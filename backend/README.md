# RetinaCare AI — Backend

Node.js/Express REST API for the RetinaCare AI diabetic retinopathy screening platform.

## Technologies

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM / schema layer |
| dotenv | Environment variable loading |
| CORS | Cross-origin resource sharing |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| TypeScript | Type safety |
| ts-node | Run TypeScript in development |
| nodemon | Auto-restart on file changes |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                  ← MongoDB connection
│   ├── controllers/
│   │   ├── admin.controller.ts    ← Doctor verification endpoints
│   │   ├── auth.controller.ts     ← Signup, login, me
│   │   └── connection.controller.ts ← Doctor-Patient connection workflows
│   ├── middleware/
│   │   ├── authenticate.ts        ← JWT verification
│   │   ├── authorizeRoles.ts      ← Role-based access control
│   │   ├── requireVerifiedDoctor.ts ← Verified doctor enforcement
│   │   ├── errorHandler.ts        ← Centralized error handling
│   │   └── notFound.ts            ← 404 catch-all
│   ├── models/
│   │   ├── User.ts                ← User model (all roles)
│   │   ├── DoctorProfile.ts       ← Doctor professional info
│   │   ├── PatientProfile.ts      ← Patient medical background
│   │   └── DoctorPatientConnection.ts ← Connection requests & status
│   ├── routes/
│   │   ├── index.ts               ← Route aggregator
│   │   ├── admin.ts               ← /api/admin/*
│   │   ├── auth.ts                ← /api/auth/*
│   │   ├── connections.ts         ← /api/connections/*
│   │   └── health.ts              ← GET /api/health
│   ├── scripts/
│   │   ├── seedSuperAdmin.ts      ← Super Admin seed script
│   │   └── testPhase5C.ts         ← Automated test suite for Phase 5C
│   ├── utils/
│   │   ├── jwt.ts                 ← JWT sign/verify
│   │   ├── logger.ts              ← Console logger
│   │   └── validation.ts          ← Request validation helpers
│   └── server.ts                  ← Express entry point
├── .env.example                   ← Environment variable template
├── .env                           ← YOUR credentials (git-ignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Setup

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

```bash
cp .env.example .env
```

### 4. Fill in environment variables

Open `backend/.env` and configure all variables (see table below).

The `MONGO_URI` must include `retinacare` as the database name:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/retinacare?retryWrites=true&w=majority
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Seed the Super Admin

> **The Super Admin can ONLY be created via this seed script — not through public signup.**

```bash
npm run seed:admin
```

This is safe to run multiple times — it will not create duplicates.

### 6. Start the backend

**Development (auto-restart on changes):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `5001` | No | Server port |
| `MONGO_URI` | — | **Yes** | MongoDB connection string (include `/retinacare` as DB name) |
| `FRONTEND_URL` | `http://localhost:5173` | No | Allowed CORS origin |
| `NODE_ENV` | `development` | No | Environment mode |
| `JWT_SECRET` | — | **Yes** | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | No | Token expiry (e.g. `7d`, `24h`) |
| `SUPER_ADMIN_NAME` | — | For seed | Display name of the Super Admin |
| `SUPER_ADMIN_EMAIL` | — | For seed | Login email of the Super Admin |
| `SUPER_ADMIN_PASSWORD` | — | For seed | Super Admin password (will be hashed) |

---

## User Roles

| Role | Description |
|---|---|
| `patient` | Diabetic patients. Created via public signup. |
| `doctor` | Ophthalmologists. Created via public signup. Start as `pending`. |
| `super_admin` | Platform administrator. Created **only** via `npm run seed:admin`. |

## Doctor Verification Workflow

| Status | Meaning |
|---|---|
| `pending` | New doctor awaiting admin review |
| `verified` | Doctor approved by admin. Clinical permissions granted. |
| `rejected` | Doctor rejected by admin. Clinical permissions withheld. |
| `not_applicable` | Used for patients and super_admin |

### Verification Security Rules
1. **Frontend restrictions are NOT the security boundary**: The backend middleware (`requireVerifiedDoctor`) enforces that only verified doctors can access clinical operations.
2. Unverified or rejected doctors can authenticate to receive their profile status, but cannot access patient data or accept connection requests.
3. Only `super_admin` accounts can approve or reject doctor credentials.

---

## Doctor ↔ Patient Connections

Patients can discover verified doctors and request a clinical connection. Relationships maintain state:
- `pending`: Patient requested a connection; waiting for doctor's approval.
- `accepted`: Doctor accepted the request; active clinical relationship established.
- `rejected`: Doctor rejected the request.

### Ownership & Access Control Rules
- **Strict Tenant & Identity Isolation**: Doctors can ONLY see and manage requests directed to them (`doctorId = req.user.id`).
- **Patient Isolation**: Patients can ONLY view their own connections (`patientId = req.user.id`).
- **No Self-Connections**: Patients cannot request connections with themselves.
- **Verified Doctors Only**: Connection requests can only be sent to doctors whose `verificationStatus === 'verified'`.
- **Client IDs Untrusted**: All mutation actions derive doctor/patient identities directly from authenticated `req.user` tokens.

---

## API Endpoints

### Health & Auth Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server & MongoDB connection status |
| `POST` | `/api/auth/signup` | Public | Register patient or doctor (Super Admin blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |

---

### Super Admin Endpoints (`/api/admin/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/doctors/pending` | Super Admin | View all doctors awaiting verification |
| `GET` | `/api/admin/doctors` | Super Admin | View all doctors (supports `?status=` query filter) |
| `PATCH` | `/api/admin/doctors/:doctorId/approve` | Super Admin | Approve doctor (`verificationStatus = 'verified'`) |
| `PATCH` | `/api/admin/doctors/:doctorId/reject` | Super Admin | Reject doctor (`verificationStatus = 'rejected'`) |

---

### Connection Endpoints (`/api/connections/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/connections` | Patient | Request connection with a verified doctor |
| `GET` | `/api/connections/my-doctors` | Patient | View doctor connections for authenticated patient |
| `GET` | `/api/connections/requests` | Verified Doctor | View incoming pending connection requests |
| `PATCH` | `/api/connections/:connectionId/accept` | Verified Doctor | Accept a pending connection request |
| `PATCH` | `/api/connections/:connectionId/reject` | Verified Doctor | Reject a pending connection request |
| `GET` | `/api/connections/my-patients` | Verified Doctor | View active accepted patients for authenticated doctor |

---

## MongoDB Collections

| Collection | Description |
|---|---|
| `users` | All accounts (`patient`, `doctor`, `super_admin`) |
| `doctorprofiles` | Doctor credentials and professional details |
| `patientprofiles` | Patient medical history background |
| `doctorpatientconnections` | Relationship state between doctors and patients |

---

## Testing

Run the automated test suite covering all 24 Phase 5C end-to-end scenarios:

```bash
npm run test:5c
```

The test script automatically tests:
- Super Admin login & doctor reviews
- Pending doctor registration & blocking
- Super Admin approval & rejection flows
- `requireVerifiedDoctor` middleware enforcement
- Patient connection requests & duplicate prevention
- Doctor request acceptance & data isolation
- Ownership security validation

---

## Phase Roadmap Status

### Phase 5A — Foundation ✅
- Express server, MongoDB connection, CORS, health endpoint, error handling

### Phase 5B — Authentication & Users ✅
- User, DoctorProfile, PatientProfile models
- Password hashing (bcryptjs) & JWT authentication
- Role enforcement & Super Admin seeding

### Phase 5C — Super Admin Doctor Verification & Connections ✅
- Super Admin doctor review, approve, and reject workflows
- `requireVerifiedDoctor` authorization middleware
- Doctor-Patient connection model and lifecycles
- Strict data ownership and role boundaries

### Future Phases (Not implemented yet):
- Screening API & image uploads
- ML inference & PyTorch model connection
- Reports & clinical screening workflow
- Frontend-to-backend authentication and UI integration

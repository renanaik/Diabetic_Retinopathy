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
│   │   └── auth.controller.ts     ← signup, login, me
│   ├── middleware/
│   │   ├── authenticate.ts        ← JWT verification
│   │   ├── authorizeRoles.ts      ← Role-based access control
│   │   ├── errorHandler.ts        ← Centralized error handling
│   │   └── notFound.ts            ← 404 catch-all
│   ├── models/
│   │   ├── User.ts                ← User model (all roles)
│   │   ├── DoctorProfile.ts       ← Doctor professional info
│   │   └── PatientProfile.ts      ← Patient medical background
│   ├── routes/
│   │   ├── index.ts               ← Route aggregator
│   │   ├── auth.ts                ← /api/auth/*
│   │   └── health.ts              ← GET /api/health
│   ├── scripts/
│   │   └── seedSuperAdmin.ts      ← Super Admin seed script
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

## Doctor Verification Status

| Status | Meaning |
|---|---|
| `pending` | New doctor awaiting admin review |
| `verified` | Doctor approved by admin (Phase 5C) |
| `rejected` | Doctor rejected by admin (Phase 5C) |
| `not_applicable` | Used for patients and super_admin |

Doctors with `verificationStatus: "pending"` can authenticate (receive a token) but are restricted from doctor functionality. The frontend redirects them to a verification-pending page.

---

## API

### `GET /api/health`

Returns server and database status. No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "RetinaCare AI API is running",
  "database": "connected",
  "environment": "development",
  "timestamp": "2026-08-15T14:00:00.000Z"
}
```

---

### `POST /api/auth/signup`

Register a new patient or doctor account. **Super Admin signup is blocked.**

**Patient request body:**
```json
{
  "name": "Alice Patient",
  "email": "alice@example.com",
  "password": "Test@1234",
  "role": "patient",
  "dateOfBirth": "1990-01-01",
  "gender": "Female",
  "phone": "+91-9876543210",
  "medicalHistory": "Type 2 diabetes",
  "diabetesHistory": "HbA1c 7.1%",
  "eyeHistory": "No prior conditions"
}
```

**Doctor request body:**
```json
{
  "name": "Dr. Priya Shah",
  "email": "drpriya@example.com",
  "password": "Doctor@5678",
  "role": "doctor",
  "licenseNumber": "MCI-GUJ-2019-0042",
  "medicalCouncil": "Medical Council of India",
  "specialization": "Ophthalmology",
  "hospital": "City Eye Hospital",
  "yearsOfExperience": 8
}
```

**Password policy:** minimum 8 characters, at least 1 uppercase, 1 digit, 1 special character.

**Response (201):**
```json
{
  "success": true,
  "message": "Patient account created successfully.",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "...",
      "name": "Alice Patient",
      "email": "alice@example.com",
      "role": "patient",
      "isActive": true,
      "verificationStatus": "not_applicable",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### `POST /api/auth/login`

Authenticate with email and password. Returns a JWT.

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "Test@1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "<jwt>",
    "user": { ... }
  }
}
```

The token is a Bearer JWT — include it in all protected requests:
```
Authorization: Bearer <token>
```

**Logout:** JWT is stateless. Logout is handled client-side by discarding the stored token.

---

### `GET /api/auth/me`

Returns the currently authenticated user's profile.

**Headers required:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Authenticated user profile.",
  "data": {
    "user": {
      "id": "...",
      "name": "Alice Patient",
      "email": "alice@example.com",
      "role": "patient",
      "isActive": true,
      "verificationStatus": "not_applicable",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## MongoDB Collections

| Collection | Description |
|---|---|
| `users` | All accounts (patient, doctor, super_admin) |
| `doctorprofiles` | Doctor professional information |
| `patientprofiles` | Patient medical background |

---

## Testing Endpoints

```bash
# Patient signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"test@patient.com","password":"Test@1234","role":"patient","dateOfBirth":"1990-01-01","gender":"Male","phone":"+91-9000000000","medicalHistory":"None","diabetesHistory":"None","eyeHistory":"None"}'

# Doctor signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr Test","email":"test@doctor.com","password":"Doctor@1234","role":"doctor","licenseNumber":"LIC001","medicalCouncil":"MCI","specialization":"Ophthalmology","hospital":"Test Hospital","yearsOfExperience":5}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@patient.com","password":"Test@1234"}'

# Get profile (paste token from login)
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Seed Super Admin
npm run seed:admin
```

---

## Phase 5A — Foundation ✅

- Express server, MongoDB connection, CORS, health endpoint, error handling

## Phase 5B — Authentication & Users ✅

✅ User model (patient / doctor / super_admin)  
✅ DoctorProfile model  
✅ PatientProfile model  
✅ bcryptjs password hashing  
✅ JWT authentication  
✅ `POST /api/auth/signup` (patient + doctor; super_admin blocked)  
✅ `POST /api/auth/login`  
✅ `GET /api/auth/me` (protected)  
✅ `authenticate` middleware  
✅ `authorizeRoles` middleware  
✅ Super Admin seed script (`npm run seed:admin`)  
✅ Doctor starts as `verificationStatus: "pending"`  
✅ Role derived from database (never trusted from client)

**Not implemented yet (Phase 5C+):**

❌ Doctor approval / rejection endpoints  
❌ Patient-doctor connections  
❌ Screening API  
❌ Image upload  
❌ ML inference  
❌ Frontend-backend authentication integration  

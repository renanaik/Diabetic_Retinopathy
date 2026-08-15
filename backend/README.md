# RetinaCare AI — Backend

Node.js/Express REST API with Python FastAPI Machine Learning Inference for the RetinaCare AI diabetic retinopathy screening platform.

## Architecture

```
React Frontend (Vite + TypeScript)
       ↓  HTTP / REST
Node.js / Express API (Port 5001)
   ├── MongoDB (Mongoose ODM)
   └── Python FastAPI ML Inference Engine (Port 5002)
            ↓
       PyTorch EfficientNet-B4 (balanced_efficientnet_b4_dr.pth)
```

## Technologies

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM / schema layer |
| Python 3 | Machine Learning runtime |
| PyTorch | Deep Learning framework |
| torchvision | EfficientNet-B4 model & transforms |
| Pillow | Image decoding & RGB processing |
| FastAPI / Uvicorn | High-performance Python ML microservice |
| multer | In-memory multipart file handling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| TypeScript | Type safety |

## Project Structure

```
backend/
├── ml_service/
│   ├── models/                    ← Model checkpoints (git-ignored)
│   │   └── balanced_efficientnet_b4_dr.pth
│   ├── app.py                     ← FastAPI microservice (Port 5002)
│   ├── config.py                  ← ML service configuration
│   ├── inference.py               ← PyTorch EfficientNet-B4 loader & inference
│   └── requirements.txt           ← Python ML dependencies
├── src/
│   ├── config/
│   │   └── db.ts                  ← MongoDB connection
│   ├── controllers/
│   │   ├── admin.controller.ts    ← Doctor verification endpoints
│   │   ├── auth.controller.ts     ← Signup, login, me
│   │   ├── connection.controller.ts ← Doctor-Patient connection workflows
│   │   ├── ml.controller.ts       ← ML inference gateway controller
│   │   └── screening.controller.ts ← Retinal screening creation & history
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
│   │   ├── DoctorPatientConnection.ts ← Connection requests & status
│   │   └── Screening.ts           ← Retinal screenings & AI predictions
│   ├── routes/
│   │   ├── index.ts               ← Route aggregator
│   │   ├── admin.ts               ← /api/admin/*
│   │   ├── auth.ts                ← /api/auth/*
│   │   ├── connections.ts         ← /api/connections/*
│   │   ├── ml.ts                  ← /api/ml/* (AI Screening Prediction)
│   │   ├── screenings.ts          ← /api/screenings/* (Screening Workflow)
│   │   └── health.ts              ← GET /api/health
│   ├── scripts/
│   │   ├── seedSuperAdmin.ts      ← Super Admin seed script
│   │   ├── testPhase5C.ts         ← Automated test suite for Phase 5C
│   │   ├── testPhase5D.ts         ← Automated test suite for Phase 5D
│   │   └── testPhase5E.ts         ← Automated test suite for Phase 5E
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

---

## Setup & Quick Start

### 1. Node.js Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and configure variables. Ensure `MONGO_URI` includes `retinacare` as database name.

### 2. Python ML Inference Service Setup

```bash
# Create Python virtual environment and install dependencies
python3 -m venv ml_service/venv
source ml_service/venv/bin/activate
pip install -r ml_service/requirements.txt
```

Place the trained model file at:
```
backend/ml_service/models/balanced_efficientnet_b4_dr.pth
```

### 3. Seed the Super Admin

```bash
npm run seed:admin
```

### 4. Running the Services

**Terminal 1 — Python ML Service (Port 5002):**
```bash
cd backend
npm run ml:start
```

**Terminal 2 — Node.js Express API (Port 5001):**
```bash
cd backend
npm run dev
```

---

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `5001` | No | Express server port |
| `MONGO_URI` | — | **Yes** | MongoDB connection string (database: `retinacare`) |
| `FRONTEND_URL` | `http://localhost:5173` | No | Allowed CORS origin |
| `NODE_ENV` | `development` | No | Environment mode |
| `JWT_SECRET` | — | **Yes** | Secret string for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | No | Token expiration |
| `SUPER_ADMIN_NAME` | — | For seed | Super Admin display name |
| `SUPER_ADMIN_EMAIL` | — | For seed | Super Admin login email |
| `SUPER_ADMIN_PASSWORD` | — | For seed | Super Admin password |
| `ML_SERVICE_URL` | `http://127.0.0.1:5002` | No | Internal URL of Python ML service |

---

## Retinal Screening Workflow (Phase 5E)

The screening workflow connects verified ophthalmologists, active patients, and the deep learning model into a unified clinical flow.

```
Verified Doctor
     ↓
Select Accepted Patient
     ↓
Upload Retinal Image (POST /api/screenings)
     ↓
Validate Active Doctor-Patient Connection ('accepted')
     ↓
Forward Image to EfficientNet-B4 Service (Port 5002)
     ↓
Receive AI Predictions & Probability Distribution
     ↓
Persist Screening Record in MongoDB (status: 'pending_review')
     ↓
Return Structured Screening Details to Doctor
```

### Screening Document Model

```typescript
{
  patientId: ObjectId (ref: 'User'),
  doctorId: ObjectId (ref: 'User'),
  image: {
    originalFilename: string,
    mimeType: string,
    size: number
  },
  aiResult: {
    predictedClass: number (0-4),
    predictedLabel: string,
    confidence: number,
    classProbabilities: { "0": number, "1": number, "2": number, "3": number, "4": number },
    referable: boolean,
    referableProbability: number,
    disclaimer: string
  },
  status: 'pending_review',
  createdAt: Date,
  updatedAt: Date
}
```

### Ownership & Privacy Rules
1. **Verified Doctor Only**: Only doctors with `verificationStatus === 'verified'` can create or list screenings (`requireVerifiedDoctor`).
2. **Accepted Relationship Required**: Screenings can ONLY be created for patients who have an `accepted` connection with the authenticated doctor. Unconnected, pending, or rejected patient screenings are rejected with `403 Forbidden`.
3. **Doctor Isolation**: Doctor A can only list and retrieve screenings created by Doctor A. Doctor B cannot access Doctor A's records.
4. **Patient Privacy**: In this phase, patients cannot access screening results (`403 Forbidden`). Patient visibility and doctor approval will be introduced in Phases 5F and 5G.
5. **No Orphaned Records**: The Screening document is only created after successful ML prediction. If the ML service is down or fails, no partial record is persisted and a `503 Service Unavailable` error is returned.

---

## API Endpoints

### Retinal Screening Endpoints (`/api/screenings/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/screenings` | Verified Doctor | Create and analyze a new retinal screening for an accepted patient (form fields: `patientId`, `file` or `image`) |
| `GET` | `/api/screenings` | Verified Doctor | List screenings conducted by authenticated doctor (supports `?patientId=` query filter) |
| `GET` | `/api/screenings/:id` | Verified Doctor | Retrieve full screening record by ID (ownership strictly enforced) |

#### Example: `POST /api/screenings`
```bash
curl -X POST http://localhost:5001/api/screenings \
  -H "Authorization: Bearer <VERIFIED_DOCTOR_JWT>" \
  -F "patientId=6a80886f4335e3a0fa1dee20" \
  -F "file=@/path/to/retina.png"
```

#### Example Response (201 Created)
```json
{
  "success": true,
  "message": "Retinal screening created and analyzed successfully.",
  "data": {
    "screening": {
      "id": "6a8088734335e3a0fa1dee50",
      "patientId": "6a80886f4335e3a0fa1dee20",
      "doctorId": "6a80886c4335e3a0fa1dedfe",
      "image": {
        "originalFilename": "fundus_left.png",
        "mimeType": "image/png",
        "size": 245890
      },
      "aiResult": {
        "predictedClass": 1,
        "predictedLabel": "Mild DR",
        "confidence": 0.8328,
        "classProbabilities": {
          "0": 0.1474,
          "1": 0.8328,
          "2": 0.0197,
          "3": 0.0,
          "4": 0.0
        },
        "referable": false,
        "referableProbability": 0.0198,
        "disclaimer": "AI prediction is a screening aid and requires doctor review."
      },
      "status": "pending_review",
      "patient": {
        "id": "6a80886f4335e3a0fa1dee20",
        "name": "Alice Patient",
        "email": "alice@test.com"
      },
      "doctor": {
        "id": "6a80886c4335e3a0fa1dedfe",
        "name": "Dr. Alpha Specialist"
      },
      "createdAt": "2026-08-15T15:40:35.123Z",
      "updatedAt": "2026-08-15T15:40:35.123Z"
    }
  }
}
```

---

### Machine Learning Inference (`/api/ml/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ml/predict` | Verified Doctor | Direct AI inference on raw image without persisting screening |

---

### Core & Auth Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server & MongoDB connection status |
| `POST` | `/api/auth/signup` | Public | Register patient or doctor |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |

---

### Super Admin Endpoints (`/api/admin/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/doctors/pending` | Super Admin | View doctors awaiting verification |
| `GET` | `/api/admin/doctors` | Super Admin | View all doctors |
| `PATCH` | `/api/admin/doctors/:doctorId/approve` | Super Admin | Approve doctor verification |
| `PATCH` | `/api/admin/doctors/:doctorId/reject` | Super Admin | Reject doctor verification |

---

### Connection Endpoints (`/api/connections/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/connections` | Patient | Request connection with a verified doctor |
| `GET` | `/api/connections/my-doctors` | Patient | View connections for patient |
| `GET` | `/api/connections/requests` | Verified Doctor | View incoming pending requests |
| `PATCH` | `/api/connections/:connectionId/accept` | Verified Doctor | Accept connection request |
| `PATCH` | `/api/connections/:connectionId/reject` | Verified Doctor | Reject connection request |
| `GET` | `/api/connections/my-patients` | Verified Doctor | View accepted patients |

---

## Testing

Run automated test suites for all backend phases:

```bash
# Phase 5C: Doctor Verification & Connections
npm run test:5c

# Phase 5D: Machine Learning Inference & Security
npm run test:5d

# Phase 5E: Retinal Screening Workflow & Persistence
npm run test:5e
```

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

### Phase 5D — ML Inference Service Integration ✅
- Python FastAPI microservice loading `balanced_efficientnet_b4_dr.pth`
- EfficientNet-B4 5-class classifier architecture with ImageNet preprocessing
- Softmax probability distributions, referable triage metrics, and clinical disclaimers
- Secure Node.js proxy endpoint `POST /api/ml/predict` for verified doctors only

### Phase 5E — Screening Workflow & Persistent AI Results ✅
- `Screening` Mongoose model persisting image metadata, full AI output, and `pending_review` status
- `POST /api/screenings` validating active accepted doctor-patient connection before screening
- `GET /api/screenings` & `GET /api/screenings/:id` with strict ownership isolation
- Comprehensive patient privacy protections and zero orphaned record guarantees

### Future Phases (Not implemented yet):
- Phase 5F: Doctor report approval, notes, and finalization
- Phase 5G: Patient-visible reports and screening viewer
- Phase 5H: Frontend-to-backend integration

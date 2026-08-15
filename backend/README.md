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
│   │   └── ml.controller.ts       ← ML inference gateway controller
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
│   │   ├── ml.ts                  ← /api/ml/* (AI Screening Prediction)
│   │   └── health.ts              ← GET /api/health
│   ├── scripts/
│   │   ├── seedSuperAdmin.ts      ← Super Admin seed script
│   │   ├── testPhase5C.ts         ← Automated test suite for Phase 5C
│   │   └── testPhase5D.ts         ← Automated test suite for Phase 5D
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

## ML Inference Engine (Phase 5D)

### Model Architecture
- **Base Architecture**: `torchvision.models.efficientnet_b4`
- **Classifier Head**:
  ```python
  num_features = model.classifier[1].in_features # 1792
  model.classifier = nn.Sequential(
      nn.Dropout(p=0.4, inplace=True),
      nn.Linear(num_features, 5)
  )
  ```
- **Weights**: Loaded once on server startup from `balanced_efficientnet_b4_dr.pth` (`state_dict`).
- **Device Support**: Auto-detects `CUDA` (NVIDIA GPUs), `MPS` (Apple Silicon), or `CPU`.

### Input Preprocessing Pipeline
1. Decodes raw image bytes and converts to standard `RGB`.
2. Resizes image to `(380, 380)` dimensions.
3. Converts to PyTorch Tensor.
4. Normalizes with standard ImageNet statistics:
   - `mean = [0.485, 0.456, 0.406]`
   - `std = [0.229, 0.224, 0.225]`
5. Adds batch dimension `(1, 3, 380, 380)` and evaluates via `torch.no_grad()`.
6. Calculates softmax class probability distribution.

### Diabetic Retinopathy 5-Class Mapping

| Class Index | Label | Triage Category | Description |
|---|---|---|---|
| `0` | **No DR** | Non-Referable | No visible signs of diabetic retinopathy |
| `1` | **Mild DR** | Non-Referable | Microaneurysms only |
| `2` | **Moderate DR** | Referable | More than microaneurysms but less than severe |
| `3` | **Severe DR** | Referable | >20 intraretinal hemorrhages, venous beading, IRMA |
| `4` | **Proliferative DR** | Referable | Neovascularization, vitreous/preretinal hemorrhage |

### Referable / Non-Referable Triage
- `referable`: `true` if `predictedClass` is in `{2, 3, 4}`.
- `referableProbability`: $\sum_{c \in \{2, 3, 4\}} P(c)$ (sum of probabilities for classes 2, 3, and 4).
- **Clinical Disclaimer**: AI predictions are assistive screening aids and strictly require review by a licensed ophthalmologist.

---

## API Endpoints

### Machine Learning Inference (`/api/ml/*`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ml/predict` | Verified Doctor | Upload retinal image (form field: `image` or `file`) for AI screening prediction |

#### `POST /api/ml/predict` Example Request
```bash
curl -X POST http://localhost:5001/api/ml/predict \
  -H "Authorization: Bearer <VERIFIED_DOCTOR_JWT>" \
  -F "image=@/path/to/retina.jpg"
```

#### Example Success Response (200 OK)
```json
{
  "success": true,
  "message": "Retinal image analysis completed successfully.",
  "data": {
    "prediction": {
      "predictedClass": 2,
      "predictedLabel": "Moderate DR",
      "confidence": 0.7425,
      "classProbabilities": {
        "0": 0.0412,
        "1": 0.1250,
        "2": 0.7425,
        "3": 0.0610,
        "4": 0.0303
      },
      "referable": true,
      "referableProbability": 0.8338,
      "imageMetadata": {
        "originalFormat": "JPEG",
        "originalWidth": 2048,
        "originalHeight": 1536
      },
      "disclaimer": "AI prediction is a screening aid and requires doctor review."
    },
    "doctor": {
      "id": "6a806c95d8a0f6c13d753bbb",
      "name": "Dr. Evelyn Reed"
    },
    "timestamp": "2026-08-15T13:41:40.123Z"
  }
}
```

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

Run automated test suites for all phases:

```bash
# Phase 5C: Doctor Verification & Connections
npm run test:5c

# Phase 5D: Machine Learning Inference & Security
npm run test:5d
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

### Future Phases (Not implemented yet):
- Persistent Screening & Report records in MongoDB
- Doctor approval & patient-visible report generation
- Frontend-to-backend integration

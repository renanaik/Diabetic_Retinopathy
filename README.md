# RetinaCare AI — Deep Learning Retinal Screening Platform

> **AI-Assisted Diabetic Retinopathy Detection, Clinical Verification, and Longitudinal Patient Care**

RetinaCare AI is an enterprise-grade medical AI platform designed to detect, classify, and track **Diabetic Retinopathy (DR)** from digital retinal fundus photographs. By pairing **Deep Convolutional Neural Networks (EfficientNet-B4)** with a secure, multi-tenant clinical workflow, RetinaCare AI bridges the gap between automated artificial intelligence and real-world ophthalmic practice.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
  - [The Problem](#the-problem)
  - [The Solution](#the-solution)
  - [AI Assistance vs. Clinical Verification](#ai-assistance-vs-clinical-verification)
  - [DR Classification Hierarchy](#dr-classification-hierarchy)
- [2. Core Roles & Features](#2-core-roles--features)
  - [Patient Capabilities](#patient-capabilities)
  - [Doctor Capabilities](#doctor-capabilities)
  - [Super Admin Capabilities](#super-admin-capabilities)
- [3. Complete End-to-End Workflow](#3-complete-end-to-end-workflow)
  - [Step-by-Step Clinical Journey](#step-by-step-clinical-journey)
  - [Screening Lifecycle State Machine](#screening-lifecycle-state-machine)
- [4. System Architecture](#4-system-architecture)
  - [Data Flow Diagram](#data-flow-diagram)
  - [Component Responsibilities & Network Topology](#component-responsibilities--network-topology)
- [5. Deep Learning & AI Model Details](#5-deep-learning--ai-model-details)
  - [Model Architecture & Checkpoint](#model-architecture--checkpoint)
  - [Image Preprocessing Pipeline](#image-preprocessing-pipeline)
  - [Referable DR Triage](#referable-dr-triage)
- [6. Technology Stack](#6-technology-stack)
- [7. Project Directory Structure](#7-project-directory-structure)
- [8. Installation & Setup Guide](#8-installation--setup-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-repository)
  - [Step 2: Python ML Microservice Setup](#step-2-python-ml-microservice-setup)
  - [Step 3: Backend API Setup](#step-3-backend-api-setup)
  - [Step 4: Seed Super Admin](#step-4-seed-super-admin)
  - [Step 5: Frontend Setup](#step-5-frontend-setup)
- [9. Starting the Application](#9-starting-the-application)
- [10. API Reference & Contracts](#10-api-reference--contracts)
  - [Authentication Routes](#authentication-routes)
  - [Doctor-Patient Connection Routes](#doctor-patient-connection-routes)
  - [Screening & AI Inference Routes](#screening--ai-inference-routes)
  - [Patient Clinical Report Routes](#patient-clinical-report-routes)
  - [Super Admin Routes](#super-admin-routes)
- [11. Testing & Quality Assurance](#11-testing--quality-assurance)
  - [Running Integration & Regression Suites](#running-integration--regression-suites)
  - [Frontend Type Checking & Production Build](#frontend-type-checking--production-build)
- [12. Troubleshooting & Common Errors](#12-troubleshooting--common-errors)

---

## 1. Project Overview

### The Problem
Diabetic Retinopathy (DR) is one of the leading causes of preventable blindness among working-age adults worldwide. Caused by prolonged high blood sugar damaging the delicate microvasculature of the retina, early stages are often **entirely asymptomatic**. By the time patients notice vision degradation, irreversible structural damage has frequently occurred. Routine screening is critical, yet millions lack access to certified ophthalmologists.

### The Solution
RetinaCare AI provides an end-to-end tele-ophthalmology infrastructure:
1. **Patients** find certified eye specialists, request medical supervision, view diagnostic reports, and monitor longitudinal disease progression over multiple clinic visits.
2. **Ophthalmologists** receive high-resolution fundus images, execute state-of-the-art **EfficientNet-B4** inference in milliseconds, validate AI predictions, add diagnostic annotations, and release official medical reports.
3. **Super Administrators** govern platform integrity by rigorously verifying doctor medical licenses and maintaining system-wide clinical safety.

### AI Assistance vs. Clinical Verification
RetinaCare AI enforces a strict ethical and clinical boundary:
- **AI is a Screening Aid, NOT an Autonomous Diagnostician:** The EfficientNet-B4 model generates stage probabilities and triage recommendations.
- **Doctor Verification is Mandatory:** Initial screenings are stored in a strict `pending_review` status. **Patients cannot see AI outputs until a licensed doctor reviews, confirms or modifies, and officially approves the screening report.**
- **AI Prediction Immutability:** When a doctor approves or rejects a screening, the raw machine prediction is never overwritten or mutated. The doctor's review decision and notes are preserved alongside the original prediction for clinical auditability.

### DR Classification Hierarchy
The platform classifies retinal fundus images into the standard international clinical scale:

| Stage | Clinical Class | Description | Referable DR? | Recommended Action |
|:---:|:---|:---|:---:|:---|
| **0** | **No DR** | Healthy retina; no microaneurysms or vascular abnormalities | No | Annual routine eye exam |
| **1** | **Mild NPDR** | Microaneurysms only | No | Glycemic control; 6–12 month follow-up |
| **2** | **Moderate NPDR** | Microaneurysms, hemorrhages, hard exudates, or cotton wool spots | **Yes** | Ophthalmologist referral within 3–6 months |
| **3** | **Severe NPDR** | Extensive intraretinal hemorrhages (4 quadrants), venous beading (2+ quadrants), or IRMA | **Yes** | Urgent specialist referral within 1 month |
| **4** | **Proliferative DR** | Neovascularization, vitreous/preretinal hemorrhage, or fibrous proliferation | **Yes** | Immediate specialist intervention / Laser / Anti-VEGF |

---

## 2. Core Roles & Features

### Patient Capabilities
- **Authentication & Security:** Self-registration, secure JWT login, and profile management with medical, diabetes, and eye history.
- **Find Verified Doctors:** Search and filter certified ophthalmologists by name, hospital affiliation, and medical specialization.
- **Doctor Connection Requests:** Send digital connection requests to verified doctors; view pending connection statuses.
- **Primary Care Team:** View connected primary ophthalmologists with contact info, clinical credentials, and hospital details.
- **Verified Clinical Reports:** Access official diagnostic reports released after doctor review. Reports clearly separate AI machine outputs from attending doctor clinical evaluations.
- **Longitudinal Progress Tracker:** Interactive visual chart plotting multi-visit DR stage progression over time with comparative trajectory metrics (Baseline vs. Latest stage, improvement/progression indicators).
- **Printable Diagnostics:** One-click print-ready diagnostic summaries formatted for personal medical records.

### Doctor Capabilities
- **Doctor Onboarding & Verification:** Register with medical council credentials, license numbers, hospital affiliations, and clinical experience. Accounts undergo Super Admin verification before clinical access is granted.
- **Patient Connection Queue:** Inspect incoming patient connection requests with medical histories; accept or decline connections.
- **Connected Patient Roster:** View established clinical patients, access patient summaries, and launch new screening workflows.
- **Retinal Image Upload & AI Screening:** Upload JPEG/PNG fundus photographs and execute automated EfficientNet-B4 inference through the backend pipeline.
- **Screening Results & Review Queue:** Inspect deep learning prediction confidence, 5-class probability distributions, and referable triage flags. Approve or reject screenings with customized clinical diagnostic notes.
- **Longitudinal Patient History:** Track multi-visit screening trajectories for connected patients to evaluate therapeutic response over time.
- **AI Model Performance Workspace:** Dedicated model architecture workspace explaining EfficientNet-B4 parameters, training metrics, and clinical thresholds.

### Super Admin Capabilities
- **Secure Provisioning:** Dedicated Super Admin seed script (`npm run seed:admin`) preventing unauthorized public signups.
- **Doctor Verification Governance:** Review pending doctor applications, inspect medical licenses, and approve or reject clinical practitioners.
- **Platform Analytics & Management:** View system-wide registered doctors, patients, clinical connections, and diagnostic screenings.

---

## 3. Complete End-to-End Workflow

### Step-by-Step Clinical Journey

```
┌───────────────┐
│    PATIENT    │ Registers & logs into patient portal
└───────┬───────┘
        │ 1. Search verified doctors (/patient/doctors)
        ▼
┌───────────────┐
│ FIND DOCTORS  │ Patient sends connection request (POST /api/connections)
└───────┬───────┘
        │ 2. Request appears in doctor's inbox (/doctor/requests)
        ▼
┌───────────────┐
│    DOCTOR     │ Doctor accepts connection (PATCH /api/connections/:id/accept)
└───────┬───────┘
        │ 3. Clinical relationship established; Patient appears in Doctor roster
        ▼
┌───────────────┐
│ NEW SCREENING │ Doctor selects patient, uploads retinal image (POST /api/screenings)
└───────┬───────┘
        │ 4. Backend forwards image to Python ML Service (:5002)
        ▼
┌───────────────┐
│ ML INFERENCE  │ EfficientNet-B4 computes 5-class distribution & confidence
└───────┬───────┘
        │ 5. Screening persisted in MongoDB with status = 'pending_review'
        ▼
┌───────────────┐
│ REVIEW QUEUE  │ Doctor reviews AI predictions & enters notes (/doctor/results)
└───────┬───────┘
        │ 6. Doctor approves report (PATCH /api/screenings/:id/review)
        ▼
┌───────────────┐
│ REPORT RELEASE│ Status transitions to 'approved'; Report released to patient
└───────┬───────┘
        │ 7. Patient views report (/patient/reports/:id)
        ▼
┌───────────────┐
│ PROGRESSION   │ Multi-visit screenings plot longitudinal trend (/patient/progress)
└───────────────┘
```

### Screening Lifecycle State Machine

1. **`pending_review` (Initial State):**
   - Created immediately after EfficientNet-B4 finishes image inference.
   - AI prediction is stored in the database.
   - **Privacy Guard:** `GET /api/patient/screenings` strictly filters out `pending_review` screenings, and `GET /api/patient/screenings/:id` returns `404 Not Found` for patients to prevent premature unverified medical anxiety.
2. **`approved` (Doctor Verified):**
   - Doctor confirms findings, enters clinical recommendations, and submits approval.
   - Report is released and accessible in the patient portal.
3. **`rejected` (Clinical Disagreement / Poor Image Quality):**
   - Doctor identifies artifact, image blur, or disagrees with model output.
   - Rejection decision and notes are preserved; patient receives reviewed status indicating re-examination requirement.
4. **Idempotency & Immutability:**
   - Once reviewed, state transitions are locked. Attempting to re-review an already finalized screening returns `409 Conflict`.

---

## 4. System Architecture

### Data Flow Diagram

```
                       ┌──────────────────────────────────────┐
                       │           USER BROWSER               │
                       │    (Patient / Doctor / Admin)        │
                       └──────────────────┬───────────────────┘
                                          │
                                          │ HTTP / HTTPS (:5173)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │       REACT 19 + VITE FRONTEND       │
                       │  - AuthContext (JWT Session)         │
                       │  - ProtectedRoute RBAC Guards        │
                       │  - TailwindCSS + Dark/Light Theme    │
                       └──────────────────┬───────────────────┘
                                          │
                                          │ REST API (/api/* proxy)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │     NODE.JS / EXPRESS BACKEND API    │
                       │             (Port 5001)              │
                       │  - JWT Authentication Middleware     │
                       │  - Role Authorization Guards         │
                       │  - Multi-Tenant Ownership Isolation  │
                       │  - Multer Multipart Image Handler    │
                       └───────────┬──────────────┬───────────┘
                                   │              │
                    Mongoose / BSON│              │ HTTP Form-Data
                                   ▼              ▼
        ┌────────────────────────────┐  ┌─────────────────────────────────┐
        │       MONGODB CLOUD        │  │     PYTHON FASTAPI ML SERVICE   │
        │      (Database Layer)      │  │           (Port 5002)           │
        │  - Users & Profiles        │  │  - PyTorch 2.x Runtime          │
        │  - Connections             │  │  - Torchvision Transforms       │
        │  - Immutable Screenings    │  │  - EfficientNet-B4 Checkpoint   │
        └────────────────────────────┘  └─────────────────────────────────┘
```

### Component Responsibilities & Network Topology

| Component | Technology | Default Port | Primary Responsibility |
|---|---|:---:|---|
| **Frontend** | React 19, Vite 8, TypeScript | `5173` | Responsive UI, client-side routing, RBAC protection, SVG longitudinal charting, dark/light theme management. |
| **Backend API** | Node.js, Express 4, TypeScript | `5001` | Authentication, password hashing (bcrypt), multi-tenant authorization, relationship enforcement, Multer image parsing, business logic. |
| **ML Service** | Python 3.10+, FastAPI, PyTorch | `5002` | Image validation, tensor preprocessing (380x380, normalization), EfficientNet-B4 forward pass, Softmax probability distribution. |
| **Database** | MongoDB Atlas / Community | `27017` | Persistent document storage for users, doctor/patient profiles, connection records, and screening history. |

---

## 5. Deep Learning & AI Model Details

### Model Architecture & Checkpoint
- **Base Architecture:** `EfficientNet-B4` (Convolutional Neural Network utilizing compound coefficient scaling across depth, width, and resolution).
- **Model Checkpoint:** `backend/ml_service/models/balanced_efficientnet_b4_dr.pth`
- **Output Layer:** Linear classification head mapped to 5 output logits representing DR Stages 0 through 4.
- **Execution Device:** Automatically selects Apple Silicon Metal (`mps`), NVIDIA CUDA (`cuda`), or optimized multi-threaded `cpu`.

### Image Preprocessing Pipeline
1. **Decodability & MIME Check:** Validates JPEG, PNG, or WEBP byte streams.
2. **Color Mode Normalization:** Converts uploaded images to standard 3-channel RGB.
3. **Bicubic Resizing:** Rescales fundus images to the native EfficientNet-B4 input dimension: `(380, 380)` pixels.
4. **Tensor Normalization:** Standardizes pixel intensities using ImageNet distribution statistics:
   $$\text{Mean} = [0.485, 0.456, 0.406], \quad \text{Std} = [0.229, 0.224, 0.225]$$
5. **Softmax Probabilities:** Normalizes output logits into a valid probability distribution summing to 1.0 across all 5 classes.

### Referable DR Triage
- **Non-Referable:** Classes 0 (No DR) and 1 (Mild DR).
- **Referable:** Classes 2 (Moderate DR), 3 (Severe DR), and 4 (Proliferative DR).
- **Referable Probability Calculation:**
  $$P(\text{Referable}) = P(\text{Class 2}) + P(\text{Class 3}) + P(\text{Class 4})$$

---

## 6. Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `^19.2.8` | Component-driven user interface |
| **Frontend Routing** | React Router DOM | `^7.18.2` | Single-page application routing and guards |
| **Frontend Build Tool** | Vite | `^8.2.0` | Ultra-fast HMR and bundle compilation |
| **Styling & Icons** | TailwindCSS & Lucide React | `^3.4.19` / `^1.30.0` | Modern design system and accessible iconography |
| **Backend Runtime** | Node.js | `>= 18.x` | Asynchronous JavaScript runtime |
| **Backend Framework** | Express | `^4.19.2` | RESTful API server |
| **Language** | TypeScript | `~5.5.4` | Static type safety across frontend and backend |
| **Database & ODM** | MongoDB & Mongoose | `^8.5.1` | NoSQL document database and schema modeling |
| **Authentication** | JSON Web Tokens & bcryptjs | `^9.0.3` / `^3.0.3` | Stateless Bearer token auth and salted password hashing |
| **Multipart Uploads** | Multer | `^2.2.0` | In-memory binary file handling |
| **ML Framework** | PyTorch & Torchvision | `>= 2.0.0` | Deep learning model inference |
| **ML Service Engine** | FastAPI & Uvicorn | `>= 0.100.0` | High-performance Python ASGI web service |
| **Image Processing** | Pillow (PIL) | `>= 9.0.0` | Image format conversion and tensor transformations |

---

## 7. Project Directory Structure

```text
Diabetic_Retinopathy/
├── frontend/                              # React 19 Client Application
│   ├── public/                            # Static public assets
│   ├── src/
│   │   ├── components/                    # Reusable UI components
│   │   │   ├── auth/                      # ProtectedRoute & Role Guards
│   │   │   ├── layout/                    # Public, Doctor, Patient, Admin Shells
│   │   │   ├── sections/                  # Landing page sections
│   │   │   └── ui/                        # Modals, Toasts, Badges, Buttons
│   │   ├── context/                       # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/                         # Application Views
│   │   │   ├── admin/                     # Super Admin management dashboards
│   │   │   ├── doctor/                    # Doctor screening, reviews & history
│   │   │   └── patient/                   # Patient reports, doctor search & tracker
│   │   ├── App.tsx                        # Client-side router configuration
│   │   ├── index.css                      # TailwindCSS design system & themes
│   │   └── main.tsx                       # React DOM entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                     # Dev server proxy (/api -> :5001)
│
├── backend/                               # Node.js / Express REST API
│   ├── ml_service/                        # Python Deep Learning Microservice
│   │   ├── models/                        # PyTorch .pth model weights
│   │   ├── app.py                         # FastAPI application entry point
│   │   ├── config.py                      # Model thresholds, classes & constants
│   │   ├── inference.py                   # PyTorch model loader & predict engine
│   │   └── requirements.txt               # Python package dependencies
│   ├── src/
│   │   ├── controllers/                   # Request handlers (auth, screening, etc.)
│   │   ├── middleware/                    # Auth, RBAC, Doctor Verification, Errors
│   │   ├── models/                        # Mongoose schemas (User, Screening, etc.)
│   │   ├── routes/                        # Express API route declarations
│   │   ├── scripts/                       # Integration test suites & Super Admin seed
│   │   │   ├── seedSuperAdmin.ts          # Script to create initial Super Admin
│   │   │   ├── testPhase5C.ts             # Auth & Admin integration tests
│   │   │   ├── testPhase5D.ts             # ML prediction endpoint tests
│   │   │   ├── testPhase5E.ts             # Screening creation tests
│   │   │   ├── testPhase5F.ts             # Doctor review workflow tests
│   │   │   ├── testPhase5G.ts             # Patient report release tests
│   │   │   └── testPhase5H.ts             # Comprehensive 77-check regression suite
│   │   ├── utils/                         # Token helpers & ObjectId validators
│   │   └── server.ts                      # Express server entry point
│   ├── .env.example                       # Template for environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                              # Complete Project Documentation
```

---

## 8. Installation & Setup Guide

### Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js:** `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python:** `v3.10` or higher ([Download Python](https://www.python.org/))
- **MongoDB:** A running local MongoDB instance or a free [MongoDB Atlas Cluster](https://cloud.mongodb.com)
- **Git:** Version control CLI

---

### Step 1: Clone Repository
```bash
git clone https://github.com/renanaik/Diabetic_Retinopathy.git
cd Diabetic_Retinopathy
```

---

### Step 2: Python ML Microservice Setup
Navigate to the `backend/ml_service` directory, set up a virtual environment, and install dependencies:

```bash
cd backend/ml_service

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Upgrade pip and install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Verify model checkpoint exists in models/
ls -lh models/balanced_efficientnet_b4_dr.pth

cd ../..
```

---

### Step 3: Backend API Setup
Navigate to the `backend` directory, install npm packages, and create the environment configuration:

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```

Open `backend/.env` in your code editor and configure your environment variables:

```env
# ─── Server Configuration ──────────────────────────────────────────────────
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ─── Database ──────────────────────────────────────────────────────────────
# Replace with your MongoDB connection string (local or Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/retinacare?retryWrites=true&w=majority

# ─── Authentication Secrets ────────────────────────────────────────────────
# Generate a strong 64-byte hex key
JWT_SECRET=super_secret_jwt_key_retinacare_ai_production_grade_token
JWT_EXPIRES_IN=7d

# ─── Initial Super Admin Seed Credentials ──────────────────────────────────
SUPER_ADMIN_NAME="System Administrator"
SUPER_ADMIN_EMAIL="admin@retinacare.ai"
SUPER_ADMIN_PASSWORD="AdminSecurePassword123!"

# ─── Python ML Microservice URL ────────────────────────────────────────────
ML_SERVICE_URL=http://127.0.0.1:5002
```

---

### Step 4: Seed Super Admin
Initialize the database with the initial verified Super Admin user:

```bash
# Run the super admin seed script
npm run seed:admin
```
*Output: `Super Admin account initialized successfully. Email: admin@retinacare.ai`*

```bash
cd ..
```

---

### Step 5: Frontend Setup
Navigate to the `frontend` directory and install client dependencies:

```bash
cd frontend
npm install
cd ..
```

---

## 9. Starting the Application

To run the full RetinaCare AI platform locally, you will run **three processes** across terminal tabs:

### Terminal 1: Start ML Microservice (Port 5002)
```bash
cd backend/ml_service
source venv/bin/activate
python app.py
```
*Service starts on `http://127.0.0.1:5002`. Check `http://127.0.0.1:5002/health` for model readiness.*

---

### Terminal 2: Start Backend REST API (Port 5001)
```bash
cd backend
npm run dev
```
*API server starts on `http://localhost:5001`. Connects to MongoDB and verifies ML service readiness.*

---

### Terminal 3: Start Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
*Frontend dev server starts on `http://localhost:5173`.*

---

## 10. API Reference & Contracts

All requests to protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register/patient` — Register new patient account.
- `POST /api/auth/register/doctor` — Register new doctor account (status defaults to `pending_verification`).
- `POST /api/auth/login` — Authenticate user; returns JWT token and safe user profile.
- `GET /api/auth/me` — Retrieve current authenticated user session.

### Doctor-Patient Connection Routes (`/api/connections`)
- `GET /api/connections/doctors` — *(Patient)* Discover verified doctors with active connection status.
- `POST /api/connections` — *(Patient)* Send connection request to verified doctor (`{ "doctorId": "..." }`).
- `GET /api/connections/my-doctors` — *(Patient)* List connected doctors and pending connection requests.
- `GET /api/connections/requests` — *(Doctor)* List incoming pending patient connection requests.
- `PATCH /api/connections/:id/accept` — *(Doctor)* Accept a patient connection request.
- `PATCH /api/connections/:id/reject` — *(Doctor)* Reject a patient connection request.
- `GET /api/connections/my-patients` — *(Doctor)* View all active connected patients.

### Screening & AI Inference Routes (`/api/screenings`)
- `POST /api/screenings` — *(Doctor)* Upload fundus image (`file`) for connected patient (`patientId`). Executes EfficientNet-B4 inference; persists screening as `pending_review`.
- `GET /api/screenings` — *(Doctor)* Retrieve all screenings initiated by logged-in doctor (supports `?patientId=<id>`).
- `GET /api/screenings/:id` — *(Doctor)* Get complete screening details by ID.
- `PATCH /api/screenings/:id/review` — *(Doctor)* Submit clinical approval or rejection with notes (`{ "decision": "approved" | "rejected", "doctorNotes": "..." }`).

### Patient Clinical Report Routes (`/api/patient`)
- `GET /api/patient/screenings` — *(Patient)* List verified reports (strictly only `approved` or `rejected`).
- `GET /api/patient/screenings/:id` — *(Patient)* Retrieve full verified report. Returns `404 Not Found` if screening is still `pending_review`.

### Super Admin Routes (`/api/admin`)
- `GET /api/admin/doctors/pending` — *(Super Admin)* List doctors awaiting license verification.
- `GET /api/admin/doctors` — *(Super Admin)* List all registered doctors on platform.
- `PATCH /api/admin/doctors/:id/approve` — *(Super Admin)* Verify and activate doctor clinical privileges.
- `PATCH /api/admin/doctors/:id/reject` — *(Super Admin)* Reject doctor verification application.

---

## 11. Testing & Quality Assurance

RetinaCare AI includes a comprehensive regression testing suite validating service health, authorization guards, ML inference accuracy, state machine idempotency, and multi-tenant isolation.

### Running Integration & Regression Suites

In the `backend` directory, run the Phase 5 automated test scripts:

```bash
cd backend

# Run the Phase 5H Complete 77-Check Integration Suite
npm run test:5h
```

#### Test Suite Breakdown:
- `npm run test:5c` — Role-based access control, Super Admin guards, and connection isolation.
- `npm run test:5d` — Direct Python ML inference connectivity, tensor transformations, and probability bounds.
- `npm run test:5e` — Screening creation, multipart image upload, and pending review lifecycle.
- `npm run test:5f` — Doctor review decision state machine (approval, rejection, idempotency).
- `npm run test:5g` — Patient report release barriers and ownership protection.
- `npm run test:5h` — **Master regression suite running all 77 end-to-end integration checks.**

### Frontend Type Checking & Production Build

Ensure frontend code passes strict TypeScript checks and compiles cleanly:

```bash
cd frontend

# TypeScript check
npm run build
```
*Builds production assets in `frontend/dist/` with 0 type errors.*

---

## 12. Troubleshooting & Common Errors

### 1. ML Service Returns 503 "Service Unavailable"
- **Cause:** The Python FastAPI service is not running on port `5002` or the model checkpoint failed to load.
- **Fix:** Check Terminal 1. Ensure the Python virtual environment is activated (`source venv/bin/activate`) and run `python app.py`. Visit `http://127.0.0.1:5002/health` in your browser to verify `"status": "ok"`.

### 2. MongoDB Connection Error (`MongooseServerSelectionError`)
- **Cause:** `MONGO_URI` in `backend/.env` is missing, incorrect, or your IP address is not whitelisted in MongoDB Atlas.
- **Fix:** In MongoDB Atlas, go to **Network Access** → **Add IP Address** → choose **Allow Access From Anywhere** (for development) or whitelist your current IP.

### 3. Doctor Cannot Create Screening (403 "Forbidden")
- **Cause 1:** Doctor is not verified by Super Admin (Status: `pending_verification`).
  - **Fix:** Log in as Super Admin (`admin@retinacare.ai`) → Go to `/admin/doctors` → Click **Approve Doctor**.
- **Cause 2:** The patient is not connected to this doctor.
  - **Fix:** The patient must request a connection (`/patient/doctors`), and the doctor must accept it (`/doctor/requests`) before screenings can be performed.

### 4. Patient Cannot See Screening (404 "Report Not Found")
- **Cause:** The screening is in `pending_review` status.
- **Fix:** This is an intentional clinical safety feature. The doctor must open `/doctor/results`, review the AI prediction, and click **Approve & Release Report**.

### 5. CORS / Network Error in Browser
- **Cause:** Frontend is accessing an unproxied port.
- **Fix:** The frontend uses Vite's built-in proxy mapping `/api` to `http://localhost:5001`. Ensure your backend is running on port `5001` as configured in `backend/.env`.

---

## Authors & Academic Project Context
Developed for academic presentation, clinical evaluation, and tele-ophthalmology research at **CHARUSAT**.
Designed with clinical safety standards, multi-tenant security isolation, and deep learning diagnostic assistance.


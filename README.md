# RetinaCare AI

AI-powered diabetic retinopathy screening platform.

## Architecture

```
React Frontend  (Vite + TypeScript)
       ↓  HTTP / REST
Node.js / Express API
       ↓
MongoDB  (Mongoose ODM)
       ↓  [Future Phase]
Python ML Inference Service
       ↓
PyTorch EfficientNet
       ↓
Trained .pth model
```

## Project Structure

```
Diabetic_Retinopathy/
├── frontend/       ← React + Vite + TailwindCSS + TypeScript
└── backend/        ← Node.js + Express + MongoDB + TypeScript
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your MONGO_URI
npm run dev          # → http://localhost:5000
```

See [`backend/README.md`](./backend/README.md) for full backend setup instructions.

## Backend

RetinaCare AI now has a backend API foundation (Phase 5A).

### Backend Technologies

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM / schema layer |
| dotenv | Environment configuration |
| CORS | Cross-origin resource sharing |
| TypeScript | Type safety |

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env**
   ```bash
   cp .env.example .env
   ```

4. **Add MONGO_URI**
   
   Open `backend/.env` and set:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   ```

5. **Start backend**
   ```bash
   npm run dev
   ```

### API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server + database status |

### Phase 5A

Phase 5A implements the backend **foundation**:

- ✅ Express server on `PORT=5000`
- ✅ MongoDB connection via `MONGO_URI`
- ✅ Environment variable configuration
- ✅ CORS (scoped to `FRONTEND_URL`)
- ✅ Health endpoint `GET /api/health`
- ✅ Centralized error handling
- ✅ Consistent JSON error responses
- ✅ TypeScript configuration
- ✅ Development tooling

**Not yet implemented:**

- ❌ Authentication
- ❌ User database models
- ❌ Doctor verification
- ❌ Doctor-patient relationships
- ❌ Screening API
- ❌ Image upload
- ❌ ML model inference

## Roles

| Role | Description |
|---|---|
| `patient` | Diabetic patients undergoing retinal screening |
| `doctor` | Verified ophthalmologists reviewing screening results |
| `super_admin` | Platform administrators |

## DR Classification

The system classifies diabetic retinopathy into 5 stages (0–4):

| Stage | Name |
|---|---|
| 0 | No Diabetic Retinopathy |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative |

## Branches

| Branch | Description |
|---|---|
| `main` | Stable baseline |
| `rena` | Backend development (Phase 5A+) |
| `shreya` | Frontend development |

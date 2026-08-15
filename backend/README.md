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
| TypeScript | Type safety |
| ts-node | Run TypeScript in development |
| nodemon | Auto-restart on file changes |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              ← MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.ts    ← Centralized error handling
│   │   └── notFound.ts        ← 404 catch-all
│   ├── routes/
│   │   ├── index.ts           ← Route aggregator
│   │   └── health.ts          ← GET /api/health
│   ├── utils/
│   │   └── logger.ts          ← Console logger
│   └── server.ts              ← Express entry point
├── .env.example               ← Environment variable template
├── .env                       ← YOUR credentials (git-ignored)
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

### 4. Add your MongoDB connection string

Open `backend/.env` and set `MONGO_URI`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Get your connection string from [MongoDB Atlas](https://cloud.mongodb.com).

### 5. Start the backend

**Development (auto-restart on changes):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `5000` | No | Server port |
| `MONGO_URI` | — | **Yes** | MongoDB connection string |
| `FRONTEND_URL` | `http://localhost:5173` | No | Allowed CORS origin |
| `NODE_ENV` | `development` | No | Environment mode |

## API

### `GET /api/health`

Returns the current status of the API and database connection.

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

### Future endpoints (Phase 5B and beyond)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
GET    /api/doctors
GET    /api/patients
POST   /api/connections
GET    /api/screenings
GET    /api/reports
```

## Phase 5A Scope

Phase 5A implements the backend **foundation only**:

✅ Express server  
✅ MongoDB connection  
✅ Environment variable configuration  
✅ CORS  
✅ Health endpoint (`GET /api/health`)  
✅ Centralized error handling  
✅ Consistent JSON error responses  
✅ TypeScript configuration  
✅ Development tooling (nodemon + ts-node)  

**Not implemented yet (future phases):**

❌ Authentication (JWT / sessions)  
❌ User database models  
❌ Doctor verification workflow  
❌ Doctor-patient relationship management  
❌ Screening API  
❌ Image upload  
❌ ML inference (PyTorch model integration)  

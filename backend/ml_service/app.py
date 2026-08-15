"""
app.py — FastAPI Application for RetinaCare AI ML Inference Service.

Endpoints:
  GET  /health  — Health check and model readiness
  POST /predict — Run 5-class diabetic retinopathy inference on uploaded retinal image
"""

import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import HOST, PORT, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES
from inference import get_inference_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the model singleton on server startup
    try:
        engine = get_inference_engine()
        print("ML Service started and model is ready for inference.")
    except Exception as e:
        print(f"FATAL: Failed to load model on startup: {e}", file=sys.stderr)
        raise e
    yield


app = FastAPI(
    title="RetinaCare AI — ML Inference Service",
    description="EfficientNet-B4 Diabetic Retinopathy 5-Class Inference API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint reflecting model load status and device."""
    try:
        engine = get_inference_engine()
        return {
            "status": "ok",
            "service": "RetinaCare ML Inference Service",
            "modelLoaded": engine.model is not None,
            "architecture": "EfficientNet-B4",
            "classes": 5,
            "device": str(engine.device),
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "message": str(e)},
        )


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """
    Run 5-class diabetic retinopathy prediction on an uploaded retinal image.
    
    Accepts:
      - Multipart form-data with 'file' field containing image (JPEG/JPG/PNG/WEBP).
      
    Returns:
      - Predicted class (0-4), label, confidence, all class probabilities, and referable triage.
    """
    # 1. Check file presence and content type
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided."
        )

    # Validate image extension / content-type
    content_type = file.content_type or ""
    filename_lower = file.filename.lower()
    valid_exts = (".jpg", ".jpeg", ".png", ".webp")

    if not (content_type in ALLOWED_MIME_TYPES or filename_lower.endswith(valid_exts)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format. Supported formats: JPEG, JPG, PNG, WEBP. Received: {content_type or file.filename}",
        )

    # 2. Read image bytes and validate size
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES / (1024 * 1024):.1f} MB.",
        )

    # 3. Perform model inference
    try:
        engine = get_inference_engine()
        prediction = engine.predict(contents)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution error: {str(err)}"
        )

    return {
        "success": True,
        "message": "Retinal screening prediction completed successfully.",
        "data": prediction,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=HOST, port=PORT, reload=False)

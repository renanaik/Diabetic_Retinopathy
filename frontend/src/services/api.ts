/// <reference types="vite/client" />
/**
 * API Service Layer — RetinaCare AI
 *
 * All functions currently return mock data.
 * When the Python backend is ready, replace the implementations
 * below with real fetch() / axios calls to the corresponding endpoints.
 *
 * Endpoint map:
 *   POST   /api/predict                   → analyzeRetinalImage()
 *   GET    /api/patients                  → getPatients()
 *   GET    /api/patients/:id/history      → getPatientHistory()
 *   GET    /api/screenings/:id            → getScreeningResult()
 *   POST   /api/screenings               → createScreening()
 */

import type {
  ApiResponse,
  PredictRequest,
  PredictResponse,
  ScreeningResult,
  Patient,
  ProgressDataPoint,
} from '../types';
import { MOCK_RESULTS, MOCK_CURRENT_RESULT } from '../data/mockResults';
import { MOCK_PATIENTS } from '../data/mockPatients';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

function simulateLatency(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

/**
 * POST /api/predict
 * Uploads a retinal fundus image and returns DR stage prediction.
 */
export async function analyzeRetinalImage(
  request: PredictRequest
): Promise<ApiResponse<PredictResponse>> {
  // TODO: Replace with real API call:
  // const formData = new FormData();
  // formData.append('image', request.imageFile);
  // formData.append('patientId', request.patientId);
  // formData.append('eye', request.eye);
  // formData.append('examinationDate', request.examinationDate);
  // if (request.notes) formData.append('notes', request.notes);
  // const response = await fetch(`${API_BASE_URL}/api/predict`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // return response.json();

  await simulateLatency(3500); // Simulate model inference time

  const result = MOCK_CURRENT_RESULT;
  return {
    success: true,
    data: {
      predictedStage: result.predictedStage,
      stageName: result.stageName,
      confidence: result.confidence,
      probabilities: result.probabilities,
      heatmapUrl: undefined, // Will be a real URL from backend
      screeningId: result.screeningId,
    },
  };
}

// ─── Patients ─────────────────────────────────────────────────────────────────

/**
 * GET /api/patients
 */
export async function getPatients(): Promise<ApiResponse<Patient[]>> {
  await simulateLatency(400);
  return { success: true, data: MOCK_PATIENTS };
}

// ─── Screening History ────────────────────────────────────────────────────────

/**
 * GET /api/patients/:id/history
 */
export async function getPatientHistory(
  patientId: string
): Promise<ApiResponse<ScreeningResult[]>> {
  await simulateLatency(500);
  const results = MOCK_RESULTS.filter(r => r.patientId === patientId);
  return { success: true, data: results };
}

/**
 * GET /api/screenings/:id
 */
export async function getScreeningResult(
  screeningId: string
): Promise<ApiResponse<ScreeningResult>> {
  await simulateLatency(350);
  const result = MOCK_RESULTS.find(r => r.screeningId === screeningId);
  if (!result) {
    return { success: false, data: MOCK_CURRENT_RESULT, error: 'Screening not found.' };
  }
  return { success: true, data: result };
}

/**
 * GET /api/screenings — all records
 */
export async function getAllScreenings(): Promise<ApiResponse<ScreeningResult[]>> {
  await simulateLatency(450);
  return { success: true, data: MOCK_RESULTS };
}

/**
 * POST /api/screenings
 * Creates a screening record before running prediction.
 */
export async function createScreening(
  data: Omit<ScreeningResult, 'screeningId' | 'predictedStage' | 'stageName' | 'confidence' | 'probabilities' | 'potentialFindings' | 'heatmapAvailable'>
): Promise<ApiResponse<{ screeningId: string }>> {
  await simulateLatency(300);
  return {
    success: true,
    data: { screeningId: `SCR-${Date.now()}` },
  };
}

// ─── Progress Tracker ─────────────────────────────────────────────────────────

/**
 * GET /api/patients/:id/progress
 */
export async function getProgressData(
  patientId: string,
  eye?: 'Left' | 'Right'
): Promise<ApiResponse<ProgressDataPoint[]>> {
  await simulateLatency(450);
  const results = MOCK_RESULTS.filter(
    r => r.patientId === patientId && (!eye || r.eye === eye)
  );
  const points: ProgressDataPoint[] = results.map(r => ({
    date: r.examinationDate,
    predictedStage: r.predictedStage,
    stageName: r.stageName,
    confidence: r.confidence,
    screeningId: r.screeningId,
    eye: r.eye,
  }));
  return { success: true, data: points };
}

// Export for potential use in component tests
export { API_BASE_URL };

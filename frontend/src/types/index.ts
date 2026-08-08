// ─── DR Stage Types ──────────────────────────────────────────────────────────

export type DRStageIndex = 0 | 1 | 2 | 3 | 4;

export interface DRStage {
  index: DRStageIndex;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const DR_STAGES: DRStage[] = [
  {
    index: 0,
    name: 'No Diabetic Retinopathy',
    shortName: 'No DR',
    description: 'No signs of diabetic retinopathy detected.',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    index: 1,
    name: 'Mild Diabetic Retinopathy',
    shortName: 'Mild DR',
    description: 'Mild nonproliferative diabetic retinopathy.',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    index: 2,
    name: 'Moderate Diabetic Retinopathy',
    shortName: 'Moderate DR',
    description: 'Moderate nonproliferative diabetic retinopathy.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    index: 3,
    name: 'Severe Diabetic Retinopathy',
    shortName: 'Severe DR',
    description: 'Severe nonproliferative diabetic retinopathy.',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    index: 4,
    name: 'Proliferative Diabetic Retinopathy',
    shortName: 'Proliferative DR',
    description: 'Proliferative diabetic retinopathy — most advanced stage.',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
];

// ─── Prediction / Result Types ────────────────────────────────────────────────

export interface ProbabilityDistribution {
  noDR: number;
  mild: number;
  moderate: number;
  severe: number;
  proliferative: number;
}

export interface PotentialFinding {
  type: string;
  description: string;
  confidence: 'low' | 'moderate' | 'high';
}

export interface ScreeningResult {
  screeningId: string;
  patientId: string;
  examinationDate: string;
  eye: 'Left' | 'Right';
  predictedStage: DRStageIndex;
  stageName: string;
  confidence: number;           // 0–1
  probabilities: ProbabilityDistribution;
  heatmapAvailable: boolean;
  potentialFindings: PotentialFinding[];
  notes?: string;
  reviewStatus: 'Pending Review' | 'Reviewed' | 'Flagged';
  imageUrl?: string;
}

// ─── Patient Types ────────────────────────────────────────────────────────────

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  diabetesDuration: number; // years
  lastScreening?: string;   // ISO date
}

// ─── Screening Form ───────────────────────────────────────────────────────────

export interface ScreeningFormData {
  patientId: string;
  examinationDate: string;
  eye: 'Left' | 'Right';
  notes?: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PredictRequest {
  imageFile: File;
  patientId: string;
  examinationDate: string;
  eye: 'Left' | 'Right';
  notes?: string;
}

export interface PredictResponse {
  predictedStage: DRStageIndex;
  stageName: string;
  confidence: number;
  probabilities: ProbabilityDistribution;
  heatmapUrl?: string;
  screeningId: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressDataPoint {
  date: string;
  predictedStage: DRStageIndex;
  stageName: string;
  confidence: number;
  screeningId: string;
  eye: 'Left' | 'Right';
}

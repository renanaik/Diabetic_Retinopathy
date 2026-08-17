export type ScreeningStatus = 'pending_review' | 'approved' | 'rejected';

export interface DoctorReview {
  decision: 'approved' | 'rejected';
  doctorNotes?: string;
  reviewedAt: string;
  reviewedBy: string;
}

export interface ScreeningResult {
  stage: 0 | 1 | 2 | 3 | 4;
  stageName: string;
  confidence: number;
  probabilities: number[];
  recommendation?: string;
}

export interface Report {
  id: string;
  screeningId: string;
  patientId: string;
  doctorId: string;
  generatedAt: string;
  status: ScreeningStatus;
  result: ScreeningResult;
  doctorReview?: DoctorReview;
}

export interface Screening {
  id: string;
  patientId: string;
  doctorId: string;
  imageUrl: string;
  status: ScreeningStatus;
  aiResult: ScreeningResult;
  doctorReview?: DoctorReview;
  createdAt: string;
  updatedAt: string;
}

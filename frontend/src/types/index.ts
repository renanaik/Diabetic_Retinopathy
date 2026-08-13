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
  dotClass: string;
}

export const DR_STAGES: DRStage[] = [
  {
    index: 0,
    name: 'No Diabetic Retinopathy',
    shortName: 'No DR',
    description: 'No visible signs of diabetic retinopathy detected in the retinal image.',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    dotClass: 'dr-none',
  },
  {
    index: 1,
    name: 'Mild Diabetic Retinopathy',
    shortName: 'Mild',
    description: 'Mild nonproliferative changes. Small areas of swelling (microaneurysms) may be present.',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    dotClass: 'dr-mild',
  },
  {
    index: 2,
    name: 'Moderate Diabetic Retinopathy',
    shortName: 'Moderate',
    description: 'Moderate nonproliferative changes. Blood vessels in the retina may swell and distort.',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    dotClass: 'dr-moderate',
  },
  {
    index: 3,
    name: 'Severe Diabetic Retinopathy',
    shortName: 'Severe',
    description: 'Severe nonproliferative changes. More blood vessels are blocked, depriving retinal areas of blood supply.',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    dotClass: 'dr-severe',
  },
  {
    index: 4,
    name: 'Proliferative Diabetic Retinopathy',
    shortName: 'Proliferative',
    description: 'Most advanced stage. New, fragile blood vessels grow on the retinal surface — the most serious form.',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    dotClass: 'dr-proliferative',
  },
];

// ─── Theme Types ──────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// ─── Auth Types — re-exported from auth.ts ────────────────────────────────────

export type {
  UserRole,
  DoctorVerificationStatus,
  ConnectionStatus,
  ConnectionRequestedBy,
  AuthUser,
  AuthSession,
  PatientSignupData,
  DoctorSignupData,
  SignupData,
  AuthContextValue,
  DoctorPatientConnection,
  MockScreening,
} from './auth';

// ─── Screening Types — re-exported from screening.ts ─────────────────────────

export type {
  ScreeningStatus,
  DoctorReview,
  ScreeningResult,
  Report,
  Screening,
} from './screening';

export const DR_CLASS_MAPPING: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'No Diabetic Retinopathy',
  1: 'Mild Diabetic Retinopathy',
  2: 'Moderate Diabetic Retinopathy',
  3: 'Severe Diabetic Retinopathy',
  4: 'Proliferative Diabetic Retinopathy',
};

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

import type { ScreeningResult } from '../types';

/**
 * Mock screening results used for development/demo purposes.
 * All data is fabricated for UI prototyping only.
 * Replace with real API responses when backend is connected.
 */
export const MOCK_RESULTS: ScreeningResult[] = [
  // ─── PT-001 History ─────────────────────────────────────────────────────
  {
    screeningId: 'SCR-2026-001',
    patientId: 'PT-001',
    examinationDate: '2026-01-08',
    eye: 'Left',
    predictedStage: 2,
    stageName: 'Moderate DR',
    confidence: 0.912,
    probabilities: {
      noDR: 0.018,
      mild: 0.052,
      moderate: 0.912,
      severe: 0.014,
      proliferative: 0.004,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Microaneurysm-like regions', description: 'Small dot-like structures noted in posterior pole region.', confidence: 'high' },
      { type: 'Hemorrhage-like regions', description: 'Possible dot and blot hemorrhage patterns detected.', confidence: 'moderate' },
      { type: 'Exudate-like regions', description: 'Possible hard exudate regions in temporal quadrant.', confidence: 'low' },
    ],
    reviewStatus: 'Reviewed',
    notes: 'Baseline examination. No complaints.',
  },
  {
    screeningId: 'SCR-2026-002',
    patientId: 'PT-001',
    examinationDate: '2026-04-12',
    eye: 'Left',
    predictedStage: 2,
    stageName: 'Moderate DR',
    confidence: 0.947,
    probabilities: {
      noDR: 0.012,
      mild: 0.048,
      moderate: 0.947,
      severe: 0.010,
      proliferative: 0.003,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Microaneurysm-like regions', description: 'Increased microaneurysm-like dot count compared to baseline.', confidence: 'high' },
      { type: 'Hemorrhage-like regions', description: 'Dot and blot hemorrhage patterns in multiple quadrants.', confidence: 'high' },
      { type: 'Exudate-like regions', description: 'Hard exudate-like pattern in macular region.', confidence: 'moderate' },
    ],
    reviewStatus: 'Pending Review',
    notes: 'Follow-up examination. Slight visual complaints.',
  },
  {
    screeningId: 'SCR-2026-003',
    patientId: 'PT-001',
    examinationDate: '2026-07-15',
    eye: 'Left',
    predictedStage: 3,
    stageName: 'Severe DR',
    confidence: 0.931,
    probabilities: {
      noDR: 0.004,
      mild: 0.018,
      moderate: 0.043,
      severe: 0.931,
      proliferative: 0.004,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Microaneurysm-like regions', description: 'Widespread microaneurysm-like structures across all quadrants.', confidence: 'high' },
      { type: 'Hemorrhage-like regions', description: 'Extensive dot, blot, and flame-shaped hemorrhage patterns.', confidence: 'high' },
      { type: 'Exudate-like regions', description: 'Possible cotton-wool spot patterns noted.', confidence: 'high' },
    ],
    reviewStatus: 'Pending Review',
    notes: 'Significant visual change reported by patient.',
  },

  // ─── PT-002 History ─────────────────────────────────────────────────────
  {
    screeningId: 'SCR-2026-004',
    patientId: 'PT-002',
    examinationDate: '2026-03-05',
    eye: 'Right',
    predictedStage: 1,
    stageName: 'Mild DR',
    confidence: 0.881,
    probabilities: {
      noDR: 0.065,
      mild: 0.881,
      moderate: 0.043,
      severe: 0.009,
      proliferative: 0.002,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Microaneurysm-like regions', description: 'Isolated microaneurysm-like dots near disc.', confidence: 'moderate' },
    ],
    reviewStatus: 'Reviewed',
  },
  {
    screeningId: 'SCR-2026-005',
    patientId: 'PT-002',
    examinationDate: '2026-06-22',
    eye: 'Right',
    predictedStage: 1,
    stageName: 'Mild DR',
    confidence: 0.864,
    probabilities: {
      noDR: 0.058,
      mild: 0.864,
      moderate: 0.068,
      severe: 0.008,
      proliferative: 0.002,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Microaneurysm-like regions', description: 'Mild microaneurysm-like regions, stable compared to previous.', confidence: 'moderate' },
    ],
    reviewStatus: 'Reviewed',
  },

  // ─── PT-003 History ─────────────────────────────────────────────────────
  {
    screeningId: 'SCR-2026-006',
    patientId: 'PT-003',
    examinationDate: '2026-07-30',
    eye: 'Right',
    predictedStage: 0,
    stageName: 'No DR',
    confidence: 0.961,
    probabilities: {
      noDR: 0.961,
      mild: 0.028,
      moderate: 0.007,
      severe: 0.003,
      proliferative: 0.001,
    },
    heatmapAvailable: false,
    potentialFindings: [],
    reviewStatus: 'Reviewed',
    notes: 'Annual screening. No significant findings.',
  },

  // ─── PT-004 History ─────────────────────────────────────────────────────
  {
    screeningId: 'SCR-2026-007',
    patientId: 'PT-004',
    examinationDate: '2026-02-18',
    eye: 'Left',
    predictedStage: 4,
    stageName: 'Proliferative DR',
    confidence: 0.889,
    probabilities: {
      noDR: 0.002,
      mild: 0.008,
      moderate: 0.022,
      severe: 0.079,
      proliferative: 0.889,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Neovascularization-like regions', description: 'Possible new vessel formation pattern near disc.', confidence: 'high' },
      { type: 'Hemorrhage-like regions', description: 'Pre-retinal and vitreous hemorrhage patterns.', confidence: 'high' },
      { type: 'Fibrous tissue-like regions', description: 'Possible fibrovascular proliferation pattern.', confidence: 'moderate' },
    ],
    reviewStatus: 'Flagged',
    notes: 'Urgent ophthalmic review recommended per model output.',
  },
  {
    screeningId: 'SCR-2026-008',
    patientId: 'PT-004',
    examinationDate: '2026-05-10',
    eye: 'Left',
    predictedStage: 4,
    stageName: 'Proliferative DR',
    confidence: 0.902,
    probabilities: {
      noDR: 0.001,
      mild: 0.005,
      moderate: 0.014,
      severe: 0.078,
      proliferative: 0.902,
    },
    heatmapAvailable: true,
    potentialFindings: [
      { type: 'Neovascularization-like regions', description: 'Increased NV-like pattern extent.', confidence: 'high' },
      { type: 'Hemorrhage-like regions', description: 'Extensive hemorrhage-like regions.', confidence: 'high' },
    ],
    reviewStatus: 'Flagged',
    notes: 'Urgent referral indicated based on model output.',
  },
];

// Current result used on Results page after a new screening
export const MOCK_CURRENT_RESULT: ScreeningResult = MOCK_RESULTS[1]; // SCR-2026-002

/**
 * mockPatients.ts — extended patient profile data.
 * Keyed by userId (matches MOCK_USERS id).
 */

export interface MockPatientProfile {
  userId: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  medicalHistory: string;
  diabetesHistory: string;
  eyeHistory: string;
}

export const MOCK_PATIENT_PROFILES: MockPatientProfile[] = [
  {
    userId: 'patient-001',
    dateOfBirth: '1988-04-12',
    gender: 'Female',
    phone: '+1 (555) 102-3344',
    medicalHistory: 'Type 2 diabetes (diagnosed 2018). Hypertension under control.',
    diabetesHistory: 'HbA1c last measured at 7.2%. On oral hypoglycaemics.',
    eyeHistory: 'No prior retinal conditions. Glasses for mild myopia.',
  },
  {
    userId: 'patient-002',
    dateOfBirth: '1975-09-28',
    gender: 'Male',
    phone: '+1 (555) 209-6677',
    medicalHistory: 'Type 1 diabetes (diagnosed 1998). Periodic nephropathy check-ups.',
    diabetesHistory: 'HbA1c at 8.1%. On insulin therapy.',
    eyeHistory: 'Mild DR detected in 2023. Under periodic monitoring.',
  },
  {
    userId: 'patient-003',
    dateOfBirth: '1992-07-14',
    gender: 'Female',
    phone: '+1 (555) 318-9900',
    medicalHistory: 'Type 2 diabetes (diagnosed 2020). Well-controlled with diet and metformin.',
    diabetesHistory: 'HbA1c at 6.8%. No current insulin dependency.',
    eyeHistory: 'No prior eye conditions. First retinal screening requested.',
  },
  {
    userId: 'patient-004',
    dateOfBirth: '1968-11-02',
    gender: 'Male',
    phone: '+1 (555) 427-1155',
    medicalHistory: 'Type 2 diabetes (diagnosed 2010). Hypertension and moderate dyslipidaemia.',
    diabetesHistory: 'HbA1c at 9.0%. On insulin + oral agents.',
    eyeHistory: 'Previous laser photocoagulation (left eye, 2019). Regular follow-up required.',
  },
];

/** Runtime array for newly signed-up patients */
export const runtimePatientProfiles: MockPatientProfile[] = [...MOCK_PATIENT_PROFILES];

export function getPatientProfile(userId: string): MockPatientProfile | undefined {
  return runtimePatientProfiles.find(p => p.userId === userId);
}

export function addPatientProfile(profile: MockPatientProfile): void {
  runtimePatientProfiles.push(profile);
}

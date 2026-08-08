import type { Patient } from '../types';

/**
 * Mock patient roster used for development/demo purposes.
 * Replace with real API calls when backend is available.
 */
export const MOCK_PATIENTS: Patient[] = [
  {
    patientId: 'PT-001',
    name: 'Demo Patient A',
    age: 58,
    diabetesDuration: 12,
    lastScreening: '2026-07-15',
  },
  {
    patientId: 'PT-002',
    name: 'Demo Patient B',
    age: 64,
    diabetesDuration: 8,
    lastScreening: '2026-06-22',
  },
  {
    patientId: 'PT-003',
    name: 'Demo Patient C',
    age: 47,
    diabetesDuration: 5,
    lastScreening: '2026-07-30',
  },
  {
    patientId: 'PT-004',
    name: 'Demo Patient D',
    age: 71,
    diabetesDuration: 18,
    lastScreening: '2026-05-10',
  },
];

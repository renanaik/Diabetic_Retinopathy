import React from 'react';
import { useParams } from 'react-router-dom';

export const PatientDoctorProfile: React.FC = () => {
  const { doctorId } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Doctor Profile</h1>
      <div className="card p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Viewing details for doctor ID: {doctorId}</p>
      </div>
    </div>
  );
};

import React from 'react';
import type { ScreeningFormData } from '../../types';

interface PatientInfoFormProps {
  data: ScreeningFormData;
  onChange: (data: ScreeningFormData) => void;
  disabled?: boolean;
}

export const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  data,
  onChange,
  disabled = false,
}) => {
  const handleChange = <K extends keyof ScreeningFormData>(
    key: K,
    value: ScreeningFormData[K]
  ) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Patient ID */}
      <div>
        <label htmlFor="patient-id" className="label">
          Patient ID <span className="text-red-500">*</span>
        </label>
        <input
          id="patient-id"
          type="text"
          className="input"
          placeholder="e.g. PT-001"
          value={data.patientId}
          onChange={(e) => handleChange('patientId', e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      {/* Examination Date */}
      <div>
        <label htmlFor="exam-date" className="label">
          Examination Date <span className="text-red-500">*</span>
        </label>
        <input
          id="exam-date"
          type="date"
          className="input"
          value={data.examinationDate}
          onChange={(e) => handleChange('examinationDate', e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      {/* Eye */}
      <div>
        <label className="label">
          Eye <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3" role="radiogroup" aria-label="Eye selection">
          {(['Left', 'Right'] as const).map((eye) => (
            <label
              key={eye}
              className={[
                'flex-1 flex items-center justify-center gap-2 border rounded-md py-2 px-3 text-sm cursor-pointer transition-colors',
                data.eye === eye
                  ? 'border-navy-600 bg-navy-50 text-navy-700 font-medium'
                  : 'border-clinical-border bg-white text-clinical-muted hover:border-navy-300',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name="eye-selection"
                value={eye}
                checked={data.eye === eye}
                onChange={() => handleChange('eye', eye)}
                disabled={disabled}
                className="sr-only"
              />
              {eye} Eye
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Clinical Notes{' '}
          <span className="text-clinical-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          className="input resize-none"
          placeholder="Any relevant clinical information…"
          rows={3}
          value={data.notes ?? ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

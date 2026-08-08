import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ProgressTimeline } from '../components/progress/ProgressTimeline';
import { ImageComparison } from '../components/progress/ImageComparison';
import { Card } from '../components/ui/Card';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Disclaimer } from '../components/ui/Disclaimer';
import { getPatientHistory, getPatients } from '../services/api';
import type { ScreeningResult, Patient } from '../types';
import { DR_STAGES } from '../types';
import { Users, TrendingUp } from 'lucide-react';

export const ProgressTrackerPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('PT-001');
  const [selectedEye, setSelectedEye] = useState<'All' | 'Left' | 'Right'>('All');
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPatients().then(res => setPatients(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getPatientHistory(selectedPatientId).then((res) => {
      const data = selectedEye === 'All'
        ? res.data
        : res.data.filter(r => r.eye === selectedEye);
      setResults(data);
      setLoading(false);
    });
  }, [selectedPatientId, selectedEye]);

  const sorted = [...results].sort(
    (a, b) => new Date(a.examinationDate).getTime() - new Date(b.examinationDate).getTime()
  );

  const hasComparison = sorted.length >= 2;
  const previous = sorted[sorted.length - 2];
  const current = sorted[sorted.length - 1];

  // Stage progression data for mini chart
  const stageProgression = sorted.map(r => ({
    date: new Date(r.examinationDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    stage: r.predictedStage,
    stageName: r.stageName,
    confidence: r.confidence,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Disease Progress Tracker"
        subtitle="Track AI-predicted DR changes across multiple retinal examinations."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Progress Tracker' }]}
      />

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="patient-selector" className="label">Patient ID</label>
          <select
            id="patient-selector"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="select w-40"
          >
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.patientId}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="eye-filter" className="label">Eye Filter</label>
          <select
            id="eye-filter"
            value={selectedEye}
            onChange={(e) => setSelectedEye(e.target.value as 'All' | 'Left' | 'Right')}
            className="select w-36"
          >
            <option value="All">Both Eyes</option>
            <option value="Left">Left Eye</option>
            <option value="Right">Right Eye</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading examination history…" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No examinations found"
          description="Select a different patient or eye filter."
        />
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Timeline — 2/5 */}
          <div className="lg:col-span-2">
            <Card padding="md">
              <div className="mb-4">
                <p className="text-sm font-semibold text-navy-800">Examination Timeline</p>
                <p className="text-xs text-clinical-muted mt-0.5">
                  {results.length} examination{results.length !== 1 ? 's' : ''} — {selectedPatientId}
                </p>
              </div>
              <ProgressTimeline results={results} />
            </Card>
          </div>

          {/* Right — 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mini stage chart */}
            {stageProgression.length > 0 && (
              <Card padding="md">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-navy-800">Stage Progression Chart</p>
                  <p className="text-xs text-clinical-muted mt-0.5">
                    AI-predicted DR stage over time
                  </p>
                </div>
                <div className="flex items-end gap-3 h-28 px-2">
                  {stageProgression.map((pt, i) => {
                    const h = Math.max(20, (pt.stage / 4) * 90);
                    const colors = ['bg-green-400', 'bg-yellow-400', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-navy-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {pt.stageName} · {Math.round(pt.confidence * 100)}%
                        </div>
                        <div
                          className={`w-full rounded-t ${colors[pt.stage]} transition-all duration-300`}
                          style={{ height: `${h}%` }}
                        />
                        <p className="text-xs text-clinical-muted text-center leading-tight" style={{ fontSize: '10px' }}>
                          {pt.date}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* Y-axis legend */}
                <div className="mt-2 flex justify-between text-xs text-clinical-muted px-2">
                  {['No DR', 'Mild', 'Moderate', 'Severe', 'Prolif.'].map(l => (
                    <span key={l} style={{ fontSize: '9px' }}>{l}</span>
                  ))}
                </div>
              </Card>
            )}

            {/* Image comparison */}
            {hasComparison ? (
              <Card padding="md">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-navy-800">Image Comparison</p>
                  <p className="text-xs text-clinical-muted mt-0.5">
                    Compare retinal images between examinations
                  </p>
                </div>
                <ImageComparison previous={previous} current={current} />
              </Card>
            ) : (
              <Card padding="md">
                <EmptyState
                  icon={<TrendingUp size={20} />}
                  title="Only one examination available"
                  description="Image comparison requires at least two examinations for the selected patient and eye."
                />
              </Card>
            )}

            <Disclaimer variant="banner" />
          </div>
        </div>
      )}
    </div>
  );
};

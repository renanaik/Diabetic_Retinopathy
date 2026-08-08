import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { UploadZone } from '../components/screening/UploadZone';
import { PatientInfoForm } from '../components/screening/PatientInfoForm';
import { RetinalImageViewer } from '../components/screening/RetinalImageViewer';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/ui/Disclaimer';
import { Card } from '../components/ui/Card';
import { analyzeRetinalImage } from '../services/api';
import type { ScreeningFormData } from '../types';
import { ScanLine, CheckCircle, AlertCircle } from 'lucide-react';

type AnalysisStep =
  | 'idle'
  | 'preparing'
  | 'extracting'
  | 'running'
  | 'generating'
  | 'done'
  | 'error';

const STEPS: { key: AnalysisStep; label: string }[] = [
  { key: 'preparing',  label: 'Preparing image…' },
  { key: 'extracting', label: 'Extracting retinal features…' },
  { key: 'running',    label: 'Running AI model…' },
  { key: 'generating', label: 'Generating screening result…' },
];

const STEP_DURATION_MS = 800; // per step before API call resolves

export const ScreeningPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ScreeningFormData>({
    patientId: '',
    examinationDate: new Date().toISOString().split('T')[0],
    eye: 'Left',
    notes: '',
  });

  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isFormValid =
    selectedFile !== null &&
    formData.patientId.trim() !== '' &&
    formData.examinationDate !== '';

  const handleAnalyze = async () => {
    if (!isFormValid || !selectedFile) return;

    setAnalysisError(null);
    setProgress(0);

    // Step through stages for UX feedback
    const stepKeys = STEPS.map(s => s.key);
    for (let i = 0; i < stepKeys.length; i++) {
      setAnalysisStep(stepKeys[i] as AnalysisStep);
      setProgress(Math.round(((i + 1) / (stepKeys.length + 1)) * 100));
      await new Promise(r => setTimeout(r, STEP_DURATION_MS));
    }

    try {
      const result = await analyzeRetinalImage({
        imageFile: selectedFile,
        patientId: formData.patientId,
        examinationDate: formData.examinationDate,
        eye: formData.eye,
        notes: formData.notes,
      });

      if (result.success) {
        setAnalysisStep('done');
        setProgress(100);
        // Brief pause to show 100%
        await new Promise(r => setTimeout(r, 400));
        navigate(`/results/${result.data.screeningId}`);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      setAnalysisStep('error');
      setAnalysisError('Model analysis failed. Please try again.');
    }
  };

  const currentStepLabel = STEPS.find(s => s.key === analysisStep)?.label ?? '';
  const isAnalyzing = !['idle', 'done', 'error'].includes(analysisStep);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="New Retinal Screening"
        subtitle="Upload a retinal fundus photograph for AI-assisted screening."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'New Screening' }]}
      />

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-navy-800">Retinal Fundus Image</p>
            <p className="text-xs text-clinical-muted mt-0.5">
              Upload a clear, well-illuminated fundus photograph.
            </p>
          </div>

          <UploadZone
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={(file, url) => {
              setSelectedFile(file);
              setPreviewUrl(url);
              setAnalysisStep('idle');
              setAnalysisError(null);
            }}
            onImageRemoved={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              setAnalysisStep('idle');
            }}
            className="min-h-64"
          />

          {/* Placeholder viewer when no image selected */}
          {!selectedFile && (
            <div className="mt-4">
              <p className="text-xs text-clinical-muted mb-2 text-center">
                Example: How a retinal fundus image appears
              </p>
              <div className="rounded-lg overflow-hidden border border-clinical-border max-w-xs mx-auto opacity-60">
                <RetinalImageViewer aspectRatio="square" className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div>
          <Card padding="md">
            <div className="mb-4">
              <p className="text-sm font-semibold text-navy-800">Examination Information</p>
              <p className="text-xs text-clinical-muted mt-0.5">
                Complete all required fields before analysis.
              </p>
            </div>

            <PatientInfoForm
              data={formData}
              onChange={setFormData}
              disabled={isAnalyzing}
            />

            {/* Analysis progress */}
            {isAnalyzing && (
              <div className="mt-5 p-4 bg-clinical-bg border border-clinical-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500 pulse-dot" />
                  <p className="text-xs font-medium text-navy-700">{currentStepLabel}</p>
                </div>
                <div className="h-1.5 bg-clinical-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-clinical-muted mt-1.5 text-right">{progress}%</p>
              </div>
            )}

            {/* Error state */}
            {analysisStep === 'error' && analysisError && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{analysisError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="mt-5 pt-4 border-t border-clinical-border">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                disabled={!isFormValid || isAnalyzing}
                loading={isAnalyzing}
                onClick={handleAnalyze}
                icon={<ScanLine size={18} />}
              >
                Analyze Retinal Image
              </Button>

              {!selectedFile && (
                <p className="text-xs text-clinical-muted text-center mt-2">
                  Upload an image to enable analysis.
                </p>
              )}
              {selectedFile && !formData.patientId && (
                <p className="text-xs text-clinical-muted text-center mt-2">
                  Enter a Patient ID to continue.
                </p>
              )}
            </div>
          </Card>

          <div className="mt-4">
            <Disclaimer variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
};

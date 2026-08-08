import React from 'react';
import { Eye, Circle } from 'lucide-react';

interface RetinalImageViewerProps {
  imageUrl?: string;
  showHeatmap?: boolean;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait';
}

/**
 * Retinal fundus image viewer.
 * When imageUrl is not provided, renders a realistic fundus-like placeholder.
 * When showHeatmap is true, overlays a Grad-CAM style attention map.
 */
export const RetinalImageViewer: React.FC<RetinalImageViewerProps> = ({
  imageUrl,
  showHeatmap = false,
  label,
  className = '',
  aspectRatio = 'square',
}) => {
  const containerClass = aspectRatio === 'portrait' ? 'aspect-[4/3]' : 'aspect-square';

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${containerClass} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Retinal fundus image"
          className="w-full h-full object-cover"
        />
      ) : (
        /* Realistic fundus placeholder */
        <FundusPlaceholder showHeatmap={showHeatmap} />
      )}

      {showHeatmap && !imageUrl && (
        <div className="heatmap-overlay absolute inset-0" />
      )}

      {/* Image label */}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-xs font-medium text-white/90">{label}</p>
        </div>
      )}
    </div>
  );
};

const FundusPlaceholder: React.FC<{ showHeatmap?: boolean }> = ({ showHeatmap }) => (
  <div className="w-full h-full relative retinal-placeholder">
    {/* Optic disc */}
    <div
      className="absolute rounded-full"
      style={{
        width: '14%',
        height: '14%',
        top: '42%',
        left: '62%',
        background: 'radial-gradient(circle, rgba(255,200,120,0.9) 0%, rgba(220,140,60,0.7) 60%, transparent 100%)',
        transform: 'translate(-50%, -50%)',
      }}
    />
    {/* Macula */}
    <div
      className="absolute rounded-full"
      style={{
        width: '8%',
        height: '8%',
        top: '50%',
        left: '42%',
        background: 'radial-gradient(circle, rgba(90,30,0,0.6) 0%, transparent 100%)',
        transform: 'translate(-50%, -50%)',
      }}
    />
    {/* Major vessels */}
    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
      {/* Superior temporal vessel */}
      <path d="M 65 48 Q 55 35 40 28 Q 30 24 20 22" stroke="rgba(180,80,40,0.8)" strokeWidth="0.7" fill="none" />
      <path d="M 65 48 Q 55 35 40 28 Q 30 24 20 22" stroke="rgba(220,100,50,0.4)" strokeWidth="1.2" fill="none" />
      {/* Inferior temporal vessel */}
      <path d="M 65 52 Q 55 62 42 68 Q 33 73 22 76" stroke="rgba(180,80,40,0.8)" strokeWidth="0.7" fill="none" />
      <path d="M 65 52 Q 55 62 42 68 Q 33 73 22 76" stroke="rgba(220,100,50,0.4)" strokeWidth="1.2" fill="none" />
      {/* Superior nasal vessel */}
      <path d="M 65 48 Q 72 40 78 34 Q 82 28 85 22" stroke="rgba(180,80,40,0.7)" strokeWidth="0.5" fill="none" />
      {/* Inferior nasal vessel */}
      <path d="M 65 52 Q 72 60 78 66 Q 82 72 85 78" stroke="rgba(180,80,40,0.7)" strokeWidth="0.5" fill="none" />
      {/* Branches */}
      <path d="M 50 33 Q 45 30 42 27" stroke="rgba(160,70,30,0.5)" strokeWidth="0.4" fill="none" />
      <path d="M 50 66 Q 45 69 42 71" stroke="rgba(160,70,30,0.5)" strokeWidth="0.4" fill="none" />
      <path d="M 35 28 Q 30 29 25 32" stroke="rgba(160,70,30,0.4)" strokeWidth="0.3" fill="none" />
      <path d="M 35 70 Q 30 70 25 69" stroke="rgba(160,70,30,0.4)" strokeWidth="0.3" fill="none" />
    </svg>

    {/* Subtle vignette */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)',
        pointerEvents: 'none',
      }}
    />

    {/* Heatmap overlay if requested */}
    {showHeatmap && (
      <>
        <div
          className="absolute rounded-full"
          style={{
            width: '30%',
            height: '25%',
            top: '45%',
            left: '43%',
            background: 'radial-gradient(ellipse, rgba(255,30,0,0.55) 0%, rgba(255,120,0,0.35) 40%, rgba(255,200,0,0.2) 70%, transparent 100%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(3px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '18%',
            height: '15%',
            top: '35%',
            left: '30%',
            background: 'radial-gradient(ellipse, rgba(255,80,0,0.4) 0%, rgba(255,180,0,0.2) 50%, transparent 100%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(4px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '14%',
            height: '12%',
            top: '65%',
            left: '55%',
            background: 'radial-gradient(ellipse, rgba(255,100,0,0.35) 0%, rgba(255,200,0,0.15) 50%, transparent 100%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(3px)',
          }}
        />
      </>
    )}
  </div>
);

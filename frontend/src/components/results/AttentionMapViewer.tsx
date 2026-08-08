import React, { useState } from 'react';
import { RetinalImageViewer } from '../screening/RetinalImageViewer';
import { Info } from 'lucide-react';

interface AttentionMapViewerProps {
  imageUrl?: string;
  heatmapUrl?: string;
  className?: string;
}

type Tab = 'original' | 'heatmap';

export const AttentionMapViewer: React.FC<AttentionMapViewerProps> = ({
  imageUrl,
  heatmapUrl,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('original');

  return (
    <div className={className}>
      {/* Tab controls */}
      <div className="flex items-center gap-1 mb-3 border border-clinical-border rounded-lg p-1 bg-clinical-bg w-fit">
        {(['original', 'heatmap'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
              activeTab === tab
                ? 'bg-white text-navy-700 shadow-clinical border border-clinical-border'
                : 'text-clinical-muted hover:text-navy-600',
            ].join(' ')}
          >
            {tab === 'original' ? 'Original' : 'AI Attention Map'}
          </button>
        ))}
      </div>

      {/* Image area */}
      <div className="relative rounded-lg overflow-hidden">
        <RetinalImageViewer
          imageUrl={activeTab === 'heatmap' ? heatmapUrl : imageUrl}
          showHeatmap={activeTab === 'heatmap'}
          label={
            activeTab === 'original'
              ? 'Retinal Fundus Image — Original'
              : 'Grad-CAM Attention Map — Model Focus Regions'
          }
          className="w-full"
          aspectRatio="portrait"
        />

        {activeTab === 'heatmap' && (
          /* Colormap legend */
          <div className="absolute top-3 left-3 bg-white/90 border border-clinical-border rounded-md px-2.5 py-2 shadow-clinical-md">
            <p className="text-xs font-semibold text-navy-800 mb-1.5">Attention Intensity</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-24 rounded-full" style={{
                background: 'linear-gradient(to right, rgba(0,200,100,0.6), rgba(255,200,0,0.7), rgba(255,100,0,0.8), rgba(255,0,0,0.9))'
              }} />
              <div className="flex justify-between w-24 text-xs text-clinical-muted" style={{ marginLeft: '-94px' }}>
                <span style={{ marginLeft: '-2px' }}>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation note */}
      {activeTab === 'heatmap' && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">Model Attention / Important Regions.</span>{' '}
            Highlighted regions represent areas that contributed strongly to the model's prediction using Grad-CAM visualization.
            They should <span className="font-semibold">not</span> be interpreted as definitive lesion boundaries or confirmed clinical findings.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onImageRemoved: () => void;
  selectedFile?: File | null;
  previewUrl?: string | null;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_MB = 20;

export const UploadZone: React.FC<UploadZoneProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedFile,
  previewUrl,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are accepted.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File size must be under ${MAX_SIZE_MB} MB.`);
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
      e.target.value = '';
    },
    [validateAndSelect]
  );

  // Show preview if image is selected
  if (previewUrl && selectedFile) {
    return (
      <div className={`relative rounded-lg overflow-hidden border border-clinical-border bg-black ${className}`}>
        <img
          src={previewUrl}
          alt="Uploaded retinal image"
          className="w-full h-full object-contain max-h-96"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <label
            htmlFor="replace-image-input"
            className="cursor-pointer flex items-center gap-1.5 bg-white/90 hover:bg-white border border-clinical-border rounded-md px-2.5 py-1.5 text-xs font-medium text-navy-700 transition-colors shadow-clinical"
          >
            <Upload size={12} />
            Replace
          </label>
          <button
            onClick={onImageRemoved}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white border border-clinical-border rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors shadow-clinical"
          >
            <X size={12} />
            Remove
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-xs text-white/80 truncate">{selectedFile.name}</p>
          <p className="text-xs text-white/60">
            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        <input
          id="replace-image-input"
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          'relative border-2 border-dashed rounded-lg transition-colors duration-150',
          'flex flex-col items-center justify-center gap-3 p-8 min-h-64',
          isDragging
            ? 'border-teal-400 bg-teal-50'
            : 'border-clinical-border bg-clinical-bg hover:border-teal-300 hover:bg-teal-50/30',
        ].join(' ')}
      >
        <div className="w-14 h-14 rounded-full bg-white border border-clinical-border flex items-center justify-center shadow-clinical">
          <ImageIcon size={24} className="text-clinical-muted" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-navy-700">
            {isDragging ? 'Drop the image here' : 'Upload a retinal fundus image'}
          </p>
          <p className="text-xs text-clinical-muted mt-1">
            Drag &amp; drop or{' '}
            <label
              htmlFor="fundus-image-input"
              className="text-teal-600 hover:text-teal-700 cursor-pointer underline underline-offset-2 font-medium"
            >
              browse files
            </label>
          </p>
          <p className="text-xs text-clinical-muted mt-1">
            Accepted: JPG, JPEG, PNG &nbsp;·&nbsp; Max {MAX_SIZE_MB} MB
          </p>
        </div>

        <input
          id="fundus-image-input"
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

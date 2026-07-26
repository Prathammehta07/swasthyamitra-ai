import React, { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function SmartWoundTriage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setUploadStatus('idle');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max dimension for triage is 800px to save rural bandwidth
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Highly compressed JPEG to ensure it sends over 2G/3G
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setImagePreview(compressedDataUrl);
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!imagePreview) return;
    
    // In a real implementation, this would POST the base64 string to S3/Cloudinary or the backend
    // Since we are mocking the network layer for now, we just show success
    setUploadStatus('success');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <Camera className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Smart Image Triage</h3>
          <p className="text-xs text-slate-500">Upload a clear photo before your consultation.</p>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleImageCapture}
        className="hidden"
      />

      {!imagePreview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <Camera className="h-10 w-10 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Tap to Take Photo</p>
          <p className="text-xs text-slate-400 mt-1">Saves bandwidth via auto-compression</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black">
            <img 
              src={imagePreview} 
              alt="Wound Triage Preview" 
              className="w-full h-48 object-contain"
            />
            <button 
              onClick={() => { setImagePreview(null); setUploadStatus('idle'); }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 text-xs px-2 hover:bg-black/70"
            >
              Retake
            </button>
          </div>
          
          {uploadStatus === 'idle' && (
            <Button onClick={handleUpload} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Upload for Doctor Review
            </Button>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5" />
              Image successfully queued for doctor!
            </div>
          )}
        </div>
      )}

      {isCompressing && (
        <p className="text-center text-xs text-blue-600 mt-2 animate-pulse">
          Compressing for low bandwidth...
        </p>
      )}
    </div>
  );
}

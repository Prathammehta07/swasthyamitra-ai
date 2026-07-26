import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DocumentUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFile(null);

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if file is > 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      setError(`Image too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Rural 3G networks will struggle to upload this. Please compress the image or take a lower resolution photo before uploading.`);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
        onClick={handleUploadClick}
      >
        <UploadCloud className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="font-semibold mb-1">Upload Lab Reports</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tap to select a document or image (Max size: 5MB)
        </p>
        <Button variant="secondary" size="sm">Select File</Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf" 
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>File Too Heavy!</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {file && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-900">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>File Ready</AlertTitle>
          <AlertDescription className="flex items-center mt-2">
            <FileImage className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium truncate mr-2">{file.name}</span>
            <span className="text-xs text-green-600/80">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

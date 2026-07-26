import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function CoughAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setUploadStatus('idle');

      // Auto-stop after 5 seconds to ensure low file size for rural connections
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);

    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = () => {
    if (!audioUrl) return;
    // In a real implementation, upload the Blob to S3 or backend API
    setUploadStatus('success');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <Mic className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Respiratory Audio Screening</h3>
          <p className="text-xs text-slate-500">Record a 5-second cough sample for the doctor.</p>
        </div>
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 shadow-md p-0 flex items-center justify-center"
            >
              <Mic className="h-8 w-8 text-white" />
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              className="rounded-full h-16 w-16 bg-slate-800 hover:bg-slate-900 shadow-md p-0 flex items-center justify-center animate-pulse"
            >
              <Square className="h-6 w-6 text-white" fill="white" />
            </Button>
          )}
          <p className="mt-4 font-semibold text-slate-700">
            {isRecording ? "Recording... (Auto-stops at 5s)" : "Tap to Record"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-lg flex items-center gap-4">
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full bg-white h-10 w-10 shrink-0 border-slate-200"
              onClick={() => {
                const audio = new Audio(audioUrl);
                audio.play();
              }}
            >
              <Play className="h-5 w-5 text-blue-600 ml-1" fill="currentColor" />
            </Button>
            <div className="flex-1">
              <div className="h-2 bg-blue-200 rounded-full w-full">
                <div className="h-2 bg-blue-600 rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">Cough_Sample_compressed.webm</p>
            </div>
            <button 
              onClick={() => { setAudioUrl(null); setUploadStatus('idle'); }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Retake
            </button>
          </div>

          {uploadStatus === 'idle' && (
            <Button onClick={handleUpload} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Upload Audio Sample
            </Button>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5" />
              Audio successfully queued for doctor!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

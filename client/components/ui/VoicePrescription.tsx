import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface VoicePrescriptionProps {
  text: string;
  lang?: string; // Default to English, but allows for Hindi/Gujarati
}

export function VoicePrescription({ text, lang = 'en-US' }: VoicePrescriptionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [currentLang, setCurrentLang] = useState(lang);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handlePlay = () => {
    if (!isSupported) {
      toast.error('Voice guidance is not supported on this device.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      toast.error('No prescription text to read.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent garbage collection
    utterance.lang = currentLang;
    
    // Find a voice matching the selected language
    const preferredVoice = voices.find(v => v.lang.startsWith(currentLang.split('-')[0]));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsPlaying(false);
      toast.error('Error playing voice guidance.');
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <Select value={currentLang} onValueChange={setCurrentLang} disabled={isPlaying}>
        <SelectTrigger className="w-[110px] h-9 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en-US">English</SelectItem>
          <SelectItem value="hi-IN">Hindi</SelectItem>
          <SelectItem value="gu-IN">Gujarati</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePlay}
        className={`flex items-center gap-2 ${isPlaying ? 'bg-primary/10 text-primary border-primary' : ''}`}
        aria-label={isPlaying ? 'Stop voice reading' : 'Read aloud'}
      >
        {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        <span>{isPlaying ? 'Stop Reading' : 'Listen'}</span>
      </Button>
    </div>
  );
}

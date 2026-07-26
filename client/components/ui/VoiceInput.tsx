import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Ensure TypeScript knows about window.SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceInputProps {
  onResult: (text: string) => void;
  lang?: string; // Default to 'hi-IN' for Hindi, allows 'gu-IN' for Gujarati
  className?: string;
}

export function VoiceInput({ onResult, lang = 'hi-IN', className = '' }: VoiceInputProps) {
  const [currentLang, setCurrentLang] = useState(lang);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = currentLang;

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
      toast.success('Voice input recognized');
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, [currentLang, onResult]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser.');
      return;
    }

    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.info('Listening... Please speak now.');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast.error('Failed to start voice input. Please try again.');
        setIsListening(false);
      }
    }
  }, [isListening, isSupported, recognition]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={currentLang} onValueChange={setCurrentLang} disabled={isListening}>
        <SelectTrigger className="w-[110px] h-10 text-xs shrink-0">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hi-IN">Hindi</SelectItem>
          <SelectItem value="gu-IN">Gujarati</SelectItem>
          <SelectItem value="en-US">English</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleListening}
        className={`shrink-0 transition-colors ${
          isListening ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200 hover:text-red-700' : ''
        }`}
        title={isListening ? "Stop Listening" : "Start Voice Input"}
        aria-label={isListening ? "Stop Listening" : "Start Voice Input"}
      >
        {isListening ? (
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <Mic className="relative h-4 w-4" />
          </span>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

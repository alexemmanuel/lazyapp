import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRegion } from '../context/RegionContext';
import { Mic, Disc } from 'lucide-react';

interface VoiceButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

// Window declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function VoiceButton({
  onTranscript,
  className = '',
  size = 'md',
  title = 'Voice input',
}: VoiceButtonProps) {
  const { detectedCountry } = useRegion();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Determine speech recognition language based on detectedCountry
  const getRecognitionLang = useCallback((country: string) => {
    switch (country) {
      case 'NG':
        return 'en-NG'; // Optimized for Nigerian accents
      case 'US':
        return 'en-US';
      case 'GB':
        return 'en-GB';
      case 'CA':
        return 'en-CA';
      case 'AU':
        return 'en-AU';
      case 'IN':
        return 'en-IN';
      case 'ZA':
        return 'en-ZA';
      case 'GH':
        return 'en-GH';
      case 'KE':
        return 'en-KE';
      default:
        return 'en-US';
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getRecognitionLang(detectedCountry);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[0]?.[0]?.transcript?.trim() || '';
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        const errorMsg =
          event.error === 'not-allowed'
            ? 'Microphone access denied. Please enable mic permissions in your browser.'
            : event.error === 'no-speech'
            ? 'No speech detected. Please speak clearly into your mic.'
            : 'Voice recognition unavailable. Please try again.';

        window.dispatchEvent(
          new CustomEvent('lazy:push-notification', {
            detail: { message: errorMsg },
          })
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [detectedCountry, getRecognitionLang, onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported || !recognitionRef.current) {
      window.dispatchEvent(
        new CustomEvent('lazy:push-notification', {
          detail: {
            message:
              'Voice recognition is not supported in this browser. Please type manually.',
          },
        })
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = getRecognitionLang(detectedCountry);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
        try {
          recognitionRef.current.abort();
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      }
    }
  };

  // Sizing styles
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={isListening ? 'Stop listening' : title}
      title={isListening ? 'Listening... click to stop' : title}
      className={`relative inline-flex items-center justify-center rounded-2xl transition-all duration-200 select-none cursor-pointer flex-shrink-0 touch-manipulation ${sizeClasses} ${
        isListening
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 scale-105 shadow-lg shadow-rose-500/25 ring-2 ring-rose-500/30'
          : 'bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-border/40'
      } ${className}`}
    >
      {isListening ? (
        <span className="relative flex items-center justify-center">
          <span className="absolute h-3 w-3 rounded-full bg-rose-500 animate-ping opacity-75" />
          <Disc className={`${iconSizes} text-rose-500 animate-pulse`} />
        </span>
      ) : (
        <Mic className={iconSizes} />
      )}
    </button>
  );
}

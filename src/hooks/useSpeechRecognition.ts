import { useState, useCallback, useRef } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'fa-IR', onResult, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      const errorMsg = isFirefox
        ? 'ورودی صوتی در Firefox پشتیبانی نمی‌شود. لطفاً از Chrome یا Safari استفاده کنید.'
        : 'مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند. لطفاً از Chrome یا Safari استفاده کنید.';
      alert(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onerror = (event: any) => {
        setIsListening(false);
        let errorMsg = 'خطا در ورودی صوتی';
        if (event.error === 'no-speech') {
          errorMsg = 'صدایی شنیده نشد. لطفاً دوباره امتحان کنید.';
        } else if (event.error === 'not-allowed') {
          errorMsg = 'دسترسی به میکروفون رد شد. لطفاً اجازه دسترسی را در مرورگر فعال کنید.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'میکروفون یافت نشد.';
        }
        onError?.(errorMsg);
      };

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript || '';
        if (text) {
          setTranscript(text);
          onResult?.(text);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      onError?.(err?.message || 'خطا در فعال‌سازی ورودی صوتی');
    }
  }, [lang, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
  };
}

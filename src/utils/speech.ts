// Web Speech API helper for Persian (Farsi) Text-to-Speech

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakPersianText = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported on this browser');
    return false;
  }

  try {
    // Cancel previous speaking if running
    window.speechSynthesis.cancel();

    // Clean text from markdown formatting or symbols
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    // Search for Persian/Farsi or Arabic or general fallback voice
    const voices = window.speechSynthesis.getVoices();
    const farsiVoice = voices.find(
      v => v.lang.includes('fa') || v.lang.includes('fa-IR') || v.name.toLowerCase().includes('persian') || v.name.toLowerCase().includes('farsi')
    );

    if (farsiVoice) {
      utterance.voice = farsiVoice;
      utterance.lang = 'fa-IR';
    } else {
      utterance.lang = 'fa-IR';
    }

    utterance.rate = 0.9; // Slightly slower, friendly for 3rd graders
    utterance.pitch = 1.1; // Gentle, higher pitch for friendly teacher tone

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      currentUtterance = null;
      if (onError) onError();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onError) onError();
    return false;
  }
};

export const stopPersianSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (e) {
      console.error(e);
    }
  }
};

// Speech synthesis removed per user request

export const isSpeechSynthesisSupported = (): boolean => false;

export const speakPersianText = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean => {
  if (onError) onError();
  return false;
};

export const stopPersianSpeech = () => {};

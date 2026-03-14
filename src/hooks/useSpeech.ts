import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface UseSpeech {
  speak: (text: string, options?: SpeechOptions) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  unlockAudio: () => void;
}

export function useSpeech(): UseSpeech {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices (async on some browsers)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();

    // Chrome fires voiceschanged async
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Retry if empty
    if (voicesRef.current.length === 0) {
      let attempts = 0;
      const retry = setInterval(() => {
        loadVoices();
        attempts++;
        if (voicesRef.current.length > 0 || attempts > 10) clearInterval(retry);
      }, 100);
    }

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  // Handle tab visibility: cancel speech when hidden, it will resume on next announcement
  useEffect(() => {
    if (!isSupported) return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isSupported]);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    // Prefer English voices, prefer non-network voices
    const preferred = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Online'));
    return preferred ?? voices.find(v => v.lang.startsWith('en')) ?? voices[0] ?? null;
  };

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.05;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.volume = options.volume ?? 1.0;

    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // iOS Safari requires a user gesture to unlock TTS
  const unlockAudio = useCallback(() => {
    if (!isSupported) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported, unlockAudio };
}

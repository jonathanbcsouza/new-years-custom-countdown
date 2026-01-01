import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Audio files in public/audio folder
const AUDIO_FILES = [
  '/audio/#1-1767238665820.wav',
  '/audio/#1-1767238722256.wav',
  '/audio/#2-1767238733739.wav',
  '/audio/#3-1767238644708.wav',
  '/audio/#3-1767238741761.wav',
  '/audio/#4-1767238633481.wav',
  '/audio/#4-1767238751408.wav',
];

const SOUND_ENABLED_KEY = 'celebration-sound-enabled';

interface UseCelebrationAudioReturn {
  isSoundEnabled: boolean;
  isPlaying: boolean;
  toggleSound: () => void;
}

/**
 * Hook to manage celebration audio playback
 * Plays audio files in sequence during celebration mode
 */
export function useCelebrationAudio(
  isCelebrationMode: boolean
): UseCelebrationAudioReturn {
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage(
    SOUND_ENABLED_KEY,
    true
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Play next audio in sequence
  const playNextAudio = useCallback(() => {
    if (!isSoundEnabled || !isCelebrationMode) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    // Get next audio file (loop through the array)
    const audioSrc = AUDIO_FILES[currentIndexRef.current % AUDIO_FILES.length];
    currentIndexRef.current += 1;

    // Create and play audio
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 0.7;

    audio.onplay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    audio.onended = () => {
      // Play next audio after a short delay
      setTimeout(() => {
        if (isPlayingRef.current && isSoundEnabled) {
          playNextAudio();
        }
      }, 1000); // 1 second gap between tracks
    };

    audio.onerror = () => {
      console.warn('Audio playback error, trying next track');
      setTimeout(() => {
        if (isPlayingRef.current && isSoundEnabled) {
          playNextAudio();
        }
      }, 500);
    };

    audio.play().catch((error) => {
      console.warn('Audio autoplay blocked:', error);
      setIsPlaying(false);
      isPlayingRef.current = false;
    });
  }, [isSoundEnabled, isCelebrationMode]);

  // Start/stop audio based on celebration mode
  useEffect(() => {
    if (isCelebrationMode && isSoundEnabled && !isPlayingRef.current) {
      // Start playing audio
      playNextAudio();
    } else if (!isCelebrationMode || !isSoundEnabled) {
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isCelebrationMode, isSoundEnabled, playNextAudio]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newValue = !prev;
      if (!newValue && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
      return newValue;
    });
  }, [setIsSoundEnabled]);

  return {
    isSoundEnabled,
    isPlaying,
    toggleSound,
  };
}

import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Audio files in public/audio folder (mp3 for smaller size)
const AUDIO_FILES = [
  '/audio/track-1-1767239911340.mp3',
  '/audio/track-2-1767239958278.mp3',
  '/audio/track-3-1767239977776.mp3',
  '/audio/track-4-1767239998265.mp3',
];

const SOUND_ENABLED_KEY = 'celebration-sound-enabled';
const USER_INTERACTED_KEY = 'celebration-user-interacted';

interface UseCelebrationAudioReturn {
  isSoundEnabled: boolean;
  isPlaying: boolean;
  toggleSound: () => void;
}

/**
 * Hook to manage celebration audio playback
 * Plays audio files in sequence during celebration mode
 * Requires user interaction before playing (browser autoplay policy)
 */
export function useCelebrationAudio(
  isCelebrationMode: boolean
): UseCelebrationAudioReturn {
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage(
    SOUND_ENABLED_KEY,
    false // Default to off - user must explicitly enable
  );
  const [hasUserInteracted, setHasUserInteracted] = useLocalStorage(
    USER_INTERACTED_KEY,
    false
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Play next audio in sequence
  const playNextAudio = useCallback(() => {
    if (!isSoundEnabled || !isCelebrationMode || !hasUserInteracted) {
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
    audio.volume = 0.6;

    audio.onplay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    audio.onended = () => {
      // Play next audio after a short delay
      setTimeout(() => {
        if (isPlayingRef.current && isSoundEnabled && hasUserInteracted) {
          playNextAudio();
        }
      }, 2000); // 2 second gap between tracks
    };

    audio.onerror = () => {
      // Skip to next track on error
      setTimeout(() => {
        if (isPlayingRef.current && isSoundEnabled && hasUserInteracted) {
          playNextAudio();
        }
      }, 500);
    };

    audio.play().catch(() => {
      // Silently fail - user hasn't interacted yet
      setIsPlaying(false);
      isPlayingRef.current = false;
    });
  }, [isSoundEnabled, isCelebrationMode, hasUserInteracted]);

  // Start/stop audio based on celebration mode and user interaction
  useEffect(() => {
    if (
      isCelebrationMode &&
      isSoundEnabled &&
      hasUserInteracted &&
      !isPlayingRef.current
    ) {
      playNextAudio();
    } else if (!isCelebrationMode || !isSoundEnabled) {
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
  }, [isCelebrationMode, isSoundEnabled, hasUserInteracted, playNextAudio]);

  // Toggle sound on/off - this counts as user interaction
  const toggleSound = useCallback(() => {
    // Mark that user has interacted
    setHasUserInteracted(true);

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
  }, [setIsSoundEnabled, setHasUserInteracted]);

  return {
    isSoundEnabled,
    isPlaying,
    toggleSound,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Unified display casting hook that supports:
 * - Chromecast (Chrome browser)
 * - AirPlay (Safari browser)
 * - Presentation API (for external displays)
 * - Fullscreen (fallback for all browsers)
 */

// Type declarations for Cast SDK
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: {
      framework: {
        CastContext: {
          getInstance: () => CastContext;
        };
        CastContextEventType: {
          CAST_STATE_CHANGED: string;
        };
        CastState: {
          NO_DEVICES_AVAILABLE: string;
          NOT_CONNECTED: string;
          CONNECTING: string;
          CONNECTED: string;
        };
      };
    };
    chrome?: {
      cast: {
        AutoJoinPolicy: {
          ORIGIN_SCOPED: string;
        };
      };
    };
    WebKitPlaybackTargetAvailabilityEvent?: unknown;
  }
}

interface CastContext {
  setOptions: (options: { receiverApplicationId: string; autoJoinPolicy: string }) => void;
  addEventListener: (type: string, listener: (event: { castState: string }) => void) => void;
  getCastState: () => string;
  requestSession: () => Promise<void>;
  endCurrentSession: (stopCasting: boolean) => void;
  getCurrentSession: () => unknown;
}

// Default Media Receiver app ID
const DEFAULT_RECEIVER_APP_ID = 'CC1AD845';

type CastType = 'chromecast' | 'airplay' | 'presentation' | 'fullscreen' | null;

interface UseDisplayCastReturn {
  // Available options
  isChromecastAvailable: boolean;
  isAirPlayAvailable: boolean;
  isPresentationAvailable: boolean;
  isFullscreenSupported: boolean;
  
  // Current state
  activeCastType: CastType;
  isConnecting: boolean;
  deviceName: string | null;
  
  // Actions
  startChromecast: () => Promise<void>;
  stopChromecast: () => void;
  showAirPlayPicker: () => void;
  startPresentation: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  isFullscreen: boolean;
}

export function useDisplayCast(): UseDisplayCastReturn {
  // Chromecast state
  const [isChromecastAvailable, setIsChromecastAvailable] = useState(false);
  const [chromecastConnected, setChromecastConnected] = useState(false);
  const [chromecastConnecting, setChromecastConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [castContext, setCastContext] = useState<CastContext | null>(null);
  const castInitializedRef = useRef(false);

  // AirPlay state
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const airPlayVideoRef = useRef<HTMLVideoElement | null>(null);

  // Presentation API state
  const [isPresentationAvailable, setIsPresentationAvailable] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullscreenSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled || (document as any).webkitFullscreenEnabled);

  // Determine active cast type
  const activeCastType: CastType = chromecastConnected
    ? 'chromecast'
    : isFullscreen
    ? 'fullscreen'
    : null;

  // Initialize Chromecast
  useEffect(() => {
    if (typeof window === 'undefined' || castInitializedRef.current) return;

    const initializeCastApi = () => {
      if (!window.cast?.framework || !window.chrome?.cast) return;
      if (castInitializedRef.current) return;
      castInitializedRef.current = true;

      try {
        const context = window.cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: DEFAULT_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        setCastContext(context);
        updateCastState(context.getCastState());

        context.addEventListener(
          window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
          (event: { castState: string }) => updateCastState(event.castState)
        );
      } catch (error) {
        console.warn('Failed to initialize Cast SDK:', error);
        castInitializedRef.current = false;
      }
    };

    const updateCastState = (castState: string) => {
      if (!window.cast?.framework) return;
      const { CastState } = window.cast.framework;

      setIsChromecastAvailable(castState !== CastState.NO_DEVICES_AVAILABLE);
      setChromecastConnected(castState === CastState.CONNECTED);
      setChromecastConnecting(castState === CastState.CONNECTING);

      if (castState === CastState.CONNECTED) {
        const session = castContext?.getCurrentSession() as any;
        setDeviceName(session?.getCastDevice?.()?.friendlyName || 'Chromecast');
      } else {
        setDeviceName(null);
      }
    };

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) initializeCastApi();
    };

    if (window.cast?.framework) {
      initializeCastApi();
    }
  }, [castContext]);

  // Check for AirPlay availability (Apple devices)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // AirPlay is available on Apple devices
    // Detect Mac, iPad, iPhone - these can use AirPlay/Screen Mirroring
    const platform = navigator.platform || '';
    const userAgent = navigator.userAgent || '';
    
    const isMac = platform.toUpperCase().includes('MAC');
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    // AirPlay option should be shown on Apple devices
    setIsAirPlayAvailable(isMac || isIOS || isSafari);
  }, []);

  // Check for Presentation API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'presentation' in navigator) {
      setIsPresentationAvailable(true);
    }
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Chromecast actions
  const startChromecast = useCallback(async () => {
    if (!castContext) return;
    try {
      setChromecastConnecting(true);
      await castContext.requestSession();
    } catch (error) {
      console.warn('Failed to start Chromecast:', error);
      setChromecastConnecting(false);
    }
  }, [castContext]);

  const stopChromecast = useCallback(() => {
    if (!castContext) return;
    try {
      castContext.endCurrentSession(true);
      setChromecastConnected(false);
      setDeviceName(null);
    } catch (error) {
      console.warn('Failed to stop Chromecast:', error);
    }
  }, [castContext]);

  // AirPlay action - creates a video element to trigger AirPlay picker
  const showAirPlayPicker = useCallback(() => {
    // For Safari, we need a video element to show AirPlay picker
    // Since this is a countdown app (not video), we'll show instructions
    // Users can use Screen Mirroring from their device
    
    // Try to show AirPlay picker if video element exists
    if (airPlayVideoRef.current && (airPlayVideoRef.current as any).webkitShowPlaybackTargetPicker) {
      (airPlayVideoRef.current as any).webkitShowPlaybackTargetPicker();
    } else {
      // Show instructions modal or alert
      const message = navigator.language.startsWith('ja')
        ? 'AirPlayを使用するには、iPhoneまたはMacのコントロールセンターから「画面ミラーリング」を選択してください。'
        : 'To use AirPlay, open Control Center on your iPhone/Mac and select "Screen Mirroring" to share your screen with Apple TV.';
      alert(message);
    }
  }, []);

  // Presentation API action
  const startPresentation = useCallback(async () => {
    if (!('presentation' in navigator)) return;

    try {
      const request = new (window as any).PresentationRequest([window.location.href]);
      await request.start();
    } catch (error) {
      console.warn('Presentation API failed:', error);
    }
  }, []);

  // Fullscreen action
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  return {
    isChromecastAvailable,
    isAirPlayAvailable,
    isPresentationAvailable,
    isFullscreenSupported,
    activeCastType,
    isConnecting: chromecastConnecting,
    deviceName,
    startChromecast,
    stopChromecast,
    showAirPlayPicker,
    startPresentation,
    toggleFullscreen,
    isFullscreen,
  };
}


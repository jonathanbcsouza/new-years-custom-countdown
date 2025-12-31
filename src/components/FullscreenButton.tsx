import { memo, useState, useCallback, useEffect } from 'react';
import { Maximize, Minimize, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Fullscreen toggle button for TV casting/display
 * Works with Apple AirPlay, Chromecast, and standard fullscreen
 */
export const FullscreenButton = memo(function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if fullscreen is supported
  const isSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled || (document as any).webkitFullscreenEnabled);

  // Sync state with actual fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
          !!(document as any).webkitFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement
      ) {
        // Enter fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } else {
        // Exit fullscreen
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

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFullscreen}
      className={cn(
        'text-white/50 hover:text-white hover:bg-white/10 transition-all gap-2',
        isFullscreen && 'text-white bg-white/10'
      )}
      title={
        isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen for TV display'
      }
    >
      {isFullscreen ? (
        <>
          <Minimize className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Exit</span>
        </>
      ) : (
        <>
          <Tv className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Cast to TV</span>
        </>
      )}
    </Button>
  );
});


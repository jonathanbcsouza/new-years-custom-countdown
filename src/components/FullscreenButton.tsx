import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Minimize, Tv, Cast, Loader2, Airplay, Monitor, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDisplayCast } from '@/hooks/useDisplayCast';
import { cn } from '@/lib/utils';

/**
 * Display/Cast button with support for:
 * - Chromecast (Chrome browser)
 * - AirPlay (Apple devices/Safari)
 * - Fullscreen mode (all browsers)
 */
export const FullscreenButton = memo(function FullscreenButton() {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const {
    isChromecastAvailable,
    isAirPlayAvailable,
    isFullscreenSupported,
    activeCastType,
    isConnecting,
    deviceName,
    startChromecast,
    stopChromecast,
    showAirPlayPicker,
    toggleFullscreen,
    isFullscreen,
  } = useDisplayCast();

  // Determine if we should show a dropdown menu
  const hasMultipleOptions = 
    (isChromecastAvailable ? 1 : 0) + 
    (isAirPlayAvailable ? 1 : 0) + 
    (isFullscreenSupported ? 1 : 0) > 1;

  const handleMainButtonClick = useCallback(() => {
    if (activeCastType === 'chromecast') {
      stopChromecast();
      return;
    }

    if (isFullscreen) {
      toggleFullscreen();
      return;
    }

    if (hasMultipleOptions) {
      setShowMenu(!showMenu);
    } else if (isChromecastAvailable) {
      startChromecast();
    } else if (isFullscreenSupported) {
      toggleFullscreen();
    }
  }, [
    activeCastType,
    isFullscreen,
    hasMultipleOptions,
    showMenu,
    isChromecastAvailable,
    isFullscreenSupported,
    stopChromecast,
    toggleFullscreen,
    startChromecast,
  ]);

  const handleChromecast = useCallback(() => {
    startChromecast();
    setShowMenu(false);
  }, [startChromecast]);

  const handleAirPlay = useCallback(() => {
    showAirPlayPicker();
    setShowMenu(false);
  }, [showAirPlayPicker]);

  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
    setShowMenu(false);
  }, [toggleFullscreen]);

  // Button content based on state
  const getButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs hidden sm:inline">{t('cast.connecting')}</span>
        </>
      );
    }

    if (activeCastType === 'chromecast') {
      return (
        <>
          <Cast className="h-4 w-4 text-green-400" />
          <span className="text-xs hidden sm:inline">{deviceName || t('cast.connected')}</span>
        </>
      );
    }

    if (isFullscreen) {
      return (
        <>
          <Minimize className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">{t('fullscreen.exit')}</span>
        </>
      );
    }

    // Default - show TV icon with dropdown indicator if multiple options
    return (
      <>
        <Tv className="h-4 w-4" />
        <span className="text-xs hidden sm:inline">{t('cast.shareToTV')}</span>
        {hasMultipleOptions && <ChevronDown className="h-3 w-3 ml-0.5" />}
      </>
    );
  };

  const getButtonTitle = () => {
    if (activeCastType === 'chromecast') return t('cast.disconnect');
    if (isFullscreen) return t('fullscreen.exitTitle');
    return t('cast.shareToTVTooltip');
  };

  if (!isFullscreenSupported && !isChromecastAvailable && !isAirPlayAvailable) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMainButtonClick}
        className={cn(
          'text-white/50 hover:text-white hover:bg-white/10 transition-all gap-1.5',
          (isFullscreen || activeCastType) && 'text-white bg-white/10',
          activeCastType === 'chromecast' && 'text-green-400'
        )}
        title={getButtonTitle()}
      >
        {getButtonContent()}
      </Button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 z-[110] w-56 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
              <span className="text-sm font-medium">{t('cast.shareToTV')}</span>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Options */}
            <div className="py-1">
              {/* Chromecast */}
              {isChromecastAvailable && (
                <button
                  onClick={handleChromecast}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <Cast className="h-4 w-4 text-blue-400" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t('cast.chromecast')}</div>
                    <div className="text-xs text-muted-foreground">{t('cast.chromecastDesc')}</div>
                  </div>
                </button>
              )}

              {/* AirPlay */}
              {isAirPlayAvailable && (
                <button
                  onClick={handleAirPlay}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <Airplay className="h-4 w-4 text-white" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t('cast.airplay')}</div>
                    <div className="text-xs text-muted-foreground">{t('cast.airplayDesc')}</div>
                  </div>
                </button>
              )}

              {/* Fullscreen */}
              {isFullscreenSupported && (
                <button
                  onClick={handleFullscreen}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <Monitor className="h-4 w-4 text-amber-400" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{t('fullscreen.enter')}</div>
                    <div className="text-xs text-muted-foreground">{t('fullscreen.desc')}</div>
                  </div>
                </button>
              )}
            </div>

            {/* Tip */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {t('cast.tip')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

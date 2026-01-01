import { memo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SoundToggleButtonProps {
  isSoundEnabled: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Sound toggle button for celebration audio
 */
export const SoundToggleButton = memo(function SoundToggleButton({
  isSoundEnabled,
  isPlaying,
  onToggle,
  className,
}: SoundToggleButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        'text-white/50 hover:text-white hover:bg-white/10 transition-all gap-1.5',
        isSoundEnabled && 'text-white bg-white/10',
        isPlaying && 'animate-pulse',
        className
      )}
      title={isSoundEnabled ? t('sound.disable') : t('sound.enable')}
    >
      {isSoundEnabled ? (
        <>
          <Volume2 className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">{t('sound.on')}</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">{t('sound.off')}</span>
        </>
      )}
    </Button>
  );
});


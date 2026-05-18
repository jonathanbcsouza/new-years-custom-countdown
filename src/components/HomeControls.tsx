import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { HolidaySelector } from '@/components/HolidaySelector';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { DonateButton } from '@/components/DonateButton';
import { AppNavLinks } from '@/components/AppNavLinks';

interface HomeControlsProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  selectedHolidayId: string | null;
  onHolidayChange: (holidayId: string | null) => void;
}

export const HomeControls = memo(function HomeControls({
  timezone,
  onTimezoneChange,
  selectedHolidayId,
  onHolidayChange,
}: HomeControlsProps) {
  const { t } = useTranslation();
  const [showFireworkHint, setShowFireworkHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowFireworkHint(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-end gap-2 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
        <HolidaySelector
          timezone={timezone}
          selectedHolidayId={selectedHolidayId}
          onChange={onHolidayChange}
          className="w-full sm:min-w-[200px] sm:max-w-[280px]"
        />
        <TimezoneSelector value={timezone} onChange={onTimezoneChange} />
      </div>
      <AppNavLinks compact />
      <DonateButton compact />
      {showFireworkHint && (
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-app-muted max-w-[14rem] text-right">
          <Sparkles className="h-3 w-3 text-brand/60 shrink-0" />
          <span>{t('fireworks.tapHint')}</span>
        </div>
      )}
    </div>
  );
});

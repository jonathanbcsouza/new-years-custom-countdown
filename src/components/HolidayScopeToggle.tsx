import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HolidayScopeToggleProps {
  allCountries: boolean;
  onChange: (allCountries: boolean) => void;
  className?: string;
  compact?: boolean;
}

export function HolidayScopeToggle({
  allCountries,
  onChange,
  className,
  compact = false,
}: HolidayScopeToggleProps) {
  const { t } = useTranslation();

  return (
    <ScopeRoot className={className} compact={compact}>
      {!compact && (
        <span className="text-xs text-muted-foreground shrink-0">
          {t('holidayScope.label', { defaultValue: 'Browse' })}
        </span>
      )}
      <div
        className={cn(
          'flex rounded-lg border border-input overflow-hidden',
          compact && 'w-full',
        )}
        role="group"
        aria-label={t('holidayScope.label', { defaultValue: 'Browse' })}
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors',
            !allCountries
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted',
          )}
        >
          {t('holidayScope.myRegion', { defaultValue: 'My region' })}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-input',
            allCountries
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted',
          )}
        >
          {t('holidayScope.allCountries', { defaultValue: 'All countries' })}
        </button>
      </div>
    </ScopeRoot>
  );
}

function ScopeRoot({
  className,
  compact,
  children,
}: {
  className?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'flex-col items-stretch w-full' : 'flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
}

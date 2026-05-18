import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HolidayFilterToggleProps {
  publicOnly: boolean;
  onChange: (publicOnly: boolean) => void;
  className?: string;
  compact?: boolean;
}

export function HolidayFilterToggle({
  publicOnly,
  onChange,
  className,
  compact = false,
}: HolidayFilterToggleProps) {
  const { t } = useTranslation();

  return (
    <FilterRoot className={className} compact={compact}>
      {!compact && (
        <span className="text-xs text-muted-foreground shrink-0">
          {t('holidayFilter.label', { defaultValue: 'Show' })}
        </span>
      )}
      <div
        className={cn(
          'flex rounded-lg border border-input overflow-hidden',
          compact && 'w-full',
        )}
        role="group"
        aria-label={t('holidayFilter.label', { defaultValue: 'Show' })}
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors',
            !publicOnly
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted',
          )}
        >
          {t('holidayFilter.all', { defaultValue: 'All holidays' })}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-input',
            publicOnly
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted',
          )}
        >
          {t('holidayFilter.publicOnly', { defaultValue: 'Public holidays only' })}
        </button>
      </div>
    </FilterRoot>
  );
}

function FilterRoot({
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

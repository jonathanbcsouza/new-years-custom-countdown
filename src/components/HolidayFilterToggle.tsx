import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HolidayFilterToggleProps {
  publicOnly: boolean;
  onChange: (publicOnly: boolean) => void;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'glass';
}

export function HolidayFilterToggle({
  publicOnly,
  onChange,
  className,
  compact = false,
  variant = 'default',
}: HolidayFilterToggleProps) {
  const { t } = useTranslation();
  const isGlass = variant === 'glass';

  const activeClass = isGlass
    ? 'bg-brand/20 text-brand border-brand/40'
    : 'bg-primary text-primary-foreground';
  const inactiveClass = isGlass
    ? 'bg-white/5 text-app-muted hover:text-app-secondary border-white/10'
    : 'bg-background text-muted-foreground hover:bg-muted';
  const borderClass = isGlass ? 'border-white/15' : 'border-input';
  const labelClass = isGlass ? 'text-app-muted' : 'text-muted-foreground';

  return (
    <FilterRoot className={className} compact={compact}>
      {!compact && (
        <span className={cn('text-xs shrink-0', labelClass)}>
          {t('holidayFilter.label', { defaultValue: 'Show' })}
        </span>
      )}
      <div
        className={cn(
          'flex rounded-lg border overflow-hidden',
          borderClass,
          compact && 'w-full',
        )}
        role="group"
        aria-label={t('holidayFilter.label', { defaultValue: 'Show' })}
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !publicOnly ? activeClass : inactiveClass,
          )}
        >
          {t('holidayFilter.all', { defaultValue: 'All holidays' })}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors border-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            borderClass,
            publicOnly ? activeClass : inactiveClass,
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

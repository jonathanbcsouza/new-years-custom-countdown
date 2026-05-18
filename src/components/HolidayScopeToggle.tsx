import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HolidayScopeToggleProps {
  allCountries: boolean;
  onChange: (allCountries: boolean) => void;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'glass';
}

export function HolidayScopeToggle({
  allCountries,
  onChange,
  className,
  compact = false,
  variant = 'default',
}: HolidayScopeToggleProps) {
  const { t } = useTranslation();
  const isGlass = variant === 'glass';

  const activeClass = isGlass
    ? 'bg-brand/20 text-brand'
    : 'bg-primary text-primary-foreground';
  const inactiveClass = isGlass
    ? 'bg-white/5 text-app-muted hover:text-app-secondary'
    : 'bg-background text-muted-foreground hover:bg-muted';
  const borderClass = isGlass ? 'border-white/15' : 'border-input';
  const labelClass = isGlass ? 'text-app-muted' : 'text-muted-foreground';

  return (
    <ScopeRoot className={className} compact={compact}>
      {!compact && (
        <span className={cn('text-xs shrink-0', labelClass)}>
          {t('holidayScope.label', { defaultValue: 'Browse' })}
        </span>
      )}
      <div
        className={cn(
          'flex rounded-lg border overflow-hidden',
          borderClass,
          compact && 'w-full',
        )}
        role="group"
        aria-label={t('holidayScope.label', { defaultValue: 'Browse' })}
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !allCountries ? activeClass : inactiveClass,
          )}
        >
          {t('holidayScope.myRegion', { defaultValue: 'My region' })}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors border-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            borderClass,
            allCountries ? activeClass : inactiveClass,
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

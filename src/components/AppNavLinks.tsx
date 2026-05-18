import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppNavLinksProps {
  className?: string;
  compact?: boolean;
}

export const AppNavLinks = memo(function AppNavLinks({
  className,
  compact = false,
}: AppNavLinksProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const linkClass = cn(
    'text-brand/90 hover:text-brand hover:bg-brand/10 transition-all gap-1.5 group',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  );

  return (
    <nav className={cn('flex items-center gap-0.5', className)} aria-label="App navigation">
      {pathname !== '/world' && (
        <Link to="/world">
          <Button
            variant="ghost"
            size="sm"
            className={linkClass}
            title={t('world.buttonTooltip')}
          >
            <Globe className="h-4 w-4 shrink-0 group-hover:animate-pulse" />
            {!compact && (
              <span className="text-xs hidden sm:inline">{t('world.button')}</span>
            )}
          </Button>
        </Link>
      )}
      {pathname !== '/holidays' && (
        <Link to="/holidays">
          <Button
            variant="ghost"
            size="sm"
            className={linkClass}
            title={t('holidaysPage.buttonTooltip')}
          >
            <Calendar className="h-4 w-4 shrink-0 group-hover:animate-pulse" />
            {!compact && (
              <span className="text-xs hidden sm:inline">{t('holidaysPage.button')}</span>
            )}
          </Button>
        </Link>
      )}
    </nav>
  );
});

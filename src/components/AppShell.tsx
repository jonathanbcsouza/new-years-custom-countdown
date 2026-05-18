import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AppNavLinks } from '@/components/AppNavLinks';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  variant?: 'home' | 'subpage';
  /** Extra controls rendered left of language (e.g. fullscreen on home). */
  leftSlot?: ReactNode;
  /** Extra controls on the right (e.g. holiday picker on home). */
  rightSlot?: ReactNode;
  /** Sticky header block below the top bar (holidays filters). */
  stickyHeader?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AppShell({
  children,
  variant = 'subpage',
  leftSlot,
  rightSlot,
  stickyHeader,
  className,
  contentClassName,
}: AppShellProps) {
  const { t } = useTranslation();
  return (
    <main
      className={cn('min-h-screen flex flex-col relative z-10', className)}
      style={{
        paddingTop:
          variant === 'subpage' && !stickyHeader ? 'var(--header-safe-top)' : undefined,
      }}
    >
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div
          className={cn(
            'flex items-start justify-between gap-2 px-3 pt-3 pointer-events-auto',
            stickyHeader &&
              'bg-gradient-to-b from-[var(--navy-deep)] via-[var(--navy-deep)]/95 to-transparent pb-2',
          )}
        >
          <div className="flex items-center gap-1 shrink-0">
            {variant === 'subpage' && (
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-control text-foreground/80 gap-2 focus-visible:ring-2 focus-visible:ring-ring"
                  data-no-firework
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">{t('common.back')}</span>
                </Button>
              </Link>
            )}
            {leftSlot}
            <LanguageSelector />
          </div>

          <div className="flex items-start gap-1 shrink-0 max-w-[min(100vw-8rem,22rem)]">
            {rightSlot ?? (variant === 'subpage' && !stickyHeader && <AppNavLinks compact />)}
          </div>
        </div>

        {stickyHeader && <div className="pointer-events-auto">{stickyHeader}</div>}
      </header>

      <div
        className={cn(
          'flex-1 flex flex-col',
          stickyHeader && 'pt-[var(--sticky-month-top)]',
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

import { memo } from 'react';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const STRIPE_DONATE_URL = 'https://buy.stripe.com/6oU6oI9PlaJj9hrgrKeUU00';

/**
 * "Buy me a coffee" button that opens Stripe payment page
 */
interface DonateButtonProps {
  compact?: boolean;
}

export const DonateButton = memo(function DonateButton({ compact = false }: DonateButtonProps) {
  const { t } = useTranslation();

  const handleDonate = () => {
    window.open(STRIPE_DONATE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDonate}
      className="text-brand/90 hover:text-brand hover:bg-brand/10 transition-all gap-1.5 group px-2 focus-visible:ring-2 focus-visible:ring-ring"
      title={t('donate.tooltip')}
      data-no-firework
    >
      <Coffee className="h-4 w-4 group-hover:scale-110 transition-all shrink-0" />
      {!compact && <span className="text-xs whitespace-nowrap">{t('donate.button')}</span>}
    </Button>
  );
});

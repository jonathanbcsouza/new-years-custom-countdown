import { memo } from 'react';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const STRIPE_DONATE_URL = 'https://buy.stripe.com/4gM28sfcyadz9kO0H68so02';

/**
 * "Buy me a coffee" button that opens Stripe payment page
 */
export const DonateButton = memo(function DonateButton() {
  const { t } = useTranslation();

  const handleDonate = () => {
    window.open(STRIPE_DONATE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDonate}
      className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all gap-1.5 group px-2 sm:px-3"
      title={t('donate.tooltip')}
    >
      <Coffee className="h-4 w-4 group-hover:scale-110 transition-all shrink-0" />
      <span className="text-xs whitespace-nowrap">{t('donate.button')}</span>
    </Button>
  );
});

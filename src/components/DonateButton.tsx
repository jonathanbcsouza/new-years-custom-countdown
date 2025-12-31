import { memo } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const STRIPE_DONATE_URL = 'https://buy.stripe.com/9B66oIggCdpL1SmexW8so01';

/**
 * Donate button that opens Stripe payment page
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
      className="text-pink-400/80 hover:text-pink-400 hover:bg-pink-500/10 transition-all gap-1.5 group px-2 sm:px-3"
      title={t('donate.tooltip')}
    >
      <Heart className="h-4 w-4 group-hover:fill-pink-400 transition-all" />
      <span className="text-xs">{t('donate.button')}</span>
    </Button>
  );
});


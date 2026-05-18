import { memo, useMemo, useState, useEffect } from 'react';
import type { ThemeVariant } from '@/lib/holidays/types';

/**
 * Seeded pseudo-random so decorations are stable across re-renders.
 */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface DecorationItem {
  emoji: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

function generateDecorations(
  emojis: string[],
  count: number,
  seed: number,
  minDuration = 8,
  maxDuration = 20,
  minSize = 14,
  maxSize = 32,
): DecorationItem[] {
  const rand = seededRandom(seed);
  const items: DecorationItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      emoji: emojis[Math.floor(rand() * emojis.length)]!,
      left: `${rand() * 100}%`,
      delay: `${rand() * -maxDuration}s`,
      duration: `${minDuration + rand() * (maxDuration - minDuration)}s`,
      size: `${minSize + rand() * (maxSize - minSize)}px`,
      opacity: 0.15 + rand() * 0.35,
    });
  }
  return items;
}

const VARIANT_CONFIG: Record<ThemeVariant, { emojis: string[]; count: number; animation: string }> = {
  easter:        { emojis: ['🥚', '🐣', '🐰', '🌷', '🌸', '🦋'], count: 28, animation: 'holiday-float' },
  christmas:     { emojis: ['❄️', '🎄', '⭐', '🎅', '🔔', '🎁', '🦌'], count: 30, animation: 'holiday-fall' },
  halloween:     { emojis: ['🦇', '🎃', '👻', '🕷️', '🕸️', '💀', '🌙'], count: 26, animation: 'holiday-drift' },
  valentine:     { emojis: ['❤️', '💕', '💖', '💗', '🌹', '💘', '💝'], count: 24, animation: 'holiday-float' },
  lunar_new_year:{ emojis: ['🏮', '🧧', '🐉', '🎆', '🧨', '🎊'], count: 22, animation: 'holiday-float' },
  diwali:        { emojis: ['🪔', '✨', '🎇', '🎆', '💫', '🕯️'], count: 24, animation: 'holiday-float' },
  carnival:      { emojis: ['🎭', '🎊', '🎉', '💃', '🪅', '🎪'], count: 22, animation: 'holiday-drift' },
  new_year:      { emojis: ['🎆', '✨', '🥂', '🎊', '🎉', '💫'], count: 20, animation: 'holiday-float' },
  ramadan:       { emojis: ['🌙', '⭐', '✨', '🕌', '🌟'], count: 18, animation: 'holiday-float' },
  pride:         { emojis: ['🏳️‍🌈', '❤️', '🧡', '💛', '💚', '💙', '💜'], count: 22, animation: 'holiday-drift' },
  thanksgiving:  { emojis: ['🦃', '🍂', '🌽', '🥧', '🍁', '🌾'], count: 20, animation: 'holiday-fall' },
  independence:  { emojis: ['🎆', '⭐', '🎉', '🎊', '✨'], count: 18, animation: 'holiday-float' },
  spring:        { emojis: ['🌸', '🌷', '🦋', '🌻', '🐝', '🌿'], count: 22, animation: 'holiday-float' },
  summer:        { emojis: ['☀️', '🌊', '🏖️', '🐚', '🌴', '🍉'], count: 18, animation: 'holiday-drift' },
  fall:          { emojis: ['🍂', '🍁', '🌰', '🎃', '🍄'], count: 22, animation: 'holiday-fall' },
  winter:        { emojis: ['❄️', '⛄', '🌨️', '🧊', '☃️', '🌟'], count: 26, animation: 'holiday-fall' },
  cultural:      { emojis: ['🎊', '🎉', '✨', '💫', '🌟'], count: 16, animation: 'holiday-float' },
  default:       { emojis: ['✨', '💫', '🌟', '⭐'], count: 12, animation: 'holiday-float' },
};

interface HolidayDecorationsProps {
  variant: ThemeVariant;
}

export const HolidayDecorations = memo(function HolidayDecorations({
  variant,
}: HolidayDecorationsProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default;

  const decorations = useMemo(
    () => generateDecorations(config.emojis, config.count, variant.length * 7919),
    [config, variant],
  );

  if (reduceMotion) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
      aria-hidden="true"
    >
      {decorations.map((item, i) => (
        <span
          key={`${variant}-${i}`}
          className={config.animation}
          style={{
            position: 'absolute',
            left: item.left,
            top: '-5%',
            fontSize: item.size,
            animationDelay: item.delay,
            animationDuration: item.duration,
            opacity: item.opacity,
            willChange: 'transform',
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
});

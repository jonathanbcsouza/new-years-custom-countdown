import { memo, useMemo } from 'react';

/**
 * Animated fireworks background with sparkles
 * Creates a festive New Year's Eve atmosphere
 */
export const FireworksBackground = memo(function FireworksBackground() {
  // Generate random sparkle positions
  const sparkles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${2 + Math.random() * 4}px`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden fireworks-bg">
      {/* Animated sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
            background: `radial-gradient(circle, rgba(255, 215, 100, ${0.4 + Math.random() * 0.4}) 0%, transparent 70%)`,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
          }}
        />
      ))}

      {/* Glow spots for firework bursts */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255, 200, 100, 0.8) 0%, transparent 70%)',
          top: '10%',
          left: '15%',
        }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 180, 80, 0.8) 0%, transparent 70%)',
          top: '5%',
          right: '20%',
        }}
      />
      <div 
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 210, 120, 0.8) 0%, transparent 70%)',
          bottom: '30%',
          left: '5%',
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255, 190, 90, 0.8) 0%, transparent 70%)',
          bottom: '25%',
          right: '10%',
        }}
      />
      <div 
        className="absolute w-56 h-56 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 200, 100, 0.8) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 10, 30, 0.4) 100%)',
        }}
      />
    </div>
  );
});


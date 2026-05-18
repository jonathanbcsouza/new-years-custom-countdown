import { memo, useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'star' | 'firework' | 'spark' | 'trail';
}

interface StarryFireworksBackgroundProps {
  celebrationMode?: boolean;
}

// Audio files for click-triggered fireworks
const FIREWORK_AUDIO_FILES = [
  '/audio/track-1-1767239911340.mp3',
  '/audio/track-2-1767239958278.mp3',
  '/audio/track-3-1767239977776.mp3',
  '/audio/track-4-1767239998265.mp3',
];

/**
 * Canvas-based animated starry night with fireworks
 * Creates a realistic New Year's Eve sky effect
 * Enhanced celebration mode for New Year's arrival
 */
export const StarryFireworksBackground = memo(function StarryFireworksBackground({
  celebrationMode = false,
}: StarryFireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; twinkle: number; speed: number }[]>([]);
  const celebrationModeRef = useRef(celebrationMode);
  const audioIndexRef = useRef(0);
  const createFireworkRef = useRef<((x: number, y: number, intense?: boolean) => void) | null>(null);

  // Update ref when prop changes
  useEffect(() => {
    celebrationModeRef.current = celebrationMode;
  }, [celebrationMode]);

  // Play audio for click-triggered fireworks (cycles through tracks)
  const playFireworkAudio = useCallback(() => {
    const audio = new Audio(FIREWORK_AUDIO_FILES[audioIndexRef.current]);
    audio.volume = 0.5;
    audio.play().catch((err) => {
      // Silently fail if autoplay is blocked
      console.debug('Audio play failed:', err);
    });
    // Cycle to next track
    audioIndexRef.current = (audioIndexRef.current + 1) % FIREWORK_AUDIO_FILES.length;
  }, []);

  // Handle click/touch anywhere on the page to trigger firework
  const handleInteraction = useCallback((x: number, y: number, target: HTMLElement) => {
    if (!createFireworkRef.current) return;

    // Check if the interaction was on an interactive element (button, input, link, etc.)
    const isInteractiveElement = target.closest('button, a, input, select, textarea, [role="button"], [role="link"], [data-no-firework]');
    
    // Don't trigger firework if interacting with interactive elements
    if (isInteractiveElement) return;

    // Create an intense firework at interaction position
    createFireworkRef.current(x, y, true);
    
    // Play corresponding audio
    playFireworkAudio();
  }, [playFireworkAudio]);

  // Handle mouse click
  const handleGlobalClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    handleInteraction(event.clientX, event.clientY, event.target as HTMLElement);
  }, [handleInteraction]);

  // Handle touch end (for mobile devices)
  const handleGlobalTouchEnd = useCallback((event: TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get the last touch point
    const touch = event.changedTouches[0];
    if (!touch) return;
    
    handleInteraction(touch.clientX, touch.clientY, event.target as HTMLElement);
  }, [handleInteraction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const brandRaw = getComputedStyle(document.documentElement)
      .getPropertyValue('--brand')
      .trim();
    const brandParts = brandRaw.split(/\s+/);
    const bh = Number(brandParts[0]) || 45;
    const bs = Number(brandParts[1]?.replace('%', '')) || 80;
    const bl = Number(brandParts[2]?.replace('%', '')) || 70;

    const buildTintedColors = () => [
      `hsla(${bh}, ${bs}%, ${Math.min(bl + 12, 88)}%, `,
      `hsla(${bh}, ${Math.max(bs - 8, 30)}%, ${bl}%, `,
      `hsla(${bh}, ${bs}%, ${Math.max(bl - 10, 40)}%, `,
      `hsla(${bh}, ${Math.min(bs + 5, 95)}%, ${Math.min(bl + 5, 85)}%, `,
    ];

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Initialize static stars
    const initStars = () => {
      starsRef.current = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 6000);
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.04,
        });
      }
    };

    // Celebration colors - more vibrant and varied
    const celebrationColors = [
      'rgba(255, 215, 0, ',     // Gold
      'rgba(255, 100, 150, ',   // Pink
      'rgba(100, 200, 255, ',   // Light blue
      'rgba(150, 255, 150, ',   // Light green
      'rgba(255, 150, 50, ',    // Orange
      'rgba(200, 150, 255, ',   // Purple
      'rgba(255, 255, 255, ',   // White
    ];

    const normalColors = buildTintedColors();

    // Create firework explosion - stored in ref for click handler access
    const createFirework = (x: number, y: number, intense = false) => {
      // Store reference for click handler
      createFireworkRef.current = createFirework;
      const isCelebrating = celebrationModeRef.current || intense;
      const colors = isCelebrating ? celebrationColors : normalColors;
      const particleCount = isCelebrating ? 100 + Math.random() * 60 : 60 + Math.random() * 40;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Main explosion
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
        const velocity = (isCelebrating ? 3 : 2) + Math.random() * (isCelebrating ? 5 : 3);
        
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          maxLife: 1,
          size: 1.5 + Math.random() * (isCelebrating ? 3 : 2),
          color,
          type: 'firework',
        });
      }

      // Secondary burst for celebration mode
      if (isCelebrating) {
        setTimeout(() => {
          const secondColor = colors[Math.floor(Math.random() * colors.length)];
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            
            particlesRef.current.push({
              x: x + (Math.random() - 0.5) * 50,
              y: y + (Math.random() - 0.5) * 50,
              vx: Math.cos(angle) * velocity,
              vy: Math.sin(angle) * velocity,
              life: 1,
              maxLife: 1,
              size: 1 + Math.random() * 2,
              color: secondColor,
              type: 'spark',
            });
          }
        }, 100);
      }
    };

    // Create rising trail before firework
    const createRisingFirework = () => {
      const startX = canvas.width * 0.1 + Math.random() * canvas.width * 0.8;
      const targetY = canvas.height * 0.1 + Math.random() * canvas.height * 0.3;
      
      // Rising trail particle
      let currentY = canvas.height;
      const riseSpeed = 8 + Math.random() * 4;
      
      const riseInterval = setInterval(() => {
        currentY -= riseSpeed;
        
        // Trail particles
        particlesRef.current.push({
          x: startX + (Math.random() - 0.5) * 4,
          y: currentY,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random(),
          life: 0.8,
          maxLife: 0.8,
          size: 2 + Math.random(),
          color: 'rgba(255, 220, 150, ',
          type: 'trail',
        });
        
        if (currentY <= targetY) {
          clearInterval(riseInterval);
          createFirework(startX, currentY, celebrationModeRef.current);
        }
      }, 30);
    };

    // Create random spark
    const createSpark = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6;
      const colors = celebrationModeRef.current ? celebrationColors : normalColors;
      
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5,
        life: 1,
        maxLife: 1,
        size: 1 + Math.random() * (celebrationModeRef.current ? 4 : 3),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'spark',
      });
    };

    // Animation loop
    let animationId = 0;
    let lastFirework = 0;
    let lastSpark = 0;

    const animate = (timestamp: number) => {
      // Clear with trail effect
      ctx.fillStyle = celebrationModeRef.current 
        ? 'rgba(10, 15, 35, 0.12)' 
        : 'rgba(10, 15, 35, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(8, 12, 30, 0.98)');
      gradient.addColorStop(0.5, 'rgba(15, 25, 50, 0.95)');
      gradient.addColorStop(1, 'rgba(10, 18, 40, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw twinkling stars
      starsRef.current.forEach((star) => {
        star.twinkle += star.speed;
        const baseOpacity = celebrationModeRef.current ? 0.4 : 0.3;
        const opacity = baseOpacity + Math.sin(star.twinkle) * 0.4 + 0.3;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Star glow - brighter in celebration mode
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 220, ${opacity * (celebrationModeRef.current ? 0.3 : 0.2)})`;
          ctx.fill();
        }
      });

      // Spawn fireworks - more frequent in celebration mode
      const fireworkInterval = celebrationModeRef.current 
        ? 800 + Math.random() * 1000 
        : 2000 + Math.random() * 3000;
      
      if (timestamp - lastFirework > fireworkInterval) {
        if (celebrationModeRef.current) {
          // Multiple simultaneous fireworks in celebration mode
          createRisingFirework();
          if (Math.random() > 0.5) {
            setTimeout(() => createRisingFirework(), 200);
          }
          if (Math.random() > 0.7) {
            setTimeout(() => createRisingFirework(), 400);
          }
        } else {
          createFirework(
            canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
            canvas.height * 0.1 + Math.random() * canvas.height * 0.4
          );
        }
        lastFirework = timestamp;
      }

      // Spawn sparks more frequently in celebration mode
      const sparkInterval = celebrationModeRef.current ? 50 : 100;
      if (timestamp - lastSpark > sparkInterval) {
        createSpark();
        if (celebrationModeRef.current) createSpark(); // Double sparks
        lastSpark = timestamp;
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        const decayRate = particle.type === 'firework' ? 0.012 : 
                         particle.type === 'trail' ? 0.03 : 0.018;
        particle.life -= decayRate;
        
        if (particle.life <= 0) return false;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.type === 'trail' ? 0.01 : 0.02; // Gravity
        
        // Friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        const alpha = particle.life;
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + alpha + ')';
        ctx.fill();

        // Glow effect - enhanced in celebration mode
        const glowMultiplier = celebrationModeRef.current ? 4 : 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + (alpha * 0.25) + ')';
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      ctx.fillStyle = 'rgba(10, 15, 35, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(8, 12, 30, 0.98)');
      gradient.addColorStop(0.5, 'rgba(15, 25, 50, 0.95)');
      gradient.addColorStop(1, 'rgba(10, 18, 40, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      starsRef.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      });
    } else {
      animationId = requestAnimationFrame(animate);
    }

    // Store createFirework reference for click handler
    createFireworkRef.current = createFirework;

    if (!reducedMotion) {
      setTimeout(() => createFirework(canvas.width * 0.3, canvas.height * 0.25), 500);
      setTimeout(() => createFirework(canvas.width * 0.7, canvas.height * 0.2), 1200);
      setTimeout(() => createFirework(canvas.width * 0.5, canvas.height * 0.35), 2000);
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [handleGlobalClick, handleGlobalTouchEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'var(--body-gradient)' }}
    />
  );
});

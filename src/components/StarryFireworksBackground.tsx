import { memo, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'star' | 'firework' | 'spark';
}

/**
 * Canvas-based animated starry night with fireworks
 * Creates a realistic New Year's Eve sky effect
 */
export const StarryFireworksBackground = memo(function StarryFireworksBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; twinkle: number; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Initialize static stars
    const initStars = () => {
      starsRef.current = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000);
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03,
        });
      }
    };

    // Gold/champagne colors for fireworks
    const fireworkColors = [
      'rgba(255, 215, 140, ',
      'rgba(255, 200, 100, ',
      'rgba(255, 230, 170, ',
      'rgba(255, 190, 80, ',
      'rgba(255, 240, 200, ',
    ];

    // Create firework explosion
    const createFirework = (x: number, y: number) => {
      const particleCount = 60 + Math.random() * 40;
      const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const velocity = 2 + Math.random() * 3;
        
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          maxLife: 1,
          size: 1 + Math.random() * 2,
          color,
          type: 'firework',
        });
      }
    };

    // Create random spark
    const createSpark = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6;
      
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5,
        life: 1,
        maxLife: 1,
        size: 1 + Math.random() * 3,
        color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
        type: 'spark',
      });
    };

    // Animation loop
    let animationId: number;
    let lastFirework = 0;
    let lastSpark = 0;

    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(10, 15, 35, 0.15)';
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
        const opacity = 0.3 + Math.sin(star.twinkle) * 0.4 + 0.3;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Star glow
        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 220, ${opacity * 0.2})`;
          ctx.fill();
        }
      });

      // Spawn fireworks periodically
      if (timestamp - lastFirework > 2000 + Math.random() * 3000) {
        createFirework(
          canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
          canvas.height * 0.1 + Math.random() * canvas.height * 0.4
        );
        lastFirework = timestamp;
      }

      // Spawn sparks more frequently
      if (timestamp - lastSpark > 100) {
        createSpark();
        lastSpark = timestamp;
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life -= particle.type === 'firework' ? 0.015 : 0.02;
        
        if (particle.life <= 0) return false;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.02; // Gravity

        const alpha = particle.life;
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + alpha + ')';
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life * 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + (alpha * 0.3) + ')';
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(animate);

    // Create initial fireworks
    setTimeout(() => createFirework(canvas.width * 0.3, canvas.height * 0.25), 500);
    setTimeout(() => createFirework(canvas.width * 0.7, canvas.height * 0.2), 1200);
    setTimeout(() => createFirework(canvas.width * 0.5, canvas.height * 0.35), 2000);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(180deg, #0a0f23 0%, #0f1932 50%, #0a1228 100%)' }}
    />
  );
});


import { memo, useState, useEffect, useCallback } from 'react';
import { ImagePlus } from 'lucide-react';

interface PhotoCarouselProps {
  photos: string[];
  onAddClick: () => void;
  interval?: number;
}

/**
 * Full-width photo carousel with smooth crossfade animation
 * Photos blend seamlessly with Ken Burns effect
 */
export const PhotoCarousel = memo(function PhotoCarousel({
  photos,
  onAddClick,
  interval = 7000,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Smooth transition to next photo
  const transitionTo = useCallback((newIndex: number) => {
    if (newIndex === currentIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setPrevIndex(currentIndex);
    setCurrentIndex(newIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000); // Match CSS transition duration
  }, [currentIndex, isTransitioning]);

  // Auto-advance carousel
  useEffect(() => {
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % photos.length;
      transitionTo(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [photos.length, interval, currentIndex, transitionTo]);

  // Reset index if photos change
  useEffect(() => {
    if (currentIndex >= photos.length && photos.length > 0) {
      setCurrentIndex(0);
      setPrevIndex(0);
    }
  }, [photos.length, currentIndex]);

  if (photos.length === 0) {
    return (
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <button
          onClick={onAddClick}
          className="mx-auto flex items-center gap-3 px-6 py-4 rounded-xl
                     bg-white/5 backdrop-blur-sm border border-white/10
                     text-white/60 hover:text-white/90 hover:bg-white/10 hover:border-white/20
                     transition-all duration-300 group"
        >
          <ImagePlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="text-base font-medium">Add Your Family Photos</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 h-[50vh] md:h-[55vh] lg:h-[60vh] overflow-hidden cursor-pointer"
      onClick={onAddClick}
    >
      {/* Top gradient fade into background */}
      <div 
        className="absolute inset-x-0 top-0 h-40 md:h-56 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0.7) 50%, transparent 100%)',
        }}
      />

      {/* Photo layers with crossfade */}
      <div className="relative w-full h-full">
        {photos.map((photo, index) => {
          const isCurrent = index === currentIndex;
          const isPrev = index === prevIndex && isTransitioning;
          const isVisible = isCurrent || isPrev;
          
          if (!isVisible) return null;

          return (
            <div
              key={index}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: isCurrent ? 1 : 0,
                transition: 'opacity 2s ease-in-out, transform 8s ease-out',
                transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                zIndex: isCurrent ? 10 : 5,
              }}
            >
              {/* Photo with Ken Burns zoom effect */}
              <div 
                className="w-full h-full"
                style={{
                  animation: isCurrent ? 'kenBurns 12s ease-out forwards' : 'none',
                }}
              >
                <img
                  src={photo}
                  alt={`Family photo ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  style={{
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Side gradients for blending */}
      <div 
        className="absolute inset-y-0 left-0 w-24 md:w-40 z-15 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(10, 15, 35, 0.8) 0%, transparent 100%)',
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-24 md:w-40 z-15 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(10, 15, 35, 0.8) 0%, transparent 100%)',
        }}
      />

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                transitionTo(index);
              }}
              className={`rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`View photo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Edit hint */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 opacity-60 hover:opacity-100 transition-opacity">
        <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-xs">
          Click to edit photos
        </span>
      </div>

      {/* CSS for Ken Burns animation */}
      <style>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1) translateY(0);
          }
          100% {
            transform: scale(1.08) translateY(-2%);
          }
        }
      `}</style>
    </div>
  );
});

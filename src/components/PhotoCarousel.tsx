import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoCarouselProps {
  photos: string[];
  onAddClick: () => void;
  interval?: number;
}

/**
 * Full-width photo carousel with smooth crossfade and swipe gestures
 */
export const PhotoCarousel = memo(function PhotoCarousel({
  photos,
  onAddClick,
  interval = 7000,
}: PhotoCarouselProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch handling state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth transition to a specific photo
  const transitionTo = useCallback((newIndex: number) => {
    if (newIndex === currentIndex || isTransitioning) return;
    
    // Handle wrapping
    let targetIndex = newIndex;
    if (targetIndex < 0) targetIndex = photos.length - 1;
    if (targetIndex >= photos.length) targetIndex = 0;
    
    setIsTransitioning(true);
    setPrevIndex(currentIndex);
    setCurrentIndex(targetIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  }, [currentIndex, isTransitioning, photos.length]);

  // Navigate to next/previous
  const goNext = useCallback(() => {
    transitionTo(currentIndex + 1);
  }, [currentIndex, transitionTo]);

  const goPrev = useCallback(() => {
    transitionTo(currentIndex - 1);
  }, [currentIndex, transitionTo]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - go to next
        goNext();
      } else {
        // Swiped right - go to previous
        goPrev();
      }
    }
    
    // Resume auto-play after a delay
    setTimeout(() => setIsPaused(false), 3000);
  }, [goNext, goPrev]);

  // Auto-advance carousel
  useEffect(() => {
    if (photos.length <= 1 || isPaused) return;

    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [photos.length, interval, goNext, isPaused]);

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
          <span className="text-base font-medium">{t('photos.addPhotos')}</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 h-[50vh] md:h-[55vh] lg:h-[60vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top gradient fade into background */}
      <div 
        className="absolute inset-x-0 top-0 h-40 md:h-56 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0.7) 50%, transparent 100%)',
        }}
      />

      {/* Photo layers with smooth crossfade */}
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
                transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isCurrent ? 10 : 5,
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  animation: isCurrent ? 'kenBurns 14s ease-out forwards' : 'none',
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

      {/* Side gradients */}
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

      {/* Navigation arrows (desktop) */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 
                       p-2 rounded-full bg-black/30 backdrop-blur-sm
                       text-white/60 hover:text-white hover:bg-black/50
                       transition-all duration-300 opacity-0 hover:opacity-100
                       hidden md:flex items-center justify-center"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 
                       p-2 rounded-full bg-black/30 backdrop-blur-sm
                       text-white/60 hover:text-white hover:bg-black/50
                       transition-all duration-300 opacity-0 hover:opacity-100
                       hidden md:flex items-center justify-center"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

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

      {/* Edit button */}
      <button
        onClick={onAddClick}
        className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 
                   px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm 
                   text-white/70 hover:text-white hover:bg-black/60
                   text-sm transition-all duration-300"
      >
        {t('photos.editPhotos')}
      </button>

      {/* Swipe hint (mobile) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 md:hidden">
        <span className="text-white/40 text-xs">{t('photos.swipeHint')}</span>
      </div>

      {/* Ken Burns animation */}
      <style>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1%, -2%);
          }
        }
      `}</style>
    </div>
  );
});

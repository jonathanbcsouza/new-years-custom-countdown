import { useState, useEffect, memo } from 'react';

interface BackgroundSliderProps {
  photos: string[];
  interval?: number; // Interval in milliseconds
}

/**
 * Full-screen background slider with crossfade transitions
 * Displays photos behind the countdown with smooth animations
 */
export const BackgroundSlider = memo(function BackgroundSlider({
  photos,
  interval = 5000, // Default 5 seconds
}: BackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance photos
  useEffect(() => {
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);

      // Wait for fade out, then change image
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1000); // Match CSS transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [photos.length, interval]);

  // Reset index when photos change
  useEffect(() => {
    if (currentIndex >= photos.length) {
      setCurrentIndex(0);
    }
  }, [photos.length, currentIndex]);

  // Don't render if no photos
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Current image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${photos[currentIndex]})`,
        }}
        aria-hidden="true"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/70" />

      {/* Photo indicator dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 500);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`View photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});


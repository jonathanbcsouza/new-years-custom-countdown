import { memo, useState, useEffect } from 'react';
import { ImagePlus } from 'lucide-react';

interface PhotoCarouselProps {
  photos: string[];
  onAddClick: () => void;
  interval?: number;
}

/**
 * Full-width photo carousel with sliding animation
 * Photos overlap and blend seamlessly into the background
 */
export const PhotoCarousel = memo(function PhotoCarousel({
  photos,
  onAddClick,
  interval = 6000,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [photos.length, interval]);

  // Reset index if photos change
  useEffect(() => {
    if (currentIndex >= photos.length && photos.length > 0) {
      setCurrentIndex(0);
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

  // Calculate which photos to show (current, prev, next for smooth transitions)
  const getPhotoIndex = (offset: number) => {
    return (currentIndex + offset + photos.length) % photos.length;
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 h-[45vh] md:h-[50vh] lg:h-[55vh] overflow-hidden cursor-pointer"
      onClick={onAddClick}
    >
      {/* Top gradient fade into background */}
      <div 
        className="absolute inset-x-0 top-0 h-32 md:h-48 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0.8) 40%, transparent 100%)',
        }}
      />

      {/* Photo container */}
      <div className="relative w-full h-full flex items-end justify-center">
        {photos.length === 1 ? (
          // Single photo - centered
          <div className="relative w-full max-w-2xl h-full mx-auto">
            <img
              src={photos[0]}
              alt="Family photo"
              className="w-full h-full object-cover object-top"
              style={{
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              }}
            />
          </div>
        ) : photos.length === 2 ? (
          // Two photos - side by side with overlap
          <div className="relative w-full h-full flex items-end justify-center">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="absolute h-full transition-all duration-1000"
                style={{
                  width: '55%',
                  left: index === 0 ? '5%' : '40%',
                  zIndex: index === currentIndex ? 10 : 5,
                  opacity: index === currentIndex ? 1 : 0.7,
                  transform: `scale(${index === currentIndex ? 1 : 0.95})`,
                }}
              >
                <img
                  src={photo}
                  alt={`Family photo ${index + 1}`}
                  className="w-full h-full object-cover object-top"
                  style={{
                    maskImage: `linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 95%), 
                                linear-gradient(to ${index === 0 ? 'right' : 'left'}, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)`,
                    WebkitMaskImage: `linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 95%), 
                                      linear-gradient(to ${index === 0 ? 'right' : 'left'}, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)`,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          // 3+ photos - sliding carousel with overlapping images
          <div className="relative w-full h-full">
            {[-1, 0, 1].map((offset) => {
              const photoIndex = getPhotoIndex(offset);
              const isCenter = offset === 0;
              const isLeft = offset === -1;
              
              return (
                <div
                  key={`${photoIndex}-${offset}`}
                  className="absolute h-full transition-all duration-1000 ease-in-out"
                  style={{
                    width: isCenter ? '50%' : '35%',
                    left: isLeft ? '0%' : isCenter ? '25%' : '65%',
                    zIndex: isCenter ? 10 : 5,
                    opacity: isCenter ? 1 : 0.6,
                    transform: `scale(${isCenter ? 1 : 0.9})`,
                  }}
                >
                  <img
                    src={photos[photoIndex]}
                    alt={`Family photo ${photoIndex + 1}`}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage: `
                        linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%),
                        linear-gradient(to right, ${isLeft ? 'rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%' : 'rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%'})
                      `,
                      WebkitMaskImage: `
                        linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%),
                        linear-gradient(to right, ${isLeft ? 'rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%' : 'rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%'})
                      `,
                      maskComposite: 'intersect',
                      WebkitMaskComposite: 'source-in',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`View photo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Edit hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
        <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/50 text-xs">
          Click to edit photos
        </span>
      </div>
    </div>
  );
});

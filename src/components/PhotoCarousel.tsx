import { memo } from 'react';
import { ImagePlus } from 'lucide-react';

interface PhotoCarouselProps {
  photos: string[];
  onAddClick: () => void;
}

/**
 * Faded photo carousel displayed at the bottom of the screen
 * Photos blend into the background with gradient overlays
 */
export const PhotoCarousel = memo(function PhotoCarousel({
  photos,
  onAddClick,
}: PhotoCarouselProps) {
  if (photos.length === 0) {
    return (
      <div className="w-full py-6">
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
    <div className="absolute bottom-0 left-0 right-0 h-48 md:h-56 lg:h-64 overflow-hidden">
      {/* Gradient overlay - fades photos into background */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0) 40%),
            linear-gradient(to top, rgba(10, 15, 35, 0.7) 0%, rgba(10, 15, 35, 0) 30%),
            linear-gradient(to right, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0) 10%),
            linear-gradient(to left, rgba(10, 15, 35, 1) 0%, rgba(10, 15, 35, 0) 10%)
          `,
        }}
      />

      {/* Photo strip */}
      <div 
        className="flex items-end justify-center h-full gap-1 px-4 cursor-pointer"
        onClick={onAddClick}
      >
        {photos.map((photo, index) => {
          // Calculate position offset for overlap effect
          const isCenter = index === Math.floor(photos.length / 2);
          const distanceFromCenter = Math.abs(index - Math.floor(photos.length / 2));
          const scale = isCenter ? 1 : Math.max(0.85, 1 - distanceFromCenter * 0.08);
          const translateY = isCenter ? 0 : distanceFromCenter * 8;
          
          return (
            <div
              key={index}
              className="relative flex-shrink-0 overflow-hidden transition-transform duration-500 hover:scale-105"
              style={{
                width: photos.length === 1 ? '100%' : photos.length === 2 ? '50%' : '35%',
                maxWidth: photos.length === 1 ? '600px' : photos.length === 2 ? '350px' : '280px',
                height: '100%',
                transform: `scale(${scale}) translateY(${translateY}px)`,
                zIndex: 10 - distanceFromCenter,
              }}
            >
              <img
                src={photo}
                alt={`Family photo ${index + 1}`}
                className="w-full h-full object-cover object-top"
                style={{
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                }}
              />
              
              {/* Individual photo fade overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(to top, transparent 0%, rgba(10, 15, 35, 0.3) 70%, rgba(10, 15, 35, 0.9) 100%),
                    linear-gradient(to right, rgba(10, 15, 35, 0.5) 0%, transparent 20%, transparent 80%, rgba(10, 15, 35, 0.5) 100%)
                  `,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Edit hint on hover */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={onAddClick}
          className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm
                     text-white/60 hover:text-white text-xs
                     opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          Click to edit photos
        </button>
      </div>
    </div>
  );
});

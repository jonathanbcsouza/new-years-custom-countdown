import { memo } from 'react';
import { ImagePlus } from 'lucide-react';

interface PhotoCarouselProps {
  photos: string[];
  onAddClick: () => void;
}

/**
 * Horizontal photo carousel displayed at the bottom of the screen
 * Shows user photos in a sliding strip with fade edges
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
                     bg-white/10 backdrop-blur-sm border border-white/20
                     text-white/80 hover:text-white hover:bg-white/20
                     transition-all duration-300 group"
        >
          <ImagePlus className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-medium">Add Your Family Photos</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden py-4">
      {/* Photo strip container */}
      <div className="relative photo-carousel">
        <div className="flex gap-4 justify-center items-center px-4">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={onAddClick}
              className="relative flex-shrink-0 w-48 h-32 md:w-64 md:h-44 rounded-lg overflow-hidden
                         border-2 border-white/30 hover:border-white/60
                         transition-all duration-300 hover:scale-105
                         shadow-lg hover:shadow-xl group cursor-pointer"
            >
              <img
                src={photo}
                alt={`Family photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
                              flex items-center justify-center transition-all duration-300">
                <span className="text-white opacity-0 group-hover:opacity-100 
                                 text-sm font-medium transition-opacity">
                  Edit Photos
                </span>
              </div>
            </button>
          ))}
          
          {/* Add more button */}
          {photos.length < 10 && (
            <button
              onClick={onAddClick}
              className="flex-shrink-0 w-32 h-32 md:w-44 md:h-44 rounded-lg
                         border-2 border-dashed border-white/30 hover:border-white/60
                         flex flex-col items-center justify-center gap-2
                         text-white/60 hover:text-white/90
                         transition-all duration-300 hover:scale-105
                         bg-white/5 hover:bg-white/10"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-xs">Add More</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});


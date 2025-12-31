import { useState, useCallback, useRef, memo } from 'react';
import { X, Upload, ImagePlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { compressImages, isValidImageType } from '@/lib/imageCompression';
import { getStorageUsage, formatBytes } from '@/lib/storage';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  onClose?: () => void;
}

const MAX_PHOTOS_DEFAULT = 10;

/**
 * Photo upload component with drag-and-drop, compression, and preview
 */
export const PhotoUpload = memo(function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = MAX_PHOTOS_DEFAULT,
  onClose,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageInfo = getStorageUsage();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      // Validate file types
      const validFiles = fileArray.filter(isValidImageType);
      if (validFiles.length === 0) {
        setError('Please select valid image files (JPEG, PNG, or WebP)');
        return;
      }

      // Check photo limit
      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const filesToProcess = validFiles.slice(0, remainingSlots);
      if (filesToProcess.length < validFiles.length) {
        setError(`Only adding ${filesToProcess.length} of ${validFiles.length} photos (limit: ${maxPhotos})`);
      }

      // Compress images
      setIsCompressing(true);
      setCompressionProgress({ current: 0, total: filesToProcess.length });

      try {
        const compressed = await compressImages(filesToProcess, (current, total) => {
          setCompressionProgress({ current, total });
        });

        onPhotosChange([...photos, ...compressed]);
      } catch (err) {
        console.error('Compression error:', err);
        setError('Failed to process some images. Please try again.');
      } finally {
        setIsCompressing(false);
        setCompressionProgress({ current: 0, total: 0 });
      }
    },
    [photos, onPhotosChange, maxPhotos]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleRemovePhoto = useCallback(
    (index: number) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    },
    [photos, onPhotosChange]
  );

  const handleClearAll = useCallback(() => {
    onPhotosChange([]);
  }, [onPhotosChange]);

  return (
    <Card className="w-full max-w-2xl bg-card/95 backdrop-blur border-border shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Upload Photos
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Add up to {maxPhotos} photos for your countdown background slideshow
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Storage Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Photos: {photos.length} / {maxPhotos}
          </span>
          <span className={storageInfo.isNearLimit ? 'text-destructive' : ''}>
            Storage: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
          </span>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-primary bg-primary/10 scale-[1.02]' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${isCompressing ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />

          {isCompressing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Compressing {compressionProgress.current} of {compressionProgress.total}...
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop photos here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, or WebP • Max 10MB per photo
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Photos</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200
                             hover:bg-destructive"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});


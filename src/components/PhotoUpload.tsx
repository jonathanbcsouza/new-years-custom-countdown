import { useState, useCallback, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, ImagePlus, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageInfo = getStorageUsage();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      
      // Show immediate feedback that files were received
      setIsReceiving(true);
      
      // Small delay to ensure UI updates before heavy processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const fileArray = Array.from(files);

      // Validate file types
      const validFiles = fileArray.filter(isValidImageType);
      if (validFiles.length === 0) {
        setError(t('photos.invalidFileType'));
        setIsReceiving(false);
        return;
      }

      // Check photo limit
      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setError(t('photos.maxPhotosReached', { max: maxPhotos }));
        setIsReceiving(false);
        return;
      }

      const filesToProcess = validFiles.slice(0, remainingSlots);
      if (filesToProcess.length < validFiles.length) {
        setError(t('photos.onlyAdding', { count: filesToProcess.length, total: validFiles.length, max: maxPhotos }));
      }

      // Compress images
      setIsReceiving(false);
      setIsCompressing(true);
      setCompressionProgress({ current: 0, total: filesToProcess.length });

      try {
        const compressed = await compressImages(filesToProcess, (current, total) => {
          setCompressionProgress({ current, total });
        });

        onPhotosChange([...photos, ...compressed]);
      } catch (err) {
        console.error('Compression error:', err);
        setError(t('photos.compressionError'));
      } finally {
        setIsCompressing(false);
        setCompressionProgress({ current: 0, total: 0 });
      }
    },
    [photos, onPhotosChange, maxPhotos, t]
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
      if (e.target.files && e.target.files.length > 0) {
        // Capture files immediately before any async operations
        const files = Array.from(e.target.files);
        
        // Reset file input immediately to allow re-selection and close native picker faster
        e.target.value = '';
        
        // Process files asynchronously with a small delay to ensure native picker closes
        requestAnimationFrame(() => {
          handleFiles(files);
        });
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
    <Card className="w-full max-w-2xl bg-card/95 backdrop-blur border-border shadow-xl max-h-[90vh] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            {t('photos.uploadPhotos')}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('photos.addUpTo', { max: maxPhotos })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {/* Storage Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t('photos.photosCount', { current: photos.length, max: maxPhotos })}
          </span>
          <span className={storageInfo.isNearLimit ? 'text-destructive' : ''}>
            {t('photos.storage', { used: formatBytes(storageInfo.used), total: formatBytes(storageInfo.total) })}
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
            ${(isCompressing || isReceiving) ? 'pointer-events-none opacity-60' : ''}
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

          {isReceiving ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('photos.receiving')}
              </p>
            </div>
          ) : isCompressing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('photos.compressing', { current: compressionProgress.current, total: compressionProgress.total })}
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                {t('photos.dropOrClick')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('photos.fileTypes')}
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
              <span className="text-sm font-medium">{t('photos.yourPhotos')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                {t('photos.clearAll')}
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
                    aria-label={t('photos.removePhoto', { index: index + 1 })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with Done Button */}
      <CardFooter className="flex-shrink-0 pt-4 border-t border-border">
        <Button
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Check className="h-5 w-5 mr-2" />
          {t('common.done')} {photos.length > 0 && `(${photos.length})`}
        </Button>
      </CardFooter>
    </Card>
  );
});

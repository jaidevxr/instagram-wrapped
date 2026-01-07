import { useCallback, useState } from 'react';
import { Upload, Package } from 'lucide-react';

interface ChestUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function ChestUpload({ onFileSelect, isLoading }: ChestUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.zip')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="relative">
      <label
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          chest-dropzone group
          ${isDragging ? 'scale-105' : ''}
          ${isLoading ? 'cursor-wait opacity-80' : ''}
          transition-all duration-300
        `}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          disabled={isLoading}
          className="sr-only"
        />
        
        {/* Chest lid animation */}
        <div className={`
          relative mb-4 transition-transform duration-300
          ${isHovering || isDragging ? '-translate-y-2 -rotate-12' : ''}
        `}>
          <div className="w-24 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-4 border-amber-900 shadow-lg">
            <div className="absolute inset-x-0 top-1 h-1 bg-amber-500/50 rounded" />
          </div>
        </div>
        
        {/* Chest body */}
        <div className="relative w-28 h-20 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg border-4 border-amber-950 shadow-xl">
          {/* Lock */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-4 h-6 bg-yellow-500 rounded-sm border-2 border-yellow-700">
            <div className="w-2 h-2 bg-yellow-800 rounded-full mx-auto mt-1" />
          </div>
          
          {/* Wood texture lines */}
          <div className="absolute inset-2 flex flex-col gap-1">
            <div className="h-1 bg-amber-600/30 rounded" />
            <div className="h-1 bg-amber-600/30 rounded" />
            <div className="h-1 bg-amber-600/30 rounded" />
          </div>
        </div>

        <div className="mt-6 text-center">
          {isLoading ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary animate-bounce" />
                <span className="pixel-text text-primary">EXTRACTING...</span>
              </div>
              <div className="w-48 pixel-progress mx-auto">
                <div className="pixel-progress-fill shimmer" style={{ width: '60%' }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-foreground" />
                <span className="pixel-text text-foreground">DROP YOUR ZIP</span>
              </div>
              <p className="retro-text text-muted-foreground text-lg">
                or click to browse
              </p>
            </>
          )}
        </div>
      </label>

      {/* Particle effects around chest */}
      {(isHovering || isDragging) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-float"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { ChestUpload } from '@/components/ChestUpload';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PrivacyBanner } from '@/components/PrivacyBanner';
import { StoryFlow } from '@/components/StoryFlow';
import { parseZipFile } from '@/utils/zipParser';
import { analyzeInstagramData } from '@/utils/dataAnalyzer';
import { InstagramData } from '@/types/instagram';
import { AlertCircle } from 'lucide-react';

type AppState = 'upload' | 'processing' | 'results' | 'error';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<InstagramData | null>(null);
  const [parsedFiles, setParsedFiles] = useState<any[]>([]);
  const [bgVariant, setBgVariant] = useState<'city' | 'room'>('city');

  // Randomly pick background on mount
  useEffect(() => {
    setBgVariant(Math.random() > 0.5 ? 'city' : 'room');
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setState('processing');
    setError('');

    try {
      const { files, isHtmlExport } = await parseZipFile(file);

      if (isHtmlExport) {
        setError('Please download your Instagram data in JSON format, not HTML.');
        setState('error');
        return;
      }

      if (files.length === 0) {
        setError('No valid Instagram data found in the ZIP file.');
        setState('error');
        return;
      }

      setParsedFiles(files);

      // Default to 2025 or most recent year
      const currentYear = new Date().getFullYear();
      const analyzed = analyzeInstagramData(files, currentYear);
      
      setData(analyzed);
      setState('results');
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the ZIP file. Please make sure it\'s a valid Instagram data export.');
      setState('error');
    }
  }, []);

  const handleYearChange = useCallback((year: number) => {
    if (parsedFiles.length > 0) {
      const analyzed = analyzeInstagramData(parsedFiles, year);
      setData(analyzed);
    }
  }, [parsedFiles]);

  const handleReset = useCallback(() => {
    setState('upload');
    setData(null);
    setParsedFiles([]);
    setError('');
  }, []);

  // Keyboard navigation for StoryFlow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'results') return;
      
      // This will be handled by StoryFlow component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground variant={bgVariant} />

      <div className="relative z-10">
        {state === 'upload' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <h1 className="pixel-title text-2xl md:text-4xl mb-4">
                INSTAGRAM WRAPPED
              </h1>
              <p className="retro-text text-base md:text-lg text-muted-foreground">
                Upload your Instagram data export to see your year in review
              </p>
            </div>

            {/* Chest Upload */}
            <ChestUpload onFileSelect={handleFileSelect} isLoading={false} />

            {/* Privacy - subtle inline */}
            <PrivacyBanner />

            {/* Instructions */}
            <div className="glass-card p-6 max-w-sm w-full">
              <p className="pixel-text text-xs text-muted-foreground mb-4 text-center">HOW TO GET YOUR DATA</p>
              <ol className="retro-text text-sm text-muted-foreground space-y-2">
                <li>1. Go to Instagram Settings → Accounts Center</li>
                <li>2. Select "Your information and permissions"</li>
                <li>3. Choose "Download your information"</li>
                <li>4. Select JSON format and download</li>
                <li>5. Upload the ZIP file here</li>
              </ol>
            </div>

            {/* Made by */}
            <p className="retro-text text-xs text-muted-foreground/50">
              Made with ❤️ by Jaidev
            </p>
          </div>
        )}

        {state === 'processing' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-primary rounded-lg animate-ping opacity-30" />
                <div className="absolute inset-0 bg-primary/50 rounded-lg animate-pulse" />
              </div>
              <h2 className="pixel-title text-xl mb-4">MINING YOUR DATA...</h2>
              <p className="retro-text text-xl text-muted-foreground">
                Extracting chunks from your Instagram world
              </p>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
            <div className="glass-card p-8 text-center max-w-lg">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="pixel-text text-lg text-destructive mb-4">ERROR</h2>
              <p className="retro-text text-xl text-foreground mb-6">{error}</p>
              <button onClick={handleReset} className="minecraft-btn">
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {state === 'results' && data && (
          <>
            <StoryFlow data={data} onYearChange={handleYearChange} />
            
            {/* Reset button */}
            <div className="fixed bottom-4 right-4 z-20">
              <button
                onClick={handleReset}
                className="glass-card px-4 py-2 hover:bg-muted/80 transition-colors"
              >
                <span className="retro-text text-lg">Upload New Data</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;

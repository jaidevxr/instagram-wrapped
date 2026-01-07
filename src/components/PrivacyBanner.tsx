import { Shield } from 'lucide-react';

export function PrivacyBanner() {
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground/70">
      <Shield className="w-4 h-4" />
      <p className="retro-text text-sm">
        All data stays on your device
      </p>
    </div>
  );
}

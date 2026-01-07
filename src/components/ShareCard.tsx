import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Eye, EyeOff, X } from 'lucide-react';
import { InstagramData } from '@/types/instagram';

interface ShareCardProps {
  data: InstagramData;
  onClose: () => void;
}

export function ShareCard({ data, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [blurNames, setBlurNames] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `instagram-wrapped-${data.selectedYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
    setIsGenerating(false);
  };

  const totalMessages = data.messages.totalSent + data.messages.totalReceived;
  const topContact = data.messages.topContacts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="pixel-text text-sm text-primary">SHARE YOUR RECAP</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Toggle blur */}
        <button
          onClick={() => setBlurNames(!blurNames)}
          className="flex items-center gap-2 mb-4 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          {blurNames ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="retro-text text-lg">{blurNames ? 'Reveal' : 'Blur'} usernames</span>
        </button>

        {/* The card to export */}
        <div 
          ref={cardRef}
          className="p-6 rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(220 20% 12%) 0%, hsl(220 25% 8%) 100%)',
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-6">
              <p className="pixel-text text-xs text-muted-foreground mb-1">INSTAGRAM</p>
              <h2 className="pixel-title text-xl">WRAPPED {data.selectedYear}</h2>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="retro-text text-3xl text-primary">{totalMessages.toLocaleString()}</p>
                <p className="retro-text text-sm text-muted-foreground">Messages</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="retro-text text-3xl text-accent">{data.likes.totalGiven.toLocaleString()}</p>
                <p className="retro-text text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="retro-text text-3xl text-secondary">{data.content.reels.total}</p>
                <p className="retro-text text-sm text-muted-foreground">Reels</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="retro-text text-3xl text-neon-green">{data.content.stories.total}</p>
                <p className="retro-text text-sm text-muted-foreground">Stories</p>
              </div>
            </div>

            {/* Top 5 contacts */}
            {data.messages.topContacts.length > 0 && (
              <div className="mb-4">
                <p className="pixel-text text-xs text-primary mb-2 text-center">TOP 5 CHATS</p>
                <div className="space-y-2">
                  {data.messages.topContacts.slice(0, 5).map((contact, i) => (
                    <div key={contact.username} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <span className="retro-text text-lg">
                        {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                      </span>
                      <span className={`retro-text text-sm flex-1 truncate ${blurNames ? 'blur-sm select-none' : ''}`}>
                        {contact.username}
                      </span>
                      <span className="retro-text text-xs text-muted-foreground">
                        {contact.totalMessages.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top liked account */}
            {data.likes.topLikedAccounts.length > 0 && (
              <div className="text-center p-3 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg mb-4">
                <p className="retro-text text-sm text-muted-foreground mb-1">Most Liked Account</p>
                <p className={`pixel-text text-sm text-foreground ${blurNames ? 'blur-sm select-none' : ''}`}>
                  ❤️ {data.likes.topLikedAccounts[0].account}
                </p>
                <p className="retro-text text-xs text-muted-foreground">
                  {data.likes.topLikedAccounts[0].count} likes
                </p>
              </div>
            )}

            {/* Personality tags */}
            {data.personality.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {data.personality.slice(0, 2).map((p) => (
                  <span key={p.tag} className="px-3 py-1 rounded-full bg-muted text-foreground retro-text text-lg">
                    {p.emoji} {p.tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-border">
              <p className="pixel-text text-xs text-muted-foreground">Made with 💜</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="minecraft-btn flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'GENERATING...' : 'DOWNLOAD'}
          </button>
        </div>
      </div>
    </div>
  );
}

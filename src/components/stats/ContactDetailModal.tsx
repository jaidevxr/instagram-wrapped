import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  X, Download, MessageCircle, Send, Inbox, Calendar, 
  Flame, Clock, TrendingUp, Eye, EyeOff, Hash, Smile,
  Image, Film, Link2
} from 'lucide-react';
import { TopContact } from '@/types/instagram';

interface ContactDetailModalProps {
  contact: TopContact;
  rank: number;
  year: number;
  onClose: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ContactDetailModal({ contact, rank, year, onClose }: ContactDetailModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [blurName, setBlurName] = useState(true);
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
      link.download = `chat-stats-${blurName ? 'friend' : contact.username}-${year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
    setIsGenerating(false);
  };

  const rankEmojis = ['👑', '🥈', '🥉', '⭐', '✨'];
  const maxMonthly = Math.max(...Object.values(contact.messagesPerMonth || {}), 1);
  const maxHourly = Math.max(...Object.values(contact.messagesPerHour || {}), 1);
  const sentRatio = contact.totalMessages > 0 ? (contact.sent / contact.totalMessages) * 100 : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rankEmojis[rank - 1] || '✨'}</span>
            <h3 className="pixel-text text-sm text-primary">#{rank} MOST MESSAGED</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Blur toggle */}
        <button
          onClick={() => setBlurName(!blurName)}
          className="flex items-center gap-2 mb-4 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          {blurName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="retro-text text-lg">{blurName ? 'Reveal' : 'Blur'} username</span>
        </button>

        {/* Card to export */}
        <div 
          ref={cardRef}
          className="p-6 rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(220 20% 12%) 0%, hsl(220 25% 8%) 100%)',
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative space-y-6">
            {/* Contact header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
                <span className="pixel-text text-2xl text-primary-foreground">
                  {contact.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className={`pixel-text text-lg ${blurName ? 'blur-sm select-none' : ''}`}>
                {contact.username}
              </h2>
              <p className="retro-text text-muted-foreground">Chat Stats {year}</p>
            </div>

            {/* Main stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="retro-text text-2xl text-primary">{contact.totalMessages.toLocaleString()}</p>
                <p className="retro-text text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Send className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="retro-text text-2xl text-secondary">{contact.sent.toLocaleString()}</p>
                <p className="retro-text text-xs text-muted-foreground">Sent</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Inbox className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="retro-text text-2xl text-accent">{contact.received.toLocaleString()}</p>
                <p className="retro-text text-xs text-muted-foreground">Received</p>
              </div>
            </div>

            {/* Send/Receive ratio bar */}
            <div>
              <p className="pixel-text text-xs text-muted-foreground mb-2 text-center">MESSAGE BALANCE</p>
              <div className="h-4 rounded-full overflow-hidden bg-muted flex">
                <div 
                  className="bg-gradient-to-r from-secondary to-secondary/70 transition-all"
                  style={{ width: `${sentRatio}%` }}
                />
                <div 
                  className="bg-gradient-to-r from-accent/70 to-accent transition-all"
                  style={{ width: `${100 - sentRatio}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="retro-text text-xs text-secondary">You: {sentRatio.toFixed(0)}%</span>
                <span className="retro-text text-xs text-accent">Them: {(100 - sentRatio).toFixed(0)}%</span>
              </div>
            </div>

            {/* Extra stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Flame className="w-4 h-4 text-primary" />
                <div>
                  <p className="retro-text text-lg text-foreground">{contact.longestStreak} days</p>
                  <p className="retro-text text-xs text-muted-foreground">Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-4 h-4 text-accent" />
                <div>
                  <p className="retro-text text-lg text-foreground">{contact.mostActiveMonth}</p>
                  <p className="retro-text text-xs text-muted-foreground">Best Month</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-neon-green" />
                <div>
                  <p className="retro-text text-lg text-foreground">{contact.percentage.toFixed(1)}%</p>
                  <p className="retro-text text-xs text-muted-foreground">Of all DMs</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-4 h-4 text-secondary" />
                <div>
                  <p className="retro-text text-lg text-foreground">
                    {contact.firstInteraction.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </p>
                  <p className="retro-text text-xs text-muted-foreground">First Chat</p>
                </div>
            </div>

            {/* Media Stats */}
            {contact.mediaStats && (contact.mediaStats.photos > 0 || contact.mediaStats.videos > 0 || contact.mediaStats.reels > 0 || contact.mediaStats.links > 0) && (
              <div>
                <p className="pixel-text text-xs text-secondary mb-3 text-center">MEDIA SHARED</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Image className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="retro-text text-lg text-foreground">{contact.mediaStats.photos}</p>
                    <p className="retro-text text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Film className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="retro-text text-lg text-foreground">{contact.mediaStats.videos}</p>
                    <p className="retro-text text-xs text-muted-foreground">Videos</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Film className="w-4 h-4 text-neon-purple mx-auto mb-1" />
                    <p className="retro-text text-lg text-foreground">{contact.mediaStats.reels}</p>
                    <p className="retro-text text-xs text-muted-foreground">Reels</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Link2 className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <p className="retro-text text-lg text-foreground">{contact.mediaStats.links}</p>
                    <p className="retro-text text-xs text-muted-foreground">Links</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Monthly timeline */}
            {contact.messagesPerMonth && Object.keys(contact.messagesPerMonth).length > 0 && (
              <div>
                <p className="pixel-text text-xs text-primary mb-3 text-center">MONTHLY ACTIVITY ({year})</p>
                <div className="flex gap-1 items-end" style={{ height: '64px' }}>
                  {MONTHS.map((month) => {
                    const count = contact.messagesPerMonth[month] || 0;
                    const heightPx = maxMonthly > 0 ? Math.max((count / maxMonthly) * 56, count > 0 ? 8 : 2) : 2;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all bg-gradient-to-t from-primary to-primary/50"
                          style={{ height: `${heightPx}px` }}
                          title={`${month}: ${count} messages`}
                        />
                        <span className="retro-text text-xs text-muted-foreground mt-1">
                          {month.charAt(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground retro-text">
                  <span>Total: {Object.values(contact.messagesPerMonth).reduce((a, b) => a + b, 0)}</span>
                  <span>Peak: {Object.entries(contact.messagesPerMonth).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Top emojis */}
            {contact.topEmojis && contact.topEmojis.length > 0 && (
              <div>
                <p className="pixel-text text-xs text-secondary mb-3 text-center flex items-center justify-center gap-2">
                  <Smile className="w-4 h-4" />
                  MOST USED EMOJIS
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {contact.topEmojis.slice(0, 8).map((e, i) => (
                    <div 
                      key={e.emoji + i} 
                      className="flex flex-col items-center p-2 bg-muted/50 rounded-lg"
                    >
                      <span style={{ fontSize: `${Math.max(20, 32 - i * 2)}px` }}>{e.emoji}</span>
                      <span className="retro-text text-xs text-muted-foreground">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top words */}
            {contact.topWords && contact.topWords.length > 0 && (
              <div>
                <p className="pixel-text text-xs text-accent mb-3 text-center flex items-center justify-center gap-2">
                  <Hash className="w-4 h-4" />
                  MOST USED WORDS
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {contact.topWords.slice(0, 8).map((w, i) => (
                    <span 
                      key={w.word} 
                      className="px-3 py-1 rounded-full bg-muted text-foreground retro-text"
                      style={{ fontSize: `${Math.max(12, 18 - i * 1.5)}px` }}
                    >
                      {w.word} <span className="text-muted-foreground">({w.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* First/Last messages */}
            {(contact.firstMessage || contact.lastMessage) && (
              <div className="grid md:grid-cols-2 gap-3">
                {contact.firstMessage && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="pixel-text text-xs text-neon-green mb-1">FIRST MESSAGE</p>
                    <p className="retro-text text-sm text-foreground truncate">
                      "{contact.firstMessage.content.slice(0, 40)}..."
                    </p>
                    <p className="retro-text text-xs text-muted-foreground">
                      {contact.firstMessage.date.toLocaleDateString()}
                    </p>
                  </div>
                )}
                {contact.lastMessage && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="pixel-text text-xs text-accent mb-1">LAST MESSAGE</p>
                    <p className="retro-text text-sm text-foreground truncate">
                      "{contact.lastMessage.content.slice(0, 40)}..."
                    </p>
                    <p className="retro-text text-xs text-muted-foreground">
                      {contact.lastMessage.date.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-border">
              <p className="pixel-text text-xs text-muted-foreground">Made with 💜</p>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="minecraft-btn flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'GENERATING...' : 'DOWNLOAD CARD'}
          </button>
        </div>
      </div>
    </div>
  );
}

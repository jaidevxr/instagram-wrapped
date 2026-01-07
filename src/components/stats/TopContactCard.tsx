import { useState } from 'react';
import { TopContact } from '@/types/instagram';
import { Trophy, MessageCircle, Send, Inbox, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { ContactDetailModal } from './ContactDetailModal';

interface TopContactCardProps {
  contact: TopContact;
  rank: number;
  year?: number;
}

export function TopContactCard({ contact, rank, year = new Date().getFullYear() }: TopContactCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const rankColors = {
    1: 'from-yellow-500 to-amber-600',
    2: 'from-slate-300 to-slate-500',
    3: 'from-amber-600 to-amber-800',
    4: 'from-primary/60 to-primary/40',
    5: 'from-primary/40 to-primary/20',
  };

  const rankEmojis = ['👑', '🥈', '🥉', '⭐', '✨'];

  return (
    <>
      <div 
        className="glass-card p-6 relative overflow-hidden fade-in-up cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
        style={{ animationDelay: `${rank * 0.1}s` }}
        onClick={() => setShowDetail(true)}
      >
        {/* Rank badge */}
        <div 
          className={`absolute top-0 left-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors] || rankColors[5]}`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        >
          <span className="text-2xl absolute top-1 left-1">{rankEmojis[rank - 1]}</span>
        </div>

        {/* Click indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-primary" />
        </div>

        <div className="ml-12">
          {/* Username */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="pixel-text text-lg text-primary-foreground">
                {contact.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="pixel-text text-sm text-foreground">{contact.username}</h4>
              <p className="retro-text text-lg text-muted-foreground">
                #{rank} Most Messaged
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <div>
                <p className="retro-text text-xl text-foreground">{contact.totalMessages.toLocaleString()}</p>
                <p className="retro-text text-sm text-muted-foreground">Total</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-secondary" />
              <div>
                <p className="retro-text text-xl text-foreground">{contact.sent.toLocaleString()}</p>
                <p className="retro-text text-sm text-muted-foreground">Sent</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-accent" />
              <div>
                <p className="retro-text text-xl text-foreground">{contact.received.toLocaleString()}</p>
                <p className="retro-text text-sm text-muted-foreground">Received</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <div>
                <p className="retro-text text-xl text-foreground">{contact.percentage.toFixed(1)}%</p>
                <p className="retro-text text-sm text-muted-foreground">of all DMs</p>
              </div>
            </div>
          </div>

          {/* Progress bar showing percentage */}
          <div className="mt-4">
            <div className="pixel-progress">
              <div 
                className="pixel-progress-fill"
                style={{ width: `${Math.min(contact.percentage * 2, 100)}%` }}
              />
            </div>
          </div>

          {/* Meta info */}
          <div className="flex gap-4 mt-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="retro-text text-sm">
                First chat: {contact.firstInteraction.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-primary" />
              <span className="retro-text text-sm">
                Best month: {contact.mostActiveMonth}
              </span>
            </div>
          </div>

          {/* Tap hint */}
          <p className="retro-text text-xs text-primary/60 mt-3 group-hover:text-primary transition-colors">
            Tap for detailed stats & download →
          </p>
        </div>
      </div>

      {showDetail && (
        <ContactDetailModal
          contact={contact}
          rank={rank}
          year={year}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

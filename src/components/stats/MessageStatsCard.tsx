import { MessageStats } from '@/types/instagram';
import { MessageCircle, Send, Inbox, Users, Flame, Clock, Calendar } from 'lucide-react';
import { TopContactCard } from './TopContactCard';

interface MessageStatsCardProps {
  stats: MessageStats;
  year?: number;
}

export function MessageStatsCard({ stats, year = new Date().getFullYear() }: MessageStatsCardProps) {
  const totalMessages = stats.totalSent + stats.totalReceived;
  
  // Prepare hourly heatmap data
  const maxHourly = Math.max(...Object.values(stats.messagesPerHour), 1);
  
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          icon={<MessageCircle className="w-6 h-6" />}
          label="Total Messages"
          value={totalMessages.toLocaleString()}
          color="primary"
        />
        <StatBox
          icon={<Send className="w-6 h-6" />}
          label="Sent"
          value={stats.totalSent.toLocaleString()}
          color="cyan"
        />
        <StatBox
          icon={<Inbox className="w-6 h-6" />}
          label="Received"
          value={stats.totalReceived.toLocaleString()}
          color="pink"
        />
        <StatBox
          icon={<Users className="w-6 h-6" />}
          label="Conversations"
          value={stats.totalConversations.toLocaleString()}
          color="purple"
        />
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatBox
          icon={<Flame className="w-6 h-6" />}
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          color="primary"
        />
        <StatBox
          icon={<Clock className="w-6 h-6" />}
          label="Avg/Day"
          value={stats.avgMessagesPerDay.toFixed(1)}
          color="cyan"
        />
        <StatBox
          icon={<Calendar className="w-6 h-6" />}
          label="Best Chat"
          value={stats.longestConversation.name.slice(0, 12)}
          subValue={`${stats.longestConversation.count} msgs`}
          color="pink"
        />
      </div>

      {/* First & Last Message */}
      {(stats.firstMessage || stats.lastMessage) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.firstMessage && (
            <div className="stat-card">
              <p className="pixel-text text-xs text-neon-green mb-2">FIRST MESSAGE OF THE YEAR</p>
              <p className="retro-text text-xl text-foreground truncate">
                "{stats.firstMessage.content.slice(0, 50)}..."
              </p>
              <p className="retro-text text-muted-foreground mt-1">
                with {stats.firstMessage.with} • {stats.firstMessage.date.toLocaleDateString()}
              </p>
            </div>
          )}
          {stats.lastMessage && (
            <div className="stat-card-pink">
              <p className="pixel-text text-xs text-accent mb-2">LAST MESSAGE OF THE YEAR</p>
              <p className="retro-text text-xl text-foreground truncate">
                "{stats.lastMessage.content.slice(0, 50)}..."
              </p>
              <p className="retro-text text-muted-foreground mt-1">
                with {stats.lastMessage.with} • {stats.lastMessage.date.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hourly Heatmap */}
      <div className="glass-card p-6">
        <h3 className="pixel-text text-sm text-primary mb-4">MESSAGE ACTIVITY BY HOUR</h3>
        <div className="flex gap-1 justify-between">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = stats.messagesPerHour[hour] || 0;
            const intensity = count / maxHourly;
            return (
              <div key={hour} className="flex flex-col items-center gap-1">
                <div
                  className="w-4 md:w-6 h-12 rounded transition-all duration-300"
                  style={{
                    background: `linear-gradient(to top, 
                      hsl(20 100% ${30 + intensity * 40}% / ${0.3 + intensity * 0.7}),
                      hsl(330 100% ${30 + intensity * 40}% / ${0.3 + intensity * 0.7})
                    )`,
                  }}
                  title={`${hour}:00 - ${count} messages`}
                />
                <span className="retro-text text-xs text-muted-foreground">
                  {hour % 6 === 0 ? `${hour}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Contacts */}
      {stats.topContacts.length > 0 && (
        <div>
          <h3 className="pixel-text text-lg text-primary mb-6 text-center">
            🏆 TOP 5 MOST MESSAGED PEOPLE 🏆
          </h3>
          <div className="space-y-4">
            {stats.topContacts.map((contact, index) => (
              <TopContactCard key={contact.username} contact={contact} rank={index + 1} year={year} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: 'primary' | 'cyan' | 'pink' | 'purple';
}

function StatBox({ icon, label, value, subValue, color }: StatBoxProps) {
  const colorClasses = {
    primary: 'text-primary border-l-primary',
    cyan: 'text-secondary border-l-secondary',
    pink: 'text-accent border-l-accent',
    purple: 'text-neon-purple border-l-neon-purple',
  };

  return (
    <div className={`glass-card p-4 border-l-4 ${colorClasses[color].split(' ')[2]}`}>
      <div className={`${colorClasses[color].split(' ').slice(0, 2).join(' ')} mb-2`}>
        {icon}
      </div>
      <p className="pixel-text text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`retro-text text-3xl ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
        {value}
      </p>
      {subValue && (
        <p className="retro-text text-lg text-muted-foreground">{subValue}</p>
      )}
    </div>
  );
}

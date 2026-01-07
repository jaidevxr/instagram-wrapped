import { LikeStats } from '@/types/instagram';
import { Heart, ThumbsUp, Clock, TrendingUp, User } from 'lucide-react';

interface LikeStatsCardProps {
  stats: LikeStats;
}

export function LikeStatsCard({ stats }: LikeStatsCardProps) {
  const maxHourly = Math.max(...Object.values(stats.likesPerHour), 1);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      {/* Total Likes */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10" />
        <Heart className="w-16 h-16 text-accent mx-auto mb-4" />
        <p className="pixel-text text-sm text-muted-foreground mb-2">TOTAL LIKES GIVEN</p>
        <p className="pixel-title text-4xl md:text-6xl text-accent">
          {stats.totalGiven.toLocaleString()}
        </p>
      </div>

      {/* Monthly breakdown */}
      <div className="glass-card p-6">
        <h3 className="pixel-text text-sm text-primary mb-4">LIKES PER MONTH</h3>
        <div className="space-y-2">
          {MONTHS.map((month) => {
            const count = stats.likesPerMonth[month] || 0;
            const maxMonthly = Math.max(...Object.values(stats.likesPerMonth), 1);
            const percentage = (count / maxMonthly) * 100;
            
            return (
              <div key={month} className="flex items-center gap-3">
                <span className="retro-text text-lg w-10 text-muted-foreground">{month}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="retro-text text-lg w-16 text-right text-foreground">
                  {count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="glass-card p-6">
        <h3 className="pixel-text text-sm text-secondary mb-4">LIKE ACTIVITY BY HOUR</h3>
        <div className="flex gap-1 justify-between">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = stats.likesPerHour[hour] || 0;
            const intensity = count / maxHourly;
            return (
              <div key={hour} className="flex flex-col items-center gap-1">
                <div
                  className="w-4 md:w-6 h-12 rounded transition-all duration-300"
                  style={{
                    background: `linear-gradient(to top, 
                      hsl(330 100% ${30 + intensity * 40}% / ${0.3 + intensity * 0.7}),
                      hsl(330 100% ${50 + intensity * 20}% / ${0.3 + intensity * 0.7})
                    )`,
                  }}
                  title={`${hour}:00 - ${count} likes`}
                />
                <span className="retro-text text-xs text-muted-foreground">
                  {hour % 6 === 0 ? `${hour}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top liked accounts */}
      {stats.topLikedAccounts.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="pixel-text text-sm text-accent mb-4">TOP LIKED ACCOUNTS</h3>
          <div className="space-y-3">
            {stats.topLikedAccounts.slice(0, 5).map((account, i) => (
              <div key={account.account} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <span className="pixel-text text-xs text-primary-foreground">{i + 1}</span>
                </div>
                <span className="retro-text text-xl flex-1 text-foreground truncate">
                  {account.account}
                </span>
                <div className="flex items-center gap-1 text-accent">
                  <Heart className="w-4 h-4" />
                  <span className="retro-text text-lg">{account.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media type breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(stats.mediaTypeCounts).map(([type, count]) => (
          <div key={type} className="glass-card p-4 text-center">
            <p className="pixel-text text-xs text-muted-foreground mb-1 uppercase">{type}</p>
            <p className="retro-text text-2xl text-foreground">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

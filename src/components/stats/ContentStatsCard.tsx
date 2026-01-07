import { ContentStats } from '@/types/instagram';
import { Film, Image, BookOpen, Calendar, TrendingUp } from 'lucide-react';

interface ContentStatsCardProps {
  stats: ContentStats;
}

export function ContentStatsCard({ stats }: ContentStatsCardProps) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reels */}
        <div className="glass-card p-6 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Film className="w-12 h-12 text-secondary mx-auto mb-3 animate-float" />
          <p className="pixel-text text-xs text-muted-foreground mb-2">REELS POSTED</p>
          <p className="pixel-title text-3xl text-secondary glow-cyan">
            {stats.reels.total}
          </p>
        </div>

        {/* Posts */}
        <div className="glass-card p-6 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image className="w-12 h-12 text-primary mx-auto mb-3 animate-float" style={{ animationDelay: '0.2s' }} />
          <p className="pixel-text text-xs text-muted-foreground mb-2">POSTS SHARED</p>
          <p className="pixel-title text-3xl text-primary glow-orange">
            {stats.posts.total}
          </p>
        </div>

        {/* Stories */}
        <div className="glass-card p-6 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <BookOpen className="w-12 h-12 text-accent mx-auto mb-3 animate-float" style={{ animationDelay: '0.4s' }} />
          <p className="pixel-text text-xs text-muted-foreground mb-2">STORIES SHARED</p>
          <p className="pixel-title text-3xl text-accent glow-pink">
            {stats.stories.total}
          </p>
        </div>
      </div>

      {/* Monthly timeline */}
      <div className="glass-card p-6">
        <h3 className="pixel-text text-sm text-primary glow-orange mb-6">CONTENT TIMELINE</h3>
        
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex gap-4 justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary" />
              <span className="retro-text text-sm text-muted-foreground">Reels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="retro-text text-sm text-muted-foreground">Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent" />
              <span className="retro-text text-sm text-muted-foreground">Stories</span>
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-end gap-2 h-48 justify-between">
            {MONTHS.map((month) => {
              const reelCount = stats.reels.perMonth[month] || 0;
              const postCount = stats.posts.perMonth[month] || 0;
              const storyCount = stats.stories.perMonth[month] || 0;
              
              const maxValue = Math.max(
                ...Object.values(stats.reels.perMonth),
                ...Object.values(stats.posts.perMonth),
                ...Object.values(stats.stories.perMonth),
                1
              );

              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end h-36">
                    <div 
                      className="flex-1 bg-secondary rounded-t transition-all duration-500"
                      style={{ height: `${(reelCount / maxValue) * 100}%`, minHeight: reelCount ? '4px' : '0' }}
                    />
                    <div 
                      className="flex-1 bg-primary rounded-t transition-all duration-500"
                      style={{ height: `${(postCount / maxValue) * 100}%`, minHeight: postCount ? '4px' : '0' }}
                    />
                    <div 
                      className="flex-1 bg-accent rounded-t transition-all duration-500"
                      style={{ height: `${(storyCount / maxValue) * 100}%`, minHeight: storyCount ? '4px' : '0' }}
                    />
                  </div>
                  <span className="retro-text text-xs text-muted-foreground">{month.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best months */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="pixel-text text-xs text-muted-foreground">MOST ACTIVE POSTING MONTH</p>
          </div>
          <p className="retro-text text-2xl text-foreground">{stats.posts.mostActiveMonth}</p>
        </div>
        
        <div className="stat-card-pink">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <p className="pixel-text text-xs text-muted-foreground">PEAK STORY MONTH</p>
          </div>
          <p className="retro-text text-2xl text-foreground">{stats.stories.peakMonth}</p>
        </div>
      </div>
    </div>
  );
}

import { ConnectionStats, SearchStats, LoginStats } from '@/types/instagram';
import { Users, UserPlus, UserMinus, Search, Smartphone, MapPin, TrendingUp } from 'lucide-react';

interface ConnectionStatsCardProps {
  connections: ConnectionStats;
  searches: SearchStats;
  logins: LoginStats;
}

export function ConnectionStatsCard({ connections, searches, logins }: ConnectionStatsCardProps) {
  return (
    <div className="space-y-6">
      {/* Follower stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="pixel-text text-xs text-muted-foreground mb-1">FOLLOWERS</p>
          <p className="retro-text text-2xl text-foreground">{connections.followers.toLocaleString()}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <UserPlus className="w-8 h-8 text-neon-green mx-auto mb-2" />
          <p className="pixel-text text-xs text-muted-foreground mb-1">NEW</p>
          <p className="retro-text text-2xl text-neon-green">{connections.newFollowers.toLocaleString()}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="pixel-text text-xs text-muted-foreground mb-1">FOLLOWING</p>
          <p className="retro-text text-2xl text-foreground">{connections.following.toLocaleString()}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <Users className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="pixel-text text-xs text-muted-foreground mb-1">MUTUALS</p>
          <p className="retro-text text-2xl text-foreground">~{connections.mutuals.toLocaleString()}</p>
        </div>
      </div>

      {/* Search behavior */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-secondary" />
          <h3 className="pixel-text text-sm text-secondary glow-cyan">SEARCH BEHAVIOR</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="retro-text text-4xl text-foreground mb-2">{searches.totalSearches}</p>
            <p className="retro-text text-lg text-muted-foreground">Total Searches</p>
            
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/50">
              <p className="pixel-text text-xs text-secondary">{searches.searchPersonality}</p>
            </div>
          </div>
          
          <div>
            <p className="pixel-text text-xs text-muted-foreground mb-3">TOP SEARCHED</p>
            <div className="space-y-2">
              {searches.topSearchedAccounts.slice(0, 3).map((item, i) => (
                <div key={item.account} className="flex items-center gap-2">
                  <span className="retro-text text-lg text-muted-foreground">{i + 1}.</span>
                  <span className="retro-text text-xl text-foreground flex-1 truncate">{item.account}</span>
                  <span className="retro-text text-lg text-secondary">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login activity */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-accent" />
          <h3 className="pixel-text text-sm text-accent glow-pink">LOGIN ACTIVITY</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="retro-text text-4xl text-foreground">{logins.totalLogins}</p>
            <p className="retro-text text-lg text-muted-foreground">Total Logins</p>
          </div>
          
          <div className="text-center">
            <p className="retro-text text-4xl text-foreground">{logins.devices.length}</p>
            <p className="retro-text text-lg text-muted-foreground">Devices Used</p>
          </div>
          
          <div className="text-center">
            <div className="inline-block px-4 py-2 rounded-lg bg-accent/20 border border-accent/50">
              <Smartphone className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="pixel-text text-xs text-accent">{logins.mostUsedDevice}</p>
            </div>
            <p className="retro-text text-sm text-muted-foreground mt-2">Most Used</p>
          </div>
        </div>

        {logins.devices.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {logins.devices.map((device) => (
              <span key={device} className="px-3 py-1 rounded bg-muted text-muted-foreground retro-text text-lg">
                {device}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

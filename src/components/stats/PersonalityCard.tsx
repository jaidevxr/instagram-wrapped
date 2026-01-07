import { PersonalityInsight } from '@/types/instagram';
import { Award, Star, Sparkles } from 'lucide-react';

interface PersonalityCardProps {
  insights: PersonalityInsight[];
}

export function PersonalityCard({ insights }: PersonalityCardProps) {
  if (insights.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="retro-text text-xl text-muted-foreground">
          Not enough data to determine your personality traits
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Award className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
        <h2 className="pixel-title text-2xl glow-orange mb-2">YOUR 2025 PERSONALITY</h2>
        <p className="retro-text text-xl text-muted-foreground">Based on your Instagram activity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {insights.map((insight, i) => (
          <div 
            key={insight.tag}
            className="glass-card p-6 relative overflow-hidden hover:scale-105 transition-transform duration-300 bounce-in"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {/* Background glow */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 30% 30%, 
                  ${i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))'} 0%, 
                  transparent 70%
                )`,
              }}
            />

            <div className="relative">
              {/* Emoji & Tag */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{insight.emoji}</span>
                <div>
                  <h3 className="pixel-text text-sm text-foreground">{insight.tag}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star 
                        key={starIndex}
                        className={`w-4 h-4 ${starIndex < Math.round(insight.score * 5) ? 'text-neon-yellow fill-neon-yellow' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="retro-text text-xl text-muted-foreground">
                {insight.description}
              </p>

              {/* Score bar */}
              <div className="mt-4">
                <div className="pixel-progress">
                  <div 
                    className="pixel-progress-fill"
                    style={{ width: `${insight.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

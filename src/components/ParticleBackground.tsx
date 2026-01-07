import { useMemo } from 'react';
import bgNeonCity from '@/assets/bg-neon-city.gif';
import bgPixelRoom from '@/assets/bg-pixel-room.gif';

interface ParticleBackgroundProps {
  variant?: 'city' | 'room';
}

export function ParticleBackground({ variant = 'city' }: ParticleBackgroundProps) {
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
      size: 2 + Math.random() * 3,
      color: ['primary', 'secondary', 'accent'][Math.floor(Math.random() * 3)],
    }));
  }, []);

  const bgImage = variant === 'city' ? bgNeonCity : bgPixelRoom;

  return (
    <>
      {/* Background image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.4) saturate(1.2)',
        }}
      />
      
      {/* Overlay gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      
      {/* Particles */}
      <div className="particles-bg z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`particle ${p.color === 'secondary' ? 'bg-secondary' : p.color === 'accent' ? 'bg-accent' : 'bg-primary'}`}
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Scanlines effect */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
    </>
  );
}

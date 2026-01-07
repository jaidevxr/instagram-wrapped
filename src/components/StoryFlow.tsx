import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Heart, Film, Users, Award, Share } from 'lucide-react';
import { InstagramData } from '@/types/instagram';
import { MessageStatsCard } from './stats/MessageStatsCard';
import { LikeStatsCard } from './stats/LikeStatsCard';
import { ContentStatsCard } from './stats/ContentStatsCard';
import { ConnectionStatsCard } from './stats/ConnectionStatsCard';
import { PersonalityCard } from './stats/PersonalityCard';
import { ShareCard } from './ShareCard';
import { YearSelector } from './YearSelector';

interface StoryFlowProps {
  data: InstagramData;
  onYearChange: (year: number) => void;
}

const SLIDES = [
  { id: 'messages', label: 'Messages', icon: MessageCircle, color: 'primary' },
  { id: 'likes', label: 'Likes', icon: Heart, color: 'accent' },
  { id: 'content', label: 'Content', icon: Film, color: 'secondary' },
  { id: 'connections', label: 'Connections', icon: Users, color: 'neon-purple' },
  { id: 'personality', label: 'Personality', icon: Award, color: 'neon-yellow' },
] as const;

export function StoryFlow({ data, onYearChange }: StoryFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showShare, setShowShare] = useState(false);

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderSlide = () => {
    switch (SLIDES[currentSlide].id) {
      case 'messages':
        return <MessageStatsCard stats={data.messages} year={data.selectedYear} />;
      case 'likes':
        return <LikeStatsCard stats={data.likes} />;
      case 'content':
        return <ContentStatsCard stats={data.content} />;
      case 'connections':
        return (
          <ConnectionStatsCard 
            connections={data.connections} 
            searches={data.searches} 
            logins={data.logins} 
          />
        );
      case 'personality':
        return <PersonalityCard insights={data.personality} />;
      default:
        return null;
    }
  };

  const CurrentIcon = SLIDES[currentSlide].icon;

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="pixel-title text-xl md:text-2xl">
              INSTAGRAM WRAPPED
            </h1>
            <YearSelector 
              years={data.availableYears} 
              selectedYear={data.selectedYear} 
              onChange={onYearChange} 
            />
          </div>
          
          <button
            onClick={() => setShowShare(true)}
            className="minecraft-btn flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            SHARE
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SLIDES.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200
                  ${index === currentSlide 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="pixel-text text-xs hidden md:inline">{slide.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex gap-1">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={`
                flex-1 h-1 rounded-full transition-all duration-300
                ${index <= currentSlide ? 'bg-primary' : 'bg-muted'}
              `}
            />
          ))}
        </div>
      </div>

      {/* Slide header */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <div className="inline-flex items-center gap-3 glass-card px-6 py-3">
          <CurrentIcon className={`w-6 h-6 text-${SLIDES[currentSlide].color}`} />
          <h2 className="pixel-text text-lg">{SLIDES[currentSlide].label}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative">
        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
            w-12 h-12 rounded-full bg-muted flex items-center justify-center
            transition-all duration-200 hover:bg-muted/80
            ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}
          `}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goNext}
          disabled={currentSlide === SLIDES.length - 1}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
            w-12 h-12 rounded-full bg-muted flex items-center justify-center
            transition-all duration-200 hover:bg-muted/80
            ${currentSlide === SLIDES.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}
          `}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide content */}
        <div className="slide-up" key={currentSlide}>
          {renderSlide()}
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <p className="retro-text text-lg text-muted-foreground">
          Use arrow keys or swipe to navigate
        </p>
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareCard data={data} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

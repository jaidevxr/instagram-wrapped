import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
}

export function YearSelector({ years, selectedYear, onChange }: YearSelectorProps) {
  if (years.length <= 1) return null;

  return (
    <div className="glass-card p-3 inline-flex items-center gap-3">
      <Calendar className="w-5 h-5 text-primary" />
      <div className="flex gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={`
              px-4 py-2 rounded font-pixel text-xs transition-all duration-200
              ${year === selectedYear 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

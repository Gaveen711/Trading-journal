import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming this exists for tailwind-merge

export function CustomSelect({ options, value, onChange, placeholder = 'Select...', className, name, disabled, align = 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {name && <input type="hidden" name={name} value={value || ''} />}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 rounded-xl border border-border bg-muted flex items-center justify-between group transition-all duration-300 hover:border-primary hover:bg-muted-foreground/10",
          !className?.includes('h-') && "h-12",
          isOpen && "border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(139,92,246,0.1)]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <span className={cn(
          "text-[11px] font-black uppercase tracking-tight transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis mr-2",
          selectedOption ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-500 ease-[var(--apple-ease)]",
          isOpen ? "rotate-180 text-primary" : "group-hover:text-foreground"
        )} />
      </button>

      {isOpen && (
        <div
          style={align === 'top' ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }}
          className={cn(
            "absolute left-0 right-0 z-[100] p-1.5 rounded-2xl border border-border bg-card backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200",
            align === 'top' ? "origin-bottom" : "origin-top"
          )}
        >
          <div data-lenis-prevent className="space-y-1 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 group relative overflow-hidden text-left",
                  value === option.value 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {option.label}
                {value === option.value && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


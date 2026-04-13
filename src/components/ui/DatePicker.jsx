import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar3 } from 'react-bootstrap-icons';
import { pad2 } from '../../lib/tradeUtils';

export function DatePicker({ value, onChange, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value + 'T00:00:00') : new Date());
  const popoverRef = useRef(null);

  // Parse value to date components
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const calMonth = viewDate.getMonth();
  const calYear = viewDate.getFullYear();

  const formatDate = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

  const changeMonth = (delta) => {
    let nextMonth = calMonth + delta, nextYear = calYear;
    if (nextMonth < 0) { nextMonth = 11; nextYear--; }
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    setViewDate(new Date(nextYear, nextMonth, 1));
  };

  const handleDayClick = (d) => {
    const formatted = formatDate(calYear, calMonth, d);
    onChange(formatted);
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    const formatted = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(formatted);
    setViewDate(today);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderCells = () => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const days = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < first; i++) cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);

    for (let d = 1; d <= days; d++) {
      const isSelected = selectedDate && d === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
      const today = new Date();
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      
      cells.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => handleDayClick(d)}
          className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all flex items-center justify-center border-0 ${
            isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
            isToday ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:bg-muted'
          }`}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="relative w-full" ref={popoverRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-premium h-12 flex items-center justify-between cursor-pointer group"
      >
        <span className="text-sm font-bold">{value || 'Select Date...'}</span>
        <Calendar3 className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
      </div>
      
      <input type="hidden" name={name} value={value} />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[100] w-64 p-4 card-premium glass shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-muted rounded-full transition-all active:scale-90">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
              {new Date(calYear, calMonth, 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 hover:bg-muted rounded-full transition-all active:scale-90">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="w-8 h-4 flex items-center justify-center text-[8px] font-black text-muted-foreground/40">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCells()}
          </div>

          <div className="mt-4 pt-4 border-t border-border/30">
            <button 
              type="button" 
              onClick={setToday}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

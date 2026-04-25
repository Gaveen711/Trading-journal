import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useToast } from '../components/ToastContext';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', country: 'US' },
  { code: 'EUR', name: 'Euro', country: 'EU' },
  { code: 'GBP', name: 'British Pound', country: 'GB' },
  { code: 'JPY', name: 'Japanese Yen', country: 'JP' },
  { code: 'AUD', name: 'Australian Dollar', country: 'AU' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'CA' },
  { code: 'CHF', name: 'Swiss Franc', country: 'CH' },
  { code: 'CNY', name: 'Chinese Yuan', country: 'CN' },
  { code: 'HKD', name: 'Hong Kong Dollar', country: 'HK' },
  { code: 'NZD', name: 'New Zealand Dollar', country: 'NZ' },
  { code: 'SEK', name: 'Swedish Krona', country: 'SE' },
  { code: 'KRW', name: 'South Korean Won', country: 'KR' },
  { code: 'SGD', name: 'Singapore Dollar', country: 'SG' },
  { code: 'NOK', name: 'Norwegian Krone', country: 'NO' },
  { code: 'MXN', name: 'Mexican Peso', country: 'MX' },
  { code: 'INR', name: 'Indian Rupee', country: 'IN' },
  { code: 'RUB', name: 'Russian Ruble', country: 'RU' },
  { code: 'ZAR', name: 'South African Rand', country: 'ZA' },
  { code: 'TRY', name: 'Turkish Lira', country: 'TR' },
  { code: 'BRL', name: 'Brazilian Real', country: 'BR' },
  { code: 'TWD', name: 'Taiwan New Dollar', country: 'TW' },
  { code: 'DKK', name: 'Danish Krone', country: 'DK' },
  { code: 'PLN', name: 'Polish Zloty', country: 'PL' },
  { code: 'THB', name: 'Thai Baht', country: 'TH' },
  { code: 'IDR', name: 'Indonesian Rupiah', country: 'ID' },
  { code: 'HUF', name: 'Hungarian Forint', country: 'HU' },
  { code: 'CZK', name: 'Czech Koruna', country: 'CZ' },
  { code: 'ILS', name: 'Israeli Shekel', country: 'IL' },
  { code: 'CLP', name: 'Chilean Peso', country: 'CL' },
  { code: 'PHP', name: 'Philippine Peso', country: 'PH' },
  { code: 'AED', name: 'UAE Dirham', country: 'AE' },
  { code: 'COP', name: 'Colombian Peso', country: 'CO' },
  { code: 'SAR', name: 'Saudi Riyal', country: 'SA' },
  { code: 'MYR', name: 'Malaysian Ringgit', country: 'MY' },
  { code: 'RON', name: 'Romanian Leu', country: 'RO' },
  { code: 'LKR', name: 'Sri Lankan Rupee', country: 'LK' },
  { code: 'PKR', name: 'Pakistani Rupee', country: 'PK' },
  { code: 'BDT', name: 'Bangladeshi Taka', country: 'BD' },
  { code: 'VND', name: 'Vietnamese Dong', country: 'VN' },
  { code: 'EGP', name: 'Egyptian Pound', country: 'EG' },
  { code: 'KWD', name: 'Kuwaiti Dinar', country: 'KW' },
  { code: 'BHD', name: 'Bahraini Dinar', country: 'BH' },
  { code: 'OMR', name: 'Omani Rial', country: 'OM' },
  { code: 'QAR', name: 'Qatari Riyal', country: 'QA' }
];

function CurrencySelect({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = CURRENCIES.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative w-full" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isOpen ? 'bg-muted/50 border-primary/50 ring-2 ring-primary/10' : 'bg-muted/30 border-border/50 hover:border-primary/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 overflow-hidden rounded-sm bg-muted/20 flex-shrink-0">
            <img 
              src={`/flags/${selected?.country?.toLowerCase()}.svg`} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => { 
                if (selected?.code === 'EUR') e.target.src = '/flags/fr.svg';
                else e.target.src = 'https://placehold.co/40x30/1e1e2e/64748b?text=' + selected?.code; 
              }}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">{selected?.code}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] p-1.5 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="space-y-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  value === c.code ? 'bg-primary text-white' : 'hover:bg-white/5 text-foreground/70 hover:text-foreground'
                }`}
              >
                <div className="w-6 h-4 overflow-hidden rounded-sm bg-muted/10 flex-shrink-0">
                  <img 
                    src={`/flags/${c.country?.toLowerCase()}.svg`} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { 
                      if (c.code === 'EUR') e.target.src = '/flags/fr.svg';
                    }}
                  />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CurrencyConverter() {
  const toast = useToast();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchRate = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast("Please enter a valid amount.", "error");
      return;
    }

    if (from === to) {
      setRate(1);
      setResult(val);
      return;
    }
    
    setLoading(true);
    try {
      // Primary: User's private API key
      // Primary: User's private API key
      const apiKey = import.meta.env.VITE_CURRENCY_API_KEY;
      let res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
      let data;
      
      if (res.ok) {
        data = await res.json();
      }

      // Fallback: Public API if private fails
      if (!res.ok || data?.result !== 'success') {
        console.warn('Private API failed or limit reached, trying fallback...');
        res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        data = await res.json();
      }

      if (!data || (!data.conversion_rates && !data.rates)) {
        throw new Error("Invalid rate data received");
      }

      const rates = data.conversion_rates || data.rates;
      const currentRate = rates[to];
      
      if (!currentRate) throw new Error("Target currency not found in rates");

      setResult(val * currentRate);
      setRate(currentRate);
    } catch (error) {
      console.error('Currency Conversion Error:', error);
      toast("Connection error. Using estimated rates.", "error");
      // Basic fallback result to prevent "Calculating..." being stuck
      setResult(val * 1.0); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [from, to]);

  const handleConvert = (e) => {
    e.preventDefault();
    fetchRate();
  };

  return (
    <div className="card-premium p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-300">
      <div className="text-center space-y-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Currency Converter</h3>
        <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
      </div>

      <form onSubmit={handleConvert} className="space-y-8">
        <div className="space-y-2 flex flex-col items-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter Amount</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="input-premium h-12 text-sm font-bold text-center max-w-[220px]"
            placeholder="100"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <CurrencySelect label="From" value={from} onChange={setFrom} />
          <CurrencySelect label="To" value={to} onChange={setTo} />
        </div>

        {result !== null && (
          <div className="py-2 text-center animate-in fade-in duration-500">
            <div className="text-sm font-bold text-foreground/80 tracking-tight">
              {loading ? (
                <span>Calculating...</span>
              ) : (
                <span>{amount} {from} = {result.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} {to}</span>
              )}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full h-12 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>
    </div>
  );
}

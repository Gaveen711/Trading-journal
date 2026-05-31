import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ArrowRight, ArrowUpRight, ArrowDownRight, Gem, Wallet, Book, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { auth } from '../../firebase';
import { formatCurrency, formatNumber } from '../../lib/tradeUtils';

const CURRENCIES = [
  {
    "code": "AED",
    "name": "United Arab Emirates Dirham",
    "country": "AE"
  },
  {
    "code": "AFN",
    "name": "Afghan Afghani",
    "country": "AF"
  },
  {
    "code": "ALL",
    "name": "Albanian Lek",
    "country": "AL"
  },
  {
    "code": "AMD",
    "name": "Armenian Dram",
    "country": "AM"
  },
  {
    "code": "ANG",
    "name": "Netherlands Antillean Guilder",
    "country": "CW"
  },
  {
    "code": "AOA",
    "name": "Angolan Kwanza",
    "country": "AO"
  },
  {
    "code": "ARS",
    "name": "Argentine Peso",
    "country": "AR"
  },
  {
    "code": "AUD",
    "name": "Australian Dollar",
    "country": "AU"
  },
  {
    "code": "AWG",
    "name": "Aruban Florin",
    "country": "AW"
  },
  {
    "code": "AZN",
    "name": "Azerbaijani Manat",
    "country": "AZ"
  },
  {
    "code": "BAM",
    "name": "Bosnia-Herzegovina Convertible Mark",
    "country": "BA"
  },
  {
    "code": "BBD",
    "name": "Barbadian Dollar",
    "country": "BB"
  },
  {
    "code": "BDT",
    "name": "Bangladeshi Taka",
    "country": "BD"
  },
  {
    "code": "BGN",
    "name": "Bulgarian Lev",
    "country": "BG"
  },
  {
    "code": "BHD",
    "name": "Bahraini Dinar",
    "country": "BH"
  },
  {
    "code": "BIF",
    "name": "Burundian Franc",
    "country": "BI"
  },
  {
    "code": "BMD",
    "name": "Bermudan Dollar",
    "country": "BM"
  },
  {
    "code": "BND",
    "name": "Brunei Dollar",
    "country": "BN"
  },
  {
    "code": "BOB",
    "name": "Bolivian Boliviano",
    "country": "BO"
  },
  {
    "code": "BRL",
    "name": "Brazilian Real",
    "country": "BR"
  },
  {
    "code": "BSD",
    "name": "Bahamian Dollar",
    "country": "BS"
  },
  {
    "code": "BTN",
    "name": "Bhutanese Ngultrum",
    "country": "BT"
  },
  {
    "code": "BWP",
    "name": "Botswanan Pula",
    "country": "BW"
  },
  {
    "code": "BYN",
    "name": "Belarusian Ruble",
    "country": "BY"
  },
  {
    "code": "BZD",
    "name": "Belize Dollar",
    "country": "BZ"
  },
  {
    "code": "CAD",
    "name": "Canadian Dollar",
    "country": "CA"
  },
  {
    "code": "CDF",
    "name": "Congolese Franc",
    "country": "CD"
  },
  {
    "code": "CHF",
    "name": "Swiss Franc",
    "country": "CH"
  },
  {
    "code": "CLF",
    "name": "Chilean Unit of Account (UF)",
    "country": "CL"
  },
  {
    "code": "CLP",
    "name": "Chilean Peso",
    "country": "CL"
  },
  {
    "code": "CNH",
    "name": "Chinese Yuan (Offshore)",
    "country": "CN"
  },
  {
    "code": "CNY",
    "name": "Chinese Yuan",
    "country": "CN"
  },
  {
    "code": "COP",
    "name": "Colombian Peso",
    "country": "CO"
  },
  {
    "code": "CRC",
    "name": "Costa Rican Colón",
    "country": "CR"
  },
  {
    "code": "CUP",
    "name": "Cuban Peso",
    "country": "CU"
  },
  {
    "code": "CVE",
    "name": "Cape Verdean Escudo",
    "country": "CV"
  },
  {
    "code": "CZK",
    "name": "Czech Republic Koruna",
    "country": "CZ"
  },
  {
    "code": "DJF",
    "name": "Djiboutian Franc",
    "country": "DJ"
  },
  {
    "code": "DKK",
    "name": "Danish Krone",
    "country": "DK"
  },
  {
    "code": "DOP",
    "name": "Dominican Peso",
    "country": "DO"
  },
  {
    "code": "DZD",
    "name": "Algerian Dinar",
    "country": "DZ"
  },
  {
    "code": "EGP",
    "name": "Egyptian Pound",
    "country": "EG"
  },
  {
    "code": "ERN",
    "name": "Eritrean Nakfa",
    "country": "ER"
  },
  {
    "code": "ETB",
    "name": "Ethiopian Birr",
    "country": "ET"
  },
  {
    "code": "EUR",
    "name": "Euro",
    "country": "EU"
  },
  {
    "code": "FJD",
    "name": "Fijian Dollar",
    "country": "FJ"
  },
  {
    "code": "FKP",
    "name": "Falkland Islands Pound",
    "country": "FK"
  },
  {
    "code": "FOK",
    "name": "FOK Currency",
    "country": "FO"
  },
  {
    "code": "GBP",
    "name": "British Pound Sterling",
    "country": "GB"
  },
  {
    "code": "GEL",
    "name": "Georgian Lari",
    "country": "GE"
  },
  {
    "code": "GGP",
    "name": "Guernsey Pound",
    "country": "GG"
  },
  {
    "code": "GHS",
    "name": "Ghanaian Cedi",
    "country": "GH"
  },
  {
    "code": "GIP",
    "name": "Gibraltar Pound",
    "country": "GI"
  },
  {
    "code": "GMD",
    "name": "Gambian Dalasi",
    "country": "GM"
  },
  {
    "code": "GNF",
    "name": "Guinean Franc",
    "country": "GN"
  },
  {
    "code": "GTQ",
    "name": "Guatemalan Quetzal",
    "country": "GT"
  },
  {
    "code": "GYD",
    "name": "Guyanaese Dollar",
    "country": "GY"
  },
  {
    "code": "HKD",
    "name": "Hong Kong Dollar",
    "country": "HK"
  },
  {
    "code": "HNL",
    "name": "Honduran Lempira",
    "country": "HN"
  },
  {
    "code": "HRK",
    "name": "Croatian Kuna",
    "country": "HR"
  },
  {
    "code": "HTG",
    "name": "Haitian Gourde",
    "country": "HT"
  },
  {
    "code": "HUF",
    "name": "Hungarian Forint",
    "country": "HU"
  },
  {
    "code": "IDR",
    "name": "Indonesian Rupiah",
    "country": "ID"
  },
  {
    "code": "ILS",
    "name": "Israeli New Sheqel",
    "country": "IL"
  },
  {
    "code": "IMP",
    "name": "Manx pound",
    "country": "IM"
  },
  {
    "code": "INR",
    "name": "Indian Rupee",
    "country": "IN"
  },
  {
    "code": "IQD",
    "name": "Iraqi Dinar",
    "country": "IQ"
  },
  {
    "code": "IRR",
    "name": "Iranian Rial",
    "country": "IR"
  },
  {
    "code": "ISK",
    "name": "Icelandic Króna",
    "country": "IS"
  },
  {
    "code": "JEP",
    "name": "Jersey Pound",
    "country": "JE"
  },
  {
    "code": "JMD",
    "name": "Jamaican Dollar",
    "country": "JM"
  },
  {
    "code": "JOD",
    "name": "Jordanian Dinar",
    "country": "JO"
  },
  {
    "code": "JPY",
    "name": "Japanese Yen",
    "country": "JP"
  },
  {
    "code": "KES",
    "name": "Kenyan Shilling",
    "country": "KE"
  },
  {
    "code": "KGS",
    "name": "Kyrgystani Som",
    "country": "KG"
  },
  {
    "code": "KHR",
    "name": "Cambodian Riel",
    "country": "KH"
  },
  {
    "code": "KID",
    "name": "KID Currency",
    "country": "KI"
  },
  {
    "code": "KMF",
    "name": "Comorian Franc",
    "country": "KM"
  },
  {
    "code": "KRW",
    "name": "South Korean Won",
    "country": "KR"
  },
  {
    "code": "KWD",
    "name": "Kuwaiti Dinar",
    "country": "KW"
  },
  {
    "code": "KYD",
    "name": "Cayman Islands Dollar",
    "country": "KY"
  },
  {
    "code": "KZT",
    "name": "Kazakhstani Tenge",
    "country": "KZ"
  },
  {
    "code": "LAK",
    "name": "Laotian Kip",
    "country": "LA"
  },
  {
    "code": "LBP",
    "name": "Lebanese Pound",
    "country": "LB"
  },
  {
    "code": "LKR",
    "name": "Sri Lankan Rupee",
    "country": "LK"
  },
  {
    "code": "LRD",
    "name": "Liberian Dollar",
    "country": "LR"
  },
  {
    "code": "LSL",
    "name": "Lesotho Loti",
    "country": "LS"
  },
  {
    "code": "LYD",
    "name": "Libyan Dinar",
    "country": "LY"
  },
  {
    "code": "MAD",
    "name": "Moroccan Dirham",
    "country": "MA"
  },
  {
    "code": "MDL",
    "name": "Moldovan Leu",
    "country": "MD"
  },
  {
    "code": "MGA",
    "name": "Malagasy Ariary",
    "country": "MG"
  },
  {
    "code": "MKD",
    "name": "Macedonian Denar",
    "country": "MK"
  },
  {
    "code": "MMK",
    "name": "Myanma Kyat",
    "country": "MM"
  },
  {
    "code": "MNT",
    "name": "Mongolian Tugrik",
    "country": "MN"
  },
  {
    "code": "MOP",
    "name": "Macanese Pataca",
    "country": "MO"
  },
  {
    "code": "MRU",
    "name": "Mauritanian Ouguiya",
    "country": "MR"
  },
  {
    "code": "MUR",
    "name": "Mauritian Rupee",
    "country": "MU"
  },
  {
    "code": "MVR",
    "name": "Maldivian Rufiyaa",
    "country": "MV"
  },
  {
    "code": "MWK",
    "name": "Malawian Kwacha",
    "country": "MW"
  },
  {
    "code": "MXN",
    "name": "Mexican Peso",
    "country": "MX"
  },
  {
    "code": "MYR",
    "name": "Malaysian Ringgit",
    "country": "MY"
  },
  {
    "code": "MZN",
    "name": "Mozambican Metical",
    "country": "MZ"
  },
  {
    "code": "NAD",
    "name": "Namibian Dollar",
    "country": "NA"
  },
  {
    "code": "NGN",
    "name": "Nigerian Naira",
    "country": "NG"
  },
  {
    "code": "NIO",
    "name": "Nicaraguan Córdoba",
    "country": "NI"
  },
  {
    "code": "NOK",
    "name": "Norwegian Krone",
    "country": "NO"
  },
  {
    "code": "NPR",
    "name": "Nepalese Rupee",
    "country": "NP"
  },
  {
    "code": "NZD",
    "name": "New Zealand Dollar",
    "country": "NZ"
  },
  {
    "code": "OMR",
    "name": "Omani Rial",
    "country": "OM"
  },
  {
    "code": "PAB",
    "name": "Panamanian Balboa",
    "country": "PA"
  },
  {
    "code": "PEN",
    "name": "Peruvian Nuevo Sol",
    "country": "PE"
  },
  {
    "code": "PGK",
    "name": "Papua New Guinean Kina",
    "country": "PG"
  },
  {
    "code": "PHP",
    "name": "Philippine Peso",
    "country": "PH"
  },
  {
    "code": "PKR",
    "name": "Pakistani Rupee",
    "country": "PK"
  },
  {
    "code": "PLN",
    "name": "Polish Zloty",
    "country": "PL"
  },
  {
    "code": "PYG",
    "name": "Paraguayan Guarani",
    "country": "PY"
  },
  {
    "code": "QAR",
    "name": "Qatari Rial",
    "country": "QA"
  },
  {
    "code": "RON",
    "name": "Romanian Leu",
    "country": "RO"
  },
  {
    "code": "RSD",
    "name": "Serbian Dinar",
    "country": "RS"
  },
  {
    "code": "RUB",
    "name": "Russian Ruble",
    "country": "RU"
  },
  {
    "code": "RWF",
    "name": "Rwandan Franc",
    "country": "RW"
  },
  {
    "code": "SAR",
    "name": "Saudi Riyal",
    "country": "SA"
  },
  {
    "code": "SBD",
    "name": "Solomon Islands Dollar",
    "country": "SB"
  },
  {
    "code": "SCR",
    "name": "Seychellois Rupee",
    "country": "SC"
  },
  {
    "code": "SDG",
    "name": "Sudanese Pound",
    "country": "SD"
  },
  {
    "code": "SEK",
    "name": "Swedish Krona",
    "country": "SE"
  },
  {
    "code": "SGD",
    "name": "Singapore Dollar",
    "country": "SG"
  },
  {
    "code": "SHP",
    "name": "Saint Helena Pound",
    "country": "SH"
  },
  {
    "code": "SLE",
    "name": "Sierra Leonean Leone",
    "country": "SL"
  },
  {
    "code": "SLL",
    "name": "Sierra Leonean Leone (Old)",
    "country": "SL"
  },
  {
    "code": "SOS",
    "name": "Somali Shilling",
    "country": "SO"
  },
  {
    "code": "SRD",
    "name": "Surinamese Dollar",
    "country": "SR"
  },
  {
    "code": "SSP",
    "name": "South Sudanese Pound",
    "country": "SS"
  },
  {
    "code": "STN",
    "name": "São Tomé and Príncipe Dobra",
    "country": "ST"
  },
  {
    "code": "SYP",
    "name": "Syrian Pound",
    "country": "SY"
  },
  {
    "code": "SZL",
    "name": "Swazi Lilangeni",
    "country": "SZ"
  },
  {
    "code": "THB",
    "name": "Thai Baht",
    "country": "TH"
  },
  {
    "code": "TJS",
    "name": "Tajikistani Somoni",
    "country": "TJ"
  },
  {
    "code": "TMT",
    "name": "Turkmenistani Manat",
    "country": "TM"
  },
  {
    "code": "TND",
    "name": "Tunisian Dinar",
    "country": "TN"
  },
  {
    "code": "TOP",
    "name": "Tongan Pa'anga",
    "country": "TO"
  },
  {
    "code": "TRY",
    "name": "Turkish Lira",
    "country": "TR"
  },
  {
    "code": "TTD",
    "name": "Trinidad and Tobago Dollar",
    "country": "TT"
  },
  {
    "code": "TVD",
    "name": "TVD Currency",
    "country": "TV"
  },
  {
    "code": "TWD",
    "name": "New Taiwan Dollar",
    "country": "TW"
  },
  {
    "code": "TZS",
    "name": "Tanzanian Shilling",
    "country": "TZ"
  },
  {
    "code": "UAH",
    "name": "Ukrainian Hryvnia",
    "country": "UA"
  },
  {
    "code": "UGX",
    "name": "Ugandan Shilling",
    "country": "UG"
  },
  {
    "code": "USD",
    "name": "United States Dollar",
    "country": "US"
  },
  {
    "code": "UYU",
    "name": "Uruguayan Peso",
    "country": "UY"
  },
  {
    "code": "UZS",
    "name": "Uzbekistan Som",
    "country": "UZ"
  },
  {
    "code": "VES",
    "name": "Venezuelan Bolívar Soberano",
    "country": "VE"
  },
  {
    "code": "VND",
    "name": "Vietnamese Dong",
    "country": "VN"
  },
  {
    "code": "VUV",
    "name": "Vanuatu Vatu",
    "country": "VU"
  },
  {
    "code": "WST",
    "name": "Samoan Tala",
    "country": "WS"
  },
  {
    "code": "XAF",
    "name": "CFA Franc BEAC",
    "country": "CM"
  },
  {
    "code": "XCD",
    "name": "East Caribbean Dollar",
    "country": "AG"
  },
  {
    "code": "XCG",
    "name": "Caribbean Guilder",
    "country": "NL"
  },
  {
    "code": "XDR",
    "name": "Special Drawing Rights",
    "country": "EU"
  },
  {
    "code": "XOF",
    "name": "CFA Franc BCEAO",
    "country": "SN"
  },
  {
    "code": "XPF",
    "name": "CFP Franc",
    "country": "PF"
  },
  {
    "code": "YER",
    "name": "Yemeni Rial",
    "country": "YE"
  },
  {
    "code": "ZAR",
    "name": "South African Rand",
    "country": "ZA"
  },
  {
    "code": "ZMW",
    "name": "Zambian Kwacha",
    "country": "ZM"
  },
  {
    "code": "ZWG",
    "name": "Zimbabwean ZiG",
    "country": "ZW"
  },
  {
    "code": "ZWL",
    "name": "Zimbabwean Dollar",
    "country": "ZW"
  }
];

function CurrencySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const selected = CURRENCIES.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearch('');
        }}
        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/80 hover:bg-muted border border-border/40 transition-all text-[11px] font-bold"
      >
        <div className="w-5 h-3.5 overflow-hidden rounded-sm bg-muted/20 flex-shrink-0">
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
        <span>{selected?.code}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 p-1.5 rounded-xl border border-border/50 bg-background shadow-xl min-w-[160px] max-w-[200px] flex flex-col gap-1">
          <div className="px-1 py-0.5">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-7 px-2 rounded-md border border-border/40 bg-muted/20 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              autoFocus
            />
          </div>
          <div className="space-y-0.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1 pl-0.5">
            {filteredCurrencies.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold rounded-lg hover:bg-muted ${
                  value === c.code ? 'text-primary bg-primary/5' : 'text-foreground/70'
                }`}
                title={c.name}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3.5 overflow-hidden rounded-sm bg-muted/10 flex-shrink-0">
                    <img 
                      src={`/flags/${c.country?.toLowerCase()}.svg`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { 
                        if (c.code === 'EUR') e.target.src = '/flags/fr.svg';
                      }}
                    />
                  </div>
                  <span>{c.code}</span>
                </div>
                {value === c.code && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
              <div className="text-center py-2 text-[9px] text-muted-foreground font-semibold">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardRightSidebar({
  plan,
  isTrial = false,
  expiry = null,
  trades = [],
  journals = [],
  walletBalance = 0,
  setShowPricingModal,
  toast,
  openPortal,
  resetTrades,
  updateBalance
}) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [isWipingDb, setIsWipingDb] = useState(false);

  const handleWipeTerminal = async () => {
    setIsWipingDb(true);
    try {
      await resetTrades();
      await updateBalance(0);
      setIsWiping(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast("Terminal wiped. Setup new balance.", "warn");
    } catch (e) {
      toast("Failed to reset terminal: " + e.message, "error");
    } finally {
      setIsWipingDb(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isWiping) {
      timer = setTimeout(() => setIsWiping(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [isWiping]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');
      setCurrentTime(`${hoursStr}:${minutes}:${seconds} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchRate = useCallback(async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (from === to) {
      setResult(val);
      return;
    }
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CURRENCY_API_KEY;
      let res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
      let data;
      if (res.ok) {
        data = await res.json();
      }
      if (!res.ok || data?.result !== 'success') {
        res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        data = await res.json();
      }
      const rates = data.conversion_rates || data.rates;
      const currentRate = rates[to];
      if (currentRate) {
        setResult(val * currentRate);
      }
    } catch (error) {
      console.error('Right Sidebar Conversion Error:', error);
      setResult(val * 1.0);
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Calculate stats
  const totalBalance = walletBalance + trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winTrades = trades.filter(t => t.outcome === 'WIN');
  const winRate = trades.length ? ((winTrades.length / trades.length) * 100).toFixed(0) : 0;
  const totalTradesCount = trades.length;
  const totalJournalsCount = Object.keys(journals).length;

  // Build contextual notifications from real data
  const notifications = [];
  if (totalTradesCount === 0) {
    notifications.push({ id: 'no-trades', emoji: '📋', title: 'Log your first trade', body: 'Head to the Log tab and record your first XAUUSD trade to start tracking your performance.' });
  }
  if (totalTradesCount > 0 && Number(winRate) < 40) {
    notifications.push({ id: 'low-wr', emoji: '⚠️', title: 'Win rate below 40%', body: `Your current win rate is ${winRate}%. Review your losing trades in History to identify patterns.` });
  }
  if (totalTradesCount >= 5 && totalJournalsCount === 0) {
    notifications.push({ id: 'no-journal', emoji: '📝', title: 'Start journaling', body: 'You have trades logged but no journal entries. Journaling helps you reflect and improve faster.' });
  }
  if (totalTradesCount > 0 && Number(winRate) >= 60) {
    notifications.push({ id: 'good-wr', emoji: '🏆', title: `Strong win rate: ${winRate}%`, body: 'Great consistency! Keep analysing your best trades so you can replicate your edge.' });
  }
  if (plan !== 'pro') {
    notifications.push({ id: 'upgrade', emoji: '⚡', title: 'Unlock Pro features', body: 'Auto-sync your MT5 trades, access advanced analytics, and get priority support with Pro.' });
  }

  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('xau-notif-read') || '[]'); } catch { return []; }
  });
  const notifRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('xau-notif-read', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    const updated = [...new Set([...readIds, ...ids])];
    setReadIds(updated);
    localStorage.setItem('xau-notif-read', JSON.stringify(updated));
  };

  const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Trader';
  
  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(displayName);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER SECTION */}
      <div className="hidden lg:flex items-center justify-between bg-card p-3 rounded-2xl border border-border/30 shadow-flat">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border/40 hover:bg-muted text-muted-foreground/70 hover:text-foreground transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !readIds.includes(n.id)) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Notifications</span>
                <div className="flex items-center gap-2">
                  {notifications.some(n => !readIds.includes(n.id)) && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-border/10">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[11px] text-muted-foreground font-medium">
                    You're all caught up 🎉
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-default ${
                        readIds.includes(n.id) ? 'opacity-50' : 'bg-muted/10 hover:bg-muted/20'
                      }`}
                      onClick={() => markRead(n.id)}
                    >
                      <span className="text-lg leading-none mt-0.5">{n.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground leading-snug">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      </div>
                      {!readIds.includes(n.id) && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-xs font-bold text-foreground capitalize">{displayName}</p>
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{currentTime}</p>
          </div>
          <button
            type="button"
            onClick={openPortal || (() => setShowPricingModal?.(true))}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Manage Subscription / Billing"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* TOTAL BALANCE CARD */}
      <div className="bg-card p-6 rounded-3xl border border-border/30 shadow-flat relative overflow-hidden flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total balance</span>
          <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            winRate >= 50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {winRate >= 50 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {winRate}% WR
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          {formatCurrency(totalBalance)}
        </h2>
        <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, winRate))}%` }}
          />
        </div>
      </div>

      {/* MY ITEMS TRACKER */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">My items</p>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Logged Trades */}
          <div 
            onClick={() => navigate('/app/history')}
            className="bg-card p-4 rounded-2xl border border-border/30 shadow-flat flex items-center gap-3 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-pastel-blue flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Trades</p>
              <p className="text-sm font-black text-foreground">{totalTradesCount}</p>
            </div>
          </div>

          {/* Card 2: Journal Entries */}
          <div 
            onClick={() => navigate('/app/journal')}
            className="bg-card p-4 rounded-2xl border border-border/30 shadow-flat flex items-center gap-3 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-pastel-pink flex items-center justify-center shrink-0">
              <Book className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Journals</p>
              <p className="text-sm font-black text-foreground">{totalJournalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESTYLED CONVERT WIDGET */}
      <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-flat flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Convert</p>
        
        <div className="flex flex-col gap-2">
          {/* Input field */}
          <div className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 border border-border/20 rounded-xl px-3 py-2.5 transition-colors">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                  setAmount(val.replace(',', '.'));
                }
              }}
              className="bg-transparent border-0 text-xs font-bold text-foreground focus:outline-none focus:ring-0 p-0 w-24"
              placeholder="0.00"
            />
            <CurrencySelect value={from} onChange={setFrom} />
          </div>

          {/* Output field */}
          <div className="flex items-center justify-between bg-muted/30 border border-border/20 rounded-xl px-3 py-2.5">
            <span className="text-xs font-bold text-foreground/70">
              {loading ? '...' : result !== null ? formatNumber(result, 2) : '0.00'}
            </span>
            <CurrencySelect value={to} onChange={setTo} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase tracking-wider px-1">
          <span>Rate: 1 {from} ≈ {result !== null && amount > 0 ? (result / parseFloat(amount)).toFixed(4) : '0.0000'} {to}</span>
          <button 
            type="button" 
            onClick={fetchRate}
            className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Refresh
          </button>
        </div>

        <button
          type="button"
          onClick={fetchRate}
          disabled={loading}
          className="btn-convert-animated"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg>
          <span className="circle" />
          <span className="text">Convert</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg>
        </button>
      </div>

      {/* UPGRADE PLAN CARD */}
      <div className="bg-[#121214] text-white p-5 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-4 group">
        {/* Decorative Grid Glow background */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-primary">
              <Gem className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {plan === 'pro' && isTrial ? '7-Day Free Trial' : 'Upgrade Plan'}
            </span>
          </div>
          <h3 className="text-base font-black tracking-tight mt-1 leading-snug text-white">
            {plan === 'pro' 
              ? (isTrial ? 'Pro Trial Active' : 'Pro Trading Console Active') 
              : 'Unlock Pro sync with MetaAPI'}
          </h3>
          <p className="text-[10px] text-white/50 leading-relaxed font-bold">
            {plan === 'pro' 
              ? (isTrial 
                  ? `You are upgraded to Pro tier! Your 7-day free trial is currently active. ${(() => {
                      if (!expiry) return '7';
                      const diffTime = new Date(expiry) - new Date();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return Math.max(0, diffDays);
                    })()} days remaining.`
                  : 'Enjoy unlimited sync logs, automated MT5 metrics, and priority analytics.') 
              : 'Ver 1.0.4 · Connect MT5/MT4, enjoy unlimited logs, and premium reports.'}
          </p>
        </div>

        {plan === 'pro' && !isTrial ? null : (
          <div className="relative group w-full z-10">
            <button
              type="button"
              onClick={() => setShowPricingModal?.(true)}
              className="relative inline-flex w-full p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-[1.02] active:scale-95"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center justify-center w-full px-4 py-2 rounded-xl bg-gray-950">
                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest transition-all duration-500 group-hover:translate-x-1">
                    {isTrial ? 'View Plan Details' : "Let's Go"}
                  </span>
                  <ArrowRight className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </span>
            </button>
          </div>
        )}
      </div>
      {/* PRO RESET OPTION (Mobile View Only) */}
      {(plan === 'pro' || import.meta.env.DEV) && (
        <div className="pt-6 pb-2 flex md:hidden flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
          {isWiping && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 max-w-sm flex gap-3 text-left animate-in slide-in-from-bottom-2 duration-300">
              <AlertTriangle className="w-4.5 h-4.5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Danger Zone</p>
                <p className="text-[10px] text-destructive/80 leading-relaxed font-bold">
                  This will permanently delete all trades and reset your balance. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => isWiping ? handleWipeTerminal() : setIsWiping(true)}
            disabled={isWipingDb}
            className={`reset-trash-btn ${isWipingDb ? 'opacity-70 cursor-not-allowed' : ''}`}
            title="Reset Terminal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="svgIcon bin-top">
              <g clipPath="url(#clip0_35_24)">
                <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_24">
                  <rect fill="white" height={14} width={69} />
                </clipPath>
              </defs>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="svgIcon bin-bottom">
              <g clipPath="url(#clip0_35_22)">
                <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z" />
              </g>
              <defs>
                <clipPath id="clip0_35_22">
                  <rect fill="white" height={57} width={69} />
                </clipPath>
              </defs>
            </svg>
            <span className="button-text">{isWipingDb ? 'Wiping...' : isWiping ? 'Confirm?' : 'Reset'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

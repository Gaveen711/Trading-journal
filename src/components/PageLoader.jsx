export function PageLoader({ text = 'Syncing Terminal' }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[#007CFF]/10 blur-3xl rounded-full" />
        <div className="loader-wrapper relative z-10 animate-in fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="380" height="76" className="inline-block select-none max-w-full">
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={600} y1={0} x1={0} id="loader-grad">
                <stop stopColor="#973BED" offset="0%" />
                <stop stopColor="#007CFF" offset="33%" />
                <stop stopColor="#00E0ED" offset="66%" />
                <stop stopColor="#00DA72" offset="100%" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="55%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily="'Poppins', 'Montserrat', -apple-system, sans-serif"
              fontWeight="900"
              fontSize="54"
              letterSpacing="8"
              stroke="url(#loader-grad)"
              strokeWidth="3.5"
              fill="none"
              className="dash-text"
              pathLength="360"
            >
              XAU JOURNAL
            </text>
          </svg>
        </div>
      </div>
      {text && text !== 'Syncing Terminal' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{text}</p>
        </div>
      )}
    </div>
  );
}

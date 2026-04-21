import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Stars, LightningFill, BarChartLineFill, LayersFill } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';

export function LandingPage() {
  const navigate = useNavigate();
  const { isLightMode } = useAppTheme();
  
  // Parallax / Scroll animations effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-8');
          entry.target.style.opacity = 1;
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      el.style.opacity = 0;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/20 flex flex-col">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[100px] animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 glass border border-white/10 rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ease-[var(--apple-ease)] shadow-2xl backdrop-blur-3xl bg-background/40">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-[10px] group-hover:rotate-12 transition-transform duration-500">My</div>
          <span className="font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Journal</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-foreground/60">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <NavLink to="/privacy" className="hover:text-foreground transition-colors">Privacy</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <NavLink to="/login" className="text-[11px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </NavLink>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-col items-center justify-center pt-40 pb-20 px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto space-y-8 reveal-on-scroll duration-1000">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Stars className="w-3 h-3" />
            Designed exclusively for XAUUSD
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.1] text-foreground">
            The Ultimate Intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">For Gold Traders.</span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
            Automated MT5 syncing, real-time advanced analytics, and elite performance tracking flawlessly forged into one extremely aesthetic platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
            >
              Start Your Journey
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-foreground/60 border border-border/50 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-muted hover:text-foreground transition-all text-center glass"
            >
              View Features
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-24 max-w-6xl mx-auto relative reveal-on-scroll duration-1000 delay-200">
          {/* Aesthetic glow behind the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent blur-[100px] -z-10" />
          
          <div className="relative rounded-[2rem] border border-white/10 bg-background/50 p-2 sm:p-4 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* We use a glassy grid as a placeholder if no image exists, but ideally we'd show a screenshot here */}
            <div className="aspect-video w-full rounded-[1.5rem] bg-muted/30 border border-white/5 flex items-center justify-center relative overflow-hidden">
               {/* Decorative App UI Mockup Elements */}
               <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-background/40 backdrop-blur-md">
                 <div className="w-3 h-3 rounded-full bg-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/50" />
               </div>
               <div className="flex w-full h-full pt-12">
                 <div className="w-48 border-r border-white/5 hidden md:block p-4 space-y-4">
                   <div className="w-full h-8 rounded bg-white/5" />
                   <div className="w-3/4 h-8 rounded bg-white/5" />
                   <div className="w-5/6 h-8 rounded bg-white/5" />
                 </div>
                 <div className="flex-1 p-8 flex flex-col gap-8">
                   <div className="flex gap-4">
                     <div className="w-1/3 h-24 rounded-2xl bg-white/5" />
                     <div className="w-1/3 h-24 rounded-2xl bg-white/5" />
                     <div className="w-1/3 h-24 rounded-2xl bg-white/5" />
                   </div>
                   <div className="flex-1 rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent border border-white/5" />
                 </div>
               </div>
            </div>
            
            {/* Absolute overlay elements floating */}
            <div className="absolute -left-6 top-1/3 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -right-6 bottom-1/3 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
        </div>
      </main>

      {/* Features Bento Box */}
      <section id="features" className="relative z-10 py-32 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground mb-4">Precision Engineering</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium tracking-wide">Everything you need to master your psychology and analyze your edge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Large Card */}
          <div className="md:col-span-2 rounded-[2rem] bg-muted/20 border border-border/50 p-8 flex flex-col justify-between relative overflow-hidden group reveal-on-scroll glass">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
            <div className="relative z-10 space-y-4 mt-12 md:mt-24">
              <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-lg">
                <LightningFill className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Zero Input. Absolute Sync.</h3>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">Connect your MT5 account once. Our EA handles real-time synchronization of all positions natively.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-muted/20 border border-border/50 p-8 flex flex-col justify-end relative overflow-hidden group reveal-on-scroll glass delay-100">
            <div className="relative z-10 space-y-4 mt-24">
              <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-lg">
                <BarChartLineFill className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Deep Analytics</h3>
              <p className="text-sm text-muted-foreground font-medium">Session heatmaps, drawdowns, and setup scoring.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-muted/20 border border-border/50 p-8 flex flex-col justify-end relative overflow-hidden group reveal-on-scroll glass delay-200">
            <div className="relative z-10 space-y-4 mt-24">
              <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-lg">
                <LayersFill className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Aura Themes</h3>
              <p className="text-sm text-muted-foreground font-medium">Dynamic aesthetics that match your exact trading mood.</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-primary/5 to-purple-500/5 border border-border/50 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden reveal-on-scroll glass delay-300">
             <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Automate Your Growth</h3>
             <p className="text-sm text-muted-foreground mb-6">Stop manual data entry. Start trading.</p>
             <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Create Account</button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-border/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-black text-[8px]">My</div>
            <span className="font-bold text-sm tracking-tight text-foreground/60">Journal</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
            © {new Date().getFullYear()} XAU Journal. Curated by Gaveen Perera.
          </p>
        </div>
      </footer>
    </div>
  );
}

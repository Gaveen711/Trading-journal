import { ShieldCheck, ArrowRight, XLg } from 'react-bootstrap-icons';

export function ProTermsModal({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl animate-in fade-in duration-500" />
      
      {/* Modal content */}
      <div className="relative w-full max-w-xl card-premium p-8 sm:p-12 space-y-8 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 shadow-[0_0_100px_rgba(139,92,246,0.15)]">
        
        {/* Close */}
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground/40 hover:text-foreground transition-all active:scale-75">
          <XLg className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-700" />
            <ShieldCheck className="w-8 h-8 text-primary relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gradient uppercase tracking-tight">Institutional Agreement</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-relaxed">
              Required for Pro Terminal Access
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-[11px] space-y-5 text-left leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <p className="font-black text-foreground uppercase tracking-widest text-[10px]">§ 1. Professional Risk Disclosure</p>
              <p className="text-muted-foreground font-medium">
                Trading XAU/USD (Gold) involves significant risk of loss. xaujournal is an analytics and journaling tool only. We do not provide financial advice, and you are solely responsible for your trading decisions and capital. 
              </p>
            </div>

            <div className="space-y-2 border-t border-border/20 pt-4">
              <p className="font-black text-foreground uppercase tracking-widest text-[10px]">§ 2. Data & Sync Protocol</p>
              <p className="text-muted-foreground font-medium">
                Automated MT5 synchronization depends on your local hardware and internet stability. We do not guarantee 100% uptime of third-party broker connections or API data feeds.
              </p>
            </div>

            <div className="space-y-2 border-t border-border/20 pt-4">
              <p className="font-black text-foreground uppercase tracking-widest text-[10px]">§ 3. Subscription & Refund Policy</p>
              <p className="text-muted-foreground font-medium">
                You agree that all payments for the Pro version are non-refundable. Once digital access to Pro features (unlimited trades, analytics, EA sync) is granted, the service is considered fully rendered. No refunds will be issued for partial months or unused periods.
              </p>
            </div>

            <div className="space-y-2 border-t border-border/20 pt-4">
              <p className="font-black text-foreground uppercase tracking-widest text-[10px]">§ 4. Agreement Signature</p>
              <p className="text-muted-foreground font-medium">
                By clicking the confirmation button below, you are providing a digital signature acknowledging that you have read, understood, and agreed to these terms in full.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onAccept}
            className="w-full btn-primary h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-black uppercase tracking-widest group shadow-2xl active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              I Accept Terms & Proceed to Payment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <p className="text-[9px] text-center text-muted-foreground/50 uppercase tracking-widest font-bold">
            Secure Legal Node | Version 1.0.4 | XAU v1.0
          </p>
        </div>

      </div>
    </div>
  );
}

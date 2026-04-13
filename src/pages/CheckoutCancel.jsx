import { XLg, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export function CheckoutCancel() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card-premium max-w-md w-full p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 border-border/20">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-muted flex items-center justify-center shadow-inner">
            <XLg className="w-12 h-12 text-muted-foreground/40" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground/80 uppercase tracking-tight">Checkout Canceled</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No charges were made. You can attempt the upgrade again whenever you're ready to unlock Pro features.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full h-14 rounded-2xl bg-muted/50 border border-border/40 text-[11px] font-black uppercase tracking-[0.2em] shadow-inner flex items-center justify-center gap-2 hover:bg-muted transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );
}

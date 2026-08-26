import { CheckCircleFill, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function CheckoutSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card-premium max-w-md w-full p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl shadow-primary/20 border-primary/20">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center shadow-inner animate-in zoom-in-50 duration-700 delay-150">
            <CheckCircleFill className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
            Upgrade Successful
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you! Your payment was successful and your account is upgraded.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="group w-full rounded-2xl"
            onClick={() => navigate('/')}
          >
            Return to Terminal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

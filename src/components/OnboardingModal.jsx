import { useState, useRef } from 'react';
import { AppDialog } from './app/AppDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function OnboardingModal({ onClose, onComplete }) {
  const [val, setVal] = useState('');
  const inputRef = useRef(null);

  const complete = () => {
    onComplete(parseFloat(val) || 0);
  };

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Welcome to XAU Journal"
      description="Set a baseline for your equity curve calculation."
      size="md"
      initialFocus={inputRef}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Skip setup
          </Button>
          <Button onClick={complete}>Start journaling</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboard-wallet" className="text-xs font-medium text-muted-foreground">
            Starting portfolio balance
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-[11px] text-muted-foreground">
              $
            </span>
            <Input
              ref={inputRef}
              id="onboard-wallet"
              type="text"
              inputMode="decimal"
              value={val}
              onChange={e => {
                const v = e.target.value;
                if (v === '' || /^[0-9]*[.,]?[0-9]*$/.test(v)) {
                  setVal(v.replace(',', '.'));
                }
              }}
              placeholder="0.00"
              className="figure pl-7"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">You can change this anytime in settings.</p>
      </div>
    </AppDialog>
  );
}

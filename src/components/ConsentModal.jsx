import { useNavigate } from 'react-router-dom';
import { AppDialog } from './app/AppDialog';
import { Button } from './ui/button';

export function ConsentModal({ onAgree }) {
  const navigate = useNavigate();

  return (
    <AppDialog
      open
      onOpenChange={() => {}}
      title="Consent required"
      description="By using xaujournal, you acknowledge our privacy policy and terms."
      size="md"
      dismissible={false}
      showCloseButton={false}
      footer={
        <Button className="w-full" onClick={onAgree}>
          I agree &amp; continue
        </Button>
      }
    >
      <div className="flex flex-col gap-3 rounded-md bg-muted p-3">
        <p className="text-xs font-medium text-foreground">The agreement</p>
        <ul className="flex list-disc flex-col gap-2 pl-4 text-xs leading-relaxed text-muted-foreground">
          <li>
            You agree to our{' '}
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="text-primary underline-offset-2 hover:underline"
            >
              privacy policy
            </button>
            .
          </li>
          <li>You consent to secure, isolated cloud synchronization.</li>
          <li>You accept the terms and conditions of xaujournal.</li>
        </ul>
      </div>
    </AppDialog>
  );
}

import { Wrench } from 'lucide-react';
import './MaintenanceNotice.css';

export function MaintenanceNotice() {
  return (
    <main className="maintenance-notice" aria-labelledby="maintenance-title">
      <section className="maintenance-notice__card">
        <span className="maintenance-notice__icon" aria-hidden="true"><Wrench /></span>
        <p className="maintenance-notice__eyebrow">XAU Journal status</p>
        <h1 id="maintenance-title">We’re performing scheduled maintenance.</h1>
        <p>Trading journals are temporarily unavailable while we make an operational update. Please try again shortly.</p>
        <p className="maintenance-notice__support">Need help now? Contact <a href="mailto:support@xaujournal.com">support@xaujournal.com</a>.</p>
      </section>
    </main>
  );
}

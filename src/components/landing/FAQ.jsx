import { SectionHead, TextLink } from '../PublicSite';
import { LANDING_FAQ } from '../../lib/seo';
import './FAQ.css';

/* ————————————————————————————————————————————————————————————————
   FAQ — the questions are LANDING_FAQ from src/lib/seo.js, the same
   list LandingPage injects as FAQPage JSON-LD, so what a crawler reads
   and what a visitor reads are one list. Rendered with the shared
   .xj-faq <details> furniture; nothing new is invented here.
   ———————————————————————————————————————————————————————————————— */

export function FAQ() {
  return (
    <section className='xj-section xf' aria-labelledby='faq-heading'>
      <div className='xj-shell'>
        <div className='xj-faq xj-reveal'>
          <div className='xf-head'>
            <SectionHead
              id='faq-heading'
              eyebrow='Questions'
              title={<>Asked before the <em>first</em> login.</>}
              lede='Short answers. The rate card has the longer ones on billing, refunds and cancelling.'
            />
            <p className='xf-more'>
              <TextLink to='/pricing'>Billing questions, on the rate card</TextLink>
            </p>
          </div>

          <div className='xj-faq-list'>
            {LANDING_FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span aria-hidden='true'>+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

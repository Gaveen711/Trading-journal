import './Proof.css';

const STEPS = [
  { kicker: 'Capture', title: 'Log the trade', body: 'Connect your broker or enter a closed XAUUSD trade manually. The fill, risk and result land in one private record.' },
  { kicker: 'Context', title: 'Record what mattered', body: 'Add the setup, session, screenshot and notes while the decision is still fresh—not reconstructed days later.' },
  { kicker: 'Pattern', title: 'See the signal', body: 'Compare sessions, setups and execution quality. The journal turns repeated behaviour into evidence you can inspect.' },
  { kicker: 'Improve', title: 'Take one rule forward', body: 'Review what paid, what broke the plan and carry one concrete adjustment into the next trading session.' },
];

function Pin() {
  return <svg viewBox='0 0 32 32' aria-hidden='true'><path d='M12.2 4.5h7.6l-.9 8.2 3.6 3.1v2.1h-5.2V27l-1.3 1.6-1.3-1.6v-9.1H9.5v-2.1l3.6-3.1-.9-8.2Z' /></svg>;
}

export function Proof() {
  return (
    <section className='xj-section xp' aria-labelledby='how-it-works-heading'>
      <div className='xj-shell'>
        <header className='xp-intro xj-reveal'>
          <p className='xj-eyebrow'>How it works</p>
          <h2 id='how-it-works-heading' className='xj-h2'>From raw fill to a better next decision.</h2>
          <p>xaujournal keeps the loop simple: capture the trade, add the context, read the pattern, then return to the market with one sharper rule.</p>
        </header>
        <ol className='xp-steps xj-reveal' aria-label='How xaujournal works'>
          <svg className='xp-route' viewBox='0 0 1000 690' preserveAspectRatio='none' aria-hidden='true'>
            <path d='M230 104 C500 56 525 184 757 202 S815 387 590 392 S263 405 245 558 S468 636 760 586' />
          </svg>
          {STEPS.map((step, index) => (
            <li className={`xp-step xp-step--${index + 1}`} key={step.title}>
              <article className='xp-step-card'>
                <span className='xp-pin'><Pin /></span>
                <div className='xp-step-topline'>
                  <span className='xp-step-number'>{String(index + 1).padStart(2, '0')}</span>
                  <span className='xj-label'>{step.kicker}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

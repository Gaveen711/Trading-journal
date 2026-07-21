import { Link } from 'react-router-dom';
import { ArrowRight, Check, Code2, NotebookPen, PlugZap } from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import './PublicEditorial.css';

const STORY_CHAPTERS = [
  {
    number: '01',
    label: 'The result looked fine',
    title: 'A winning trade exposed a bad habit.',
    body: 'The XAUUSD position closed at +1.18R. On paper it was a good trade. In the replay, the entry was early and the confirmation never arrived. Profit had hidden the part worth learning from.',
  },
  {
    number: '02',
    label: 'The evidence was scattered',
    title: 'Broker history knew the outcome, not the decision.',
    body: 'The fill sat in MT5. The screenshot sat in a folder. The reason was a line in a note. Rebuilding one trade took long enough that honest review became easy to postpone.',
  },
  {
    number: '03',
    label: 'The same mistake returned',
    title: 'Memory is a poor trading database.',
    body: 'A week later the same early entry appeared in another profitable trade. The pattern was not new. It was simply invisible because the previous lesson had nowhere durable to live.',
  },
  {
    number: '04',
    label: 'The first useful build',
    title: 'I built the review screen I needed after the close.',
    body: 'One place for the fill, chart, setup, emotion and rule for tomorrow. Automatic capture removes the copying. The trader still does the thinking. That small nightly tool became XAU Journal.',
  },
];

const REVIEW_JOBS = [
  ['Capture', 'Save the trade before memory edits it.'],
  ['Context', 'Keep the reason beside the result.'],
  ['Compare', 'Find the process that repeats across sessions.'],
  ['Carry', 'Take one clear rule into the next trade.'],
];

function TradeCase() {
  return (
    <div className='xep-case-artifact' aria-label='The first trade review case'>
      <div className='xep-ticket-row'>
        <div><span>Market</span><strong>XAU / USD</strong></div>
        <div><span>Session</span><strong>London</strong></div>
        <div><span>Result</span><strong>+1.18R</strong></div>
        <div><span>Process</span><strong>Review</strong></div>
      </div>
      <div className='xep-ticket-note'>
        <span>What the result did not say</span>
        <strong>Entry taken before the five-minute confirmation candle closed.</strong>
      </div>
    </div>
  );
}

export default function TheStoryPage() {
  return (
    <div data-ux-skip='true'>
      <PublicNavbar />

      <main className='xep-page' data-ux-skip='true'>
        <section className='xep-story-hero' aria-labelledby='story-heading'>
          <div className='xep-shell xep-story-hero-grid'>
            <div>
              <p className='xep-kicker'><span>00</span> Founder’s case file / XAUUSD</p>
              <h1 id='story-heading' className='xep-title'>The trade won.<br /><em>The process didn’t.</em></h1>
              <p className='xep-lede'>XAU Journal began with one uncomfortable review: a profitable trade that should not have been taken. I needed a place where the result and the truth could sit together.</p>
              <div className='xep-actions'>
                <Link className='xep-button xep-button--primary' to='/login?mode=signup'>Start your first review <ArrowRight aria-hidden='true' /></Link>
                <Link className='xep-button xep-button--quiet' to='/pricing'>Read the rate sheet</Link>
              </div>
            </div>

            <div className='xep-story-visual'>
              <img
                className='xep-story-photo'
                src='/founder-trader-session.webp'
                width='960'
                height='1200'
                alt='The XAU Journal founder reviewing a gold trading session at his desk'
              />
              <div className='xep-photo-note'>
                <span>Desk note / 22:47</span>
                <strong>“The P&amp;L says green. The replay says I was early.”</strong>
              </div>
            </div>
          </div>
        </section>

        <div className='xep-shell xep-casebar' aria-label='Case file details'>
          <span>Case 001</span>
          <span>One review → one company</span>
          <span>Developer / trader</span>
        </div>

        <section className='xep-section xep-section--sheet' aria-labelledby='origin-heading'>
          <div className='xep-shell xep-origin-grid'>
            <div className='xep-origin-copy'>
              <p className='xep-kicker'><span>01</span> What happened</p>
              <h2 id='origin-heading' className='xep-heading'>A journal built from <em>the review backward.</em></h2>
              <p>I did not start with a feature list. I started with the exact questions I ask after London closes: What happened? Why did I enter? Did I follow the plan? What must change tomorrow?</p>
            </div>

            <div className='xep-case-list'>
              {STORY_CHAPTERS.map((chapter, index) => (
                <article className='xep-case-chapter' key={chapter.number}>
                  <span>{chapter.number}</span>
                  <div>
                    <p className='xep-rule-label'>{chapter.label}</p>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.body}</p>
                    {index === 0 ? <TradeCase /> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='xep-section' aria-labelledby='review-loop-heading'>
          <div className='xep-shell'>
            <p className='xep-kicker'><span>02</span> The product principle</p>
            <h2 id='review-loop-heading' className='xep-heading'>Less admin.<br /><em>More honest review.</em></h2>
            <div className='xep-support-list'>
              {REVIEW_JOBS.map(([title, detail], index) => {
                const icons = [NotebookPen, Check, Code2, PlugZap];
                const Icon = icons[index];
                return (
                  <div className='xep-support-row' key={title}>
                    <span>0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                    <Icon aria-hidden='true' />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className='xep-section xep-section--night' aria-labelledby='beliefs-heading'>
          <div className='xep-shell xep-beliefs'>
            <div>
              <p className='xep-kicker'><span>03</span> What the company protects</p>
              <h2 id='beliefs-heading' className='xep-heading'>The truth of the trade.</h2>
            </div>
            <div className='xep-belief-list'>
              <p>Not a scoreboard. <strong>Process beside outcome.</strong></p>
              <p>Not a broker replacement. <strong>A place to understand what the broker records.</strong></p>
              <p>Not automation for its own sake. <strong>Capture faster, think longer.</strong></p>
              <p>Not built by spectators. <strong>Built by a developer who reviews his own gold trades.</strong></p>
            </div>
          </div>
        </section>

        <section className='xep-section xep-section--sheet' aria-labelledby='story-close-heading'>
          <div className='xep-shell'>
            <p className='xep-kicker'><span>04</span> Your next session</p>
            <h2 id='story-close-heading' className='xep-heading'>Every trade leaves a result.<br /><em>Make it leave a lesson.</em></h2>
            <div className='xep-actions'>
              <Link className='xep-button xep-button--primary' to='/login?mode=signup'>Open the journal <ArrowRight aria-hidden='true' /></Link>
              <Link className='xep-button xep-button--quiet' to='/contact'>Ask a question</Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
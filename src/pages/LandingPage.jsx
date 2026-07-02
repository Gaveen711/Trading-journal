import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, ArrowRight, BarChart3, CheckCircle2, LineChart, NotebookPen, PlugZap, ShieldCheck } from 'lucide-react';

import Logo from '../components/Logo';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAppTheme } from '../hooks/useAppTheme';
import { LANDING_FAQ, buildFAQSchema, buildOrganizationSchema, buildSoftwareSchema, buildWebSiteSchema, injectJsonLd, removeJsonLd } from '../lib/seo';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const STYLES = `
.xau-page{min-height:100vh;position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(125deg,color-mix(in srgb,var(--xau-accent) 11%,transparent),transparent 28%),linear-gradient(235deg,color-mix(in srgb,var(--xau-warm) 10%,transparent),transparent 30%),linear-gradient(180deg,var(--xau-bg) 0%,var(--xau-bg-2) 52%,var(--xau-bg) 100%);color:var(--xau-ink);font-family:'Poppins','Inter',system-ui,sans-serif}
.xau-page:before{content:'';position:fixed;inset:0;z-index:-2;pointer-events:none;background-image:linear-gradient(var(--xau-grid) 1px,transparent 1px),linear-gradient(90deg,var(--xau-grid) 1px,transparent 1px);background-size:88px 88px;mask-image:linear-gradient(to bottom,black 0%,transparent 86%)}
.xau-page:after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--xau-surface-solid) 24%,transparent),transparent),linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--xau-bg) 72%,transparent) 72%,var(--xau-bg) 100%)}
.xau-shell{width:min(1160px,calc(100% - 32px));margin:0 auto}.xau-section{position:relative;z-index:1;padding:104px 0}.xau-hero{position:relative;z-index:1;padding:138px 0 72px}.xau-eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--xau-muted-strong);font-size:12px;font-weight:800;line-height:1.2;letter-spacing:0;text-transform:uppercase}.xau-eyebrow:before{content:'';width:34px;height:1px;background:linear-gradient(90deg,var(--xau-accent),var(--xau-warm))}
.xau-gradient{display:inline-block;background:linear-gradient(90deg,var(--xau-accent) 0%,var(--xau-warm) 48%,var(--xau-coral) 100%);background-size:180% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:xauGradient 8s linear infinite}@keyframes xauGradient{0%{background-position:0% 50%}100%{background-position:180% 50%}}
.xau-panel{border:1px solid var(--xau-border-strong);border-radius:8px;background:color-mix(in srgb,var(--xau-surface) 82%,transparent);box-shadow:var(--xau-shadow)}.xau-soft{border:1px solid var(--xau-border);border-radius:8px;background:color-mix(in srgb,var(--xau-surface) 72%,transparent)}
.xau-button{min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:8px;padding:0 18px;font-size:14px;font-weight:850;text-decoration:none;transition:transform .22s ease,border-color .22s ease,background .22s ease,color .22s ease}.xau-button:hover{transform:translateY(-2px)}.xau-button:focus-visible,.xau-tab:focus-visible{outline:2px solid var(--xau-accent);outline-offset:4px}.xau-primary{border:1px solid transparent;background:var(--xau-button-bg);color:var(--xau-button-ink);box-shadow:0 18px 45px color-mix(in srgb,var(--xau-accent) 18%,transparent)}.xau-secondary{border:1px solid var(--xau-border-strong);background:color-mix(in srgb,var(--xau-surface) 78%,transparent);color:var(--xau-ink)}
.xau-title{color:var(--xau-ink);letter-spacing:0!important;text-wrap:balance}.xau-copy{color:var(--xau-muted);font-size:16px;line-height:1.75;font-weight:560}.xau-hero-copy{max-width:900px;margin:0 auto;text-align:center}.xau-proof{max-width:920px;margin:32px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border)}.xau-proof div{padding:16px 18px;border-right:1px solid var(--xau-border);text-align:left}.xau-proof div:first-child{padding-left:0}.xau-proof div:last-child{border-right:0;padding-right:0}.xau-proof span,.xau-label{display:block;color:var(--xau-muted);font-size:12px;font-weight:780;line-height:1.4;text-transform:uppercase}.xau-proof strong{display:block;margin-top:7px;color:var(--xau-ink);font-size:18px;line-height:1.25}
.xau-product{max-width:1040px;margin:44px auto 0;overflow:hidden}.xau-screenbar{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px;border-bottom:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-surface) 80%,transparent)}.xau-dots{display:flex;gap:7px}.xau-dots span{width:9px;height:9px;border-radius:999px;background:var(--xau-border-strong)}.xau-sources{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:8px;color:var(--xau-muted);font-size:12px;font-weight:750}.xau-source{display:inline-flex;align-items:center;gap:8px;min-height:34px;border-radius:8px;border:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 58%,transparent);color:var(--xau-ink);padding:0 10px}.xau-source img{width:18px;height:18px;display:block}
.xau-preview{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:520px}.xau-side{border-right:1px solid var(--xau-border);padding:18px;background:color-mix(in srgb,var(--xau-bg) 45%,transparent)}.xau-tabs{display:grid;gap:8px;margin-top:18px}.xau-tab{width:100%;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--xau-muted);padding:0 12px;font:inherit;font-size:13px;font-weight:820;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease}.xau-tab.active{border-color:var(--xau-border-strong);background:color-mix(in srgb,var(--xau-accent) 13%,transparent);color:var(--xau-ink)}.xau-side p{margin-top:24px;padding-top:18px;border-top:1px solid var(--xau-border);color:var(--xau-muted);font-size:13px;line-height:1.65}.xau-main{padding:22px}.xau-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.xau-head h2{margin-top:7px;color:var(--xau-ink);font-size:26px!important;line-height:1.1!important;font-weight:900!important;letter-spacing:0!important}.xau-status{display:inline-flex;align-items:center;gap:8px;min-height:34px;border-radius:8px;border:1px solid color-mix(in srgb,var(--xau-green) 30%,transparent);background:color-mix(in srgb,var(--xau-green) 12%,transparent);color:var(--xau-green);padding:0 10px;font-size:12px;font-weight:820;white-space:nowrap}.xau-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}.xau-metric{border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border);padding:14px 0}.xau-metric strong{display:block;margin-top:7px;color:var(--xau-ink);font-size:22px;line-height:1.1}.xau-table{margin-top:18px;border:1px solid var(--xau-border);border-radius:8px;overflow:hidden}.xau-row{display:grid;grid-template-columns:1.1fr .9fr .9fr .9fr;gap:16px;align-items:center;min-height:72px;padding:0 16px;border-bottom:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 44%,transparent)}.xau-row:last-child{border-bottom:0}.xau-row small{display:block;color:var(--xau-muted);font-size:11px;font-weight:780;line-height:1.35}.xau-row strong{display:block;margin-top:5px;color:var(--xau-ink);font-size:13px;line-height:1.35}.xau-good{color:var(--xau-green)!important}.xau-bad{color:var(--xau-red)!important}
.xau-review{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:46px;align-items:start}.xau-points{display:grid;gap:14px;margin-top:24px}.xau-point{display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;align-items:start;color:var(--xau-muted);font-size:14px;line-height:1.65}.xau-point svg{margin-top:2px;color:var(--xau-accent)}.xau-score{padding:18px;border-bottom:1px solid var(--xau-border)}.xau-score:last-child{border-bottom:0}.xau-score-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.xau-score-head strong{color:var(--xau-ink);font-size:15px}.xau-score-head span{color:var(--xau-accent);font-size:22px;font-weight:900}.xau-track{height:7px;margin-top:13px;border-radius:999px;background:var(--xau-border);overflow:hidden}.xau-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--xau-accent),var(--xau-warm))}.xau-score p{margin-top:10px;color:var(--xau-muted);font-size:13px;line-height:1.6}
.xau-grid{display:grid;gap:12px;margin-top:34px}.xau-workflow{grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border);gap:0}.xau-step{padding:24px 20px;border-right:1px solid var(--xau-border)}.xau-step:last-child{border-right:0}.xau-num{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--xau-border-strong);border-radius:8px;color:var(--xau-accent);font-size:12px;font-weight:900}.xau-features{grid-template-columns:repeat(4,minmax(0,1fr))}.xau-compare{grid-template-columns:repeat(3,minmax(0,1fr))}.xau-platforms,.xau-faq{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-card{min-height:100%;padding:20px}.xau-card h3,.xau-step h3{margin-top:16px;color:var(--xau-ink);font-size:17px!important;font-weight:880!important;line-height:1.2!important;letter-spacing:0!important}.xau-card p,.xau-step p{margin-top:10px;color:var(--xau-muted);font-size:14px;line-height:1.65;font-weight:540}.xau-icon{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--xau-border-strong);color:var(--xau-accent);background:color-mix(in srgb,var(--xau-accent) 10%,transparent)}.xau-compare-label{color:var(--xau-accent);font-size:12px;font-weight:860;line-height:1.4;text-transform:uppercase}.xau-highlight{border-color:color-mix(in srgb,var(--xau-accent) 48%,var(--xau-border));background:color-mix(in srgb,var(--xau-accent) 12%,var(--xau-surface))}.xau-platform-head{display:flex;align-items:center;gap:14px}.xau-platform-head img{width:42px;height:42px;border-radius:8px;border:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 62%,transparent);padding:8px}.xau-cta{padding:44px;text-align:center;background:linear-gradient(135deg,color-mix(in srgb,var(--xau-accent) 16%,transparent),transparent 34%),color-mix(in srgb,var(--xau-surface) 84%,transparent)}.xau-cta p{max-width:680px;margin:16px auto 0;color:var(--xau-muted);font-size:16px;line-height:1.75}
.xau-spiral-section{position:relative;z-index:1;padding:40px 0 120px;overflow:clip}.xau-spiral-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);gap:36px;align-items:start;min-height:calc(100dvh - 72px)}.xau-spiral-copy{position:sticky;top:104px;padding-top:54px}.xau-spiral-stage{min-height:720px;display:grid;place-items:center}.xau-spiral-canvas{position:relative;width:min(660px,100%);aspect-ratio:1;display:grid;place-items:center}.xau-spiral-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.xau-spiral-track,.xau-spiral-progress{fill:none;stroke-linecap:round;stroke-linejoin:round}.xau-spiral-track{stroke:var(--xau-border-strong);stroke-width:2;stroke-dasharray:9 13}.xau-spiral-progress{stroke:url(#xauSpiralGradient);stroke-width:4;filter:drop-shadow(0 0 14px color-mix(in srgb,var(--xau-accent) 32%,transparent))}.xau-spiral-marker{filter:drop-shadow(0 0 18px color-mix(in srgb,var(--xau-accent) 68%,transparent))}.xau-spiral-core{position:relative;z-index:2;width:min(340px,58%);padding:22px}.xau-spiral-core h3{margin-top:10px;color:var(--xau-ink);font-size:22px!important;line-height:1.12!important;font-weight:900!important;letter-spacing:0!important}.xau-spiral-core p{margin-top:12px;color:var(--xau-muted);font-size:13px;line-height:1.65}.xau-spiral-core-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:18px}.xau-spiral-core-grid span{border-top:1px solid var(--xau-border);padding-top:10px;color:var(--xau-muted);font-size:11px;font-weight:780;text-transform:uppercase}.xau-spiral-core-grid strong{display:block;margin-top:4px;color:var(--xau-ink);font-size:15px}.xau-spiral-chapter{position:absolute;z-index:3;width:230px;padding:16px;opacity:.42;transform:translateY(18px) scale(.96);will-change:transform,opacity}.xau-spiral-chapter:nth-of-type(1){left:4%;top:4%}.xau-spiral-chapter:nth-of-type(2){right:-2%;top:25%}.xau-spiral-chapter:nth-of-type(3){left:-3%;bottom:22%}.xau-spiral-chapter:nth-of-type(4){right:7%;bottom:3%}.xau-spiral-chapter span{color:var(--xau-accent);font-size:12px;font-weight:900}.xau-spiral-chapter h3{margin-top:8px;color:var(--xau-ink);font-size:16px!important;line-height:1.18!important;font-weight:900!important;letter-spacing:0!important}.xau-spiral-chapter p{margin-top:8px;color:var(--xau-muted);font-size:13px;line-height:1.55}.xau-spiral-kicker{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--xau-muted);font-size:12px;font-weight:850;text-transform:uppercase}.xau-spiral-kicker:before{content:'';width:8px;height:8px;border-radius:999px;background:var(--xau-accent)}
.xau-page .site-footer{position:relative;z-index:1;border-top:0!important;background:transparent!important;box-shadow:none!important}.xau-page .site-footer__inner{border-top:0!important}.xau-page .site-footer__brand p,.xau-page .site-footer__meta p,.xau-page .site-footer__meta span,.xau-page .site-footer__link{color:var(--xau-muted)!important}.xau-page .site-footer__link:hover,.xau-page .site-footer__link:focus-visible{color:var(--xau-ink)!important}
@media (prefers-reduced-motion:reduce){.xau-gradient{animation:none}.xau-button,.xau-tab{transition:none}}
@media (max-width:980px){.xau-spiral-shell{grid-template-columns:1fr;min-height:0}.xau-spiral-copy{position:relative;top:auto;padding-top:0}.xau-spiral-stage{min-height:auto}.xau-spiral-canvas{width:min(560px,100%)}.xau-spiral-chapter{position:relative;inset:auto!important;width:auto;opacity:1!important;transform:none!important;margin-top:10px}.xau-spiral-core{width:min(330px,64%)}.xau-preview,.xau-review{grid-template-columns:1fr}.xau-side{border-right:0;border-bottom:1px solid var(--xau-border)}.xau-tabs,.xau-features,.xau-compare,.xau-platforms,.xau-faq,.xau-workflow{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-step:nth-child(2){border-right:0}.xau-step:nth-child(1),.xau-step:nth-child(2){border-bottom:1px solid var(--xau-border)}}
@media (max-width:720px){.xau-spiral-section{padding:20px 0 74px}.xau-spiral-shell{width:min(100% - 24px,1180px)}.xau-spiral-canvas{aspect-ratio:auto;display:block}.xau-spiral-svg{position:relative;aspect-ratio:1}.xau-spiral-core{position:absolute;left:50%;top:50%;width:min(280px,74%);transform:translate(-50%,-50%);padding:16px}.xau-spiral-core h3{font-size:18px!important}.xau-spiral-core-grid{display:none}.xau-shell{width:min(100% - 24px,1160px)}.xau-section{padding:74px 0}.xau-hero{padding:112px 0 56px}.xau-copy{font-size:16px}.xau-proof,.xau-metrics,.xau-features,.xau-compare,.xau-platforms,.xau-faq,.xau-workflow{grid-template-columns:1fr}.xau-proof div,.xau-proof div:first-child,.xau-proof div:last-child{border-right:0;border-bottom:1px solid var(--xau-border);padding:16px 0}.xau-proof div:last-child{border-bottom:0}.xau-screenbar,.xau-head{align-items:flex-start;flex-direction:column}.xau-sources{justify-content:flex-start}.xau-row{grid-template-columns:1fr 1fr;min-height:auto;padding:14px}.xau-step,.xau-step:nth-child(1),.xau-step:nth-child(2){border-right:0;border-bottom:1px solid var(--xau-border)}.xau-step:last-child{border-bottom:0}.xau-cta{padding:28px 18px}}
`;

const themes = {
  light: { '--xau-bg':'#f7fbfa','--xau-bg-2':'#edf7f4','--xau-surface':'rgba(255,255,255,.82)','--xau-surface-solid':'#ffffff','--xau-border':'rgba(14,28,24,.12)','--xau-border-strong':'rgba(14,28,24,.22)','--xau-grid':'rgba(14,28,24,.055)','--xau-ink':'#101816','--xau-muted':'#5f6e69','--xau-muted-strong':'#3f514b','--xau-accent':'#0f9f8a','--xau-warm':'#d49224','--xau-coral':'#c95b3c','--xau-green':'#059669','--xau-red':'#dc2626','--xau-button-bg':'linear-gradient(135deg,#7dd3c7 0%,#f0bb54 100%)','--xau-button-ink':'#07100d','--xau-shadow':'0 28px 80px rgba(14,28,24,.13)' },
  dark: { '--xau-bg':'#050806','--xau-bg-2':'#08130f','--xau-surface':'rgba(14,20,18,.76)','--xau-surface-solid':'#0a100e','--xau-border':'rgba(230,255,248,.12)','--xau-border-strong':'rgba(230,255,248,.22)','--xau-grid':'rgba(230,255,248,.048)','--xau-ink':'#f5fbf8','--xau-muted':'#a6b3ae','--xau-muted-strong':'#d2ddd9','--xau-accent':'#5eead4','--xau-warm':'#f5b544','--xau-coral':'#ff7a59','--xau-green':'#35db7a','--xau-red':'#ff6b6b','--xau-button-bg':'linear-gradient(135deg,#67e8f9 0%,#5eead4 46%,#f5b544 100%)','--xau-button-ink':'#07100d','--xau-shadow':'0 32px 90px rgba(0,0,0,.46)' },
};

const proof = [['Built for','XAUUSD only'],['Capture','Manual or MT4/MT5'],['Review','Execution, session, risk']];
const platforms = [{ src:'/mt4.svg', label:'MetaTrader 4' },{ src:'/mt5.svg', label:'MetaTrader 5' }];
const tabs = [
  { label:'Trade Journal', icon:NotebookPen, title:'Every XAUUSD trade in one focused record', status:'Manual entry ready', metrics:[['Filtered P&L','+$876.08'],['Captured pips','+5,961.2'],['Win rate','100%']], rows:[['GOLD','London session','+$242.64','+2,022 pips'],['GOLD','New York breakout','+$400.95','+2,673 pips'],['GOLD','SMC retest','+$5.25','+105 pips']] },
  { label:'Broker Sync', icon:PlugZap, title:'Closed MT4/MT5 trades become review data', status:'Pro sync workflow', metrics:[['Sources','MT4 + MT5'],['Input work','Reduced'],['History','Cloud saved']], rows:[['MetaTrader 5','Pepperstone live','Synced','+50 pips'],['MetaTrader 4','Closed trades','Queued','+112 pips'],['Manual backup','Any broker','Ready','Notes saved']] },
  { label:'Performance', icon:LineChart, title:'Patterns are easier to see after the session', status:'Review intelligence', metrics:[['Best session','London'],['Risk notes','Tagged'],['Setups','Compared']], rows:[['Trend','High conviction','+$222.24','+1,111 pips'],['Breakout','Clean follow through','+$242.64','+2,022 pips'],['Impulse chase','Rule break','-$35.20','-176 pips']] },
];
const reviewScores = [['Journal clarity','9.6',96,'Execution, notes, sessions, and outcomes stay together without spreadsheet friction.'],['Gold-trader focus','9.4',94,'XAUUSD stays first, so pips, sessions, sizing, and review language match the market.'],['Review habit','9.2',92,'Manual logging stays fast, while Pro sync removes repetitive entry work when the account grows.']];
const reviewPoints = ['A private journal built around gold trades instead of a generic asset list.','Manual logging is available from day one, with MT4/MT5 sync reserved for Pro workflows.','Closed trades become clean review evidence: session, setup, P&L, pips, notes, and repeat patterns.'];
const workflow = [['01','Capture','Log the trade manually or pull closed history from MT4/MT5 when Pro sync is enabled.'],['02','Explain','Attach setup, session, screenshot context, and the reason behind the decision.'],['03','Review','Read P&L, pips, win rate, session behavior, and risk from one calm workspace.'],['04','Improve','Use the patterns to protect discipline before the next gold session opens.']];
const features = [{ icon:NotebookPen,title:'Manual journal without friction',body:'Fast trade entry, clean notes, and focused fields for active XAUUSD review.' },{ icon:PlugZap,title:'MT4/MT5 sync for Pro',body:'Broker history can become structured review data without rebuilding every trade by hand.' },{ icon:BarChart3,title:'Session analytics',body:'Compare London, New York, Asia, setups, pips, and results in the same product language.' },{ icon:ShieldCheck,title:'Private by design',body:'A serious journal should feel controlled, secure, and calm before it asks for attention.' }];
const comparison = [['Before','Scattered notes','Screenshots, broker history, spreadsheets, and memory all fight for the same answer after a trade.'],['XAU Journal','One review system','A focused SaaS product that keeps the trade, reason, session, result, and next lesson together.'],['After','Clearer decisions','The next session starts with evidence instead of guessing what actually improved or failed.']];
const sectionTitle = '!text-4xl !font-black !leading-tight md:!text-5xl xau-title mt-5';
const spiralChapters = [
  ['01', 'Capture', 'Manual trade logging keeps the habit alive even before broker sync is connected.'],
  ['02', 'Connect', 'Pro traders can pull supported MT4 and MT5 history into a cleaner review system.'],
  ['03', 'Read', 'Sessions, pips, P&L, and setup quality start forming a pattern instead of a pile of notes.'],
  ['04', 'Improve', 'The next gold session begins with evidence from the last one, not memory.'],
];

function useSpiralStory(rootRef) {
  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined') return undefined;

    const ctx = gsap.context(() => {
      const section = rootRef.current.querySelector('.xau-spiral-section');
      const path = rootRef.current.querySelector('#xau-spiral-path');
      const shell = rootRef.current.querySelector('.xau-spiral-shell');
      const progress = rootRef.current.querySelector('.xau-spiral-progress');
      const marker = rootRef.current.querySelector('.xau-spiral-marker');
      const cards = gsap.utils.toArray('[data-spiral-card]');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!section || !shell || !path || !progress || !marker) return;

      if (reduced || window.innerWidth < 980) {
        gsap.set(progress, { strokeDashoffset: 0 });
        gsap.set(marker, { autoAlpha: reduced ? 0 : 1 });
        gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }

      const pathLength = path.getTotalLength();
      gsap.set(progress, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      gsap.set(marker, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0, end: 0 } });
      gsap.set(cards, { autoAlpha: 0.36, y: 20, scale: 0.96 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0, scale: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2600',
          scrub: 0.9,
          pin: shell,
          anticipatePin: 1,
        },
      });

      tl.to(progress, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
        .to(marker, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1, ease: 'none' }, 0)
        .to('.xau-spiral-core', { y: -12, rotate: 1.6, scale: 1.04, duration: 1, ease: 'none' }, 0);

      cards.forEach((card, index) => {
        const at = index / Math.max(cards.length - 1, 1);
        if (index > 0) {
          tl.to(cards[index - 1], { autoAlpha: 0.36, y: -16, scale: 0.96, duration: 0.12, ease: 'power2.out' }, at);
        }
        tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.12, ease: 'power2.out' }, at);
      });
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef]);
}

function useLandingPageAssets() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const style = document.createElement('style');
    style.id = 'xau-landing-product-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    injectJsonLd('ld-organization', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => {
      style.remove();
      removeJsonLd('ld-organization');
      removeJsonLd('ld-website');
      removeJsonLd('ld-software');
      removeJsonLd('ld-faq');
    };
  }, []);
}

function Reveal({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

function ButtonLink({ to, children, secondary = false }) {
  return (
    <Link to={to} className={`xau-button ${secondary ? 'xau-secondary' : 'xau-primary'}`}>
      {children}
      {!secondary && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}

function SourceBadges() {
  return (
    <div className="xau-sources" aria-label="Supported MetaTrader platforms">
      <span>Sources</span>
      {platforms.map((platform) => (
        <span className="xau-source" key={platform.label}>
          <img src={platform.src} alt="" aria-hidden="true" />
          {platform.label}
        </span>
      ))}
    </div>
  );
}

function ProductPreview() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = tabs[activeIndex];

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % tabs.length), 3600);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <Motion.div
      className="xau-product xau-panel"
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      aria-label="XAU Journal product preview"
    >
      <div className="xau-screenbar">
        <div className="flex items-center gap-3">
          <div className="xau-dots" aria-hidden="true"><span /><span /><span /></div>
          <div className="flex items-center gap-2 font-black text-[13px] text-[var(--xau-ink)]"><Logo iconSize="w-5 h-5" />XAU Journal</div>
        </div>
        <SourceBadges />
      </div>

      <div className="xau-preview">
        <aside className="xau-side">
          <span className="xau-label">Product surface</span>
          <div className="xau-tabs" role="tablist" aria-label="Product preview areas">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const selected = activeIndex === index;
              return (
                <button type="button" role="tab" aria-selected={selected} className={`xau-tab ${selected ? 'active' : ''}`} key={tab.label} onClick={() => setActiveIndex(index)}>
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden="true" />{tab.label}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p>Built for traders who want the journal to feel like a control room, not another spreadsheet.</p>
        </aside>

        <section className="xau-main" aria-live="polite">
          <Motion.div key={active.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <div className="xau-head">
              <div><span className="xau-label">{active.label}</span><h2>{active.title}</h2></div>
              <div className="xau-status"><Activity className="h-4 w-4" aria-hidden="true" />{active.status}</div>
            </div>

            <div className="xau-metrics">
              {active.metrics.map(([label, value]) => <div className="xau-metric" key={`${active.label}-${label}`}><span className="xau-label">{label}</span><strong>{value}</strong></div>)}
            </div>

            <div className="xau-table">
              {active.rows.map(([symbol, setup, value, pips]) => {
                const isLoss = value.startsWith('-') || pips.startsWith('-');
                return (
                  <div className="xau-row" key={`${active.label}-${setup}`}>
                    <div><small>Instrument</small><strong>{symbol}</strong></div>
                    <div><small>Setup</small><strong>{setup}</strong></div>
                    <div><small>Result</small><strong className={isLoss ? 'xau-bad' : 'xau-good'}>{value}</strong></div>
                    <div><small>Pips</small><strong className={isLoss ? 'xau-bad' : 'xau-good'}>{pips}</strong></div>
                  </div>
                );
              })}
            </div>
          </Motion.div>
        </section>
      </div>
    </Motion.div>
  );
}

function Hero() {
  return (
    <section className="xau-hero" aria-labelledby="landing-hero-heading">
      <div className="xau-shell">
        <div className="xau-hero-copy">
          <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <span className="xau-eyebrow">Gold trading journal</span>
            <h1 id="landing-hero-heading" className="xau-title mt-6 !text-5xl !font-black !leading-[0.98] sm:!text-6xl md:!text-7xl lg:!text-8xl">
              XAU Journal for traders who review <span className="xau-gradient">with evidence.</span>
            </h1>
            <p className="xau-copy mx-auto mt-6 max-w-3xl text-[18px]">
              A minimal SaaS journal for XAUUSD traders: log trades manually, connect supported MetaTrader workflows on Pro, and turn every session into a cleaner decision loop.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3"><ButtonLink to="/login">Start journaling</ButtonLink><ButtonLink to="/pricing" secondary>Compare plans</ButtonLink></div>
          </Motion.div>
        </div>
        <div className="xau-proof" aria-label="Product highlights">
          {proof.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

function SpiralStory() {
  return (
    <section className="xau-spiral-section" aria-labelledby="spiral-story-heading">
      <div className="xau-spiral-shell">
        <div className="xau-spiral-copy">
          <span className="xau-eyebrow">Scroll story</span>
          <h2 id="spiral-story-heading" className={sectionTitle}>The journal should feel like a <span className="xau-gradient">review loop.</span></h2>
          <p className="xau-copy mt-5">The spiral follows one trade from capture to improvement. As you scroll, the product story moves inward: less noise, more evidence, clearer decisions.</p>
          <span className="xau-spiral-kicker">GSAP scroll path</span>
        </div>

        <div className="xau-spiral-stage">
          <div className="xau-spiral-canvas" aria-label="XAU Journal spiral review story">
            <svg className="xau-spiral-svg" viewBox="0 0 600 600" aria-hidden="true">
              <defs>
                <linearGradient id="xauSpiralGradient" x1="80" y1="90" x2="520" y2="520" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="var(--xau-accent)" />
                  <stop offset="55%" stopColor="var(--xau-warm)" />
                  <stop offset="100%" stopColor="var(--xau-coral)" />
                </linearGradient>
              </defs>
              <path id="xau-spiral-path" className="xau-spiral-track" d="M300 68 C434 68 532 166 532 300 C532 452 410 554 300 554 C160 554 70 446 70 316 C70 190 166 100 286 100 C402 100 490 186 490 300 C490 416 400 500 300 500 C190 500 126 420 126 316 C126 220 196 156 290 156 C376 156 446 220 446 306 C446 386 380 446 300 446 C226 446 176 390 176 318 C176 250 226 206 292 206 C352 206 398 248 398 308 C398 360 356 398 304 398 C256 398 226 366 226 320 C226 280 256 252 294 252 C328 252 352 276 352 310 C352 336 332 354 306 354" />
              <path className="xau-spiral-progress" d="M300 68 C434 68 532 166 532 300 C532 452 410 554 300 554 C160 554 70 446 70 316 C70 190 166 100 286 100 C402 100 490 186 490 300 C490 416 400 500 300 500 C190 500 126 420 126 316 C126 220 196 156 290 156 C376 156 446 220 446 306 C446 386 380 446 300 446 C226 446 176 390 176 318 C176 250 226 206 292 206 C352 206 398 248 398 308 C398 360 356 398 304 398 C256 398 226 366 226 320 C226 280 256 252 294 252 C328 252 352 276 352 310 C352 336 332 354 306 354" />
              <g className="xau-spiral-marker">
                <circle r="13" fill="var(--xau-surface-solid)" stroke="var(--xau-accent)" strokeWidth="3" />
                <circle r="5" fill="var(--xau-warm)" />
              </g>
            </svg>

            <div className="xau-spiral-core xau-panel">
              <span className="xau-label">Review engine</span>
              <h3>Trade data becomes a decision system.</h3>
              <p>Manual journal, broker sync, session analytics, and notes all orbit the same trader habit.</p>
              <div className="xau-spiral-core-grid">
                <span>Input<strong>XAUUSD</strong></span>
                <span>Output<strong>Clarity</strong></span>
              </div>
            </div>

            {spiralChapters.map(([number, title, body]) => (
              <article className="xau-spiral-chapter xau-soft" data-spiral-card key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductReview() {
  return (
    <section className="xau-section" aria-labelledby="product-review-heading">
      <div className="xau-shell xau-review">
        <Reveal>
          <span className="xau-eyebrow">Product review</span>
          <h2 id="product-review-heading" className={sectionTitle}>What makes the product <span className="xau-gradient">worth using.</span></h2>
          <p className="xau-copy mt-5">XAU Journal is designed for one job: help a gold trader see what actually happened, why it happened, and what needs to change before the next session.</p>
          <div className="xau-points">
            {reviewPoints.map((point) => <div className="xau-point" key={point}><CheckCircle2 className="h-5 w-5" aria-hidden="true" /><span>{point}</span></div>)}
          </div>
        </Reveal>
        <Reveal className="xau-panel overflow-hidden" delay={0.08}>
          {reviewScores.map(([label, score, progress, note]) => (
            <div className="xau-score" key={label}>
              <div className="xau-score-head"><strong>{label}</strong><span>{score}</span></div>
              <div className="xau-track" aria-hidden="true"><div className="xau-fill" style={{ width: `${progress}%` }} /></div>
              <p>{note}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="xau-section" aria-labelledby="workflow-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">How it works</span><h2 id="workflow-heading" className={sectionTitle}>A simple system for better <span className="xau-gradient">trade review.</span></h2></Reveal>
        <Reveal className="xau-grid xau-workflow" delay={0.08}>
          {workflow.map(([number, title, body]) => <article className="xau-step" key={number}><span className="xau-num">{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </Reveal>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="xau-section" aria-labelledby="features-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">SaaS features</span><h2 id="features-heading" className={sectionTitle}>Focused features for a serious <span className="xau-gradient">gold journal.</span></h2></Reveal>
        <div className="xau-grid xau-features">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return <Reveal delay={index * 0.05} key={feature.title}><article className="xau-card xau-soft"><span className="xau-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3>{feature.title}</h3><p>{feature.body}</p></article></Reveal>;
          })}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="xau-section" aria-labelledby="comparison-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">Why it matters</span><h2 id="comparison-heading" className={sectionTitle}>From scattered trades to a repeatable <span className="xau-gradient">review habit.</span></h2></Reveal>
        <div className="xau-grid xau-compare">
          {comparison.map(([label, title, body], index) => <Reveal delay={index * 0.06} key={label}><article className={`xau-card xau-soft ${index === 1 ? 'xau-highlight' : ''}`}><span className="xau-compare-label">{label}</span><h3>{title}</h3><p>{body}</p></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Platforms() {
  return (
    <section className="xau-section" aria-labelledby="platform-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">Broker workflow</span><h2 id="platform-heading" className={sectionTitle}>MetaTrader icons where traders expect <span className="xau-gradient">real sources.</span></h2><p className="xau-copy mt-5">The product keeps the manual journal clean for everyone, while Pro traders can connect supported MT4 and MT5 workflows when they want sync.</p></Reveal>
        <div className="xau-grid xau-platforms">
          {platforms.map((platform, index) => <Reveal delay={index * 0.06} key={platform.label}><article className="xau-card xau-soft"><div className="xau-platform-head"><img src={platform.src} alt={`${platform.label} icon`} /><h3>{platform.label}</h3></div><p>Use {platform.label} account history as structured input for cleaner journal records and faster review.</p></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="xau-section" aria-labelledby="faq-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">Common questions</span><h2 id="faq-heading" className={sectionTitle}>Clear answers before traders <span className="xau-gradient">sign up.</span></h2></Reveal>
        <div className="xau-grid xau-faq">
          {LANDING_FAQ.slice(0, 4).map((item, index) => <Reveal delay={index * 0.05} key={item.q}><article className="xau-card xau-soft"><h3>{item.q}</h3><p>{item.a}</p></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="xau-section" aria-labelledby="final-cta-heading">
      <div className="xau-shell">
        <Reveal className="xau-panel xau-cta">
          <span className="xau-eyebrow">Start clean</span>
          <h2 id="final-cta-heading" className={sectionTitle}>Make the next gold session easier to <span className="xau-gradient">review.</span></h2>
          <p>XAU Journal is built for the developer-trader who wanted one serious place for execution, context, and improvement.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3"><ButtonLink to="/login">Open the journal</ButtonLink><ButtonLink to="/the-story" secondary>Read the story</ButtonLink></div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { isLightMode } = useAppTheme();
  const rootRef = useRef(null);
  useLandingPageAssets();
  useSpiralStory(rootRef);

  return (
    <main ref={rootRef} className="xau-page" style={isLightMode ? themes.light : themes.dark}>
      <PublicNavbar />
      <Hero />
      <SpiralStory />
      <ProductReview />
      <Workflow />
      <FeatureGrid />
      <Comparison />
      <Platforms />
      <Faq />
      <FinalCta />
      <PublicFooter />
    </main>
  );
}

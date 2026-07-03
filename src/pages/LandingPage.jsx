import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Activity, ArrowRight, Award, BarChart3, BookOpen, CalendarDays, CheckCircle2, Clock3, DollarSign, Gauge, House, LineChart, NotebookPen, Plus, PlugZap, Settings, ShieldCheck, TrendingUp } from 'lucide-react';

import Logo from '../components/Logo';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAppTheme } from '../hooks/useAppTheme';
import { LANDING_FAQ, buildFAQSchema, buildOrganizationSchema, buildSoftwareSchema, buildWebSiteSchema, injectJsonLd, removeJsonLd } from '../lib/seo';
import { GooeyText } from '../components/ui/gooey-text-morphing';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const STYLES = `
.xau-page{min-height:100vh;position:relative;isolation:isolate;overflow-x:hidden;background:linear-gradient(125deg,color-mix(in srgb,var(--xau-warm) 10%,transparent),transparent 24%),linear-gradient(220deg,color-mix(in srgb,var(--xau-accent) 9%,transparent),transparent 30%),linear-gradient(180deg,var(--xau-bg) 0%,var(--xau-bg-2) 54%,var(--xau-bg) 100%);color:var(--xau-ink);font-family:'Poppins','Inter',system-ui,sans-serif}
.xau-page:before{content:'';position:fixed;inset:0;z-index:-2;pointer-events:none;background-image:linear-gradient(var(--xau-grid) 1px,transparent 1px),linear-gradient(90deg,var(--xau-grid) 1px,transparent 1px);background-size:88px 88px;mask-image:linear-gradient(to bottom,black 0%,transparent 84%)}
.xau-page:after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--xau-bg) 70%,transparent) 72%,var(--xau-bg) 100%)}
.xau-page [data-public-nav]{position:fixed!important;top:max(16px,env(safe-area-inset-top))!important}
.xau-shell{width:min(1160px,calc(100% - 32px));margin:0 auto}.xau-section{position:relative;z-index:1;padding:104px 0}.xau-hero{position:relative;z-index:1;padding:138px 0 72px}.xau-eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--xau-muted-strong);font-size:12px;font-weight:800;line-height:1.2;letter-spacing:0;text-transform:uppercase}.xau-eyebrow:before{content:'';width:34px;height:1px;background:linear-gradient(90deg,var(--xau-warm),var(--xau-accent))}
.xau-ink-highlight{display:inline-block;background:linear-gradient(90deg,var(--xau-warm) 0%,var(--xau-coral) 38%,var(--xau-accent) 76%,var(--xau-warm) 100%);background-size:220% 100%;background-repeat:repeat;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-decoration:none;animation:xauTextRun 9s linear infinite}@keyframes xauTextRun{0%{background-position:0% 50%}100%{background-position:220% 50%}}
.xau-panel{border:1px solid var(--xau-border-strong);border-radius:8px;background:var(--xau-surface-solid);box-shadow:var(--xau-shadow)}.xau-soft{border:1px solid var(--xau-border);border-radius:8px;background:var(--xau-surface)}
.xau-button{min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:8px;padding:0 18px;font-size:14px;font-weight:850;text-decoration:none;transition:transform .22s ease,border-color .22s ease,background .22s ease,color .22s ease,box-shadow .22s ease}.xau-button:hover{transform:translateY(-2px)}.xau-button:focus-visible,.xau-tab:focus-visible{outline:2px solid var(--xau-accent);outline-offset:4px}.xau-primary{border:1px solid transparent;background:var(--xau-button-bg);color:var(--xau-button-ink);box-shadow:0 18px 45px color-mix(in srgb,var(--xau-warm) 22%,transparent)}.xau-secondary{border:1px solid var(--xau-border-strong);background:var(--xau-surface-solid);color:var(--xau-ink)}
.xau-title{color:var(--xau-ink);letter-spacing:0!important;text-wrap:balance}.xau-hero-title{max-width:1120px;margin-inline:auto}.xau-hero-lead{display:block}.xau-hero-morph{position:relative;display:block;height:1.08em;margin-top:.1em;white-space:nowrap!important;contain:layout;isolation:isolate}.xau-hero-morph:after{content:'';position:absolute;left:50%;bottom:.05em;width:min(620px,72%);height:12px;transform:translateX(-50%);border-radius:999px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--xau-warm) 34%,transparent),color-mix(in srgb,var(--xau-accent) 30%,transparent),transparent);filter:blur(10px);opacity:.52;pointer-events:none;transition:opacity .24s ease,transform .24s ease}.xau-hero-copy:hover .xau-hero-morph:after{opacity:.72;transform:translateX(-50%) scaleX(1.06)}.xau-heading-gooey{display:block;width:100%;height:1.08em;white-space:nowrap!important;filter:drop-shadow(0 18px 42px color-mix(in srgb,var(--xau-warm) 18%,transparent))}.xau-heading-gooey-text{left:50%;top:50%;transform:translate(-50%,-50%);font-size:inherit!important;line-height:1!important;font-weight:950!important;letter-spacing:0!important;white-space:nowrap!important;background:linear-gradient(90deg,#9b7a4b 0%,#d49224 22%,#c95b3c 44%,#0f9f8a 72%,#9b7a4b 100%);background-size:240% 100%;background-repeat:repeat;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:xauGooeyGrad 10s linear infinite}@keyframes xauGooeyGrad{0%{background-position:0% 50%}100%{background-position:240% 50%}}
.xau-copy{color:var(--xau-muted);font-size:16px;line-height:1.75;font-weight:560}.xau-hero-copy{max-width:930px;margin:0 auto;text-align:center}.xau-proof{max-width:960px;margin:32px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border)}.xau-proof div{padding:16px 18px;border-right:1px solid var(--xau-border);text-align:left}.xau-proof div:first-child{padding-left:0}.xau-proof div:last-child{border-right:0;padding-right:0}.xau-proof span,.xau-label{display:block;color:var(--xau-muted);font-size:12px;font-weight:780;line-height:1.4;text-transform:uppercase}.xau-proof strong{display:block;margin-top:7px;color:var(--xau-ink);font-size:18px;line-height:1.25}
.xau-product{max-width:1040px;margin:44px auto 0;overflow:hidden}.xau-screenbar{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px;border-bottom:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-surface-solid) 92%,var(--xau-bg))}.xau-dots{display:flex;gap:7px}.xau-dots span{width:9px;height:9px;border-radius:999px;background:var(--xau-border-strong)}.xau-sources{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:8px;color:var(--xau-muted);font-size:12px;font-weight:750}.xau-source{display:inline-flex;align-items:center;gap:8px;min-height:34px;border-radius:8px;border:1px solid var(--xau-border);background:var(--xau-bg);color:var(--xau-ink);padding:0 10px}.xau-source img{width:18px;height:18px;display:block}
.xau-preview{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:520px}.xau-side{border-right:1px solid var(--xau-border);padding:18px;background:color-mix(in srgb,var(--xau-bg) 76%,var(--xau-surface-solid))}.xau-tabs{display:grid;gap:8px;margin-top:18px}.xau-tab{width:100%;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--xau-muted);padding:0 12px;font:inherit;font-size:13px;font-weight:820;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease}.xau-tab.active{border-color:var(--xau-border-strong);background:color-mix(in srgb,var(--xau-warm) 13%,var(--xau-surface-solid));color:var(--xau-ink)}.xau-side p{margin-top:24px;padding-top:18px;border-top:1px solid var(--xau-border);color:var(--xau-muted);font-size:13px;line-height:1.65}.xau-main{padding:22px}.xau-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.xau-head h2{margin-top:7px;color:var(--xau-ink);font-size:26px!important;line-height:1.1!important;font-weight:900!important;letter-spacing:0!important}.xau-status{display:inline-flex;align-items:center;gap:8px;min-height:34px;border-radius:8px;border:1px solid color-mix(in srgb,var(--xau-green) 30%,transparent);background:color-mix(in srgb,var(--xau-green) 12%,var(--xau-surface-solid));color:var(--xau-green);padding:0 10px;font-size:12px;font-weight:820;white-space:nowrap}.xau-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}.xau-metric{border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border);padding:14px 0}.xau-metric strong{display:block;margin-top:7px;color:var(--xau-ink);font-size:22px;line-height:1.1}.xau-table{margin-top:18px;border:1px solid var(--xau-border);border-radius:8px;overflow:hidden}.xau-row{display:grid;grid-template-columns:1.1fr .9fr .9fr .9fr;gap:16px;align-items:center;min-height:72px;padding:0 16px;border-bottom:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 60%,var(--xau-surface-solid))}.xau-row:last-child{border-bottom:0}.xau-row small{display:block;color:var(--xau-muted);font-size:11px;font-weight:780;line-height:1.35}.xau-row strong{display:block;margin-top:5px;color:var(--xau-ink);font-size:13px;line-height:1.35}.xau-good{color:var(--xau-green)!important}.xau-bad{color:var(--xau-red)!important}
.xau-dashboard-preview{max-width:1160px;margin:46px auto 0;overflow:hidden;background:color-mix(in srgb,var(--xau-surface-solid) 94%,var(--xau-bg));box-shadow:0 30px 90px color-mix(in srgb,var(--xau-warm) 16%,rgba(0,0,0,.36))}.xau-dashboard-topbar{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 72%,var(--xau-surface-solid))}.xau-dashboard-topbar-brand{display:flex;align-items:center;gap:10px;min-width:0}.xau-dashboard-topbar-brand strong{color:var(--xau-ink);font-size:14px;font-weight:950;line-height:1}.xau-dashboard-topbar-brand span{display:block;margin-top:4px;color:var(--xau-muted);font-size:11px;font-weight:760;text-transform:uppercase}.xau-dashboard-shell{display:grid;grid-template-columns:218px minmax(0,1fr);min-height:640px}.xau-dashboard-sidebar{display:flex;flex-direction:column;gap:14px;border-right:1px solid var(--xau-border);padding:18px;background:linear-gradient(180deg,color-mix(in srgb,var(--xau-bg) 82%,var(--xau-surface-solid)),color-mix(in srgb,var(--xau-bg) 62%,var(--xau-surface-solid)))}.xau-dashboard-sidebar-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.xau-dashboard-sidebar-head span{color:var(--xau-muted);font-size:10px;font-weight:900;text-transform:uppercase}.xau-dashboard-nav{display:grid;gap:8px}.xau-dashboard-nav-item{min-height:44px;display:flex;align-items:center;gap:10px;border:1px solid transparent;border-radius:12px;padding:0 12px;color:var(--xau-muted);font-size:12px;font-weight:850;text-transform:uppercase;transition:background .22s ease,color .22s ease,border-color .22s ease,transform .22s ease}.xau-dashboard-nav-item svg{width:16px;height:16px;flex:0 0 auto}.xau-dashboard-nav-item.is-active{border-color:color-mix(in srgb,var(--xau-warm) 36%,var(--xau-border));background:color-mix(in srgb,var(--xau-warm) 13%,var(--xau-surface-solid));color:var(--xau-ink)}.xau-dashboard-nav-item:hover{transform:translateY(-1px);color:var(--xau-ink);background:color-mix(in srgb,var(--xau-accent) 8%,var(--xau-surface-solid))}.xau-dashboard-sync-card{margin-top:auto;border:1px solid var(--xau-border);border-radius:12px;padding:14px;background:color-mix(in srgb,var(--xau-surface-solid) 72%,transparent)}.xau-dashboard-sync-card span{display:block;color:var(--xau-muted);font-size:10px;font-weight:900;text-transform:uppercase}.xau-dashboard-sync-card strong{display:flex;align-items:center;gap:8px;margin-top:8px;color:var(--xau-green);font-size:12px}.xau-dashboard-main{min-width:0;display:grid;gap:16px;padding:22px;background:radial-gradient(circle at 82% 6%,color-mix(in srgb,var(--xau-accent) 11%,transparent),transparent 26rem),radial-gradient(circle at 12% 100%,color-mix(in srgb,var(--xau-warm) 11%,transparent),transparent 28rem)}.xau-dashboard-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.xau-dashboard-header h2{color:var(--xau-ink);font-size:22px!important;line-height:1.08!important;font-weight:950!important;letter-spacing:0!important;text-transform:uppercase}.xau-dashboard-header p{margin-top:4px;color:var(--xau-muted);font-size:12px;font-weight:760;text-transform:uppercase}.xau-dashboard-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.xau-market-badge,.xau-new-trade{min-height:36px;display:inline-flex;align-items:center;gap:8px;border-radius:12px;padding:0 12px;font-size:11px;font-weight:900;text-transform:uppercase;white-space:nowrap}.xau-market-badge{border:1px solid color-mix(in srgb,var(--xau-green) 25%,var(--xau-border));background:color-mix(in srgb,var(--xau-green) 11%,var(--xau-surface-solid));color:var(--xau-green)}.xau-market-badge:before{content:'';width:7px;height:7px;border-radius:999px;background:currentColor;box-shadow:0 0 10px currentColor}.xau-new-trade{border:1px solid transparent;background:var(--xau-button-bg);color:var(--xau-button-ink)}.xau-dashboard-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.xau-dash-stat{position:relative;min-height:118px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;overflow:hidden;border:1px solid var(--xau-border);border-radius:16px;padding:16px;background:color-mix(in srgb,var(--xau-surface-solid) 76%,transparent);transition:transform .22s ease,border-color .22s ease,background .22s ease}.xau-dash-stat:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--xau-warm) 42%,var(--xau-border))}.xau-dash-stat span{display:block;color:var(--xau-muted);font-size:10px;font-weight:900;line-height:1.35;text-transform:uppercase}.xau-dash-stat strong{display:block;margin-top:8px;color:var(--xau-ink);font-size:22px;line-height:1.1;font-weight:950}.xau-dash-stat small{display:block;margin-top:8px;color:var(--xau-muted);font-size:10px;font-weight:850;text-transform:uppercase}.xau-dash-stat-icon{width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid var(--xau-border);background:color-mix(in srgb,var(--xau-bg) 56%,transparent);color:var(--xau-warm);flex:0 0 auto}.xau-dash-stat.is-win .xau-dash-stat-icon,.xau-dash-stat.is-win strong{color:var(--xau-green)}.xau-dash-stat.is-best .xau-dash-stat-icon,.xau-dash-stat.is-best strong{color:var(--xau-coral)}.xau-market-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border:1px solid var(--xau-border);border-radius:16px;overflow:hidden;background:color-mix(in srgb,var(--xau-bg) 54%,var(--xau-surface-solid))}.xau-market-cell{min-height:76px;padding:14px;border-right:1px solid var(--xau-border)}.xau-market-cell:last-child{border-right:0}.xau-market-cell span{display:block;color:var(--xau-muted);font-size:10px;font-weight:900;text-transform:uppercase}.xau-market-cell strong{display:block;margin-top:8px;color:var(--xau-ink);font-size:17px;font-weight:950}.xau-dashboard-grid,.xau-dashboard-bottom{display:grid;gap:14px}.xau-dashboard-grid{grid-template-columns:.86fr 1.14fr}.xau-dashboard-bottom{grid-template-columns:1.08fr .92fr}.xau-dash-panel{border:1px solid var(--xau-border);border-radius:18px;background:color-mix(in srgb,var(--xau-surface-solid) 75%,transparent);padding:16px;min-width:0}.xau-dash-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.xau-dash-panel-head h3{color:var(--xau-ink);font-size:13px!important;line-height:1.2!important;font-weight:950!important;letter-spacing:0!important;text-transform:uppercase}.xau-dash-panel-head p{margin-top:4px;color:var(--xau-muted);font-size:10px;font-weight:760;text-transform:uppercase}.xau-gauge-wrap{display:grid;place-items:center;min-height:190px}.xau-gauge-value{fill:var(--xau-warm);font-size:30px;font-weight:950}.xau-gauge-label{fill:var(--xau-muted);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.xau-equity-chart{height:226px;border-radius:14px;border:1px solid var(--xau-border);background:linear-gradient(180deg,color-mix(in srgb,var(--xau-bg) 72%,transparent),color-mix(in srgb,var(--xau-surface-solid) 58%,transparent));overflow:hidden}.xau-equity-chart svg{width:100%;height:100%;display:block}.xau-signal-list,.xau-setup-list{display:grid;gap:8px}.xau-signal-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:54px;border:1px solid var(--xau-border);border-radius:12px;padding:10px;background:color-mix(in srgb,var(--xau-bg) 44%,transparent)}.xau-signal-direction{display:inline-flex;align-items:center;justify-content:center;min-height:28px;border-radius:8px;border:1px solid color-mix(in srgb,var(--xau-green) 30%,transparent);background:color-mix(in srgb,var(--xau-green) 12%,var(--xau-surface-solid));color:var(--xau-green);font-size:10px;font-weight:950}.xau-signal-row strong,.xau-setup-row strong{display:block;color:var(--xau-ink);font-size:12px;font-weight:920}.xau-signal-row span:not(.xau-signal-direction),.xau-setup-row span{display:block;margin-top:3px;color:var(--xau-muted);font-size:10px;font-weight:760;text-transform:uppercase}.xau-signal-pnl{color:var(--xau-green)!important;font-size:13px!important;font-weight:950!important}.xau-setup-row{display:grid;grid-template-columns:minmax(0,1fr) 88px;gap:12px;align-items:center}.xau-setup-track{height:8px;border-radius:999px;background:var(--xau-border);overflow:hidden}.xau-setup-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--xau-warm),var(--xau-accent))}
.xau-review{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:46px;align-items:start}.xau-points{display:grid;gap:14px;margin-top:24px}.xau-point{display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;align-items:start;color:var(--xau-muted);font-size:14px;line-height:1.65}.xau-point svg{margin-top:2px;color:var(--xau-accent)}.xau-score{padding:18px;border-bottom:1px solid var(--xau-border)}.xau-score:last-child{border-bottom:0}.xau-score-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.xau-score-head strong{color:var(--xau-ink);font-size:15px}.xau-score-head span{color:var(--xau-warm);font-size:22px;font-weight:900}.xau-track{height:7px;margin-top:13px;border-radius:999px;background:var(--xau-border);overflow:hidden}.xau-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--xau-warm),var(--xau-accent))}.xau-score p{margin-top:10px;color:var(--xau-muted);font-size:13px;line-height:1.6}
.xau-grid{display:grid;gap:12px;margin-top:34px}.xau-workflow{grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--xau-border);border-bottom:1px solid var(--xau-border);gap:0}.xau-step{padding:24px 20px;border-right:1px solid var(--xau-border)}.xau-step:last-child{border-right:0}.xau-num{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--xau-border-strong);border-radius:8px;color:var(--xau-warm);font-size:12px;font-weight:900}.xau-step h3{margin-top:16px;color:var(--xau-ink);font-size:17px!important;font-weight:880!important;line-height:1.2!important;letter-spacing:0!important}.xau-step p{margin-top:10px;color:var(--xau-muted);font-size:14px;line-height:1.65;font-weight:540}
.xau-debrief{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:16px;align-items:stretch}.xau-debrief-board{padding:24px;display:flex;flex-direction:column;justify-content:space-between;min-height:430px;background:linear-gradient(160deg,color-mix(in srgb,var(--xau-warm) 12%,var(--xau-surface-solid)),var(--xau-surface-solid) 46%,color-mix(in srgb,var(--xau-accent) 9%,var(--xau-surface-solid)))}.xau-debrief-board strong{display:block;margin-top:14px;color:var(--xau-ink);font-size:clamp(2rem,4vw,4.2rem);line-height:.95;font-weight:950;letter-spacing:0}.xau-debrief-board p{margin-top:18px;color:var(--xau-muted);font-size:15px;line-height:1.7}.xau-debrief-list{display:grid;gap:10px}.xau-debrief-item{display:grid;grid-template-columns:52px minmax(0,1fr);gap:14px;align-items:start;padding:18px;border-radius:8px;border:1px solid var(--xau-border);background:var(--xau-surface-solid)}.xau-debrief-item span{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--xau-border-strong);color:var(--xau-accent);background:color-mix(in srgb,var(--xau-accent) 10%,var(--xau-surface-solid))}.xau-debrief-item h3{color:var(--xau-ink);font-size:17px!important;font-weight:900!important;line-height:1.2!important;letter-spacing:0!important}.xau-debrief-item p{margin-top:8px;color:var(--xau-muted);font-size:14px;line-height:1.6}
.xau-compare{grid-template-columns:repeat(3,minmax(0,1fr))}.xau-platforms,.xau-faq{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-card{min-height:100%;padding:20px}.xau-card h3{margin-top:16px;color:var(--xau-ink);font-size:17px!important;font-weight:880!important;line-height:1.2!important;letter-spacing:0!important}.xau-card p{margin-top:10px;color:var(--xau-muted);font-size:14px;line-height:1.65;font-weight:540}.xau-compare-label{color:var(--xau-warm);font-size:12px;font-weight:860;line-height:1.4;text-transform:uppercase}.xau-highlight{border-color:color-mix(in srgb,var(--xau-warm) 48%,var(--xau-border));background:color-mix(in srgb,var(--xau-warm) 10%,var(--xau-surface-solid))}.xau-platform-head{display:flex;align-items:center;gap:14px}.xau-platform-head img{width:42px;height:42px;border-radius:8px;border:1px solid var(--xau-border);background:var(--xau-bg);padding:8px}.xau-cta{padding:44px;text-align:center;background:linear-gradient(135deg,color-mix(in srgb,var(--xau-warm) 14%,var(--xau-surface-solid)),var(--xau-surface-solid) 58%,color-mix(in srgb,var(--xau-accent) 10%,var(--xau-surface-solid)))}.xau-cta p{max-width:700px;margin:16px auto 0;color:var(--xau-muted);font-size:16px;line-height:1.75}
.xau-spiral-section{position:relative;z-index:1;padding:40px 0 120px;overflow:clip}.xau-spiral-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);gap:36px;align-items:start;min-height:calc(100dvh - 72px)}.xau-spiral-copy{position:sticky;top:104px;padding-top:54px}.xau-spiral-stage{min-height:720px;display:grid;place-items:center}.xau-spiral-canvas{position:relative;width:min(660px,100%);aspect-ratio:1;display:grid;place-items:center}.xau-spiral-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.xau-spiral-track,.xau-spiral-progress{fill:none;stroke-linecap:round;stroke-linejoin:round}.xau-spiral-track{stroke:var(--xau-border-strong);stroke-width:2;stroke-dasharray:9 13}.xau-spiral-progress{stroke:url(#xauSpiralGradient);stroke-width:4;filter:drop-shadow(0 0 14px color-mix(in srgb,var(--xau-warm) 28%,transparent))}.xau-spiral-marker{filter:drop-shadow(0 0 18px color-mix(in srgb,var(--xau-warm) 52%,transparent))}.xau-spiral-core{position:relative;z-index:2;width:min(340px,58%);padding:22px}.xau-spiral-core h3{margin-top:10px;color:var(--xau-ink);font-size:22px!important;line-height:1.12!important;font-weight:900!important;letter-spacing:0!important}.xau-spiral-core p{margin-top:12px;color:var(--xau-muted);font-size:13px;line-height:1.65}.xau-spiral-core-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:18px}.xau-spiral-core-grid span{border-top:1px solid var(--xau-border);padding-top:10px;color:var(--xau-muted);font-size:11px;font-weight:780;text-transform:uppercase}.xau-spiral-core-grid strong{display:block;margin-top:4px;color:var(--xau-ink);font-size:15px}.xau-spiral-chapter{position:absolute;z-index:3;width:230px;padding:16px;opacity:.42;transform:translateY(18px) scale(.96);will-change:transform,opacity}.xau-spiral-chapter:nth-of-type(1){left:4%;top:4%}.xau-spiral-chapter:nth-of-type(2){right:-2%;top:25%}.xau-spiral-chapter:nth-of-type(3){left:-3%;bottom:22%}.xau-spiral-chapter:nth-of-type(4){right:7%;bottom:3%}.xau-spiral-chapter span{color:var(--xau-warm);font-size:12px;font-weight:900}.xau-spiral-chapter h3{margin-top:8px;color:var(--xau-ink);font-size:16px!important;line-height:1.18!important;font-weight:900!important;letter-spacing:0!important}.xau-spiral-chapter p{margin-top:8px;color:var(--xau-muted);font-size:13px;line-height:1.55}.xau-spiral-kicker{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--xau-muted);font-size:12px;font-weight:850;text-transform:uppercase}.xau-spiral-kicker:before{content:'';width:8px;height:8px;border-radius:999px;background:var(--xau-warm)}
.xau-scroll-top{position:fixed;right:max(22px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom));z-index:120;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--xau-border-strong);border-radius:8px;background:var(--xau-surface-solid);color:var(--xau-ink);box-shadow:0 18px 48px color-mix(in srgb,var(--xau-warm) 18%,transparent);cursor:pointer;touch-action:manipulation;transition:background .22s ease,border-color .22s ease,color .22s ease,box-shadow .22s ease}.xau-scroll-top:hover{border-color:color-mix(in srgb,var(--xau-warm) 48%,var(--xau-border-strong));background:color-mix(in srgb,var(--xau-warm) 12%,var(--xau-surface-solid));color:var(--xau-warm);box-shadow:0 24px 60px color-mix(in srgb,var(--xau-warm) 24%,transparent)}.xau-scroll-top:focus-visible{outline:2px solid var(--xau-accent);outline-offset:4px}.xau-page .site-footer{position:relative;z-index:1;border-top:0!important;background:transparent!important;box-shadow:none!important}.xau-page .site-footer__inner{border-top:0!important}.xau-page .site-footer__brand p,.xau-page .site-footer__meta p,.xau-page .site-footer__meta span,.xau-page .site-footer__link{color:var(--xau-muted)!important}.xau-page .site-footer__link:hover,.xau-page .site-footer__link:focus-visible{color:var(--xau-ink)!important}
@media (prefers-reduced-motion:reduce){.xau-ink-highlight,.xau-heading-gooey-text{animation:none}.xau-button,.xau-tab,.xau-hero-morph:after,.xau-scroll-top,.xau-dash-stat,.xau-dashboard-nav-item{transition:none}}
@media (max-width:980px){.xau-dashboard-shell{grid-template-columns:1fr;min-height:auto}.xau-dashboard-sidebar{border-right:0;border-bottom:1px solid var(--xau-border);padding:14px}.xau-dashboard-nav{grid-template-columns:repeat(4,minmax(0,1fr))}.xau-dashboard-grid,.xau-dashboard-bottom{grid-template-columns:1fr}.xau-dashboard-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-spiral-shell{grid-template-columns:1fr;min-height:0}.xau-spiral-copy{position:relative;top:auto;padding-top:0}.xau-spiral-stage{min-height:auto}.xau-spiral-canvas{width:min(560px,100%)}.xau-spiral-chapter{position:relative;inset:auto!important;width:auto;opacity:1!important;transform:none!important;margin-top:10px}.xau-spiral-core{width:min(330px,64%)}.xau-preview,.xau-review,.xau-debrief{grid-template-columns:1fr}.xau-side{border-right:0;border-bottom:1px solid var(--xau-border)}.xau-tabs,.xau-compare,.xau-platforms,.xau-faq,.xau-workflow{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-step:nth-child(2){border-right:0}.xau-step:nth-child(1),.xau-step:nth-child(2){border-bottom:1px solid var(--xau-border)}}
@media (max-width:720px){.xau-dashboard-topbar,.xau-dashboard-header{align-items:flex-start;flex-direction:column}.xau-dashboard-main{padding:14px}.xau-dashboard-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-dashboard-stats{grid-template-columns:1fr}.xau-market-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.xau-market-cell:nth-child(2){border-right:0}.xau-market-cell:nth-child(-n+2){border-bottom:1px solid var(--xau-border)}.xau-signal-row{grid-template-columns:1fr auto}.xau-signal-direction{width:max-content}.xau-spiral-section{padding:20px 0 74px}.xau-spiral-shell{width:min(100% - 24px,1180px)}.xau-spiral-canvas{aspect-ratio:auto;display:block}.xau-spiral-svg{position:relative;aspect-ratio:1}.xau-spiral-core{position:absolute;left:50%;top:50%;width:min(280px,74%);transform:translate(-50%,-50%);padding:16px}.xau-spiral-core h3{font-size:18px!important}.xau-spiral-core-grid{display:none}.xau-page [data-public-nav]{position:fixed!important;top:max(16px,env(safe-area-inset-top))!important}
.xau-shell{width:min(100% - 24px,1160px)}.xau-section{padding:74px 0}.xau-hero{padding:112px 0 56px}.xau-hero-title{font-size:clamp(3rem,15.8vw,5rem)!important}.xau-hero-morph{height:1.16em;margin-top:.04em}.xau-hero-morph:after{width:88%;bottom:.04em}.xau-heading-gooey{height:1.14em}.xau-scroll-top{right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));width:46px;height:46px}.xau-copy{font-size:16px}.xau-proof,.xau-metrics,.xau-compare,.xau-platforms,.xau-faq,.xau-workflow{grid-template-columns:1fr}.xau-proof div,.xau-proof div:first-child,.xau-proof div:last-child{border-right:0;border-bottom:1px solid var(--xau-border);padding:16px 0}.xau-proof div:last-child{border-bottom:0}.xau-screenbar,.xau-head{align-items:flex-start;flex-direction:column}.xau-sources{justify-content:flex-start}.xau-row{grid-template-columns:1fr 1fr;min-height:auto;padding:14px}.xau-step,.xau-step:nth-child(1),.xau-step:nth-child(2){border-right:0;border-bottom:1px solid var(--xau-border)}.xau-step:last-child{border-bottom:0}.xau-cta{padding:28px 18px}.xau-debrief-board{min-height:320px;padding:18px}.xau-debrief-item{grid-template-columns:42px minmax(0,1fr);padding:16px}.xau-debrief-item span{width:36px;height:36px}}
`;

const themes = {
  light: { '--xau-bg':'#f8f6ef','--xau-bg-2':'#f0eadb','--xau-surface':'#fffdf7','--xau-surface-solid':'#ffffff','--xau-border':'rgba(39,31,19,.12)','--xau-border-strong':'rgba(39,31,19,.24)','--xau-grid':'rgba(39,31,19,.055)','--xau-ink':'#14120d','--xau-muted':'#655f51','--xau-muted-strong':'#433b2e','--xau-accent':'#0f9f8a','--xau-warm':'#c98924','--xau-coral':'#b55337','--xau-green':'#047857','--xau-red':'#c2412f','--xau-button-bg':'linear-gradient(135deg,#f0bb54 0%,#0f9f8a 100%)','--xau-button-ink':'#09100d','--xau-shadow':'0 28px 80px rgba(39,31,19,.14)' },
  dark: { '--xau-bg':'#050604','--xau-bg-2':'#0d0f0a','--xau-surface':'#0e120d','--xau-surface-solid':'#0a0d09','--xau-border':'rgba(245,229,191,.12)','--xau-border-strong':'rgba(245,229,191,.23)','--xau-grid':'rgba(245,229,191,.045)','--xau-ink':'#f8f3e7','--xau-muted':'#b8ad99','--xau-muted-strong':'#ded1b9','--xau-accent':'#5eead4','--xau-warm':'#f5b544','--xau-coral':'#ff7a59','--xau-green':'#35db7a','--xau-red':'#ff6b6b','--xau-button-bg':'linear-gradient(135deg,#f5b544 0%,#5eead4 100%)','--xau-button-ink':'#07100d','--xau-shadow':'0 32px 90px rgba(0,0,0,.48)' },
};

const proof = [['Market','XAUUSD only'],['Entry mode','Manual first'],['Pro case','MT4 / MT5 sync']];
const platforms = [{ src:'/mt4.svg', label:'MetaTrader 4' },{ src:'/mt5.svg', label:'MetaTrader 5' }];
const dashboardNav = [
  { label:'Dashboard', icon:House, active:true },
  { label:'History', icon:Clock3 },
  { label:'Calendar', icon:CalendarDays },
  { label:'Analytics', icon:LineChart },
  { label:'Journal', icon:BookOpen },
  { label:'Sync', icon:PlugZap },
  { label:'Settings', icon:Settings },
];
const dashboardStats = [
  { label:'Net P&L (MTD)', value:'+$876.08', sub:'vs last month +12.0%', icon:DollarSign, tone:'gold' },
  { label:'Win Rate', value:'78%', sub:'7 of 9 trades', icon:TrendingUp, tone:'win' },
  { label:'Best Trade', value:'+$400.95', sub:'XAU/USD - New York', icon:Award, tone:'best' },
  { label:'Avg R:R', value:'1:2.4', sub:'Risk-adjusted', icon:ShieldCheck, tone:'gold' },
];
const dashboardSignals = [
  ['BUY','XAU/USD','London sweep','+$242.64'],
  ['BUY','XAU/USD','NY continuation','+$400.95'],
  ['SELL','XAU/USD','Liquidity grab','+$112.10'],
];
const dashboardSetups = [
  ['Breakout', 82, '+$522.40'],
  ['SMC retest', 74, '+$242.64'],
  ['Impulse chase', 31, '-$35.20'],
];
const reviewScores = [['Entry clarity','9.6',96,'Entry, exit, reason, session, and result stay in one record instead of scattered across screenshots.'],['Gold-trader fit','9.4',94,'The language is XAUUSD first: pips, sessions, broker history, setup notes, and repeat mistakes.'],['Pro timing','9.2',92,'Manual logging keeps the habit honest; Pro sync matters when broker history starts stealing review time.']];
const reviewPoints = ['Built for gold traders with receipts after the move, not for every asset on the planet.','Manual entry is the base habit; MT4/MT5 sync is the Pro upgrade when trade volume grows.','The record keeps the trade, reason, session, P&L, pips, notes, and next rule together.'];
const workflow = [['01','Capture','Add the trade while the chart is still fresh: symbol, session, setup, entry, exit, P&L, and pips.'],['02','Explain','Write why you took it. Screenshot context, risk note, emotion, and rule quality sit beside the trade.'],['03','Read','Compare sessions, setups, pips, win rate, and mistakes without rebuilding the week in a spreadsheet.'],['04','Adjust','Walk into the next gold session with one rule to protect, not a vague promise to do better.']];
const debriefRows = [
  { icon:NotebookPen,title:'Trade facts',body:'The record starts with the details a trader actually checks later: session, setup, result, pips, and notes.' },
  { icon:BarChart3,title:'Session pressure',body:'London, New York, and Asia are separated so the account stops hiding where the damage happens.' },
  { icon:PlugZap,title:'Broker history on Pro',body:'When manual entry becomes busy work, supported MT4/MT5 history can feed the review record.' },
  { icon:ShieldCheck,title:'Private review space',body:'Your mistakes, screenshots, and performance notes stay in a controlled workspace built for repeat use.' },
];
const comparison = [['Before','Screenshot archaeology','Broker history, chart captures, phone notes, and memory all disagree by the time review starts.'],['xaujournal','One after-session record','The trade, reason, session, result, and next rule stay together so the lesson survives the next open.'],['After','A cleaner next entry','You know what to repeat, what to cut, and whether Pro sync is worth paying for.']];
const sectionTitle = '!text-4xl !font-black !leading-tight md:!text-5xl xau-title mt-5';
const spiralChapters = [
  ['01', 'Capture', 'The trade enters the journal before the reason disappears.'],
  ['02', 'Explain', 'Setup, screenshot context, risk, and emotion make the result readable later.'],
  ['03', 'Read', 'Session, pips, P&L, and setup quality show the pattern behind the week.'],
  ['04', 'Adjust', 'The next XAUUSD session starts with one rule backed by evidence.'],
];

function useSpiralStory(rootRef) {
  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined') return undefined;

    let ctx;
    let refreshTimer;
    const initTimer = window.setTimeout(() => {
      if (!rootRef.current) return;

      const mm = gsap.matchMedia(rootRef.current);
      ctx = mm;

      mm.add("(min-width: 980px)", () => {
        const section = rootRef.current.querySelector('.xau-spiral-section');
        const wrapper = rootRef.current.querySelector('.xau-spiral-pin-wrapper');
        const path = rootRef.current.querySelector('#xau-spiral-path');
        const progress = rootRef.current.querySelector('.xau-spiral-progress');
        const marker = rootRef.current.querySelector('.xau-spiral-marker');
        const core = rootRef.current.querySelector('.xau-spiral-core');
        const cards = gsap.utils.toArray('[data-spiral-card]');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!section || !wrapper || !path || !progress || !marker || !core) return;
        if (reduced) return;

        const pathLength = path.getTotalLength();

        // Initial setup
        gsap.set(progress, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.set(marker, { autoAlpha: 1, motionPath: { path, start: 0, end: 0 } });
        gsap.set(core, { y: 0, rotate: 0, scale: 1 });
        gsap.set(cards, { autoAlpha: 0.36, y: 20, scale: 0.96 });
        gsap.set(cards[0], { autoAlpha: 1, y: 0, scale: 1 });

        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 2.6, 2200)}`,
            scrub: 0.9,
            pin: wrapper,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
          },
        });

        tl.to(progress, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
          .to(marker, { motionPath: { path }, duration: 1, ease: 'none' }, 0)
          .to(core, { y: -12, rotate: 1.6, scale: 1.04, duration: 1, ease: 'none' }, 0);

        cards.forEach((card, index) => {
          const at = index / Math.max(cards.length - 1, 1);
          if (index > 0) {
            tl.to(cards[index - 1], { autoAlpha: 0.36, y: -16, scale: 0.96, duration: 0.12, ease: 'power2.out' }, at);
          }
          tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.12, ease: 'power2.out' }, at);
        });

        ScrollTrigger.refresh();
      });

      mm.add("(max-width: 979px)", () => {
        const path = rootRef.current.querySelector('#xau-spiral-path');
        const progress = rootRef.current.querySelector('.xau-spiral-progress');
        const marker = rootRef.current.querySelector('.xau-spiral-marker');
        const core = rootRef.current.querySelector('.xau-spiral-core');
        const cards = gsap.utils.toArray('[data-spiral-card]');

        // Reset properties to default styling on mobile
        if (progress) gsap.set(progress, { clearProps: 'strokeDasharray,strokeDashoffset' });
        if (core) gsap.set(core, { clearProps: 'all' });
        if (cards.length) gsap.set(cards, { clearProps: 'all' });

        if (marker && path) {
          gsap.set(marker, { autoAlpha: 1, motionPath: { path, start: 0, end: 0 } });
        }

        ScrollTrigger.refresh();
      });

      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    }, 420);

    return () => {
      window.clearTimeout(initTimer);
      window.clearTimeout(refreshTimer);
      if (ctx) ctx.revert();
    };
  }, [rootRef]);
}

function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);
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

function DashboardPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <Motion.div
      className="xau-product xau-panel xau-dashboard-preview"
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      aria-label="XAU Journal real dashboard preview"
    >
      <div className="xau-dashboard-topbar">
        <div className="xau-dashboard-topbar-brand">
          <Logo iconSize="w-6 h-6" />
          <div>
            <strong>XAU Journal Dashboard</strong>
            <span>Real app surface preview</span>
          </div>
        </div>
        <SourceBadges />
      </div>

      <div className="xau-dashboard-shell">
        <aside className="xau-dashboard-sidebar" aria-label="Dashboard navigation preview">
          <div className="xau-dashboard-sidebar-head">
            <span>Workspace</span>
            <Activity className="h-4 w-4 text-[var(--xau-green)]" aria-hidden="true" />
          </div>
          <nav className="xau-dashboard-nav" aria-label="App dashboard sections">
            {dashboardNav.map(({ label, icon: Icon, active }) => (
              <div className={`xau-dashboard-nav-item ${active ? 'is-active' : ''}`} key={label}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </nav>
          <div className="xau-dashboard-sync-card">
            <span>Broker terminal</span>
            <strong><span className="h-2 w-2 rounded-full bg-current shadow-[0_0_10px_currentColor]" aria-hidden="true" /> MT5 synced</strong>
          </div>
        </aside>

        <section className="xau-dashboard-main">
          <div className="xau-dashboard-header">
            <div>
              <h2>Dashboard</h2>
              <p>Overview & trade intelligence</p>
            </div>
            <div className="xau-dashboard-actions">
              <span className="xau-market-badge">Markets open</span>
              <span className="xau-new-trade"><Plus className="h-4 w-4" aria-hidden="true" /> New trade</span>
            </div>
          </div>

          <div className="xau-dashboard-stats">
            {dashboardStats.map(({ label, value, sub, icon: Icon, tone }) => (
              <article className={`xau-dash-stat is-${tone}`} key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{sub}</small>
                </div>
                <div className="xau-dash-stat-icon"><Icon className="h-5 w-5" aria-hidden="true" /></div>
              </article>
            ))}
          </div>

          <div className="xau-market-strip" aria-label="Live market widget preview">
            <div className="xau-market-cell"><span>XAU/USD</span><strong>2,389.33</strong></div>
            <div className="xau-market-cell"><span>24H change</span><strong className="xau-good">+14.18</strong></div>
            <div className="xau-market-cell"><span>Trend</span><strong className="xau-good">Uptrend</strong></div>
            <div className="xau-market-cell"><span>Interval</span><strong>1m</strong></div>
          </div>

          <div className="xau-dashboard-grid">
            <article className="xau-dash-panel">
              <div className="xau-dash-panel-head">
                <div><h3>Gold Bias Gauge</h3><p>Live market pressure</p></div>
                <Gauge className="h-5 w-5 text-[var(--xau-warm)]" aria-hidden="true" />
              </div>
              <div className="xau-gauge-wrap">
                <svg viewBox="0 0 200 150" role="img" aria-label="Gold bias gauge showing 72 percent bullish">
                  <defs>
                    <linearGradient id="xauLandingGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--xau-red)" />
                      <stop offset="48%" stopColor="var(--xau-warm)" />
                      <stop offset="100%" stopColor="var(--xau-green)" />
                    </linearGradient>
                  </defs>
                  <path d="M 42 108 A 62 62 0 1 1 158 108" fill="none" stroke="var(--xau-border)" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 42 108 A 62 62 0 1 1 158 108" fill="none" stroke="url(#xauLandingGauge)" strokeWidth="10" strokeLinecap="round" strokeDasharray="260" strokeDashoffset="72" />
                  <line x1="100" y1="78" x2="138" y2="51" stroke="var(--xau-warm)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="78" r="5" fill="var(--xau-surface-solid)" stroke="var(--xau-warm)" strokeWidth="3" />
                  <text x="100" y="114" textAnchor="middle" className="xau-gauge-value">72%</text>
                  <text x="100" y="132" textAnchor="middle" className="xau-gauge-label">Bullish</text>
                </svg>
              </div>
            </article>

            <article className="xau-dash-panel">
              <div className="xau-dash-panel-head">
                <div><h3>Equity Curve</h3><p>Historical performance</p></div>
                <span className="xau-source">30D</span>
              </div>
              <div className="xau-equity-chart">
                <svg viewBox="0 0 620 226" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="xauLandingEquityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--xau-warm)" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="var(--xau-warm)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 190 L78 174 L146 182 L220 130 L302 146 L390 86 L478 108 L620 48 L620 226 L0 226 Z" fill="url(#xauLandingEquityFill)" />
                  <path d="M0 190 L78 174 L146 182 L220 130 L302 146 L390 86 L478 108 L620 48" fill="none" stroke="var(--xau-warm)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <g fill="var(--xau-surface-solid)" stroke="var(--xau-warm)" strokeWidth="3">
                    <circle cx="220" cy="130" r="6" />
                    <circle cx="390" cy="86" r="6" />
                    <circle cx="620" cy="48" r="6" />
                  </g>
                </svg>
              </div>
            </article>
          </div>

          <div className="xau-dashboard-bottom">
            <article className="xau-dash-panel">
              <div className="xau-dash-panel-head"><div><h3>Recent Signals</h3><p>Latest logged trades</p></div></div>
              <div className="xau-signal-list">
                {dashboardSignals.map(([direction, market, setup, pnl]) => (
                  <div className="xau-signal-row" key={`${direction}-${setup}`}>
                    <span className="xau-signal-direction">{direction}</span>
                    <div><strong>{market}</strong><span>{setup}</span></div>
                    <strong className="xau-signal-pnl">{pnl}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="xau-dash-panel">
              <div className="xau-dash-panel-head"><div><h3>Setup Performance</h3><p>Win rate by playbook</p></div></div>
              <div className="xau-setup-list">
                {dashboardSetups.map(([setup, rate, pnl]) => (
                  <div className="xau-setup-row" key={setup}>
                    <div>
                      <strong>{setup}</strong>
                      <span>{rate}% win rate / {pnl}</span>
                    </div>
                    <div className="xau-setup-track" aria-hidden="true"><div className="xau-setup-fill" style={{ width: `${rate}%` }} /></div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </Motion.div>
  );
}
function Hero() {
  const heroMorphTexts = ["the entry.", "the reason.", "the risk.", "the next rule."];

  return (
    <section className="xau-hero" aria-labelledby="landing-hero-heading">
      <div className="xau-shell">
        <div className="xau-hero-copy">
          <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <span className="xau-eyebrow">Gold trading journal</span>
            <h1 id="landing-hero-heading" className="xau-title xau-hero-title mt-6 !text-5xl !font-black !leading-[0.98] sm:!text-6xl md:!text-7xl lg:!text-8xl">
              <span className="xau-hero-lead">Close the gold session</span>
              <span className="xau-hero-lead">with receipts</span>
              <span className="xau-hero-morph" aria-hidden="true">
                <GooeyText
                  texts={heroMorphTexts}
                  morphTime={0.85}
                  cooldownTime={0.42}
                  className="xau-heading-gooey"
                  textClassName="xau-heading-gooey-text"
                />
              </span>
              <span className="sr-only"> by reviewing the entry, the reason, the risk, and the next rule.</span>
            </h1>
            <p className="xau-copy mx-auto mt-6 max-w-3xl text-[18px]">
              xaujournal is a focused review tool for XAUUSD traders. Log the trade, keep the reason, read the session, and use Pro sync when MT4/MT5 history starts taking time from the actual review.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3"><ButtonLink to="/login">Review today's trades</ButtonLink><ButtonLink to="/pricing" secondary>See Pro workflow</ButtonLink></div>
          </Motion.div>
        </div>
        <div className="xau-proof" aria-label="Product highlights">
          {proof.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function SpiralStory() {
  return (
    <section className="xau-spiral-section" aria-labelledby="spiral-story-heading">
      <div className="xau-spiral-shell">
        <div className="xau-spiral-copy">
          <span className="xau-eyebrow">The review loop</span>
          <h2 id="spiral-story-heading" className={sectionTitle}>One gold trade becomes a <span className="xau-ink-highlight">repeatable review loop.</span></h2>
          <p className="xau-copy mt-5">The page follows the same path a disciplined trader needs after market close: record the facts, keep the reason, read the pattern, then decide what the next session must protect.</p>
          <span className="xau-spiral-kicker">Scroll the trade inward</span>
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
              <span className="xau-label">After-session engine</span>
              <h3>The trade becomes a rule.</h3>
              <p>Manual notes, Pro sync, session reads, and screenshots all orbit one habit: review before the next entry.</p>
              <div className="xau-spiral-core-grid">
                <span>Input<strong>XAUUSD</strong></span>
                <span>Output<strong>Next rule</strong></span>
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
          <span className="xau-eyebrow">Why traders stay</span>
          <h2 id="product-review-heading" className={sectionTitle}>The product earns its place after <span className="xau-ink-highlight">a real trading day.</span></h2>
          <p className="xau-copy mt-5">The point is not another dashboard. The point is a calmer next entry because the last trade was actually reviewed.</p>
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
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">After-session ritual</span><h2 id="workflow-heading" className={sectionTitle}>Four passes before the next <span className="xau-ink-highlight">gold entry.</span></h2></Reveal>
        <Reveal className="xau-grid xau-workflow" delay={0.08}>
          {workflow.map(([number, title, body]) => <article className="xau-step" key={number}><span className="xau-num">{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </Reveal>
      </div>
    </section>
  );
}

function DebriefDesk() {
  return (
    <section className="xau-section" aria-labelledby="debrief-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">The debrief desk</span><h2 id="debrief-heading" className={sectionTitle}>What a gold trader needs <span className="xau-ink-highlight">after the chart closes.</span></h2></Reveal>
        <div className="xau-debrief mt-9">
          <Reveal className="xau-debrief-board xau-panel">
            <div>
              <span className="xau-label">After market close</span>
              <strong>Facts first. Story second. Rule last.</strong>
              <p>The page does not sell noise. It sells the after-session discipline that tells a trader what to repeat, what to cut, and when Pro sync is worth paying for.</p>
            </div>
            <div className="mt-7"><ButtonLink to="/pricing" secondary>Check Pro sync</ButtonLink></div>
          </Reveal>
          <div className="xau-debrief-list">
            {debriefRows.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal delay={index * 0.05} key={item.title}>
                  <article className="xau-debrief-item">
                    <span><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <div><h3>{item.title}</h3><p>{item.body}</p></div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
function Comparison() {
  return (
    <section className="xau-section" aria-labelledby="comparison-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">Why it matters</span><h2 id="comparison-heading" className={sectionTitle}>From scattered evidence to <span className="xau-ink-highlight">one next-session rule.</span></h2></Reveal>
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
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">When Pro makes sense</span><h2 id="platform-heading" className={sectionTitle}>Pay for Pro when broker history becomes <span className="xau-ink-highlight">review work.</span></h2><p className="xau-copy mt-5">Manual review stays available from day one. Pro is for the trader who wants supported MT4/MT5 history inside the same review record.</p></Reveal>
        <div className="xau-grid xau-platforms">
          {platforms.map((platform, index) => <Reveal delay={index * 0.06} key={platform.label}><article className="xau-card xau-soft"><div className="xau-platform-head"><img src={platform.src} alt={`${platform.label} icon`} /><h3>{platform.label}</h3></div><p>Bring supported {platform.label} history into the record when the week has too many closed trades to type by hand.</p></article></Reveal>)}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="xau-section" aria-labelledby="faq-heading">
      <div className="xau-shell">
        <Reveal className="max-w-3xl"><span className="xau-eyebrow">Common questions</span><h2 id="faq-heading" className={sectionTitle}>Clear answers before traders <span className="xau-ink-highlight">commit.</span></h2></Reveal>
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
          <span className="xau-eyebrow">Start the next review</span>
          <h2 id="final-cta-heading" className={sectionTitle}>Use the last session to protect <span className="xau-ink-highlight">the next entry.</span></h2>
          <p>Start with manual review. Move to Pro when MT4/MT5 sync saves enough time to make the upgrade obvious.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3"><ButtonLink to="/login">Review today's trades</ButtonLink><ButtonLink to="/pricing" secondary>See Pro plan</ButtonLink></div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { isLightMode } = useAppTheme();
  const rootRef = useRef(null);

  useLandingPageAssets();
  useSmoothScroll();
  useSpiralStory(rootRef);

  return (
    <>
      <PublicNavbar />
      <main ref={rootRef} className="xau-page" style={isLightMode ? themes.light : themes.dark}>
        <Hero />
        <SpiralStory />
        <ProductReview />
        <Workflow />
        <DebriefDesk />
        <Comparison />
        <Platforms />
        <Faq />
        <FinalCta />
        <PublicFooter />
      </main>
    </>
  );
}

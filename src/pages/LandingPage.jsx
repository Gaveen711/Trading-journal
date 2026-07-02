import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import {
  Activity,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Database,
  LineChart,
  LockKeyhole,
  NotebookPen,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import Logo from '../components/Logo';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  LANDING_FAQ,
  buildFAQSchema,
  buildOrganizationSchema,
  buildSoftwareSchema,
  buildWebSiteSchema,
  injectJsonLd,
  removeJsonLd,
} from '../lib/seo';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const LANDING_STYLES = `
  html.lenis,
  html.lenis body {
    height: auto;
  }

  .lenis.lenis-smooth {
    scroll-behavior: auto !important;
  }

  .lenis.lenis-smooth [data-lenis-prevent] {
    overscroll-behavior: contain;
  }

  .lenis.lenis-stopped {
    overflow: hidden;
  }

  .lenis.lenis-scrolling iframe {
    pointer-events: none;
  }

  .xau-landing {
    background:
      radial-gradient(circle at 12% 12%, var(--xau-aurora-a), transparent 32%),
      radial-gradient(circle at 86% 8%, var(--xau-aurora-b), transparent 30%),
      radial-gradient(circle at 50% 90%, var(--xau-aurora-c), transparent 36%),
      var(--xau-bg);
    color: var(--xau-ink);
    font-family: 'Poppins', 'Inter', system-ui, sans-serif;
    position: relative;
    isolation: isolate;
    transition: none;
  }

  .xau-landing > section,
  .xau-landing > footer {
    position: relative;
    z-index: 1;
  }

  .xau-aurora {
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 12% 12%, var(--xau-aurora-a), transparent 32%),
      radial-gradient(circle at 86% 8%, var(--xau-aurora-b), transparent 30%),
      radial-gradient(circle at 50% 90%, var(--xau-aurora-c), transparent 36%);
    background-size: 160% 160%;
    background-position: 20% 12%;
    transition: none;
  }

  .xau-grid {
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(var(--xau-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--xau-grid) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: linear-gradient(to bottom, black, transparent 82%);
  }

  .xau-glass {
    background: var(--xau-glass);
    border: 1px solid var(--xau-border);
    box-shadow: var(--xau-shadow);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .xau-word {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
    padding: 0 0.075em 0.08em 0;
  }

  .xau-word > span {
    display: inline-block;
    transform: translateY(112%) rotate(2deg);
    will-change: transform;
  }

  .xau-hero-title {
    font-family: 'Poppins', 'Inter', system-ui, sans-serif;
    letter-spacing: -0.065em;
    text-wrap: balance;
  }

  .xau-hero-line {
    display: block;
  }

  .xau-hero-line-accent {
    font-style: italic;
    letter-spacing: -0.055em;
  }

  .xau-hero-line-accent .xau-word {
    padding-right: 0.13em;
    padding-bottom: 0.1em;
  }

  .xau-hero-kicker,
  .xau-hero-copy,
  .xau-hero-actions,
  .xau-hero-metrics,
  .xau-hero-visual {
    opacity: 0;
    transform: translateY(22px);
  }

  .xau-gradient-word,
  .xau-word-accent > span {
    display: inline-block;
    background: linear-gradient(90deg, #FF3CAC 0%, #8B5CF6 25%, #00D4FF 50%, #8B5CF6 75%, #FF3CAC 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    animation: xauGradientText 7s linear infinite;
  }

  @keyframes xauGradientText {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .xau-marquee {
    display: flex;
    width: max-content;
    animation: xauMarquee 26s linear infinite;
  }

  @keyframes xauMarquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .xau-story-card {
    opacity: 0.42;
    transform: translateY(18px) scale(0.98);
    transition: opacity 360ms ease, transform 360ms ease, border-color 360ms ease, background 360ms ease;
    will-change: transform, opacity;
  }

  .xau-story-card.is-active {
    opacity: 1;
    border-color: rgba(17, 197, 217, 0.55);
    background: var(--xau-active-glass);
  }

  .xau-story-card.is-active .xau-story-mobile-index {
    color: #11c5d9;
    border-color: rgba(17, 197, 217, 0.45);
    background: rgba(17, 197, 217, 0.12);
  }

  .xau-story-card-stack {
    position: relative;
  }

  .xau-card-motion {
    position: absolute;
    left: clamp(-5.25rem, -6vw, -3rem);
    top: 4rem;
    bottom: 4rem;
    width: 128px;
    height: calc(100% - 8rem);
    overflow: visible;
    color: var(--xau-path-muted);
    pointer-events: none;
    z-index: 0;
  }

  .xau-card-motion-line {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    stroke-dasharray: 8 12;
  }

  .xau-card-motion-progress {
    fill: none;
    stroke: url(#xauCardWaypointGradient);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .xau-card-motion-marker {
    filter: drop-shadow(0 0 18px rgba(6, 182, 212, 0.78));
  }

  .xau-story-card-stack .xau-story-card {
    position: relative;
    z-index: 1;
  }

  .xau-architecture-section {
    position: relative;
    overflow: clip;
    padding: clamp(5rem, 9vw, 8rem) max(1rem, 4vw) clamp(7rem, 12vw, 10rem);
    background:
      radial-gradient(circle at 14% 28%, rgba(168, 85, 247, 0.08), transparent 14rem),
      radial-gradient(circle at 88% 18%, rgba(34, 211, 238, 0.1), transparent 16rem);
    color: var(--xau-ink);
    isolation: isolate;
  }

  .xau-architecture-shell {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
  }

  .xau-architecture-heading {
    max-width: 620px;
    margin: 0 auto clamp(2.5rem, 5vw, 4.25rem);
    text-align: center;
  }

  .xau-architecture-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border-radius: 999px;
    background: var(--xau-soft);
    padding: 0.45rem 0.75rem;
    color: var(--xau-muted);
    font-size: 0.66rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    box-shadow: inset 0 0 0 1px var(--xau-border);
  }

  .xau-architecture-badge::before {
    content: '';
    width: 0.38rem;
    height: 0.38rem;
    border-radius: 999px;
    background: #7c5cff;
    box-shadow: 0 0 14px rgba(124, 92, 255, 0.55);
  }

  .xau-architecture-title {
    margin-top: 1.2rem;
    color: #f15aa5;
    font-size: clamp(2rem, 4vw, 3.5rem) !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: 0 !important;
  }

  .xau-architecture-copy {
    max-width: 560px;
    margin: 1rem auto 0;
    color: var(--xau-muted);
    font-size: clamp(0.95rem, 1.5vw, 1.08rem);
    font-weight: 700;
    line-height: 1.55;
  }

  .xau-architecture-stage {
    position: relative;
    min-height: clamp(760px, 92vw, 1120px);
  }

  .xau-architecture-path {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .xau-architecture-track,
  .xau-architecture-progress {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .xau-architecture-track {
    stroke: rgba(146, 162, 198, 0.23);
    stroke-width: 2;
    stroke-dasharray: 7 13;
  }

  .xau-architecture-progress {
    stroke: url(#xauArchitectureGradient);
    stroke-width: 3.5;
  }

  .xau-architecture-marker {
    filter: drop-shadow(0 0 14px rgba(34, 211, 238, 0.72));
  }

  .xau-architecture-card {
    position: absolute;
    z-index: 2;
    width: min(360px, 36vw);
    min-height: 88px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(39, 201, 231, 0.55);
    border-radius: 0.85rem;
    background: var(--xau-panel);
    color: var(--xau-ink);
    padding: 1rem 1.15rem;
    box-shadow: 0 18px 50px rgba(61, 91, 124, 0.08);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    opacity: 0.2;
    transform: translateY(18px) scale(0.985);
    transition: border-color 260ms ease, box-shadow 260ms ease, opacity 260ms ease, background-color 260ms ease;
    will-change: transform, opacity;
  }

  .xau-architecture-card.is-active {
    opacity: 1;
    background: var(--xau-active-glass);
    border-color: rgba(34, 211, 238, 0.95);
    box-shadow: 0 20px 60px rgba(20, 184, 221, 0.18);
  }

  .xau-architecture-card[data-tone='coral'] {
    border-color: rgba(255, 132, 112, 0.48);
  }

  .xau-architecture-card[data-tone='coral'].is-active {
    border-color: rgba(255, 132, 112, 0.92);
    box-shadow: 0 20px 60px rgba(255, 132, 112, 0.18);
  }

  .xau-architecture-card[data-tone='green'] {
    border-color: rgba(80, 224, 143, 0.52);
  }

  .xau-architecture-card[data-tone='green'].is-active {
    border-color: rgba(80, 224, 143, 0.95);
    box-shadow: 0 20px 60px rgba(80, 224, 143, 0.18);
  }

  .xau-architecture-card[data-tone='violet'] {
    border-color: rgba(168, 85, 247, 0.38);
  }

  .xau-architecture-card[data-tone='violet'].is-active {
    border-color: rgba(168, 85, 247, 0.82);
    box-shadow: 0 20px 60px rgba(168, 85, 247, 0.16);
  }

  .xau-architecture-icon {
    display: inline-flex;
    width: 2.45rem;
    height: 2.45rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.65rem;
    background: rgba(34, 211, 238, 0.11);
    color: #22b8cf;
  }

  .xau-architecture-card[data-tone='coral'] .xau-architecture-icon {
    background: rgba(255, 132, 112, 0.12);
    color: #ff7f67;
  }

  .xau-architecture-card[data-tone='green'] .xau-architecture-icon {
    background: rgba(80, 224, 143, 0.12);
    color: #20b968;
  }

  .xau-architecture-card[data-tone='violet'] .xau-architecture-icon {
    background: rgba(168, 85, 247, 0.11);
    color: #8b5cf6;
  }

  .xau-architecture-card h3 {
    color: var(--xau-ink);
    font-size: clamp(1.08rem, 1.8vw, 1.45rem) !important;
    line-height: 1.08 !important;
    font-weight: 900 !important;
  }

  .xau-architecture-card p {
    margin-top: 0.28rem;
    color: var(--xau-muted);
    font-size: clamp(0.72rem, 1vw, 0.82rem);
    font-weight: 700;
    line-height: 1.35;
  }

  .xau-architecture-card:nth-of-type(1) {
    left: 6%;
    top: 13%;
  }

  .xau-architecture-card:nth-of-type(2) {
    right: 4%;
    top: 33%;
  }

  .xau-architecture-card:nth-of-type(3) {
    left: 6%;
    top: 53%;
  }

  .xau-architecture-card:nth-of-type(4) {
    right: 14%;
    top: 76%;
  }
  .xau-product-card {
    transform-style: preserve-3d;
    will-change: transform;
    backface-visibility: hidden;
  }

  .xau-cinema-pin {
    position: relative;
    min-height: clamp(560px, calc(100dvh - 5rem), 720px);
    overflow: hidden;
  }

  .xau-cinema-track {
    display: flex;
    width: max-content;
    will-change: transform;
    backface-visibility: hidden;
  }

  .xau-cinema-panel {
    min-height: clamp(560px, calc(100dvh - 5rem), 720px);
    width: 100vw;
    flex: 0 0 100vw;
    display: grid;
    place-items: center;
    padding: clamp(5.5rem, 9vh, 7rem) clamp(1rem, 2vw, 1.5rem) clamp(2rem, 4vh, 3.25rem);
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .xau-cinema-card {
    width: min(860px, calc(100vw - 3rem));
    min-height: min(410px, 52vh);
    display: grid;
    grid-template-columns: minmax(0, 0.88fr) minmax(280px, 0.72fr);
    align-items: center;
    gap: clamp(1.5rem, 5vw, 4rem);
    border-radius: 2rem;
    padding: clamp(1.5rem, 4vw, 3.5rem);
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .xau-cinema-visual {
    position: relative;
    aspect-ratio: 1;
    border-radius: 2rem;
    overflow: hidden;
    background:
      radial-gradient(circle at 30% 24%, rgba(17, 197, 217, 0.34), transparent 34%),
      radial-gradient(circle at 72% 76%, rgba(217, 70, 239, 0.24), transparent 36%),
      var(--xau-soft);
    border: 1px solid var(--xau-border);
  }

  .xau-cinema-visual::before,
  .xau-cinema-visual::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    inset: 20%;
    border: 1px solid rgba(17, 197, 217, 0.26);
    transform: rotate(var(--spin, 0deg));
  }

  .xau-cinema-visual::after {
    inset: 34%;
    border-color: rgba(16, 185, 129, 0.28);
    transform: rotate(calc(var(--spin, 0deg) * -1));
  }

  .xau-cinema-orb {
    position: absolute;
    width: 36%;
    aspect-ratio: 1;
    border-radius: 999px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #11c5d9, #d946ef);
    box-shadow: 0 24px 70px rgba(17, 197, 217, 0.35);
  }

  .xau-cinema-markup {
    will-change: transform;
    backface-visibility: hidden;
  }

  @media (max-width: 1023px) {
    .xau-aurora {
      background-size: 120% 120%;
      opacity: 0.78;
    }

    .xau-glass {
      backdrop-filter: blur(12px) saturate(125%);
      -webkit-backdrop-filter: blur(12px) saturate(125%);
    }

    .xau-hero-title {
      letter-spacing: -0.045em;
    }

    .xau-story-card {
      opacity: 1;
      transform: none;
    }

    .xau-story-card.is-active {
      box-shadow: 0 18px 55px rgba(17, 197, 217, 0.16);
    }

    .xau-architecture-section {
      padding: 4.5rem 1rem 5.5rem;
    }

    .xau-architecture-section::before,
    .xau-architecture-section::after {
      display: none;
    }

    .xau-architecture-heading {
      margin-bottom: 2rem;
    }

    .xau-architecture-stage {
      display: grid;
      min-height: auto;
      gap: 2.5rem;
    }

    .xau-architecture-path {
      display: none;
    }

    .xau-architecture-card,
    .xau-architecture-card:nth-of-type(1),
    .xau-architecture-card:nth-of-type(2),
    .xau-architecture-card:nth-of-type(3),
    .xau-architecture-card:nth-of-type(4) {
      position: relative;
      inset: auto;
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
      width: min(100%, 420px);
      margin: 0 auto;
      opacity: 0.58 !important;
      transform: none !important;
      visibility: visible !important;
      transition: opacity 300ms ease, border-color 300ms ease, box-shadow 300ms ease, background-color 300ms ease !important;
    }

    .xau-architecture-card.is-active {
      opacity: 1 !important;
      background: var(--xau-active-glass) !important;
      border-color: rgba(34, 211, 238, 0.95) !important;
      box-shadow: 0 12px 40px rgba(20, 184, 221, 0.22) !important;
    }

    .xau-architecture-card[data-tone='coral'].is-active {
      border-color: rgba(255, 132, 112, 0.95) !important;
      box-shadow: 0 12px 40px rgba(255, 132, 112, 0.22) !important;
    }

    .xau-architecture-card[data-tone='green'].is-active {
      border-color: rgba(80, 224, 143, 0.95) !important;
      box-shadow: 0 12px 40px rgba(80, 224, 143, 0.22) !important;
    }

    .xau-architecture-card[data-tone='violet'].is-active {
      border-color: rgba(168, 85, 247, 0.95) !important;
      box-shadow: 0 12px 40px rgba(168, 85, 247, 0.20) !important;
    }

    .xau-architecture-card::before {
      content: '';
      position: absolute;
      left: 2.2rem;
      top: -2.5rem;
      height: 2.5rem;
      border-left: 1px dashed rgba(146, 162, 198, 0.4);
    }

    .xau-architecture-card:first-of-type::before {
      display: none;
    }

    .xau-waypoints-section {
      padding: 4rem 1rem;
    }

    .xau-waypoint-pin {
      min-height: auto;
      overflow: visible;
    }

    .xau-waypoint-stage {
      display: grid;
      height: auto;
      min-height: auto;
      gap: 1rem;
    }

    .xau-waypoint-heading,
    .xau-waypoint-map,
    .xau-waypoint-card,
    .xau-waypoint-card:nth-of-type(1),
    .xau-waypoint-card:nth-of-type(2),
    .xau-waypoint-card:nth-of-type(3),
    .xau-waypoint-card:nth-of-type(4) {
      position: relative;
      inset: auto;
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
      width: 100%;
      transform: none;
    }

    .xau-waypoint-heading {
      margin-bottom: 1rem;
    }

    .xau-waypoint-map {
      display: grid;
      gap: 1rem;
      opacity: 1;
    }

    .xau-waypoint-path {
      display: none;
    }

    .xau-waypoint-card {
      min-height: auto;
      opacity: 1;
    }

    .xau-cinema-pin {
      overflow: visible;
    }

    .xau-cinema-track {
      display: grid;
      width: auto;
      gap: 1rem;
      padding: 0 1.25rem 3rem;
    }

    .xau-cinema-panel {
      width: auto;
      min-height: auto;
      padding: 0;
      display: block;
      flex-basis: auto;
    }

    .xau-cinema-card {
      min-height: auto;
      grid-template-columns: 1fr;
      border-radius: 1.5rem;
    }

    .xau-cinema-visual {
      min-height: 220px;
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .xau-marquee,
    .xau-gradient-word,
    .xau-word-accent > span {
      animation: none;
    }

    .xau-word > span,
    .xau-hero-kicker,
    .xau-hero-copy,
    .xau-hero-actions,
    .xau-hero-metrics,
    .xau-hero-visual,
    .xau-story-card,
    .xau-waypoint-heading,
    .xau-waypoint-map,
    .xau-waypoint-card,
    .scroll-reveal {
      opacity: 1 !important;
      transform: none !important;
    }

    .xau-architecture-stage {
      min-height: auto;
      display: grid;
      gap: 1rem;
    }

    .xau-architecture-path {
      display: none;
    }

    .xau-architecture-card,
    .xau-architecture-card:nth-of-type(1),
    .xau-architecture-card:nth-of-type(2),
    .xau-architecture-card:nth-of-type(3),
    .xau-architecture-card:nth-of-type(4) {
      position: relative;
      inset: auto;
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
      width: min(100%, 420px);
      margin: 0 auto;
      opacity: 1 !important;
      transform: none !important;
      visibility: visible !important;
    }
    .xau-waypoints-section {
      padding: 4rem 1rem;
    }

    .xau-waypoint-pin {
      min-height: auto;
      overflow: visible;
    }

    .xau-waypoint-stage {
      display: grid;
      height: auto;
      min-height: auto;
      gap: 1rem;
    }

    .xau-waypoint-heading,
    .xau-waypoint-map,
    .xau-waypoint-card,
    .xau-waypoint-card:nth-of-type(1),
    .xau-waypoint-card:nth-of-type(2),
    .xau-waypoint-card:nth-of-type(3),
    .xau-waypoint-card:nth-of-type(4) {
      position: relative;
      inset: auto;
      left: auto;
      right: auto;
      top: auto;
      bottom: auto;
      width: 100%;
    }

    .xau-waypoint-map {
      display: grid;
      gap: 1rem;
    }

    .xau-waypoint-path {
      display: none;
    }
  }

  /* ── Kinetic Neon Parallax Typography ── */
  .xau-kinetic {
    padding: 80px 0;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  .xau-kinetic-left,
  .xau-kinetic-right {
    display: flex;
    white-space: nowrap;
    will-change: transform;
  }
  .xau-kinetic-left span,
  .xau-kinetic-right span {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(60px, 8vw, 100px);
    letter-spacing: -0.02em;
    line-height: 1;
    display: inline-block;
    font-weight: 900;
    margin-right: 60px;
    text-transform: none;
    flex-shrink: 0;
  }
  .xau-kinetic-left span {
    color: transparent;
    -webkit-text-stroke: 1.5px #FE5F00;
    text-shadow: 0 0 15px rgba(254, 95, 0, 0.4), 0 0 30px rgba(254, 95, 0, 0.2);
    filter: drop-shadow(0 0 10px rgba(254, 95, 0, 0.25));
  }
  .xau-kinetic-right span {
    -webkit-text-stroke: 0;
    color: #988F2A;
    opacity: 0.18;
    text-shadow: 0 0 20px rgba(152, 143, 42, 0.6), 0 0 40px rgba(152, 143, 42, 0.3);
  }
`;

const FEATURES = [
  {
    icon: PlugZap,
    title: 'MT4 and MT5 trade sync',
    body: 'Pull closed trades into your journal without typing entries by hand.',
  },
  {
    icon: BarChart3,
    title: 'Performance analytics',
    body: 'Read profit factor, win rate, drawdown, streaks, and setup quality clearly.',
  },
  {
    icon: CalendarDays,
    title: 'P&L calendar',
    body: 'Spot the days, sessions, and routines that are helping or hurting you.',
  },
  {
    icon: NotebookPen,
    title: 'Trade notes',
    body: 'Attach reasons, emotions, screenshots, and setup notes to each trade.',
  },
  {
    icon: ShieldCheck,
    title: 'Private data',
    body: 'Keep account history inside a focused cloud workspace built for review.',
  },
  {
    icon: LineChart,
    title: 'XAUUSD-first metrics',
    body: 'A specialized journal for gold traders, not a generic tracker.',
  },
];

const STORY_STEPS = [
  {
    eyebrow: 'Before the trade',
    title: 'Plan the setup before the chart gets loud.',
    body: 'Write the session, bias, risk, and invalidation before the entry. XAU Journal makes discipline visible before the position is open.',
    metric: 'Risk 0.8%',
    highlight: 'Pre-trade plan',
  },
  {
    eyebrow: 'After execution',
    title: 'Every closed trade becomes clean data.',
    body: 'Sync or log the result with size, entry, exit, fees, session, P&L, screenshots, and notes in one structured record.',
    metric: '+$420',
    highlight: 'Synced from MT5',
  },
  {
    eyebrow: 'During review',
    title: 'Patterns appear without spreadsheet archaeology.',
    body: 'See the sessions, setups, and behaviors that repeat. The story of your trading becomes easier to read and easier to improve.',
    metric: '68%',
    highlight: 'London win rate',
  },
  {
    eyebrow: 'Next session',
    title: 'Trade from a playbook, not from memory.',
    body: 'Turn your best evidence into rules. Keep what works, remove what leaks, and enter the next session with a sharper process.',
    metric: '2.8 PF',
    highlight: 'Playbook edge',
  },
];
const ARCHITECTURE_NODES = [
  {
    icon: Cloud,
    title: 'Mobile Access',
    body: 'Review your journal from any device with a responsive workspace built for fast daily check-ins.',
    tone: 'cyan',
  },
  {
    icon: PlugZap,
    title: 'Broker Agnostic',
    body: 'Connect the workflow around MT4 and MT5 activity without locking your process to one broker.',
    tone: 'coral',
  },
  {
    icon: Database,
    title: 'Automated Sync',
    body: 'Closed trades, session context, and notes flow into one structured record for analysis.',
    tone: 'green',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Review Layer',
    body: 'Private cloud storage keeps trading history organized, searchable, and ready for deeper review.',
    tone: 'violet',
  },
];
const METRICS = [
  { value: 'Precision', label: 'Built specifically for traders' },
  { value: '1', label: 'MT5 sync latency' },
  { value: '100', label: 'Your data, your control' },
];

const MARQUEE = [
  'Sync trades',
  'Review sessions',
  'Track psychology',
  'Find your edge',
  'Build rules',
  'Trade cleaner',
];

const HERO_LINES = [
  { text: 'Every trade' },
  { text: 'you make' },
  { text: 'tells a story.', accent: true, accentWords: ['story.'] },
];

function useLandingMotion(rootRef, setActiveStory) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktopViewport = window.innerWidth >= 1024;
    let mobileScrollCleanup = () => {};
    gsap.ticker.lagSmoothing(1000, 16);

    const lenis = reduceMotion
      ? null
      : new Lenis({
        duration: 1.12,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.08,
        infinite: false,
      });

    let frameId;
    const syncScrollTrigger = () => ScrollTrigger.update();
    if (lenis) {
      const raf = (time) => {
        lenis.raf(time);
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);
      lenis.on('scroll', syncScrollTrigger);
    }

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set('.xau-word > span, .xau-hero-kicker, .xau-hero-copy, .xau-hero-actions, .xau-hero-metrics, .xau-hero-visual, .scroll-reveal', {
          autoAlpha: 1,
          y: 0,
          clearProps: 'transform',
        });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro
        .to('.xau-word > span', {
          y: 0,
          rotate: 0,
          duration: 1.05,
          stagger: 0.06,
        })
        .to(
          '.xau-hero-kicker, .xau-hero-copy, .xau-hero-actions, .xau-hero-metrics, .xau-hero-visual',
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
          },
          '-=0.72'
        );

      gsap.utils.toArray('.scroll-reveal').forEach((item) => {
        const targets = item.querySelectorAll('p, h2, h3, button, .xau-story-mobile-index, .grid > div, .space-y-3 > div');

        if (targets.length > 0) {
          gsap.set(targets, { autoAlpha: 0, y: 24 });

          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        } else {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      if (isDesktopViewport) {
        gsap.to('.xau-aurora', {
          backgroundPosition: '72% 44%',
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.4,
          },
        });
      }

      if (isDesktopViewport) {
        gsap.to('.xau-product-card', {
          y: -36,
          rotateX: 4,
          rotateY: -2,
          ease: 'none',
          scrollTrigger: {
            trigger: '.xau-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      const architectureSection = document.querySelector('.xau-architecture-section');
      const architecturePath = document.querySelector('#xau-architecture-motion-path');
      const architectureMarker = document.querySelector('.xau-architecture-marker');
      const architectureProgress = document.querySelector('.xau-architecture-progress');
      const architectureCards = gsap.utils.toArray('[data-architecture-card]');

      if (architectureSection && architectureCards.length) {
        let activeArchitectureIndex = -1;
        const setArchitectureActive = (activeIndex) => {
          if (activeIndex === activeArchitectureIndex) return;
          activeArchitectureIndex = activeIndex;
          architectureCards.forEach((card, cardIndex) => {
            card.classList.toggle('is-active', cardIndex === activeIndex);
          });
          setActiveStory(activeIndex);
        };

        if (!isDesktopViewport) {
          const handleMobileScroll = () => {
            const viewportCenter = window.innerHeight / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            architectureCards.forEach((card, index) => {
              const rect = card.getBoundingClientRect();
              const cardCenter = rect.top + rect.height / 2;
              const distance = Math.abs(cardCenter - viewportCenter);
              if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
              }
            });
            setArchitectureActive(closestIndex);
          };

          handleMobileScroll();
          window.addEventListener('scroll', handleMobileScroll, { passive: true });
          mobileScrollCleanup = () => {
            window.removeEventListener('scroll', handleMobileScroll);
          };
        }

        if (isDesktopViewport && architecturePath && architectureMarker && architectureProgress) {
          let pathLength = 1000;
          try {
            const totalLen = architectureProgress.getTotalLength();
            if (totalLen > 0) pathLength = totalLen;
          } catch (e) {
            console.warn('Failed to query architecture path length:', e);
          }

          gsap.set(architectureProgress, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });
          gsap.set(architectureMarker, {
            motionPath: {
              path: architecturePath,
              autoRotate: false,
              start: 0,
              end: 0,
            },
          });
          setArchitectureActive(0);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: architectureSection,
              start: 'top 50%',
              end: 'bottom 50%',
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const targetProgressMap = [0.17, 0.37, 0.57, 0.80];
                const progress = self.progress;
                let activeIndex = 0;
                for (let i = 0; i < targetProgressMap.length; i++) {
                  if (progress >= targetProgressMap[i] - 0.10) {
                    activeIndex = i;
                  }
                }
                setArchitectureActive(activeIndex);
              },
            },
          });

          tl.to(
            architectureMarker,
            {
              ease: 'none',
              motionPath: {
                path: architecturePath,
                autoRotate: false,
              },
              duration: 1,
            },
            0
          )
          .to(architectureProgress, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);

          architectureCards.forEach((card, index) => {
            const targetProgressMap = [0.17, 0.37, 0.57, 0.80];
            const targetProgress = targetProgressMap[index];
            
            const duration = 0.04;
            const startProgress = index === 0 ? 0 : Math.max(0, targetProgress - 0.02);
            
            gsap.set(card, { autoAlpha: 0.2, scale: 0.94, y: 12 });
            
            tl.to(
              card,
              {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                ease: 'power3.out',
                duration: duration,
              },
              startProgress
            );
          });
        }
      }

      gsap.utils.toArray('.xau-story-card').forEach((card, index) => {
        const isDesktop = window.innerWidth >= 1024;
        const fromSide = index % 2 === 0 ? (isDesktop ? -120 : -22) : (isDesktop ? 120 : 22);
        const fromY = isDesktop ? 34 : 32;

        gsap.fromTo(
          card,
          {
            autoAlpha: 0,
            x: fromSide,
            y: fromY,
            scale: isDesktop ? 0.94 : 0.97,
            rotateY: isDesktop ? (index % 2 === 0 ? -5 : 5) : 0,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: isDesktop ? 0.95 : 0.75,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: card,
              start: isDesktop ? 'top 82%' : 'top 88%',
              end: isDesktop ? 'top 48%' : 'top 62%',
              scrub: isDesktop ? 0.85 : 0.65,
            },
          }
        );

        ScrollTrigger.create({
          trigger: card,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: () => setActiveStory(index),
          onEnterBack: () => setActiveStory(index),
        });
      });

      gsap.fromTo('.xau-kinetic-left',
        { xPercent: 0 },
        {
          xPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.xau-kinetic',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo('.xau-kinetic-right',
        { xPercent: -20 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.xau-kinetic',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      const cinemaTrack = document.querySelector('.xau-cinema-track');
      const cinemaPin = document.querySelector('.xau-cinema-pin');
      if (cinemaTrack && cinemaPin && window.innerWidth >= 1024) {
        const getDistance = () => {
          const panelCount = cinemaTrack.querySelectorAll('.xau-cinema-panel').length;
          return Math.max(0, window.innerWidth * Math.max(0, panelCount - 1));
        };
        const getScrollDistance = () => getDistance() * 1.35;

        gsap.fromTo(
          '.xau-cinema-card',
          { autoAlpha: 0.96, scale: 0.985 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cinemaPin,
              start: 'top 78%',
              once: true,
            },
          }
        );

        gsap.to(cinemaTrack, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: cinemaPin,
            start: 'top 88px',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 2.25,
            anticipatePin: 0,
            invalidateOnRefresh: true,
          },
        });

        gsap.to('.xau-cinema-visual', {
          '--spin': '180deg',
          ease: 'none',
          scrollTrigger: {
            trigger: cinemaPin,
            start: 'top 88px',
            end: () => `+=${getScrollDistance()}`,
            scrub: 2.25,
          },
        });

        gsap.to('.xau-cinema-orb', {
          x: 72,
          ease: 'none',
          scrollTrigger: {
            trigger: cinemaPin,
            start: 'top 88px',
            end: () => `+=${getScrollDistance()}`,
            scrub: 2.25,
            invalidateOnRefresh: true,
          },
        });

        gsap.to('.xau-cinema-markup', {
          x: -44,
          ease: 'none',
          scrollTrigger: {
            trigger: cinemaPin,
            start: 'top 88px',
            end: () => `+=${getScrollDistance()}`,
            scrub: 2.25,
            invalidateOnRefresh: true,
          },
        });
      }

    }, rootRef);

    const refreshTimers = [
      window.setTimeout(() => ScrollTrigger.refresh(), 120),
      window.setTimeout(() => ScrollTrigger.refresh(), 650),
    ];

    return () => {
      mobileScrollCleanup();
      ctx.revert();
      if (lenis) {
        lenis.off('scroll', syncScrollTrigger);
        lenis.destroy();
      }
      refreshTimers.forEach((timer) => window.clearTimeout(timer));
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [rootRef, setActiveStory]);
}

function PrimaryButton({ children, to = '/login?mode=signup' }) {
  return (
    <Link
      to={to}
      className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#11c5d9] px-6 text-sm font-bold text-[#061013] shadow-[0_18px_50px_rgba(17,197,217,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#42e6ef] active:scale-[0.98]"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function SecondaryButton({ children, href }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
      style={{
        borderColor: 'var(--xau-border)',
        background: 'var(--xau-soft)',
        color: 'var(--xau-ink)',
      }}
    >
      {children}
    </a>
  );
}

function ProductMockup({ activeStory }) {
  const step = STORY_STEPS[activeStory];

  return (
    <div className="xau-product-card relative mx-auto w-full max-w-[650px] [perspective:1200px]">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_25%_20%,rgba(17,197,217,0.30),transparent_34%),radial-gradient(circle_at_84%_55%,rgba(217,70,239,0.22),transparent_32%),radial-gradient(circle_at_55%_100%,rgba(16,185,129,0.20),transparent_34%)] blur-2xl" />
      <div className="xau-glass relative overflow-hidden rounded-[1.75rem] p-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--xau-border)' }}>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Live sync
          </div>
        </div>

        <div className="grid gap-3 pt-4 md:grid-cols-[0.9fr_1.35fr]">
          <div className="space-y-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-panel)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--xau-muted)' }}>Current signal</p>
                <Activity className="h-4 w-4 text-cyan-300" />
              </div>
              <Motion.p
                key={step.metric}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-4 !text-3xl font-black"
              >
                {step.metric}
              </Motion.p>
              <Motion.p
                key={step.highlight}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mt-1 text-xs font-semibold text-emerald-300"
              >
                {step.highlight}
              </Motion.p>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-panel)' }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--xau-muted)' }}>Trade week</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {['Win', 'BE', 'Loss', 'Win', 'Win', 'Loss', 'Win', 'Win'].map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`aspect-square rounded-lg border transition duration-500 ${item === 'Loss'
                      ? 'border-rose-400/35 bg-rose-400/15'
                      : item === 'BE'
                        ? 'border-current bg-current/5'
                        : 'border-emerald-400/35 bg-emerald-400/15'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-deep-panel)' }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Story engine</p>
                <Motion.h3
                  key={step.eyebrow}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-2 !text-lg font-bold text-white"
                >
                  {step.eyebrow}
                </Motion.h3>
              </div>
              <Zap className="h-5 w-5 text-fuchsia-300" />
            </div>

            <div className="space-y-4">
              {['Plan quality', 'Session edge', 'Rule adherence'].map((name, index) => {
                const widths = [
                  [78, 52, 64, 88],
                  [46, 68, 78, 72],
                  [54, 58, 70, 84],
                ];
                const palette = ['bg-cyan-400', 'bg-fuchsia-400', 'bg-emerald-400'];
                return (
                  <div key={name}>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/75">
                      <span>{name}</span>
                      <span>{widths[index][activeStory]}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <Motion.div
                        className={`h-full rounded-full ${palette[index]}`}
                        animate={{ width: `${widths[index][activeStory]}%` }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Motion.div
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
              className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/58">{step.body}</p>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="xau-glass scroll-reveal rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="!text-lg font-bold">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6" style={{ color: 'var(--xau-muted)' }}>{feature.body}</p>
    </div>
  );
}

const getPlatformIconUrl = (domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=96`;

function PlatformBadge({ src, label, status = 'Broker sync ready', comingSoon = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-soft)' }}>
      <img src={src} alt="" className="h-8 w-8 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs" style={{ color: 'var(--xau-muted)' }}>{status}</p>
      </div>
      {comingSoon && (
        <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-300">
          Soon
        </span>
      )}
    </div>
  );
}

export function LandingPage() {
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { isLightMode } = useAppTheme();
  const [activeStory, setActiveStory] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useLandingMotion(rootRef, setActiveStory);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 420);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [signals, setSignals] = useState([
    { symbol: 'XAUUSD', change: 2.45 },
    { symbol: 'XAGUSD', change: 1.85 },
    { symbol: 'XPTUSD', change: -0.45 },
    { symbol: 'XPDUSD', change: -0.92 },
    { symbol: 'NAS100', change: 4.12 },
    { symbol: 'SPX500', change: 1.25 },
    { symbol: 'EURUSD', change: 0.68 },
    { symbol: 'GBPUSD', change: 1.22 },
    { symbol: 'USDJPY', change: -0.35 },
    { symbol: 'BTCUSD', change: -1.12 },
  ]);

  useEffect(() => {
    const fetchSignals = async () => {
      const tickersToFetch = [
        { key: 'XAUUSD', symbol: 'GC=F' },
        { key: 'XAGUSD', symbol: 'SI=F' },
        { key: 'XPTUSD', symbol: 'PL=F' },
        { key: 'XPDUSD', symbol: 'PA=F' },
        { key: 'NAS100', symbol: 'NQ=F' },
        { key: 'SPX500', symbol: 'ES=F' },
        { key: 'EURUSD', symbol: 'EURUSD=X' },
        { key: 'GBPUSD', symbol: 'GBPUSD=X' },
        { key: 'USDJPY', symbol: 'USDJPY=X' },
        { key: 'BTCUSD', symbol: 'BTC-USD' }
      ];

      try {
        const results = await Promise.all(
          tickersToFetch.map(async (t) => {
            try {
              const res = await fetch(`/api/yahoo-chart/${t.symbol}?interval=1d&range=1d`);
              if (res.ok) {
                const data = await res.json();
                const result = data.chart?.result?.[0];
                if (result && result.meta) {
                  const price = Number(result.meta.regularMarketPrice);
                  const prevClose = Number(result.meta.chartPreviousClose);
                  const change = prevClose ? Number((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;
                  return { symbol: t.key, change };
                }
              }
            } catch (err) {
              console.error(`Failed to fetch marquee signal for ${t.key}:`, err);
            }
            return null;
          })
        );

        const validResults = results.filter(r => r !== null);
        if (validResults.length > 0) {
          setSignals(validResults);
        }
      } catch (err) {
        console.error('Failed to fetch marquee signals:', err);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    injectJsonLd('ld-org', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => {
      ['ld-org', 'ld-website', 'ld-software', 'ld-faq'].forEach(removeJsonLd);
    };
  }, []);

  const themeVars = {
    '--xau-bg': isLightMode ? '#f5f8fb' : '#000000',
    '--xau-ink': isLightMode ? '#071013' : '#f7fbff',
    '--xau-muted': isLightMode ? 'rgba(7, 16, 19, 0.74)' : 'rgba(247, 251, 255, 0.70)',
    '--xau-border': isLightMode ? 'rgba(7, 16, 19, 0.14)' : 'rgba(255, 255, 255, 0.10)',
    '--xau-glass': isLightMode ? 'rgba(255, 255, 255, 0.66)' : 'rgba(255, 255, 255, 0.055)',
    '--xau-active-glass': isLightMode ? 'rgba(255, 255, 255, 0.86)' : 'rgba(17, 197, 217, 0.10)',
    '--xau-soft': isLightMode ? 'rgba(7, 16, 19, 0.045)' : 'rgba(255, 255, 255, 0.035)',
    '--xau-panel': isLightMode ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.045)',
    '--xau-deep-panel': isLightMode ? '#ffffff' : '#020204',
    '--xau-grid': isLightMode ? 'rgba(7, 16, 19, 0.045)' : 'rgba(255, 255, 255, 0.025)',
    '--xau-shadow': isLightMode ? '0 24px 80px rgba(7, 16, 19, 0.10)' : '0 24px 80px rgba(0, 0, 0, 0.58)',
    '--xau-path-muted': isLightMode ? 'rgba(7, 16, 19, 0.24)' : 'rgba(247, 251, 255, 0.32)',
    '--xau-aurora-a': isLightMode ? 'rgba(17, 197, 217, 0.18)' : 'rgba(17, 197, 217, 0.11)',
    '--xau-aurora-b': isLightMode ? 'rgba(217, 70, 239, 0.12)' : 'rgba(139, 92, 246, 0.10)',
    '--xau-aurora-c': isLightMode ? 'rgba(16, 185, 129, 0.10)' : 'rgba(16, 185, 129, 0.055)',
  };

  return (
    <main ref={rootRef} className="xau-landing min-h-screen overflow-hidden font-sans selection:bg-cyan-300/20" style={themeVars}>
      <style>{LANDING_STYLES}</style>
      <PublicNavbar />

      <div className="xau-aurora fixed inset-0" aria-hidden="true" />
      <div className="xau-grid fixed inset-0" aria-hidden="true" />

      <section className="xau-hero relative px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <div className="xau-hero-kicker inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              XAUUSD trading journal
            </div>

            <h1 className="xau-hero-title mt-7 max-w-4xl !text-[clamp(2.65rem,8.5vw,7rem)] font-black !leading-[0.98] sm:!leading-[0.96]">
              {HERO_LINES.map((line) => (
                <span key={line.text} className={`xau-hero-line ${line.accent ? 'xau-hero-line-accent' : ''}`}>
                  {line.text.split(' ').map((word, index) => (
                    <span
                      key={`${line.text}-${word}-${index}`}
                      className={`xau-word mr-[0.18em] ${line.accentWords?.includes(word) ? 'xau-word-accent' : ''}`}
                    >
                      <span>{word}</span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="xau-hero-copy mt-7 max-w-2xl text-base font-medium leading-8 md:text-lg" style={{ color: 'var(--xau-muted)' }}>
              Every trade you make tells a story. XAU Journal captures it, analyses it, and turns raw execution into
              actionable intelligence.
            </p>

            <div className="xau-hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton>Start journaling</PrimaryButton>
              <SecondaryButton href="#features">See Features</SecondaryButton>
            </div>

            <div className="xau-hero-metrics mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {METRICS.map((item) => (
                <div key={item.label} className="xau-glass rounded-2xl p-4">
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--xau-muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xau-hero-visual">
            <ProductMockup activeStory={activeStory} />
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: 'var(--xau-soft)' }} aria-hidden="true">
        <div className="xau-marquee">
          {signals.concat(signals).concat(signals).map((sig, i) => (
            <span key={i} className="mx-8 text-xs font-black uppercase tracking-[0.22em] inline-flex items-center" style={{ color: 'var(--xau-muted)' }}>
              <span className="mr-2" style={{ color: 'var(--xau-ink)' }}>{sig.symbol}</span>
              <span className={sig.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {sig.change >= 0 ? '+' : ''}{sig.change.toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <div className="xau-glass scroll-reveal rounded-[1.75rem] p-6 md:p-8">
            <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-400/10 text-fuchsia-400 ring-1 ring-fuchsia-300/20">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="!text-3xl font-black !leading-tight md:!text-4xl">A tool, not a <span className="xau-gradient-word">template.</span></h2>
                <p className="mt-4 text-sm font-medium leading-7" style={{ color: 'var(--xau-muted)' }}>
                  Spreadsheets record what happened. XAU Journal turns your history into a review system:
                  synced trades, structured notes, session stats, calendar heat, and decision patterns in one place.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Trade importer', 'Session breakdowns', 'Risk review', 'Private vault'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-soft)' }}>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xau-glass scroll-reveal rounded-[1.75rem] p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--xau-muted)' }}>Connected platforms</p>
            <div className="mt-5 space-y-3">
              <PlatformBadge src="/mt4.svg" label="MetaTrader 4" status="Live sync ready" />
              <PlatformBadge src="/mt5.svg" label="MetaTrader 5" status="Live sync ready" />
              <PlatformBadge src={getPlatformIconUrl('binance.com')} label="Binance" status="Coming soon" comingSoon />
              <PlatformBadge src={getPlatformIconUrl('bybit.com')} label="Bybit" status="Coming soon" comingSoon />
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="xau-architecture-section" aria-labelledby="architecture-heading">
        <div className="xau-architecture-shell">
          <div className="xau-architecture-heading">
            <span className="xau-architecture-badge">Architecture</span>
            <h2 id="architecture-heading" className="xau-architecture-title">Built for <span className="xau-gradient-word">Scale</span></h2>
            <p className="xau-architecture-copy">
              An institutional-grade pipeline keeps every data layer synced, secured, and ready for analysis.
            </p>
          </div>

          <div className="xau-architecture-stage" aria-label="XAU Journal architecture path">
            <svg className="xau-architecture-path" viewBox="0 0 1000 1120" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="xauArchitectureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c7d9" />
                  <stop offset="38%" stopColor="#ff754f" />
                  <stop offset="68%" stopColor="#52c75b" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                id="xau-architecture-motion-path"
                className="xau-architecture-track"
                d="M410 42 C310 82 255 118 246 192 C228 338 670 300 708 414 C752 548 254 506 232 636 C200 812 706 748 682 902 C668 994 608 1030 604 1100"
              />
              <path
                className="xau-architecture-progress"
                d="M410 42 C310 82 255 118 246 192 C228 338 670 300 708 414 C752 548 254 506 232 636 C200 812 706 748 682 902 C668 994 608 1030 604 1100"
              />
              <g className="xau-architecture-marker">
                <circle cx="0" cy="0" r="9" fill="#ffffff" stroke="#22c7d9" strokeWidth="3" />
                <circle cx="0" cy="0" r="3.5" fill="#52c75b" />
              </g>
            </svg>

            {ARCHITECTURE_NODES.map((node, index) => {
              const Icon = node.icon;
              return (
                <article
                  key={node.title}
                  data-architecture-card
                  data-tone={node.tone}
                  className={`xau-architecture-card ${activeStory === index ? 'is-active' : ''}`}
                >
                  <span className="xau-architecture-icon" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>{node.title}</h3>
                    <p>{node.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="xau-cinema-section relative z-[1] py-16 md:py-24">
        <div className="scroll-reveal mx-auto mb-10 max-w-7xl px-5 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-400"></p>
          <h2 className="mt-4 max-w-3xl !text-4xl font-black !leading-tight md:!text-6xl">
            Your trading review, told as a moving <span className="xau-gradient-word">system.</span>
          </h2>
        </div>

        <div className="xau-cinema-pin">
          <div className="xau-cinema-track">
            {STORY_STEPS.map((step, index) => (
              <article className="xau-cinema-panel" key={`cinema-${step.eyebrow}`}>
                <div className="xau-cinema-card xau-glass">
                  <div>
                    <div className="inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em]" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-soft)' }}>
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(17,197,217,0.8)]" />
                      Chapter 0{index + 1}
                    </div>
                    <h3 className="mt-8 !text-4xl font-black !leading-tight md:!text-6xl">{step.title}</h3>
                    <p className="mt-6 max-w-xl text-base font-medium leading-8 md:text-lg" style={{ color: 'var(--xau-muted)' }}>
                      {step.body}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-300">{step.metric}</span>
                      <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-400">{step.highlight}</span>
                    </div>
                  </div>

                  <div className="xau-cinema-visual">
                    <div className="xau-cinema-orb" />
                    <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/12 bg-[#081013]/80 p-4 text-white shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">{step.eyebrow}</p>
                      <p className="mt-2 text-sm font-bold text-white">{step.highlight}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="xau-cinema-progress"><span /></div>
        </div>
      </section>

      <section className="xau-kinetic overflow-hidden" aria-hidden="true">
        <div className="xau-kinetic-left whitespace-nowrap">
          {["XAU/USD", "XAUUSD", "Gold", "XAU/USD", "XAUUSD", "Gold", "XAU/USD", "XAUUSD", "Gold", "XAU/USD", "XAUUSD", "Gold"].map((txt, i) => (
            <span key={i}>{txt}</span>
          ))}
        </div>
        <div className="xau-kinetic-right whitespace-nowrap mt-4">
          {["Journal", "Analyze", "Improve", "Journal", "Analyze", "Improve", "Journal", "Analyze", "Improve", "Journal", "Analyze", "Improve"].map((txt, i) => (
            <span key={i}>{txt}</span>
          ))}
        </div>
      </section>

      <section id="features" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-400">What users understand fast</p>
            <h2 className="mt-4 !text-4xl font-black !leading-tight md:!text-5xl">Everything needed for disciplined <span className="xau-gradient-word">review.</span></h2>
            <p className="mt-5 text-base font-medium leading-7" style={{ color: 'var(--xau-muted)' }}>
              Minimal on the surface, serious underneath. New users can tell what the tool does before they ever sign in.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="scroll-reveal">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-400">Security and clarity</p>
            <h2 className="mt-4 !text-4xl font-black !leading-tight md:!text-5xl">Built for private, focused <span className="xau-gradient-word">review.</span></h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7" style={{ color: 'var(--xau-muted)' }}>
              Your trading data is sensitive. XAU Journal keeps the experience calm and understandable while giving you the depth needed to inspect your decisions.
            </p>
          </div>

          <div className="xau-glass scroll-reveal rounded-[1.75rem] p-6">
            <div className="grid gap-3">
              {[
                { icon: LockKeyhole, label: 'Private journal workspace' },
                { icon: Cloud, label: 'Cloud-backed review history' },
                { icon: ShieldCheck, label: 'Secure broker connection flow' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4 rounded-2xl border p-4" style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-soft)' }}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-12 md:px-8 md:pb-32">
        <div className="xau-glass scroll-reveal mx-auto max-w-6xl rounded-[2rem] p-8 text-center md:p-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/20">
            <Logo onlyIcon iconSize="h-8 w-8" />
          </div>
          <h2 className="mx-auto max-w-3xl !text-4xl font-black !leading-tight md:!text-5xl">Start with your next <span className="xau-gradient-word">trade.</span></h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7" style={{ color: 'var(--xau-muted)' }}>
            Create a clear record, sync when you are ready, and let your review process show you what to keep, fix, and stop repeating.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton>Open XAU Journal</PrimaryButton>
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-soft)', color: 'var(--xau-ink)' }}
            >
              View pricing
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />

      <Motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 18, scale: isScrolled ? 1 : 0.96 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className={`fixed bottom-6 right-6 z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition duration-300 hover:-translate-y-1 active:scale-95 ${isScrolled ? '' : 'pointer-events-none'}`}
        style={{ borderColor: 'var(--xau-border)', background: 'var(--xau-glass)', color: 'var(--xau-ink)', boxShadow: 'var(--xau-shadow)' }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </Motion.button>
    </main>
  );
}

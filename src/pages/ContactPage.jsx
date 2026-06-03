import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill, Facebook, Instagram, TwitterX, Discord } from 'react-bootstrap-icons';
import Logo from '../components/Logo';

export function ContactPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { isLightMode, toggleTheme } = useAppTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        window.scrollTo(0, 0);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            lenis.destroy();
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setStatus('sending');
        // Simulate send
        await new Promise(r => setTimeout(r, 1400));
        setStatus('sent');
    };

    const handleEmailClick = (event) => {
        event.preventDefault();
        const email = 'info@xaujournal.com';
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
        const newWindow = window.open(gmailUrl, '_blank');

        if (!newWindow) {
            window.location.href = `mailto:${email}`;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    };

    const navLinks = [
        { to: '/#features', label: 'How it works' },
        { to: '/the-story', label: 'The Story' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/contact', label: 'Contact' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] opacity-60 mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[100px] opacity-40 mix-blend-screen" />
            </div>

            <header>
                <nav
                    style={{ transform: 'translateX(-50%)' }}
                    className={`fixed top-4 left-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] h-16 flex items-center justify-between px-6 md:px-10 rounded-2xl md:rounded-full border transition-all duration-300 ease-in-out ${
                        isScrolled
                            ? 'bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl'
                            : 'bg-card/75 backdrop-blur-md border-border/20 shadow-lg'
                    }`}
                >
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]">
                        <Logo iconSize="w-7 h-7" />
                    </button>

                    <ul className="hidden lg:flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
                        {navLinks.map(({ to, label }) => (
                            <Motion.li 
                                key={to}
                                whileHover={{ scale: 1.05, y: -2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <NavLink
                                    to={to}
                                    className="text-sm font-medium px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all"
                                >
                                    {label}
                                </NavLink>
                            </Motion.li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-3 z-[101]">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full border border-border/40 hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
                            aria-label="Toggle theme"
                        >
                            {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
                        </button>
                        <div className="hidden lg:block">
                            <button
                                onClick={() => navigate('/login')}
                                className="cta active:scale-95 transition-all duration-300"
                            >
                                <span>Get Started</span>
                                <svg width="15px" height="10px" viewBox="0 0 13 10">
                                    <path d="M1,5 L11,5" />
                                    <polyline points="8 1 12 5 8 9" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-foreground"
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </nav>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <Motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {/* Close Button on Top Right */}
                            <button 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="absolute top-6 right-6 p-2 text-foreground/80 hover:text-foreground transition-colors z-[102]"
                                aria-label="Close menu"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex flex-col items-center justify-center gap-8" onClick={(e) => e.stopPropagation()}>
                                {navLinks.map(({ to, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-3xl font-bold tracking-tight hover:text-primary transition-colors"
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                                <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300 w-full max-w-[280px]">
                                  <span>Get started</span>
                                  <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
                                </button>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="relative z-10 px-6 pt-32 pb-24 md:pt-40 md:pb-40 max-w-7xl mx-auto min-h-screen">
                <Motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
                >

                    <Motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
                        Get in <span className="text-primary">touch</span>
                    </Motion.h1>
                    <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                        Questions, feedback, or a bug to report? We read every message and reply within one business day.
                    </Motion.p>
                </Motion.div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24">
                    <Motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                        <div className="mb-16">
                            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Direct contact</p>
                            <a
                                href="mailto:info@xaujournal.com"
                                onClick={handleEmailClick}
                                className="text-2xl md:text-3xl font-bold hover:text-primary transition-colors duration-300"
                            >
                                info@xaujournal.com
                            </a>
                            <p className="text-sm text-muted-foreground mt-3 font-medium">Global support available Mon-Fri.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Bug reports', desc: 'Found something broken? Include your browser details and steps to reproduce.' },
                                { label: 'Feature requests', desc: 'We actively shape our roadmap based on real trader feedback.' },
                                { label: 'Billing & account', desc: 'Need help with subscriptions, invoices, or account management?' },
                            ].map((item, i) => (
                                <Motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                                    className="p-8 rounded-3xl border border-border/40 bg-muted/5 backdrop-blur-md group hover:bg-muted/10 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-500"
                                >
                                    <p className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{item.label}</p>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                                </Motion.div>
                            ))}
                        </div>
                    </Motion.div>

                    <Motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                        {status === 'sent' ? (
                            <Motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-12 rounded-[2.5rem] border border-primary/20 bg-primary/5 backdrop-blur-md text-center shadow-2xl shadow-primary/5 h-full flex flex-col items-center justify-center"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-inner">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-4">Message sent!</h2>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-sm">
                                    Thanks for reaching out. We'll get back to you at <span className="text-foreground font-bold">{form.email}</span> soon.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-10 text-sm font-bold text-primary hover:underline"
                                >
                                    Send another message
                                </button>
                            </Motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-8 md:p-12 rounded-[2.5rem] border border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl shadow-foreground/5 relative overflow-hidden">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[0.7rem] font-black tracking-[0.2em] uppercase text-muted-foreground/80 ml-1">Name</label>
                                        <input value={form.name} onChange={set('name')} required placeholder="John Doe" className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[0.7rem] font-black tracking-[0.2em] uppercase text-muted-foreground/80 ml-1">Email</label>
                                        <input type="email" value={form.email} onChange={set('email')} required placeholder="john@example.com" className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[0.7rem] font-black tracking-[0.2em] uppercase text-muted-foreground/80 ml-1">Subject</label>
                                    <input value={form.subject} onChange={set('subject')} placeholder="How can we help?" className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[0.7rem] font-black tracking-[0.2em] uppercase text-muted-foreground/80 ml-1">Message</label>
                                    <textarea value={form.message} onChange={set('message')} required rows={5} placeholder="Your message here..." className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" />
                                </div>
                                <button type="submit" disabled={status === 'sending'} className="btn-contact-send disabled:opacity-70 disabled:cursor-wait">
                                    {status === 'sending' ? (
                                        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <div className="svg-wrapper-1">
                                                <div className="svg-wrapper">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                                                        <path fill="none" d="M0 0h24v24H0z" />
                                                        <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span>Send message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </Motion.div>
                </div>
            </main>

            <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-start">
                            <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                            <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                            <NavLink to="/the-story" className="hover:text-primary transition-colors">The Story</NavLink>
                            <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center md:text-left">
                            © Copyright 2026 Xau Journal.<br />All Rights Reserved.
                        </p>
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <ul className="example-2">
                                <li className="icon-content"><a data-social="facebook" aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><div className="filled" /><Facebook /></a></li>
                                <li className="icon-content"><a data-social="instagram" aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><div className="filled" /><Instagram /></a></li>
                                <li className="icon-content"><a data-social="x" aria-label="X" href="https://x.com/xau_journal" target="_blank" rel="noopener noreferrer"><div className="filled" /><TwitterX /></a></li>
                                <li className="icon-content"><a data-social="discord" aria-label="Discord" href="https://discord.gg/smbNwBZC2" target="_blank" rel="noopener noreferrer"><div className="filled" /><Discord /></a></li>
                            </ul>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
                                made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 text-primary shadow-xl transition-all duration-500 hover:-translate-y-2 active:scale-90 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
                aria-label="Scroll to top"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
            </button>
        </div>
    );
}



import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    };

    const navLinks = [
        { to: '/', label: 'Home' },
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
                    className={`fixed top-0 left-0 right-0 z-[100] h-16 md:h-20 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ease-in-out ${
                        isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm' : 'bg-transparent border-transparent'
                    }`}
                >
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]">
                        <span className="text-xl font-bold tracking-tighter">xaujournal</span>
                    </button>

                    <ul className="hidden md:flex items-center gap-2">
                        {navLinks.map(({ to, label }) => (
                            <li key={to}>
                                <NavLink 
                                    to={to} 
                                    className="text-sm font-medium px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                >
                                    {label}
                                </NavLink>
                            </li>
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
                        <button 
                            onClick={() => navigate('/login')} 
                            className="hidden sm:block px-6 py-2 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            Get started
                        </button>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                            className="md:hidden p-2 text-foreground"
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
                            </svg>
                        </button>
                    </div>

                    <motion.div 
                        initial={false}
                        animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : -20 }}
                        className={`md:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    >
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
                        <button 
                            onClick={() => navigate('/login')} 
                            className="mt-4 px-10 py-4 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
                        >
                            Get started
                        </button>
                    </motion.div>
                </nav>
            </header>

            <main className="relative z-10 px-6 pt-32 pb-24 md:pt-40 md:pb-40 max-w-7xl mx-auto min-h-screen">
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible" 
                    className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
                >
                    <motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
                        Support & Feedback
                    </motion.span>
                    <motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
                        Get in <span className="text-primary">touch</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                        Questions, feedback, or a bug to report? We read every message and reply within one business day.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                        <div className="mb-16">
                            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">Direct contact</p>
                            <a href="mailto:support@xaujournal.com" className="text-2xl md:text-3xl font-bold hover:text-primary transition-colors duration-300">
                                support@xaujournal.com
                            </a>
                            <p className="text-sm text-muted-foreground mt-3 font-medium">Global support available Mon-Fri.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Bug reports', desc: 'Found something broken? Include your browser details and steps to reproduce.' },
                                { label: 'Feature requests', desc: 'We actively shape our roadmap based on real trader feedback.' },
                                { label: 'Billing & account', desc: 'Need help with subscriptions, invoices, or account management?' },
                            ].map((item, i) => (
                                <motion.div 
                                    key={item.label} 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + (i*0.1) }}
                                    className="p-8 rounded-3xl border border-border/40 bg-muted/5 backdrop-blur-sm group hover:bg-muted/10 transition-colors"
                                >
                                    <p className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{item.label}</p>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                        {status === 'sent' ? (
                            <motion.div 
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
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 p-8 md:p-12 rounded-[2.5rem] border border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl shadow-foreground/5 relative overflow-hidden">
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
                                <button type="submit" disabled={status === 'sending'} className={`w-full py-5 rounded-2xl bg-foreground text-background font-bold tracking-wide transition-all shadow-xl shadow-foreground/10 active:scale-95 flex items-center justify-center gap-3 group ${status === 'sending' ? 'opacity-70 cursor-wait' : 'hover:bg-foreground/90 hover:-translate-y-1'}`}>
                                    {status === 'sending' ? (
                                        <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send message
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </main>

            <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <span className="text-2xl font-bold tracking-tighter">xaujournal</span>
                            <p className="text-sm text-muted-foreground font-medium max-w-xs text-center md:text-left">
                                Here to support your trading journey every step of the way.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end gap-6">
                            <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-end">
                                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                                <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-2 text-center md:text-right">
                                © {new Date().getFullYear()} <span className="animate-rgb">-xaujournal-</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 text-primary shadow-xl transition-all duration-500 hover:-translate-y-2 active:scale-90 ${
                    isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                aria-label="Scroll to top"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
        </div>
    );
}
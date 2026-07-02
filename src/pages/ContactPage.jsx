import { useState, useEffect } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import {
    ArrowUp,
    Bug,
    Clock3,
    CreditCard,
    Mail,
    MessageCircle,
    PlugZap,
    ShieldCheck,
} from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';

const CONTACT_METHODS = [
    {
        icon: Mail,
        label: 'Email',
        value: 'info@xaujournal.com',
        helper: 'Best for account, billing, and product questions.',
        href: 'mailto:info@xaujournal.com',
    },
    {
        icon: Clock3,
        label: 'Response time',
        value: 'Within 1 business day',
        helper: 'Monday to Friday support for traders worldwide.',
    },
    {
        icon: MessageCircle,
        label: 'Community',
        value: 'Discord feedback channel',
        helper: 'Share ideas, report issues, and follow product updates.',
        href: 'https://discord.gg/smbNwBZC2',
    },
];


const SUPPORT_TOPICS = [
    {
        icon: Bug,
        label: 'Bug reports',
        detail: 'Include the page, browser, device, and the steps that caused the issue.',
    },
    {
        icon: PlugZap,
        label: 'Broker sync help',
        detail: 'Ask about Meta API, MT4/MT5 sync, connection status, or missing trade imports.',
    },
    {
        icon: CreditCard,
        label: 'Billing and account',
        detail: 'Get help with Pro access, invoices, cancellation, refunds, or account changes.',
    },
    {
        icon: ShieldCheck,
        label: 'Privacy requests',
        detail: 'Request data deletion, security clarification, or account-level privacy support.',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};

export function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [sentEmail, setSentEmail] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        let rafId = 0;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
        document.body.style.overflow = '';
        window.scrollTo(0, 0);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            lenis.destroy();
            cancelAnimationFrame(rafId);
            document.body.style.overflow = '';
        };
    }, []);

    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setStatus('sending');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message.');
            }

            setSentEmail(form.email);
            setStatus('sent');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased aurora-theme public-aurora-page">
            <div className="grain-overlay" aria-hidden="true" />
            <PublicNavbar />

            <main className="relative z-10 px-5 sm:px-6 pt-32 pb-24 md:pt-40 md:pb-32 max-w-7xl mx-auto">
                <Motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-12 lg:gap-16 items-start"
                >
                    <div className="lg:sticky lg:top-28">
                        <Motion.p variants={itemVariants} className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-primary">
                            Contact XAU Journal
                        </Motion.p>
                        <Motion.h1 variants={itemVariants} className="text-[clamp(2.7rem,7vw,5.9rem)] font-black leading-[0.98] tracking-tight text-balance">
                            Reach the team behind <span className="aurora-text">the journal.</span>
                        </Motion.h1>
                        <Motion.p variants={itemVariants} className="mt-7 max-w-2xl text-base md:text-lg text-muted-foreground font-semibold leading-relaxed">
                            Questions about Pro, broker sync, billing, privacy, or a bug you found? Send the details once and we will route it to the right place.
                        </Motion.p>

                        <Motion.ul variants={itemVariants} className="mt-10 border-y border-border/70 divide-y divide-border/70">
                            {CONTACT_METHODS.map(({ icon: Icon, label, value, helper, href }) => {
                                const content = (
                                    <>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                                            <Icon size={18} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
                                            <span className="mt-1 block text-base md:text-lg font-black text-foreground break-words">{value}</span>
                                            <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground font-medium">{helper}</span>
                                        </span>
                                    </>
                                );

                                return (
                                    <li key={label}>
                                        {href ? (
                                            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex gap-4 py-5 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl">
                                                {content}
                                            </a>
                                        ) : (
                                            <div className="flex gap-4 py-5">{content}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </Motion.ul>
                    </div>

                    <Motion.div variants={itemVariants}>
                        <AnimatePresence mode="wait">
                            {status === 'sent' ? (
                                <Motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.32 }}
                                    className="rounded-[2rem] border border-primary/25 bg-card/55 p-6 sm:p-8 md:p-10 text-center shadow-2xl shadow-primary/5"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <ShieldCheck size={25} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">Message sent</h2>
                                    <p className="mx-auto mt-4 max-w-md text-sm md:text-base text-muted-foreground font-semibold leading-relaxed">
                                        Thanks for reaching out. We will reply to {sentEmail ? <span className="text-foreground font-black">{sentEmail}</span> : 'your email'} as soon as possible.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="btn-contact-send mt-9"
                                    >
                                        <div className="svg-wrapper-1">
                                            <div className="svg-wrapper">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                                                    <path fill="none" d="M0 0h24v24H0z" />
                                                    <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span>Send another</span>
                                    </button>
                                </Motion.div>
                            ) : (
                                <Motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.32 }}
                                    className="rounded-[2rem] border border-border/45 bg-card/55 backdrop-blur-xl p-5 sm:p-7 md:p-9 shadow-2xl shadow-foreground/5"
                                >
                                    <div className="mb-8">
                                        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Send a message</p>
                                        <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">Tell us what you need.</h2>
                                        <p className="mt-3 text-sm text-muted-foreground font-semibold leading-relaxed">
                                            The more context you include, the faster we can help.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Name" required>
                                            <input value={form.name} onChange={set('name')} required autoComplete="name" placeholder="Your name" className="contact-field" />
                                        </Field>
                                        <Field label="Email" required>
                                            <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" className="contact-field" />
                                        </Field>
                                    </div>

                                    <div className="mt-5">
                                        <Field label="Subject">
                                            <input value={form.subject} onChange={set('subject')} placeholder="Broker sync, billing, bug report..." className="contact-field" />
                                        </Field>
                                    </div>

                                    <div className="mt-5">
                                        <Field label="Message" required>
                                            <textarea value={form.message} onChange={set('message')} required rows={6} placeholder="Share the account email, page, issue, or question we should look at." className="contact-field resize-none" />
                                        </Field>
                                    </div>

                                    {status === 'error' && (
                                        <div className="mt-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500" role="alert">
                                            Failed to send message. Please try again or email info@xaujournal.com directly.
                                        </div>
                                    )}

                                    <button type="submit" disabled={status === 'sending'} className="btn-contact-send mt-7 disabled:opacity-70 disabled:cursor-wait">
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
                                </Motion.form>
                            )}
                        </AnimatePresence>
                    </Motion.div>
                </Motion.section>

                <Motion.section
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-20 md:mt-28 max-w-6xl"
                    aria-labelledby="contact-help-heading"
                >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary mb-4">What to include</p>
                    <h2 id="contact-help-heading" className="max-w-3xl text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
                        Better details create <span className="aurora-text">faster answers.</span>
                    </h2>
                    <ul className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-x-10 border-y border-border/70 divide-y divide-border/70 md:divide-y-0">
                        {SUPPORT_TOPICS.map(({ icon: Icon, label, detail }) => (
                            <li key={label} className="flex gap-4 py-5 md:border-b md:border-border/70 md:last:border-b-0 md:[&:nth-last-child(2)]:border-b-0">
                                <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                                <span>
                                    <span className="flex items-center gap-2 text-base font-black tracking-tight">
                                        <Icon size={17} className="text-primary" />
                                        {label}
                                    </span>
                                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground font-medium">{detail}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </Motion.section>
            </main>

            <PublicFooter />

            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-6 right-6 z-[90] h-12 w-12 rounded-2xl bg-background/90 backdrop-blur-md text-primary shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}
                aria-label="Scroll to top"
            >
                <ArrowUp size={20} className="mx-auto" />
            </button>
        </div>
    );
}

function Field({ label, required = false, children }) {
    return (
        <label className="block space-y-2">
            <span className="block text-[0.7rem] font-black tracking-[0.2em] uppercase text-muted-foreground">
                {label}{required ? <span className="text-primary"> *</span> : null}
            </span>
            {children}
        </label>
    );
}

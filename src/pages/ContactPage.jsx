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
import { BentoBackground, BentoCard, BentoGrid } from '../components/ui/bento-grid';

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


const SUPPORT_BENTO_COLORS = [
    ['#C95B3C', '#B08A5A'],
    ['#D49224', '#14B8A6'],
    ['#B08A5A', '#0F9F8A'],
    ['#14B8A6', '#C95B3C'],
];

const SUPPORT_TOPIC_LINKS = [
    'mailto:info@xaujournal.com?subject=Bug%20report',
    'mailto:info@xaujournal.com?subject=Broker%20sync%20help',
    'mailto:info@xaujournal.com?subject=Billing%20and%20account%20help',
    '/privacy',
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

    useEffect(() => {

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

        return () => {
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
                                            <div className="flex gap-4 py-5 transition-colors hover:text-primary cursor-pointer rounded-2xl">{content}</div>
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

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className={`btn-contact-send mt-7 ${status === 'sending' ? 'sending' : ''}`}
                                    >
                                        <div className="outline" />
                                        <div className="state state--default">
                                            <div className="icon">
                                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g style={{ filter: 'url(#shadow)' }}>
                                                        <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor" />
                                                        <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor" />
                                                    </g>
                                                    <defs>
                                                        <filter id="shadow">
                                                            <feDropShadow dx={0} dy={1} stdDeviation="0.6" floodOpacity="0.5" />
                                                        </filter>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <p>
                                                <span style={{ '--i': 0 }}>S</span>
                                                <span style={{ '--i': 1 }}>e</span>
                                                <span style={{ '--i': 2 }}>n</span>
                                                <span style={{ '--i': 3 }}>d</span>
                                                <span style={{ '--i': 4 }} className="ml-1">M</span>
                                                <span style={{ '--i': 5 }}>e</span>
                                                <span style={{ '--i': 6 }}>s</span>
                                                <span style={{ '--i': 7 }}>s</span>
                                                <span style={{ '--i': 8 }}>a</span>
                                                <span style={{ '--i': 9 }}>g</span>
                                                <span style={{ '--i': 10 }}>e</span>
                                            </p>
                                        </div>
                                        <div className="state state--sent">
                                            <div className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1em" width="1em" strokeWidth="0.5px" stroke="black">
                                                    <g style={{ filter: 'url(#shadow)' }}>
                                                        <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
                                                        <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
                                                    </g>
                                                </svg>
                                            </div>
                                            <p>
                                                <span style={{ '--i': 0 }}>S</span>
                                                <span style={{ '--i': 1 }}>e</span>
                                                <span style={{ '--i': 2 }}>n</span>
                                                <span style={{ '--i': 3 }}>t</span>
                                            </p>
                                        </div>
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
                    className="mt-20 md:mt-24 max-w-5xl mx-auto"
                    aria-labelledby="contact-help-heading"
                >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary mb-4">What to include</p>
                    <h2 id="contact-help-heading" className="max-w-3xl text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
                        Better details create <span className="aurora-text">faster answers.</span>
                    </h2>
                    <BentoGrid className="mt-9 lg:grid-cols-4 lg:auto-rows-[14.5rem]">
                        {SUPPORT_TOPICS.map(({ icon: Icon, label, detail }, index) => {
                            const [accent, secondary] = SUPPORT_BENTO_COLORS[index];

                            return (
                                <BentoCard
                                    key={label}
                                    name={label}
                                    description={detail}
                                    Icon={Icon}
                                    href={SUPPORT_TOPIC_LINKS[index]}
                                    cta={index === 3 ? 'Read privacy' : 'Start request'}
                                    background={<BentoBackground accent={accent} secondary={secondary} label={`Help 0${index + 1}`} />}
                                />
                            );
                        })}
                    </BentoGrid>
                </Motion.section>
            </main>

            <PublicFooter />

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

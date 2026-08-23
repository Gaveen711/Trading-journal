import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  AtSignIcon,
  BookOpenIcon,
  CircleHelpIcon,
  FileTextIcon,
  LockKeyholeIcon,
  MailIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserRoundIcon,
  WalletCardsIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FooterLink {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface FooterLinkGroup {
  label: string
  links: FooterLink[]
}

type StickyFooterProps = React.ComponentProps<"footer">

const socialLinks = [
  { title: "Follow xaujournal on X", href: "https://x.com/xau_journal", icon: AtSignIcon },
  { title: "Join the xaujournal Discord", href: "https://discord.gg/smbNwBZC2", icon: MessageCircleIcon },
  { title: "Email xaujournal", href: "mailto:info@xaujournal.com", icon: MailIcon },
]

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Product",
    links: [
      { title: "The trading desk", href: "/", icon: NotebookPenIcon },
      { title: "Plans", href: "/pricing", icon: WalletCardsIcon },
      { title: "Start free", href: "/login?mode=signup", icon: SparklesIcon },
    ],
  },
  {
    label: "Study",
    links: [
      { title: "Field notes", href: "/blogs", icon: BookOpenIcon },
      { title: "Contact", href: "/contact", icon: CircleHelpIcon },
      { title: "Sign in", href: "/login?mode=signin", icon: UserRoundIcon },
    ],
  },
  {
    label: "Trust",
    links: [
      { title: "Privacy policy", href: "/privacy", icon: LockKeyholeIcon },
      { title: "Terms of service", href: "/terms-and-conditions", icon: ScaleIcon },
      { title: "Refund policy", href: "/refund-policy", icon: FileTextIcon },
    ],
  },
]

export function StickyFooter({ className, style, ...props }: StickyFooterProps) {
  return (
    <footer
      className={cn("xj dark relative h-[min(720px,100svh)] min-h-[620px] w-full", className)}
      style={{ ...style, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      data-ux-skip="true"
      {...props}
    >
      <div className="fixed bottom-0 h-[min(720px,100svh)] min-h-[620px] w-full bg-background text-foreground">
        <div className="sticky top-[calc(100svh-min(720px,100svh))] h-full overflow-y-auto">
          <div className="relative flex size-full flex-col justify-between gap-8 overflow-hidden border-t border-border px-5 py-8 md:px-10 lg:px-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 isolate overflow-hidden">
              <div className="absolute -left-48 -top-80 size-[48rem] rotate-[-24deg] rounded-full bg-[radial-gradient(circle,hsl(var(--foreground)/0.08),transparent_66%)]" />
              <div className="absolute -right-64 top-10 size-[44rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.1),transparent_68%)]" />
              <p className="absolute -bottom-[0.23em] left-1/2 -translate-x-1/2 whitespace-nowrap font-[Handjet] text-[clamp(5rem,17vw,14rem)] font-semibold leading-none tracking-[-0.055em] text-foreground/[0.035]">
                xau/journal
              </p>
            </div>

            <div className="relative mt-6 flex flex-col gap-10 md:flex-row md:gap-8 xl:mt-0">
              <AnimatedContainer className="flex w-full max-w-sm min-w-0 flex-col gap-4 md:mr-auto">
                <Link to="/" className="w-fit font-[Handjet] text-3xl font-semibold tracking-[-0.03em]">
                  xau<span className="text-primary">/</span>journal
                </Link>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  One focused record for XAU/USD traders: every fill kept, every session measured, every decision made reviewable.
                </p>
                <div className="flex gap-2" aria-label="Social links">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.href}
                      render={
                        <a
                          href={link.href}
                          aria-label={link.title}
                          title={link.title}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        />
                      }
                      nativeButton={false}
                      size="icon"
                      variant="outline"
                    >
                      <link.icon />
                    </Button>
                  ))}
                </div>
              </AnimatedContainer>

              {footerLinkGroups.map((group, index) => (
                <AnimatedContainer
                  key={group.label}
                  delay={0.08 + index * 0.08}
                  className="w-full md:max-w-48"
                >
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm uppercase tracking-[0.14em] text-foreground">{group.label}</h3>
                    <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <Link to={link.href} className="group inline-flex min-h-8 items-center gap-2 transition-colors duration-300 hover:text-foreground">
                            {link.icon ? <link.icon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]" /> : null}
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContainer>
              ))}
            </div>

            <AnimatedContainer delay={0.3} className="relative flex flex-col gap-5 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon className="size-4" />
                <span>Analytics and record-keeping only. No trade execution or investment advice.</span>
              </div>
              <div className="flex flex-col justify-between gap-2 text-xs text-muted-foreground md:flex-row">
                <p>© {new Date().getFullYear()} xaujournal. All rights reserved.</p>
                <p className="font-mono">XAU/USD spot · session times UTC</p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </footer>
  )
}

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode
  delay?: number
}

function AnimatedContainer({ delay = 0.1, children, ...props }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return <div className={props.className}>{children}</div>

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.22 }}
      transition={{ delay, duration: 0.65, ease: [0.2, 0.7, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

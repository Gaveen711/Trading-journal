import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  FileChartColumn,
  LayoutDashboard,
  Megaphone,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  TicketPercent,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cx } from './utils'

const adminMarkUrl = new URL('../assets/xau-admin-mark.svg', import.meta.url).href

export interface AdminNavItem {
  label: string
  href: string
  icon?: LucideIcon
  group?: string
  exact?: boolean
  badge?: ReactNode
}

export const defaultAdminNavigation: AdminNavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, group: 'Control center', exact: true },
  { label: 'Users', href: '/users', icon: Users, group: 'Operations' },
  { label: 'Subscriptions', href: '/subscriptions', icon: WalletCards, group: 'Operations' },
  { label: 'Payments', href: '/payments', icon: CircleDollarSign, group: 'Finance' },
  { label: 'Coupons', href: '/coupons', icon: TicketPercent, group: 'Finance' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, group: 'Intelligence' },
  { label: 'Reports', href: '/reports', icon: FileChartColumn, group: 'Intelligence' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone, group: 'Workspace' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'Workspace' },
]

export interface AdminShellProps {
  children: ReactNode
  navigation?: AdminNavItem[]
  activePath?: string
  onNavigate?: (href: string) => void
  commandPlaceholder?: string
  onCommandSubmit?: (query: string) => void
  environmentLabel?: string
  operatorName?: string
  operatorRole?: string
  operatorInitials?: string
  notificationCount?: number
  onNotificationsClick?: () => void
  onOperatorClick?: () => void
  footer?: ReactNode
  className?: string
}

function BrandMark() {
  return (
    <span className="admin-brand__mark" aria-hidden="true">
      <img src={adminMarkUrl} alt="" />
    </span>
  )
}

function routeIsActive(item: AdminNavItem, pathname: string) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function AdminShell({
  children,
  navigation = defaultAdminNavigation,
  activePath,
  onNavigate,
  commandPlaceholder = 'Search users, payments, reports…',
  onCommandSubmit,
  environmentLabel = 'Production',
  operatorName = 'Admin operator',
  operatorRole = 'System administrator',
  operatorInitials = 'AO',
  notificationCount = 0,
  onNotificationsClick,
  onOperatorClick,
  footer,
  className,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const commandRef = useRef<HTMLInputElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const pathname = activePath ?? (typeof window !== 'undefined' ? window.location.pathname : '/')

  const groupedNavigation = useMemo(() => {
    const groups = new Map<string, AdminNavItem[]>()
    navigation.forEach((item) => {
      const group = item.group || 'Navigation'
      groups.set(group, [...(groups.get(group) || []), item])
    })
    return Array.from(groups.entries())
  }, [navigation])

  const activeItem = navigation.find((item) => routeIsActive(item, pathname))

  useEffect(() => {
    const media = window.matchMedia('(max-width: 63.99rem)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]')
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !isTyping)) {
        event.preventDefault()
        setCommandOpen(true)
        window.requestAnimationFrame(() => commandRef.current?.focus())
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!isMobile || !mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !sidebarRef.current) return
      const focusable = Array.from(sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobile, mobileOpen])

  const submitCommand = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onCommandSubmit?.(trimmed)
    if (isMobile) setCommandOpen(false)
  }

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(href)
    setMobileOpen(false)
  }

  return (
    <div className={cx('admin-shell', className)}>
      <a className="admin-skip-link" href="#admin-main">Skip to main content</a>
      <div
        className={cx('admin-shell__scrim', mobileOpen && 'is-open')}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={sidebarRef}
        id="admin-navigation"
        className={cx('admin-sidebar', mobileOpen && 'is-open')}
        aria-label="Admin navigation"
        aria-hidden={isMobile && !mobileOpen ? true : undefined}
        inert={isMobile && !mobileOpen}
      >
        <div className="admin-sidebar__brand-row">
          <a className="admin-brand" href="/" onClick={(event) => navigate(event, '/')} aria-label="XAU Journal admin home">
            <BrandMark />
            <span className="admin-brand__copy">
              <strong>XAU Journal</strong>
              <span>Control center</span>
            </span>
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            className="admin-icon-button admin-sidebar__close"
            onClick={() => {
              setMobileOpen(false)
              menuButtonRef.current?.focus()
            }}
            aria-label="Close navigation"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="admin-sidebar__environment">
          <span className="admin-sidebar__status-dot" aria-hidden="true" />
          <span>{environmentLabel}</span>
          <span className="admin-sidebar__verified"><ShieldCheck aria-hidden="true" /> verified</span>
        </div>

        <nav className="admin-sidebar__nav">
          {groupedNavigation.map(([group, items]) => (
            <div className="admin-nav-group" key={group}>
              <p className="admin-nav-group__label">{group}</p>
              <ul>
                {items.map((item) => {
                  const Icon = item.icon
                  const active = routeIsActive(item, pathname)
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={cx('admin-nav-link', active && 'is-active')}
                        aria-current={active ? 'page' : undefined}
                        onClick={(event) => navigate(event, item.href)}
                      >
                        {Icon && <Icon aria-hidden="true" />}
                        <span>{item.label}</span>
                        {item.badge && <span className="admin-nav-link__badge">{item.badge}</span>}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {footer || (
            <button type="button" className="admin-operator" onClick={onOperatorClick}>
              <span className="admin-operator__avatar" aria-hidden="true">{operatorInitials}</span>
              <span className="admin-operator__copy"><strong>{operatorName}</strong><span>{operatorRole}</span></span>
              <ChevronDown aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>

      <div className="admin-shell__workspace">
        <header className="admin-command-bar">
          <div className="admin-command-bar__leading">
            <button
              ref={menuButtonRef}
              type="button"
              className="admin-icon-button admin-command-bar__menu"
              aria-label="Open navigation"
              aria-controls="admin-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <div className="admin-command-bar__context">
              <span>Admin</span>
              <strong>{activeItem?.label || 'Control center'}</strong>
            </div>
          </div>

          <form className={cx('admin-command', commandOpen && 'is-open')} role="search" onSubmit={submitCommand}>
            <Search aria-hidden="true" />
            <label className="admin-sr-only" htmlFor="admin-command-input">Search admin records</label>
            <input
              ref={commandRef}
              id="admin-command-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && isMobile) {
                  setCommandOpen(false)
                  event.currentTarget.blur()
                }
              }}
              placeholder={commandPlaceholder}
            />
            <kbd>Ctrl K</kbd>
          </form>

          <div className="admin-command-bar__actions">
            <button
              type="button"
              className="admin-icon-button admin-command-bar__mobile-search"
              onClick={() => {
                setCommandOpen(true)
                window.requestAnimationFrame(() => commandRef.current?.focus())
              }}
              aria-label="Open search"
              aria-expanded={commandOpen}
            >
              <Search aria-hidden="true" />
            </button>
            <button type="button" className="admin-icon-button admin-notification-button" onClick={onNotificationsClick} aria-label={notificationCount ? `${notificationCount} unread notifications` : 'Notifications'}>
              <Bell aria-hidden="true" />
              {notificationCount > 0 && <span aria-hidden="true">{notificationCount > 9 ? '9+' : notificationCount}</span>}
            </button>
            <button type="button" className="admin-command-bar__operator" onClick={onOperatorClick} aria-label="Open operator menu">
              <span>{operatorInitials}</span>
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
        </header>

        <main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}

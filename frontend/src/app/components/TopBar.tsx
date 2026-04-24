import {
  BookText,
  Camera,
  ClipboardList,
  Image as ImageIcon,
  type LucideIcon,
  User,
  Wand2,
} from 'lucide-react'

import { navItems } from '../data'
import type { PageId, Role } from '../types'

type TopBarProps = {
  activePage: PageId
  isLoggedIn: boolean
  isPending: boolean
  role: Role
  userDisplayName: string
  onOpenPage: (page: PageId) => void
  onOpenUserPage: () => void
  onLogout: () => void
  onToggleRole: () => void
  onToggleLogin: () => void
}

export function TopBar({
  activePage,
  isLoggedIn,
  isPending,
  role,
  userDisplayName,
  onOpenPage,
  onOpenUserPage,
  onLogout,
  onToggleRole,
  onToggleLogin,
}: TopBarProps) {
  const navActivePage =
    activePage === 'search-results'
      ? 'search'
      : activePage === 'travelize-2' || activePage === 'travelize-3' || activePage === 'travelize-4'
        ? 'travelize-1'
        : activePage

  const primaryNavItems = navItems.filter((item) => item.id !== 'profile')

  const mobileNavIcons: Record<string, LucideIcon> = {
    search: ClipboardList,
    'travelize-1': Wand2,
    gallery: ImageIcon,
    journal: BookText,
  }

  return (
    <>
      <header className="topbar" aria-label="Application header">
        <button type="button" className="brand-anchor" onClick={() => onOpenPage('search')}>
          <span className="brand-anchor-icon" aria-hidden="true">
            <Camera />
          </span>
          <span className="brand-anchor-copy">
            <strong>Travel From Photo</strong>
          </span>
        </button>

        <div className="topbar-tools">
          {isPending ? <span className="pending-badge">Switching view...</span> : null}

          <button type="button" className="topbar-chip" onClick={onToggleRole}>
            {role === 'traveler' ? 'Traveler' : 'Admin'}
          </button>

          <button
            type="button"
            className="topbar-chip topbar-chip--accent"
            onClick={isLoggedIn ? onLogout : onToggleLogin}
          >
            {isLoggedIn ? 'Sign out' : 'Sign in'}
          </button>

          <button
            type="button"
            className={`topbar-profile ${activePage === 'profile' ? 'is-active' : ''}`}
            onClick={onOpenUserPage}
            aria-label={isLoggedIn ? `Open profile for ${userDisplayName}` : 'Open sign-in page'}
            title={isLoggedIn ? userDisplayName : 'Sign in'}
          >
            <User />
          </button>
        </div>
      </header>

      <nav className="desktop-side-nav" aria-label="Primary desktop">
        {primaryNavItems.map((item) => {
          const Icon = mobileNavIcons[item.id]
          return (
            <button
              key={item.id}
              type="button"
              className={`desktop-side-button ${navActivePage === item.id ? 'is-active' : ''}`}
              onClick={() => onOpenPage(item.id)}
              aria-label={item.label}
              title={item.label}
            >
              {Icon ? <Icon className="desktop-side-icon" /> : null}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <nav className="mobile-bottom-nav" aria-label="Mobile primary">
        {primaryNavItems.map((item) => {
          const Icon = mobileNavIcons[item.id]
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-button ${navActivePage === item.id ? 'is-active' : ''}`}
              onClick={() => onOpenPage(item.id)}
              aria-label={item.label}
            >
              {Icon ? <Icon className="mobile-nav-icon" /> : null}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

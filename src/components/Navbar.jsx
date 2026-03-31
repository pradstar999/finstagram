import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusSquare, Film, User, MessageCircle, Moon, Sun, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSidebar } from '../context/SidebarContext'

export default function Navbar() {
  const { profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/create', icon: PlusSquare, label: 'Create' },
    { to: '/reels', icon: Film, label: 'Reels' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: `/profile/${profile?.username}`, icon: User, label: 'Profile', isProfile: true },
  ]

  const sidebarWidth = sidebarOpen ? 256 : 80

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, height: '100%',
        width: sidebarWidth,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 12px',
        zIndex: 100,
        transition: 'width 0.3s ease',
      }} className="hidden md:flex">

        {/* Logo / Collapse Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', marginBottom: 24, gap: 8 }}>
          {sidebarOpen && (
            <Link to="/" style={{ display: 'block' }}>
              <span className="logo" style={{ fontSize: 20, color: 'var(--text)', fontWeight: 700 }}>Finstagram</span>
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 8,
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label, isProfile }) => {
            const active = isActive(to)
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: 16,
                padding: '12px 12px',
                borderRadius: 10,
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                fontSize: 15,
                background: active ? 'var(--surface2)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              title={!sidebarOpen ? label : ''}
              >
                {isProfile && profile?.avatar_url ? (
                  <img src={profile.avatar_url} style={{
                    width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                    outline: active ? '2px solid var(--text)' : 'none',
                    outlineOffset: 2,
                  }} />
                ) : (
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                )}
                {sidebarOpen && <span>{label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme} 
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          style={{
          display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: 16,
          padding: '12px 12px',
          borderRadius: 10,
          color: 'var(--text)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 400,
          width: '100%',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'light' ? <Moon size={24} strokeWidth={2} style={{ flexShrink: 0 }} /> : <Sun size={24} strokeWidth={2} style={{ flexShrink: 0 }} />}
          {sidebarOpen && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
        </button>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <span className="logo" style={{ fontSize: 24, color: 'var(--text)' }}>Finstagram</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          <Link to="/messages" style={{ color: 'var(--text)' }}><MessageCircle size={22} /></Link>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <nav className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '10px 0 16px',
        zIndex: 100,
      }}>
        {[
          { to: '/', icon: Home },
          { to: '/explore', icon: Search },
          { to: '/create', icon: PlusSquare },
          { to: '/reels', icon: Film },
          { to: `/profile/${profile?.username}`, icon: User, isProfile: true },
        ].map(({ to, icon: Icon, isProfile }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} style={{ color: active ? 'var(--text)' : 'var(--text-secondary)', display: 'flex' }}>
              {isProfile && profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', outline: active ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} />
                : <Icon size={26} strokeWidth={active ? 2.5 : 2} />
              }
            </Link>
          )
        })}
      </nav>
    </>
  )
}
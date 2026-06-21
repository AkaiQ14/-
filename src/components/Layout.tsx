import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteLogo from './SiteLogo'
import { useGameStore } from '../store/gameStore'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isPlay = location.pathname === '/play'
  const isHiddenPlay = location.pathname === '/games/hidden-player/play'
  const game = useGameStore(s => s.getActiveGame())
  const immersivePlay = (isPlay && game && game.status !== 'finished') || isHiddenPlay
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (immersivePlay) {
    return <>{children}</>
  }

  return (
    <div className="app-layout">
      <header className={`app-header page-chrome ${scrolled ? 'header-scrolled' : ''}`}>
        <Link to="/" className="logo logo-pulse">
          <SiteLogo variant="header" />
        </Link>

        <nav className="nav-bar" aria-label="التنقل الرئيسي">
          <div className="nav-pills">
            <Link to="/" className={`nav-pill ${location.pathname === '/' ? 'active' : ''}`}>
              الرئيسية
            </Link>
            <Link to="/games" className={`nav-pill ${location.pathname.startsWith('/games') ? 'active' : ''}`}>
              الألعاب
            </Link>
            <Link to="/my-games" className={`nav-pill ${location.pathname === '/my-games' ? 'active' : ''}`}>
              ألعابي
            </Link>
          </div>
          {!isPlay && (
            <Link to="/games" className="btn btn-accent btn-nav btn-shimmer">
              ▶ ابدأ اللعب
            </Link>
          )}
        </nav>
      </header>

      <main
        key={location.pathname}
        className="app-main page-enter app-main--full"
      >
        {children}
      </main>

      <footer className="app-footer page-chrome">
        <span className="app-footer-brand">
          <SiteLogo variant="footer" />
        </span>
        {' '}— منصة ألعاب جماعية تجمع المتعة والمنافسة والمعرفة
        <br />
        © {new Date().getFullYear()} جميع الحقوق محفوظة
      </footer>
    </div>
  )
}

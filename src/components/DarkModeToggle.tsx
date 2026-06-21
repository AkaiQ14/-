import { useThemeStore } from '../store/themeStore'

interface DarkModeToggleProps {
  fixed?: boolean
}

function SunIcon() {
  return (
    <svg className="theme-switch__icon theme-switch__icon--sun" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="theme-switch__icon theme-switch__icon--moon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DarkModeToggle({ fixed }: DarkModeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-switch ${isDark ? 'is-dark' : ''} ${fixed ? 'theme-switch--fixed' : ''}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      <span className="theme-switch__track">
        <span className="theme-switch__icons">
          <SunIcon />
          <MoonIcon />
        </span>
        <span className="theme-switch__thumb" />
      </span>
      <span className="theme-switch__label">{isDark ? 'فاتح' : 'داكن'}</span>
    </button>
  )
}

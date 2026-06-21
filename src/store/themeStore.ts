import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'laabtna-theme'

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
}

function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'light'
    const parsed = JSON.parse(raw)
    return parsed?.state?.theme === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

applyTheme(readStoredTheme())

interface ThemeStore {
  theme: ThemeMode
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: readStoredTheme(),
      toggleTheme: () => {
        const next: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => state => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)

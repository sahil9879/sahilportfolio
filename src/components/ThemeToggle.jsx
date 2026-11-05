import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'theme'
const EVENT = 'theme-change'

// Pehli dafa site dark hi khulti hai. Agar visitor ne pehle light chuna tha to wahi yaad rakhi jaati hai.
function getInitialTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

const readTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isLight = theme === 'light'

  // <html data-theme="..."> set hota hai, baaki kaam index.css khud karti hai.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Navbar mein 2 buttons hain (desktop + mobile). Ye unhe aapas mein sync rakhta hai.
  useEffect(() => {
    const sync = () => setTheme(readTheme())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const toggle = () => {
    const next = isLight ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode mein save nahi hoga, koi masla nahi */
    }
    window.dispatchEvent(new Event(EVENT))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-fg transition duration-300 hover:border-lime hover:text-lime"
    >
      <Sun
        size={18}
        aria-hidden="true"
        className={`absolute transition duration-500 ${isLight ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
      <Moon
        size={18}
        aria-hidden="true"
        className={`absolute transition duration-500 ${isLight ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
      />
    </button>
  )
}
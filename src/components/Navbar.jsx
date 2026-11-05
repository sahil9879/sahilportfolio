import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import ThemeToggle from './ThemeToggle' 

const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'education', label: 'Education' },
]
const sectionIds = [...links.map((l) => l.id), 'contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [hovered, setHovered] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pill, setPill] = useState({ left: 0, width: 0, show: false })
  const headerRef = useRef(null)
  const linkRefs = useRef({})

  // Which section is on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Scroll state and the thin progress bar.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setScrolled(window.scrollY > 20)
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // The sliding highlight follows the hovered link, or the active one when nothing is hovered.
  const target = hovered ?? active
  useEffect(() => {
    const update = () => {
      const el = linkRefs.current[target]
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth, show: true } : (p) => ({ ...p, show: false }))
    }
    update()
    window.addEventListener('resize', update)
    document.fonts?.ready.then(update)
    return () => window.removeEventListener('resize', update)
  }, [target])

  // Close the mobile menu with Escape or a click outside.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => headerRef.current && !headerRef.current.contains(e.target) && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const bar = `absolute left-0 h-0.5 w-5 rounded bg-fg transition duration-300`

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Primary"
        className={`relative mx-auto flex max-w-[1200px] items-center justify-between overflow-hidden rounded-2xl border px-4 backdrop-blur-xl transition-all duration-300 sm:px-6 ${
          scrolled ? 'h-14 border-white/15 bg-ink/85 shadow-lg shadow-black/30' : 'h-16 border-white/10 bg-ink/50'
        }`}
      >
        <a href="#home" onClick={() => setOpen(false)} className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-sm font-extrabold text-ink transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(201,243,106,0.55)]">
            {profile.monogram}
          </span>
          <span className="text-sm font-bold tracking-tight">{profile.name}</span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <ul className="relative flex items-center" onMouseLeave={() => setHovered(null)}>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-white/10 transition-all duration-300 ease-out"
              style={{ left: pill.left, width: pill.width, opacity: pill.show ? 1 : 0 }}
            />
            {links.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  ref={(el) => { linkRefs.current[id] = el }}
                  onMouseEnter={() => setHovered(id)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                  aria-current={active === id ? 'true' : undefined}
                  className={`relative block rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${active === id ? 'text-lime' : 'text-muted hover:text-fg'}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            aria-current={active === 'contact' ? 'true' : undefined}
            className={`rounded-full bg-lime px-5 py-2 text-sm font-bold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-lime/30 ${active === 'contact' ? 'shadow-lg shadow-lime/40' : ''}`}
          >
                   Let&rsquo;s talk
          </a>
          <ThemeToggle />
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-lime md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span className={`${bar} top-0 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`${bar} top-[7px] ${open ? 'opacity-0' : ''}`} />
            <span className={`${bar} top-[14px] ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>

        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-linear-to-r from-lime to-sky"
          style={{ transform: `scaleX(${progress})` }}
        />
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={`mx-auto grid max-w-[1200px] transition-all duration-300 md:hidden ${open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden rounded-2xl bg-ink/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
          <ul className="space-y-1 p-3">
            {links.map(({ id, label }, i) => (
              <li
                key={id}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
                className={`transition duration-300 ${open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
              >
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === id ? 'true' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${active === id ? 'bg-white/10 text-lime' : 'text-fg'}`}
                >
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${active === id ? 'bg-lime' : 'bg-white/20'}`} />
                  {label}
                </a>
              </li>
            ))}
            <li
              style={{ transitionDelay: open ? `${100 + links.length * 60}ms` : '0ms' }}
              className={`pt-1 transition duration-300 ${open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
            >
              <a href="#contact" onClick={() => setOpen(false)} className="block rounded-xl bg-lime px-4 py-3 text-center text-base font-bold text-ink">
                Let&rsquo;s talk
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
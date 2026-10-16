import { Monogram, ArrowRight } from './Icons'
import { useTheme } from '../hooks/useTheme'
import HeroVisual from './HeroVisual'
import AuthCard from './AuthCard'

const HEADLINE = ['Experience', 'Simplicity,', 'Redefined.']

const NOTES = [
  { label: 'Distraction-free', detail: 'A timeline that stays quiet' },
  { label: 'Editorial by default', detail: 'Typography-first, always' },
  { label: 'Private by design', detail: 'You choose what leaves' },
]

export default function AuthLanding() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative z-10 flex min-h-screen flex-col overflow-hidden">
      {/* ambient aura */}
      <div className="aura" aria-hidden="true">
        <span className="aura__orb aura__orb--1" />
        <span className="aura__orb aura__orb--2" />
        <span className="aura__orb aura__orb--3" />
      </div>
      <div className="grain" aria-hidden="true" />

      {/* ── header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <a href="/" className="group flex items-center gap-3">
          <Monogram
            className="h-8 w-8 transition-transform duration-500 ease-out-quart group-hover:rotate-[18deg]"
            style={{ color: 'var(--ink)' }}
          />
          <span
            className="font-display text-lg tracking-wide"
            style={{ color: 'var(--ink)' }}
          >
            Aurelia
          </span>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* ── main split ── */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:gap-16 lg:py-14">
        {/* left — visual + editorial */}
        <section className="order-2 lg:order-1">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-8 xl:gap-14">
            <div>
              <p
                className="mb-6 flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.32em] reveal"
                style={{ color: 'var(--ink-faint)', animationDelay: '0.05s' }}
              >
                <span
                  className="inline-block h-1 w-1 rounded-full"
                  style={{ background: 'var(--accent-soft)' }}
                />
                The new social standard
              </p>

              <h1 className="font-display text-[clamp(2.6rem,5.4vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
                {HEADLINE.map((word, i) => (
                  <span key={word} className="word mr-[0.28em]">
                    <span style={{ animationDelay: `${0.12 + i * 0.09}s` }}>{word}</span>
                  </span>
                ))}
              </h1>

              <p
                className="mt-6 max-w-md text-[1rem] leading-relaxed reveal"
                style={{ color: 'var(--ink-soft)', animationDelay: '0.45s' }}
              >
                A calmer place to think out loud. No noise, no endless scroll —
                just an elegant canvas for the things worth saying.
              </p>

              <ul
                className="mt-9 hidden max-w-md flex-col gap-3.5 reveal xl:flex"
                style={{ animationDelay: '0.6s' }}
              >
                {NOTES.map((note) => (
                  <li key={note.label} className="flex items-baseline gap-4">
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0 translate-y-0.5"
                      style={{ color: 'var(--accent-soft)' }}
                    />
                    <span
                      className="w-[9.5rem] shrink-0 text-[0.82rem] font-medium"
                      style={{ color: 'var(--ink)' }}
                    >
                      {note.label}
                    </span>
                    <span className="text-[0.82rem]" style={{ color: 'var(--ink-faint)' }}>
                      {note.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* visual feature — beside the headline, below on touch sizes */}
            <div
              className="hidden lg:block"
              style={{
                animation: 'blur-in 1.2s cubic-bezier(0.16,1,0.3,1) 0.55s both',
              }}
            >
              <HeroVisual height={330} scale={0.78} />
            </div>
          </div>

          {/* compact hero object for stacked / mobile layouts */}
          <div
            className="mt-10 lg:hidden"
            style={{ animation: 'blur-in 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
          >
            <HeroVisual height={310} scale={0.92} />
          </div>
        </section>

        {/* right — auth card */}
        <section className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <AuthCard />
        </section>
      </main>

      {/* ── footer ── */}
      <footer
        className="relative z-10 flex flex-col items-center justify-between gap-2 px-6 py-6 text-[0.7rem] sm:flex-row sm:px-10 reveal"
        style={{ color: 'var(--ink-faint)', animationDelay: '0.9s' }}
      >
        <p>© {new Date().getFullYear()} Aurelia — crafted with restraint.</p>
        <p className="flex items-center gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </p>
      </footer>
    </div>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className="icon-btn h-9 w-9"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
        {isDark ? (
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
          </g>
        )}
      </svg>
    </button>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Asterisk, Monogram } from './Icons'

/** Natural (unscaled) size of the scene, in px. */
const BASE_W = 320
const BASE_H = 384

/**
 * The left-hand visual focus: a floating glass monolith that tilts toward the
 * pointer. Everything inside it lives on its own Z plane so the parallax reads
 * as real depth rather than a flat translate.
 */
export default function HeroVisual({ height = 384, scale = 1, className = '' }) {
  const sceneRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const reduced = usePrefersReducedMotion()

  const handlePointerMove = useCallback(
    (event) => {
      const el = sceneRef.current
      if (!el || reduced) return
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height

      setTilt({ x: (0.5 - py) * 13, y: (px - 0.5) * 17 })
      setGlow({ x: px * 100, y: py * 100 })
    },
    [reduced],
  )

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlow({ x: 50, y: 50 })
  }, [])

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* blueprint grid, masked out towards the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 45%, black, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black, transparent 72%)',
        }}
      />

      <div
        ref={sceneRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute left-1/2 top-1/2"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative"
          style={{
            width: BASE_W,
            height: BASE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* orbit rings */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[19rem] w-[19rem] rounded-full border"
            style={{
              borderColor: 'var(--hairline)',
              transform: 'translate(-50%, -50%) rotateX(72deg) rotateZ(-12deg)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] rounded-full border"
            style={{
              borderColor: 'var(--hairline)',
              transform: 'translate(-50%, -50%) rotateX(74deg) rotateZ(24deg)',
            }}
          />

          {/* the monolith */}
          <div
            className="absolute left-1/2 top-1/2 h-[21rem] w-[14rem]"
            style={{
              transform: `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="glass glass-sheen relative h-full w-full overflow-hidden rounded-[2rem]">
              {/* pointer-tracked glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-[2rem]"
                style={{
                  background: `radial-gradient(220px circle at ${glow.x}% ${glow.y}%, var(--aura-1), transparent 70%)`,
                }}
              />

              {/* slow sheen sweep */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-shimmer"
                style={{
                  background:
                    'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.16) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
              />

              <div
                className="relative flex h-full flex-col justify-between p-7"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[0.65rem] font-medium uppercase tracking-[0.28em]"
                    style={{ color: 'var(--ink-faint)' }}
                  >
                    AURELIA
                  </span>
                  <Asterisk
                    className="h-3.5 w-3.5 animate-spin-slow"
                    style={{ color: 'var(--accent-soft)' }}
                  />
                </div>

                <div className="flex flex-col items-center gap-5 py-2">
                  <div
                    className="rounded-full p-4"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 30%, var(--aura-1), transparent 70%)',
                    }}
                  >
                    <Monogram className="h-14 w-14" style={{ color: 'var(--ink)' }} />
                  </div>
                  <p
                    className="max-w-[9rem] text-center font-display text-[1.3rem] leading-snug"
                    style={{ color: 'var(--ink)' }}
                  >
                    Quietly
                    <br />
                    <em className="italic" style={{ color: 'var(--accent)' }}>
                      extraordinary
                    </em>
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[92, 68, 80].map((width, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="text-[0.6rem] tabular-nums"
                        style={{ color: 'var(--ink-faint)' }}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className="h-px rounded-full"
                        style={{
                          background:
                            i === 1
                              ? 'linear-gradient(90deg, var(--accent-soft), transparent)'
                              : 'linear-gradient(90deg, var(--hairline-strong), transparent)',
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* satellites on deeper Z planes */}
            <Satellite className="-left-9 top-12" z={90} size={10} />
            <Satellite className="-right-7 bottom-24" z={110} size={7} />
            <Satellite className="right-8 -top-6" z={60} size={5} />
          </div>

          {/* floating caption chips */}
          <Chip className="-left-6 top-4" delay="0.9s" label="Soft glass · 24px blur" />
          <Chip className="-right-8 bottom-8" delay="1.15s" label="Pointer parallax" />
        </div>
      </div>
    </div>
  )
}

function Satellite({ className = '', z = 80, size = 8 }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: 'var(--accent-soft)',
        boxShadow: '0 0 18px 4px var(--glow)',
        transform: `translateZ(${z}px)`,
      }}
    />
  )
}

function Chip({ className = '', label, delay = '0.8s' }) {
  return (
    <div
      className={`glass pointer-events-none absolute hidden whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.68rem] font-medium tracking-wide lg:block ${className}`}
      style={{
        color: 'var(--ink-soft)',
        animation: `fade-up 900ms cubic-bezier(0.16,1,0.3,1) ${delay} both`,
      }}
    >
      {label}
    </div>
  )
}

/** Tiny hook so we respect prefers-reduced-motion without a dependency. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  const onChange = useCallback((event) => setReduced(event.matches), [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [onChange])

  return reduced
}

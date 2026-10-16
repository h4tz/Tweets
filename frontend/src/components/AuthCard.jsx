import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { AppleIcon, GoogleIcon, ArrowRight } from './Icons'

const MODES = {
  signin: {
    label: 'Log In',
    cta: 'Enter Experience',
    loading: 'Entering…',
  },
  signup: {
    label: 'Sign Up',
    cta: 'Create Account',
    loading: 'Creating account…',
  },
}

const ease = [0.16, 1, 0.3, 1]

/** Reusable floating-label input. */
function Field({ id, label, type = 'text', autoComplete, value, onChange, children }) {
  return (
    <div className="field group">
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
        placeholder={label}
        aria-label={label}
        spellCheck="false"
      />
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

export default function AuthCard() {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const { login, register, continueAsGuest, isLoading, isSubmitting } = useAuthStore()
  const navigate = useNavigate()

  const isSignUp = mode === 'signup'
  const config = MODES[mode]

  const update = useCallback((key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setError('')
  }, [])

  const switchMode = useCallback((next) => {
    setMode(next)
    setError('')
    setNotice('')
    setShowPassword(false)
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setError('')
      setNotice('')

      if (isSignUp) {
        if (form.password !== form.confirm) {
          setError('Passwords do not match.')
          return
        }
        if (form.password.length < 8) {
          setError('Password must be at least 8 characters.')
          return
        }
      }

      try {
        if (isSignUp) {
          const [first_name = '', ...rest] = form.name.trim().split(/\s+/)
          await register({
            username: form.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'member',
            email: form.email,
            password: form.password,
            first_name,
            last_name: rest.join(' '),
          })
        } else {
          await login(form.email, form.password)
        }
        navigate('/dashboard')
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    },
    [form, isSignUp, login, register, navigate],
  )

  const handleGuest = useCallback(() => {
    continueAsGuest()
    setNotice('Enjoying Aurelia as a guest — nothing is stored.')
    navigate('/dashboard')
  }, [continueAsGuest, navigate])

  const busy = isLoading || isSubmitting

  // WAI-ARIA tabs pattern: arrows move between tabs, Home/End jump to the ends.
  const tabRefs = useRef([])
  const handleTabKeys = useCallback((event, index) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1 }
    const order = Object.keys(MODES)
    let next = null
    if (event.key in keys) next = (index + keys[event.key] + order.length) % order.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = order.length - 1
    if (next === null) return
    event.preventDefault()
    switchMode(order[next])
    tabRefs.current[next]?.focus()
  }, [switchMode])

  return (
    <div
      className="glass glass-sheen glass-strong relative w-full max-w-[26rem] rounded-[1.75rem] p-7 sm:p-9"
      style={{
        animation: 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.25s both',
      }}
    >
      {/* header */}
      <div className="mb-7">
        <p
          className="mb-1 text-[0.68rem] font-medium uppercase tracking-[0.3em]"
          style={{ color: 'var(--ink-faint)' }}
        >
          {isSignUp ? 'Join us' : 'Welcome back'}
        </p>
        <h2 className="font-display text-[2rem] leading-tight" style={{ color: 'var(--ink)' }}>
          {isSignUp ? 'Begin your' : 'Continue your'}
          <br />
          <em className="italic" style={{ color: 'var(--accent)' }}>
            {isSignUp ? 'story' : 'journey'}
          </em>
        </h2>
      </div>

      {/* segmented control */}
      <div className="segmented mb-6" role="tablist" aria-label="Authentication mode">
        <span className="segmented__thumb" data-mode={mode} aria-hidden="true" />
        {Object.entries(MODES).map(([key, value], index) => (
          <button
            key={key}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`tab-${key}`}
            aria-selected={mode === key}
            aria-controls="auth-panel"
            tabIndex={mode === key ? 0 : -1}
            onClick={() => switchMode(key)}
            onKeyDown={(event) => handleTabKeys(event, index)}
            className="segmented__option"
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* error / notice */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="error"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease }}
            className="mb-4 rounded-xl border px-4 py-2.5 text-[0.8rem]"
            style={{
              borderColor: 'rgba(220, 90, 90, 0.35)',
              background: 'rgba(220, 90, 90, 0.1)',
              color: '#c0563f',
            }}
          >
            {error}
          </motion.p>
        )}
        {!error && notice && (
          <motion.p
            key="notice"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease }}
            className="mb-4 rounded-xl border px-4 py-2.5 text-[0.8rem]"
            style={{
              borderColor: 'var(--hairline-strong)',
              background: 'var(--field)',
              color: 'var(--ink-soft)',
            }}
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      {/* form — the shared fields stay mounted when the mode flips so the
          email you already typed is still there when you switch tabs */}
      <motion.form
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={`tab-${mode}`}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.15 }}
        className="space-y-3.5"
        noValidate
      >
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <Field
              id="name"
              label="Full name"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
            />
          </motion.div>
        )}

        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
        />

        <Field
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={update('password')}
        >
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[0.68rem] font-medium uppercase tracking-wider transition-colors duration-300"
            style={{ color: 'var(--ink-faint)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-faint)')}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </Field>

        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease, delay: 0.04 }}
          >
            <Field
              id="confirm"
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirm}
              onChange={update('confirm')}
            />
          </motion.div>
        )}

        {!isSignUp && (
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              className="text-[0.75rem] font-medium transition-colors duration-300"
              style={{ color: 'var(--ink-faint)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-faint)')}
              onClick={() => setNotice('Password recovery is not wired up in this demo.')}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary mt-2 w-full py-3.5 text-[0.9rem] font-semibold tracking-wide">
          <span className="relative z-10 flex items-center justify-center gap-2">
            {busy ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                {config.loading}
              </>
            ) : (
              <>
                {config.cta}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </span>
        </button>
      </motion.form>

      {/* divider */}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
        <span className="divider-text text-[0.65rem] uppercase tracking-[0.3em]">or</span>
        <span className="h-px flex-1" style={{ background: 'var(--hairline)' }} />
      </div>

      {/* guest */}
      <button type="button" onClick={handleGuest} className="btn-ghost group w-full py-3.5 text-[0.9rem] font-medium">
        <span className="flex items-center justify-center gap-2">
          Explore as Guest
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-quart group-hover:translate-x-1" />
        </span>
      </button>

      {/* social */}
      <div className="mt-7 flex items-center justify-center gap-3">
        <span className="mr-1 text-[0.72rem]" style={{ color: 'var(--ink-faint)' }}>
          Or continue with
        </span>
        <button type="button" className="icon-btn" aria-label="Continue with Apple" onClick={() => setNotice('Apple sign-in is not wired up in this demo.')}>
          <AppleIcon className="h-[1.05rem] w-[1.05rem]" />
        </button>
        <button type="button" className="icon-btn" aria-label="Continue with Google" onClick={() => setNotice('Google sign-in is not wired up in this demo.')}>
          <GoogleIcon className="h-[1.05rem] w-[1.05rem]" />
        </button>
      </div>
    </div>
  )
}

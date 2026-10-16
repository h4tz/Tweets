import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Monogram, ArrowRight } from '../components/Icons'

export default function DashboardPage() {
  const { user, token, isGuest, logout, getProfile } = useAuthStore()
  const [loading, setLoading] = useState(!isGuest)
  const navigate = useNavigate()

  useEffect(() => {
    if (isGuest) {
      setLoading(false)
      return undefined
    }
    let active = true
    getProfile().finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [isGuest, getProfile])

  const handleExit = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center" style={{ background: 'var(--bg)' }}>
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'transparent' }}
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="aura" aria-hidden="true">
        <span className="aura__orb aura__orb--1" />
        <span className="aura__orb aura__orb--2" />
        <span className="aura__orb aura__orb--3" />
      </div>
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monogram className="h-8 w-8" style={{ color: 'var(--ink)' }} />
            <span className="font-display text-lg tracking-wide">Aurelia</span>
          </div>
          <button type="button" onClick={handleExit} className="btn-ghost px-5 py-2 text-[0.8rem] font-medium">
            {isGuest ? 'Leave guest mode' : 'Log out'}
          </button>
        </header>

        <section className="glass glass-sheen mt-12 rounded-[1.75rem] p-8 sm:p-10">
          <p
            className="text-[0.68rem] font-medium uppercase tracking-[0.3em]"
            style={{ color: 'var(--ink-faint)' }}
          >
            {isGuest ? 'Guest session' : 'Signed in'}
          </p>

          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">
            {isGuest ? (
              <>
                You're exploring as a <em className="italic" style={{ color: 'var(--accent)' }}>guest</em>
              </>
            ) : (
              <>
                Welcome,{' '}
                <em className="italic" style={{ color: 'var(--accent)' }}>
                  {user?.first_name || user?.username || user?.email || 'friend'}
                </em>
              </>
            )}
          </h1>

          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {isGuest
              ? 'Nothing you do here is saved. Create an account when you\'re ready to keep your timeline, drafts and settings.'
              : 'This is the authenticated shell. Authentication is the only backend slice implemented so far — the timeline arrives in the next phase.'}
          </p>

          {isGuest && (
            <button
              type="button"
              onClick={handleExit}
              className="btn-primary mt-7 inline-flex items-center gap-2 px-6 py-3 text-[0.88rem] font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create an account
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          )}
        </section>

        {!isGuest && (
          <section className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-[1.5rem] p-6">
              <h2 className="text-[0.68rem] font-medium uppercase tracking-[0.28em]" style={{ color: 'var(--ink-faint)' }}>
                Account
              </h2>
              <dl className="mt-4 space-y-3 text-[0.88rem]">
                <Row label="Email" value={user?.email} />
                <Row label="Username" value={user?.username} />
                <Row
                  label="Name"
                  value={[user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—'}
                />
                <Row label="Status" value={user?.is_active ? 'Active' : 'Inactive'} />
              </dl>
            </div>

            <div className="glass rounded-[1.5rem] p-6">
              <h2 className="text-[0.68rem] font-medium uppercase tracking-[0.28em]" style={{ color: 'var(--ink-faint)' }}>
                Session
              </h2>
              <dl className="mt-4 space-y-3 text-[0.88rem]">
                <Row label="API" value="http://localhost:8000/api/v1/" mono />
                <Row label="Auth" value="Bearer token" />
                <Row label="Token" value={token ? 'present' : 'missing'} />
                <Row label="Phase" value="01 — authentication" />
              </dl>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt style={{ color: 'var(--ink-faint)' }}>{label}</dt>
      <dd
        className={`text-right ${mono ? 'text-[0.75rem]' : ''}`}
        style={{ color: 'var(--ink)', wordBreak: 'break-word' }}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

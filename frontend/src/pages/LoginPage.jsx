import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <Link
          to="/register"
          className="rounded-full border border-gray-500 px-5 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200"
        >
          Sign up
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-white" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Sign in to X
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your credentials to access your account
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div
              className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                focused === 'email'
                  ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <label
                htmlFor="email"
                className={`block text-xs font-medium transition-colors duration-200 ${
                  focused === 'email' ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div
              className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                focused === 'password'
                  ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <label
                htmlFor="password"
                className={`block text-xs font-medium transition-colors duration-200 ${
                  focused === 'password' ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-white py-3 text-[15px] font-bold text-black transition-all duration-200 hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Create account */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-block w-full rounded-full border border-gray-600 py-3 text-[15px] font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-600">
        <p>Demo project &middot; Not affiliated with X Corp.</p>
      </footer>
    </div>
  )
}

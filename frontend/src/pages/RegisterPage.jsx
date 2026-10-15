import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordStrength(calculateStrength(value))
    }
  }

  const calculateStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
          to="/"
          className="rounded-full border border-gray-500 px-5 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200"
        >
          Sign in
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-white" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Join the conversation today
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                  focused === 'first_name'
                    ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <label
                  htmlFor="first_name"
                  className={`block text-xs font-medium transition-colors duration-200 ${
                    focused === 'first_name' ? 'text-sky-500' : 'text-gray-500'
                  }`}
                >
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  onFocus={() => setFocused('first_name')}
                  onBlur={() => setFocused('')}
                  className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                  placeholder="John"
                />
              </div>
              <div
                className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                  focused === 'last_name'
                    ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <label
                  htmlFor="last_name"
                  className={`block text-xs font-medium transition-colors duration-200 ${
                    focused === 'last_name' ? 'text-sky-500' : 'text-gray-500'
                  }`}
                >
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  onFocus={() => setFocused('last_name')}
                  onBlur={() => setFocused('')}
                  className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div
              className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                focused === 'username'
                  ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <label
                htmlFor="username"
                className={`block text-xs font-medium transition-colors duration-200 ${
                  focused === 'username' ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused('')}
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                placeholder="johndoe"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
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
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                placeholder="Create a strong password"
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthLabels[passwordStrength]}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div
              className={`rounded-xl border bg-transparent px-4 py-3 transition-all duration-200 ${
                focused === 'confirmPassword'
                  ? 'border-sky-500 shadow-[0_0_0_1px_#1d9bf0]'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <label
                htmlFor="confirmPassword"
                className={`block text-xs font-medium transition-colors duration-200 ${
                  focused === 'confirmPassword' ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused('')}
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-[15px]"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Show/hide toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? 'Hide passwords' : 'Show passwords'}
              </button>
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-sky-500 hover:underline transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-600">
        <p>Demo project &middot; Not affiliated with X Corp.</p>
      </footer>
    </div>
  )
}

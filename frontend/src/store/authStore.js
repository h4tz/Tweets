import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API = 'http://localhost:8000/api/v1'

/**
 * Pull a human-readable message out of a DRF error body.
 * The API answers with `{ error: { detail, code } }`, which the previous
 * swallow-the-detail version never surfaced.
 */
async function readError(response, fallback) {
  try {
    const payload = await response.json()
    const detail =
      payload?.error?.detail ??
      payload?.detail ??
      payload?.error ??
      payload?.message
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object') {
      const first = Object.values(detail)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
      if (typeof first === 'string') return first
    }
  } catch {
    /* body was empty or not JSON — fall through */
  }
  return fallback
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      isSubmitting: false,

      login: async (email, password) => {
        set({ isLoading: true, isSubmitting: true })
        try {
          const response = await fetch(`${API}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error(await readError(response, 'Login failed'))
          }

          const data = await response.json()
          set({
            user: data.user,
            token: data.tokens.access_token,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
            isSubmitting: false,
          })
          return data
        } catch (error) {
          set({ isLoading: false, isSubmitting: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, isSubmitting: true })
        try {
          const response = await fetch(`${API}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            throw new Error(await readError(response, 'Registration failed'))
          }

          const data = await response.json()
          set({
            user: data.user,
            token: data.tokens.access_token,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
            isSubmitting: false,
          })
          return data
        } catch (error) {
          set({ isLoading: false, isSubmitting: false })
          throw error
        }
      },

      /** Enter the app without an account — no tokens, nothing stored server-side. */
      continueAsGuest: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: true,
          isLoading: false,
          isSubmitting: false,
        })
      },

      upgradeFromGuest: async (email, password) => {
        set({ isGuest: false })
        return get().login(email, password)
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
          isSubmitting: false,
        })
      },

      getProfile: async () => {
        const { token } = get()
        if (!token) return null

        try {
          const response = await fetch(`${API}/auth/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const data = await response.json()
            set({ user: data.user })
            return data.user
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
        return null
      },
    }),
    {
      name: 'auth-storage',
      // Never rehydrate a guest session after a reload — guests start fresh.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

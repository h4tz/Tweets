import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Login failed')
          }
          
          const data = await response.json()
          set({
            user: data.user,
            token: data.tokens.access_token,
            isAuthenticated: true,
            isLoading: false
          })
          return data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await fetch('http://localhost:8000/api/v1/auth/register/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Registration failed')
          }
          
          const data = await response.json()
          set({
            user: data.user,
            token: data.tokens.access_token,
            isAuthenticated: true,
            isLoading: false
          })
          return data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },
      
      getProfile: async () => {
        const { token } = get()
        if (!token) return null
        
        try {
          const response = await fetch('http://localhost:8000/api/v1/auth/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user })
            return data.user
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,

      login: (token: string) => {
        set({ token, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'appsbuilder-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiFetch } from './lib/api';

interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLogged: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLogged: false,

      login: async (email, password) => {
        const data = await apiFetch<{ token: string; user?: AuthUser }>(
          '/api/users/login',
          { method: 'POST', body: JSON.stringify({ email, password }) }
        );
        localStorage.setItem('saas-auth-storage-token', data.token);
        set({
          token: data.token,
          user: data.user ?? { id: '', email },
          isLogged: true,
        });
      },

      logout: () => {
        localStorage.removeItem('saas-auth-storage-token');
        set({ user: null, token: null, isLogged: false });
      },

      setToken: (token) => {
        localStorage.setItem('saas-auth-storage-token', token);
        set({ token, isLogged: true });
      },
    }),
    { name: 'saas-auth-storage', storage: createJSONStorage(() => localStorage) }
  )
);

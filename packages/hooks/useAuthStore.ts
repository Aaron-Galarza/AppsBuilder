'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@saas/types';
import { apiFetch } from './lib/api';

// Re-exportar el tipo canonical para que consumidores no importen de @saas/types directamente
export type { User as AuthUser };

interface AuthState {
  user: User | null;
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
        const data = await apiFetch<{ token: string; user?: User }>(
          '/api/users/login',
          { method: 'POST', body: JSON.stringify({ email, password }) }
        );
        localStorage.setItem('saas-auth-storage-token', data.token);
        // Normalizar: el backend devuelve _id, no id
        const user: User = data.user ?? { _id: '', email, name: email.split('@')[0], role: 'admin' };
        set({
          token: data.token,
          user,
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

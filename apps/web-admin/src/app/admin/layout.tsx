'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, LogOut } from 'lucide-react'
import { useAuthStore, authHeaders, API_URL } from '@saas/hooks'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isLogged = useAuthStore((s) => s.isLogged)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  useEffect(() => {
    if (!isLogged) {
      router.replace('/login')
      return
    }

    // Sesión persistida puede tener un token viejo/vencido (p.ej. de otra app
    // que usa el mismo storage saas-auth-storage). Valida contra el backend:
    // si responde 401, limpiá sesión y volvé a login.
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/admin?range=hoy`, {
          headers: authHeaders(useAuthStore.getState().token),
          cache: 'no-store',
        })
        if (cancelled) return
        if (res.status === 401) {
          logout()
          router.replace('/login')
        }
      } catch {
        // Sin red: no expulsar al usuario por un fallo de conexión
      }
    }
    void check()
    return () => {
      cancelled = true
    }
  }, [isLogged, logout, router])

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  if (!isLogged) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-white/40 text-xs tracking-widest uppercase">Verificando credenciales...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-white flex flex-col">
      <header className="flex items-center justify-between gap-2 h-14 px-3 sm:px-4 border-b border-white/10 bg-background shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Volver</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold tracking-wide text-primary">AppsBuilder Admin</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-red-400/60 hover:text-red-300 text-xs transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
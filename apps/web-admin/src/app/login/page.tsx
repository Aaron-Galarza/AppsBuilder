'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.replace('/admin')
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/users/login', { email, password })
      const data = res.data || res
      const token = data?.data?.token || data?.token || data?.data

      if (!token || typeof token !== 'string') {
        throw new Error('No se encontró un token válido en la respuesta')
      }

      login(token)
      setTimeout(() => { router.push('/admin') }, 150)
    } catch (err: any) {
      if (err.message === 'No autorizado') return
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-widest text-primary">
          AppsBuilder
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/30">Panel de administración</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-white/10 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
      >
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-40 text-sm transition-all active:scale-95"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

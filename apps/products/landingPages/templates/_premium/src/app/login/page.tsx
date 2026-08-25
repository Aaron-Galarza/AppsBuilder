'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogIn, Lock, User } from 'lucide-react'
import { useAuthStore } from '@saas/hooks'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Credenciales inválidas')
        setLoading(false)
        return
      }

      login(data.token)
      router.push('/admin')
    } catch {
      setError('Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <button onClick={() => router.push('/')} className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-white/40 mt-1">INJECT_TENANT_NAME</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="admin@ejemplo.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-400/10 px-4 py-2 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              loading ? 'bg-zinc-800 text-white/30 cursor-not-allowed' : 'bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
            }`}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            {!loading && <LogIn className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}

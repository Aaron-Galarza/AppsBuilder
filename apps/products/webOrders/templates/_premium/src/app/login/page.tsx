'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '@saas/hooks'
import { Input } from '@saas/ui'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLogged, token } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLogged || token) router.replace('/admin')
  }, [isLogged, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.replace('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="INJECT_LOGO_URL"
            alt="INJECT_TENANT_NAME"
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">INJECT_TENANT_NAME</h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Panel de administración
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card p-6">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
              Contraseña
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}
          >
            <LogIn size={16} /> {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-white/30">Solo personal autorizado</p>
      </div>
    </main>
  )
}

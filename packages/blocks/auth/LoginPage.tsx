'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore, useSiteConfig, useSiteRouter } from '@saas/hooks';
import { Input } from '@saas/ui';

export interface LoginPageProps {
  /** branded: card sobre fondo con branding del negocio (basic/premium). minimal: form estricto sin decoración (standard). */
  variant?: 'branded' | 'minimal';
}

/** Login del panel de administración. Misma lógica de autenticación; la variante define la presentación. */
export function LoginPage({ variant = 'branded' }: LoginPageProps) {
  const router = useSiteRouter();
  const cfg = useSiteConfig();
  const { login, isLogged, token } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLogged || token) router.replace('/admin');
  }, [isLogged, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email || !password;

  if (variant === 'minimal') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <img src={cfg.logo} alt={cfg.name} className="h-14 w-14 rounded-2xl object-contain" />
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{cfg.name}</h1>
              <p className="mt-1 text-xs text-white/40">Panel de administración</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#161616] p-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-white/20 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 pr-12 text-sm text-white placeholder-white/20 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-400/10 px-4 py-2 text-center text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={disabled}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                disabled
                  ? 'cursor-not-allowed bg-zinc-800 text-white/30'
                  : 'bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              ) : (
                <>
                  Iniciar Sesión
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src={cfg.logo}
            alt={cfg.name}
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">{cfg.name}</h1>
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
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}
          >
            <LogIn size={16} /> {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-white/30">Solo personal autorizado</p>
      </div>
    </main>
  );
}
import { useRouter } from 'next/router'
import { Rocket } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 max-w-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Rocket className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AppsBuilder</h1>
          <p className="text-sm text-white/40">
            Generador de repositorios customizados para clientes.
            Elegí plantilla, configurá colores y textos, descargá el ZIP listo para deployar.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push('/builder')}
            className="bg-primary text-black font-extrabold py-3.5 px-6 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Empezar
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>6 pasos simples</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Preview en tiempo real</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>ZIP listo para Vercel + Render</span>
          </div>
        </div>
      </div>
    </div>
  )
}

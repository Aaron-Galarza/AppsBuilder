import { useRouter } from 'next/router'
import { Terminal } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="border-b border-border pb-3 mb-6">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <span className="lv-o">OK</span>
            <span>AppsBuilder v1.0</span>
            <span className="lv-w">·</span>
            <span>generador de repositorios</span>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-5">
            <Terminal className="w-8 h-8 text-ok" strokeWidth={1.5} />
            <div>
              <h1 className="text-sm tracking-[0.2em] uppercase text-foreground">AppsBuilder</h1>
              <p className="hint mt-0.5">Generador de repositorios customizados para clientes</p>
            </div>
          </div>

          <div className="kv">
            <span className="k">Proceso</span>
            <span className="v">7 pasos: producto, plantilla, bloques, config, textos, imágenes, descarga</span>
          </div>
          <div className="kv">
            <span className="k">Modo demo</span>
            <span className="v">Un click rellena todo con datos simulados</span>
          </div>
          <div className="kv">
            <span className="k">Output</span>
            <span className="v">ZIP listo para Vercel + Render</span>
          </div>
          <div className="kv">
            <span className="k">SQL</span>
            <span className="v">npm run dev = datos simulados · pnpm seed = BD real</span>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => router.push('/builder')}
              className="btn btn-ok"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
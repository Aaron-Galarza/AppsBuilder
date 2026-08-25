import { Clock, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="bg-gradient-to-b from-card to-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-primary tracking-wider mb-2 font-heading font-semibold">INJECT_TENANT_NAME</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">Horarios</h3>
              <p className="text-muted-foreground text-xs">Consultanos por WhatsApp</p>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">Dirección</h3>
              <p className="text-muted-foreground text-xs">Consultanos por WhatsApp</p>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-transparent rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center">
              <Phone className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-white text-sm mb-1">WhatsApp</h3>
              <span className="text-primary text-xs">Consultanos</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/20">
            <div className="flex items-center gap-2.5">
              <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" className="w-8 h-8 grayscale opacity-40 shrink-0 object-cover rounded-full" />
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider leading-tight">INJECT_TENANT_NAME</p>
                <p className="text-[9px] font-medium text-muted-foreground">&copy; {new Date().getFullYear()} Todos los derechos reservados</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-medium text-muted-foreground leading-tight">Desarrollado por</p>
              <a href="https://www.afdevelopers.com/" className="text-[10px] font-extrabold text-primary tracking-wide">AFdevelopers</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Clock, MapPin, Phone, MessageCircle, AtSign } from 'lucide-react'

export function Footer() {
  const whatsapp = `https://wa.me/${'INJECT_CONTACT_PHONE'.replace(/\D/g, '')}`

  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="bg-gradient-to-b from-card to-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">INJECT_TENANT_NAME</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-xs font-semibold text-white">INJECT_CONTACT_PHONE</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-xs font-semibold text-white">INJECT_CONTACT_ADDRESS</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horarios</p>
                    <p className="text-xs font-semibold text-white">INJECT_CONTACT_HOURS</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" className="mx-auto h-10 w-10 rounded-full object-cover opacity-60 mb-2" />
                <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">&copy; {new Date().getFullYear()} INJECT_TENANT_NAME</p>
                <p className="text-[9px] font-medium text-muted-foreground">Todos los derechos reservados</p>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-sm font-bold text-white mb-3">Contacto</h3>
              <div className="flex flex-col items-end gap-2">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-white transition hover:text-primary">
                  <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-white transition hover:text-primary">
                  <AtSign className="h-4 w-4 text-primary" /> Instagram
                </a>
                <a href="https://www.afdevelopers.com/" className="mt-2 inline-block text-[10px] font-extrabold text-primary tracking-wide">AFdevelopers</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

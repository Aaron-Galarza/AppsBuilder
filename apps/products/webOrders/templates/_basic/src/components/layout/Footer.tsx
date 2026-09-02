import { AtSign, Clock, MapPin, MessageCircle } from 'lucide-react'

const INFO = [
  { Icon: Clock, title: 'Horario', value: 'INJECT_CONTACT_HOURS' },
  { Icon: MapPin, title: 'Retiro / Dirección', value: 'INJECT_CONTACT_ADDRESS' },
  { Icon: MessageCircle, title: 'WhatsApp', value: 'INJECT_CONTACT_PHONE' },
  { Icon: AtSign, title: 'Instagram', value: '@INJECT_TENANT_NAME' },
]

export function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* BLOCK: contact — Tarjetas de información */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INFO.map(({ Icon, title, value }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <Icon className="text-primary" size={18} strokeWidth={2} />
              <h3 className="text-xs font-bold uppercase tracking-wide text-white">{title}</h3>
              <p className="text-[11px] leading-snug text-white/50">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6">
          <img
            src="INJECT_LOGO_URL"
            alt="INJECT_TENANT_NAME"
            className="h-6 w-6 rounded-full object-cover opacity-60"
          />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            © {new Date().getFullYear()} INJECT_TENANT_NAME
          </p>
        </div>
      </div>
    </footer>
  )
}
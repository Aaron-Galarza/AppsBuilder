'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, ShoppingBag, Image, Settings } from 'lucide-react'
import { OverviewTab } from '@saas/blocks/admin'
import { MenuTab } from '@saas/blocks/admin'
import { GalleryTab } from '@saas/blocks/admin'
import { ConfigTab } from '@saas/blocks/admin'

type AdminTab = 'overview' | 'menu' | 'gallery' | 'config'

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Resumen', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'menu', label: 'Menú', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'gallery', label: 'Galería', icon: <Image className="w-4 h-4" /> },
  { id: 'config', label: 'Config', icon: <Settings className="w-4 h-4" /> },
]

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" className="h-7 w-7 rounded object-cover" />
            <span className="font-heading text-sm font-bold tracking-wide text-primary">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              Ver landing
            </button>
            <button onClick={() => router.push('/login')} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-card p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-black'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-card p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'gallery' && <GalleryTab />}
          {activeTab === 'config' && <ConfigTab />}
        </div>
      </div>
    </div>
  )
}

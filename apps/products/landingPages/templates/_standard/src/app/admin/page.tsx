'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, Utensils, Settings } from 'lucide-react'
import { OverviewTab, MenuTab, ConfigTab } from '@saas/blocks/admin'

type Tab = 'overview' | 'menu' | 'config'

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Resumen', icon: BarChart3 },
  { id: 'menu', label: 'Menú', icon: Utensils },
  { id: 'config', label: 'Config', icon: Settings },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as Tab
      if (tabs.some(t => t.id === hash)) {
        setActiveTab(hash)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="INJECT_LOGO_URL" alt="INJECT_TENANT_NAME" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-sm font-bold text-white leading-none">INJECT_TENANT_NAME</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Panel Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="sticky top-14 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-lg overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'config' && <ConfigTab />}
      </main>
    </div>
  )
}

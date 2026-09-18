'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  ChartBar,
  ChefHat,
  ClipboardList,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScanLine,
  Settings,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import {
  useAdminMenu,
  useAdminOrders,
  useAdminOverview,
  useAuthStore,
  useSiteConfig,
  useSiteRouter,
} from '@saas/hooks';
import { cn } from '@saas/ui';
import { ConfigTab } from './ConfigTab';
import { CouponsTab } from './CouponsTab';
import { DashboardTab } from './DashboardTab';
import { GalleryTab } from './GalleryTab';
import { KitchenTab } from './KitchenTab';
import { MenuTab } from './MenuTab';
import { OrdersTab } from './OrdersTab';
import { OverviewTab } from './OverviewTab';
import { POSTab } from './POSTab';
import { StatsTab } from './StatsTab';

/** Niveles de plantilla soportados por el admin compartido (basic aún no migra) */
export type AdminAppLevel = 'standard' | 'premium';

export type AdminTabId =
  | 'overview'
  | 'dashboard'
  | 'stats'
  | 'orders'
  | 'kitchen'
  | 'pos'
  | 'menu'
  | 'gallery'
  | 'config';

type TabDef = { id: AdminTabId; label: string; Icon: LucideIcon };

const TABS: Record<AdminAppLevel, TabDef[]> = {
  standard: [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'orders', label: 'Pedidos', Icon: ShoppingBag },
    { id: 'menu', label: 'Menú', Icon: Utensils },
    { id: 'config', label: 'Configuración', Icon: Settings },
  ],
  premium: [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'stats', label: 'Estadísticas', Icon: ChartBar },
    { id: 'orders', label: 'Pedidos', Icon: ClipboardList },
    { id: 'kitchen', label: 'Cocina', Icon: ChefHat },
    { id: 'pos', label: 'POS', Icon: ScanLine },
    { id: 'menu', label: 'Menu', Icon: ShoppingBag },
    { id: 'gallery', label: 'Galería', Icon: ImageIcon },
    { id: 'config', label: 'Configuración', Icon: Settings },
  ],
};

const PRIMARY = 'var(--color-primary)';

/** Shell completo del admin compartido: guard de auth, header y tabs según nivel */
export function AdminApp({ level }: { level: AdminAppLevel }) {
  const router = useSiteRouter();
  const cfg = useSiteConfig();
  const { isLogged, token, user, logout } = useAuthStore();
  const tabs = TABS[level];
  const [activeTab, setActiveTab] = useState<AdminTabId>(level === 'standard' ? 'overview' : 'dashboard');

  // Deep-link por hash (#menu, #orders, ...)
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '') as AdminTabId;
      if (tabs.some((t) => t.id === hash)) setActiveTab(hash);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [tabs]);

  useEffect(() => {
    if (!isLogged || !token) router.replace('/login');
  }, [isLogged, token, router]);

  if (!isLogged || !token) return null;

  const switchTab = (tab: AdminTabId) => {
    setActiveTab(tab);
    if (window.location.hash.replace('#', '') !== tab) window.location.hash = tab;
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const isDarkBg = level === 'premium';

  return (
    <div className={cn('min-h-screen text-white', isDarkBg ? 'bg-[#0F0F0F]' : 'bg-[#0a0a0a]')}>
      {level === 'standard' ? (
        <StandardHeader userName={user?.name ?? ''} userEmail={user?.email ?? ''} onLogout={handleLogout} onHome={() => router.push('/')} cfgName={cfg.name} cfgLogo={cfg.logo} />
      ) : (
        <PremiumHeader initials={initials(user)} onLogout={handleLogout} onHome={() => router.push('/')} cfgName={cfg.name} cfgLogo={cfg.logo} />
      )}

      {/* Tab nav superior horizontal */}
      <div
        className={cn(
          'sticky z-30 overflow-x-auto border-b border-white/5 backdrop-blur-lg',
          level === 'standard' ? 'top-16 bg-[#0a0a0a]/90 py-1' : 'top-14 bg-[#0F0F0F]/95 py-2'
        )}
      >
        <div className={`mx-auto flex w-full max-w-7xl gap-1 px-4`}>
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive ? 'bg-primary text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        {level === 'standard' ? (
          <StandardContent activeTab={activeTab} />
        ) : (
          <PremiumContent activeTab={activeTab} onGoTo={switchTab} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Cockpit (header) ------------------------------ */

function StandardHeader({
  userName,
  userEmail,
  onLogout,
  onHome,
  cfgName,
  cfgLogo,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onHome: () => void;
  cfgName: string;
  cfgLogo: string;
}) {
  const displayName = userName || userEmail?.split('@')[0] || 'Admin';
  const initials = displayName.charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <button onClick={onHome} className="flex items-center gap-3">
            <img src={cfgLogo} alt={cfgName} className="h-9 w-9 rounded-full border border-white/10 object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-bold">{cfgName}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Panel Admin</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-black"
              style={{ backgroundColor: PRIMARY }}
            >
              {initials}
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold">{displayName}</p>
              <p className="text-[10px] text-white/40">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function PremiumHeader({
  initials,
  onLogout,
  onHome,
  cfgName,
  cfgLogo,
}: {
  initials: string;
  onLogout: () => void;
  onHome: () => void;
  cfgName: string;
  cfgLogo: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F0F0F]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <button onClick={onHome} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={cfgLogo} alt={cfgName} className="h-7 w-7 rounded object-cover" />
          <span className="font-heading text-sm font-bold tracking-wide text-primary">Admin Panel</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Ver tienda
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black">
            {initials}
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function initials(user: { name?: string } | null): string {
  return (user?.name ?? 'AD').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

/* ------------------------------ Contenido ------------------------------ */

function StandardContent({ activeTab }: { activeTab: AdminTabId }) {
  return (
    <>
      {activeTab === 'overview' && <OverviewTab primaryColor={PRIMARY} />}
      {activeTab === 'orders' && <OrdersTab primaryColor={PRIMARY} />}
      {activeTab === 'menu' && <MenuTab primaryColor={PRIMARY} />}
      {activeTab === 'config' && (
        <div className="flex flex-col gap-6">
          <ConfigTab primaryColor={PRIMARY} />
          <CouponsSection />
        </div>
      )}
    </>
  );
}

function CouponsSection() {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <Receipt className="h-4 w-4" style={{ color: PRIMARY }} /> Cupones
      </h2>
      <CouponsTab primaryColor={PRIMARY} />
    </div>
  );
}

function PremiumContent({
  activeTab,
  onGoTo,
}: {
  activeTab: AdminTabId;
  onGoTo: (tab: AdminTabId) => void;
}) {
  const overview = useAdminOverview('hoy');
  const orders = useAdminOrders();
  const menu = useAdminMenu();

  return (
    <>
      {activeTab === 'dashboard' && (
        <DashboardTab
          onGoTo={onGoTo}
          stats={overview.stats}
          loading={overview.loading}
          ordersCount={orders.allOrders.length}
          productsCount={menu.items.products.length}
        />
      )}
      {activeTab === 'stats' && <StatsTab primaryColor={PRIMARY} />}
      {activeTab === 'orders' && <OrdersTab primaryColor={PRIMARY} />}
      {activeTab === 'kitchen' && <KitchenTab primaryColor={PRIMARY} />}
      {activeTab === 'pos' && <POSTab primaryColor={PRIMARY} />}
      {activeTab === 'menu' && <MenuTab primaryColor={PRIMARY} />}
      {activeTab === 'gallery' && <GalleryTab />}
      {activeTab === 'config' && (
        <div className="flex flex-col gap-6">
          <ConfigTab primaryColor={PRIMARY} />
          <CouponsSection />
        </div>
      )}
    </>
  );
}
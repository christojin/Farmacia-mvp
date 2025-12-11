import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Stethoscope,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Heart,
  Building2,
  TrendingUp,
  ShoppingBag,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, toggleSidebar, currentModule, setCurrentModule, currentUser, logout } = useStore();

  const menuItems = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'pos', labelKey: 'nav.pos', icon: ShoppingCart },
    { id: 'inventory', labelKey: 'nav.inventory', icon: Package },
    { id: 'consultation', labelKey: 'nav.consultation', icon: Stethoscope },
    { id: 'loyalty', labelKey: 'nav.loyalty', icon: Heart },
    { id: 'customers', labelKey: 'nav.loyalty', icon: Users },
    { id: 'admin', labelKey: 'nav.admin', icon: FileText },
    { id: 'reports', labelKey: 'nav.admin', icon: TrendingUp },
    { id: 'branches', labelKey: 'nav.admin', icon: Building2 },
    { id: 'ecommerce', labelKey: 'nav.pos', icon: ShoppingBag },
  ];

  const handleNavigation = (moduleId: string) => {
    setCurrentModule(moduleId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          'sidebar-overlay lg:hidden',
          sidebarOpen && 'active'
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'sidebar flex flex-col',
          sidebarOpen ? 'open' : 'collapsed',
          'lg:relative lg:left-0'
        )}
      >
        {/* Logo Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center logo-heartbeat shadow-md shadow-[#0D9488]/20">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            {sidebarOpen && (
              <div className="animate-fadeIn">
                <h1 className="text-lg font-bold text-white">FarmaSys</h1>
                <p className="text-xs text-stone-400">{t('nav.dashboard')}</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-stone-300 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={clsx(
                    'sidebar-item w-full',
                    isActive && 'active'
                  )}
                  title={!sidebarOpen ? t(item.labelKey) : undefined}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span className="animate-fadeIn">{t(item.labelKey)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-4">
          {sidebarOpen && currentUser && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 animate-fadeIn">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-stone-400 capitalize">{currentUser.role}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => handleNavigation('settings')}
              className="sidebar-item w-full"
              title={!sidebarOpen ? t('header.settings') : undefined}
            >
              <Settings size={18} />
              {sidebarOpen && <span>{t('header.settings')}</span>}
            </button>

            <button
              onClick={logout}
              className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title={!sidebarOpen ? t('auth.logout') : undefined}
            >
              <LogOut size={18} />
              {sidebarOpen && <span>{t('auth.logout')}</span>}
            </button>
          </div>
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute top-24 -right-3 w-6 h-6 rounded-full bg-stone-700 border-2 border-stone-600 items-center justify-center text-stone-300 hover:bg-stone-600 hover:border-stone-500 transition-all shadow-lg"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>
    </>
  );
}

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
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'consultation', label: 'Consultorio', icon: Stethoscope },
  { id: 'loyalty', label: 'Lealtad', icon: Heart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'admin', label: 'Administración', icon: FileText },
  { id: 'reports', label: 'Reportes', icon: TrendingUp },
  { id: 'branches', label: 'Sucursales', icon: Building2 },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentModule, setCurrentModule, currentUser, logout } = useStore();

  return (
    <aside className={clsx('sidebar flex flex-col', !sidebarOpen && 'collapsed')}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center logo-heartbeat">
          <span className="text-white text-xl font-bold">+</span>
        </div>
        {sidebarOpen && (
          <div className="animate-fadeIn">
            <h1 className="text-lg font-bold text-white">FarmaSys</h1>
            <p className="text-xs text-slate-400">Sistema Integral</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={clsx(
                'sidebar-item w-full',
                isActive && 'active'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={20} />
              {sidebarOpen && <span className="animate-fadeIn">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        {sidebarOpen && currentUser && (
          <div className="mb-3 animate-fadeIn">
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentModule('settings')}
            className="sidebar-item flex-1 justify-center"
            title="Configuración"
          >
            <Settings size={18} />
            {sidebarOpen && <span>Configuración</span>}
          </button>
        </div>

        <button
          onClick={logout}
          className="sidebar-item w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-slate-600 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
}

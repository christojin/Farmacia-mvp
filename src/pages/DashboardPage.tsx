import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  Snowflake,
  Bell,
  ArrowRight,
  BarChart3,
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { dailyMetrics, products, productLots } from '../data/mockData';
import clsx from 'clsx';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function DashboardPage() {
  const { alerts, markAlertAsRead, dismissAlert, setCurrentModule } = useStore();

  const getProductStock = (productId: string) => {
    return productLots
      .filter(l => l.productId === productId)
      .reduce((sum, lot) => sum + lot.quantity, 0);
  };

  const lowStockProducts = products.filter(p => {
    const stock = getProductStock(p.id);
    return stock <= p.reorderPoint;
  });

  const expiringLots = productLots.filter(lot => {
    const daysUntilExpiry = differenceInDays(lot.expiryDate, new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const coldChainProducts = products.filter(p => p.requiresColdChain);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const stats = [
    {
      label: 'Ventas Hoy',
      value: `$${dailyMetrics.totalSales.toLocaleString()}`,
      change: '+12.5%',
      positive: true,
      icon: DollarSign,
      color: 'teal',
    },
    {
      label: 'Transacciones',
      value: dailyMetrics.totalTransactions,
      change: '+8.3%',
      positive: true,
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      label: 'Ticket Promedio',
      value: `$${dailyMetrics.averageTicket}`,
      change: '+3.7%',
      positive: true,
      icon: BarChart3,
      color: 'purple',
    },
    {
      label: 'Margen Bruto',
      value: `${dailyMetrics.grossMargin}%`,
      change: '-1.2%',
      positive: false,
      icon: TrendingUp,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={16} />
          Última actualización: {format(new Date(), 'HH:mm')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-5 animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="stat-card">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className={clsx('stat-change', stat.positive ? 'positive' : 'negative')}>
                    {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.change} vs ayer
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-amber-500" />
              Alertas y Notificaciones
              {unreadAlerts.length > 0 && (
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </h2>
            <button className="text-sm text-teal-600 hover:text-teal-700">Ver todas</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={clsx(
                  'alert-card m-3',
                  alert.severity,
                  !alert.isRead && 'ring-2 ring-offset-2',
                  alert.severity === 'critical' && 'ring-red-300',
                  alert.severity === 'high' && 'ring-amber-300'
                )}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  alert.severity === 'critical' && 'bg-red-100',
                  alert.severity === 'high' && 'bg-amber-100',
                  alert.severity === 'medium' && 'bg-blue-100',
                  alert.severity === 'low' && 'bg-green-100'
                )}>
                  <AlertTriangle
                    size={20}
                    className={clsx(
                      alert.severity === 'critical' && 'text-red-600',
                      alert.severity === 'high' && 'text-amber-600',
                      alert.severity === 'medium' && 'text-blue-600',
                      alert.severity === 'low' && 'text-green-600'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-slate-900">{alert.title}</h4>
                    <span className={clsx(
                      'badge text-xs flex-shrink-0',
                      alert.severity === 'critical' && 'badge-danger',
                      alert.severity === 'high' && 'badge-warning',
                      alert.severity === 'medium' && 'badge-info',
                      alert.severity === 'low' && 'badge-success'
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Bell size={40} className="mx-auto mb-2 opacity-50" />
                <p>No hay alertas pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4">
          <h2 className="font-semibold text-slate-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentModule('pos')}
              className="w-full p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl text-white text-left hover:from-teal-600 hover:to-teal-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Abrir POS</p>
                  <p className="text-sm text-teal-100">Iniciar venta</p>
                </div>
                <ShoppingCart size={24} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setCurrentModule('inventory')}
              className="w-full p-4 bg-slate-100 rounded-xl text-left hover:bg-slate-200 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Inventario</p>
                  <p className="text-sm text-slate-500">{lowStockProducts.length} con stock bajo</p>
                </div>
                <Package size={24} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setCurrentModule('consultation')}
              className="w-full p-4 bg-slate-100 rounded-xl text-left hover:bg-slate-200 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Consultorio</p>
                  <p className="text-sm text-slate-500">Ver pacientes</p>
                </div>
                <Users size={24} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setCurrentModule('admin')}
              className="w-full p-4 bg-slate-100 rounded-xl text-left hover:bg-slate-200 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Corte de Caja</p>
                  <p className="text-sm text-slate-500">Realizar corte</p>
                </div>
                <DollarSign size={24} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Stock Bajo
            </h3>
            <span className="badge badge-warning">{lowStockProducts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {lowStockProducts.slice(0, 5).map(product => {
              const stock = getProductStock(product.id);
              return (
                <div key={product.id} className="p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{stock}</p>
                      <p className="text-xs text-slate-400">Min: {product.reorderPoint}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentModule('inventory')}
            className="w-full p-3 text-sm text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1"
          >
            Ver todo el inventario <ArrowRight size={16} />
          </button>
        </div>

        {/* Expiring Soon */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-red-500" />
              Próximos a Caducar
            </h3>
            <span className="badge badge-danger">{expiringLots.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {expiringLots.slice(0, 5).map(lot => {
              const product = products.find(p => p.id === lot.productId);
              const daysLeft = differenceInDays(lot.expiryDate, new Date());
              return (
                <div key={lot.id} className="p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product?.name}</p>
                      <p className="text-xs text-slate-500">Lote: {lot.lotNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className={clsx(
                        'font-bold',
                        daysLeft <= 7 ? 'text-red-600' : daysLeft <= 15 ? 'text-amber-600' : 'text-slate-600'
                      )}>
                        {daysLeft} días
                      </p>
                      <p className="text-xs text-slate-400">{lot.quantity} uds</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentModule('inventory')}
            className="w-full p-3 text-sm text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1"
          >
            Ver todos los lotes <ArrowRight size={16} />
          </button>
        </div>

        {/* Cold Chain */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Snowflake size={18} className="text-blue-500" />
              Cadena Fría
            </h3>
            <span className="badge badge-info">{coldChainProducts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {coldChainProducts.map(product => {
              const stock = getProductStock(product.id);
              const lots = productLots.filter(l => l.productId === product.id);
              const allVerified = lots.every(l => l.coldChainVerified);

              return (
                <div key={product.id} className="p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        allVerified ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                      )} />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{stock} unidades</p>
                      </div>
                    </div>
                    <span className={clsx(
                      'badge',
                      allVerified ? 'badge-success' : 'badge-danger'
                    )}>
                      {allVerified ? 'OK' : 'Verificar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-blue-50 text-center">
            <p className="text-sm text-blue-700">
              Temperatura actual: <span className="font-bold">4.2°C</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Ventas por Hora - Hoy</h3>
        <div className="flex items-end gap-2 h-48">
          {Object.entries(dailyMetrics.salesByHour).map(([hour, amount]) => {
            const maxAmount = Math.max(...Object.values(dailyMetrics.salesByHour));
            const height = (amount / maxAmount * 100);
            const isCurrentHour = parseInt(hour) === new Date().getHours();

            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div
                  className={clsx(
                    'w-full rounded-t transition-all duration-500 cursor-pointer',
                    isCurrentHour ? 'bg-teal-500' : 'bg-teal-300 hover:bg-teal-400'
                  )}
                  style={{ height: `${height}%` }}
                  title={`${hour}:00 - $${amount.toLocaleString()}`}
                />
                <span className={clsx(
                  'text-xs mt-2',
                  isCurrentHour ? 'text-teal-600 font-bold' : 'text-slate-400'
                )}>
                  {hour}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal-500" />
            <span className="text-slate-600">Hora actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal-300" />
            <span className="text-slate-600">Otras horas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

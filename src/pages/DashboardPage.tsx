import { useState } from 'react';
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
  X,
  CheckCircle,
  Eye,
  RefreshCw,
  Stethoscope
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { dailyMetrics, products, productLots } from '../data/mockData';
import { Modal } from '../components/common/Modal';
import clsx from 'clsx';
import { differenceInDays, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const {
    alerts,
    markAlertAsRead,
    dismissAlert,
    setCurrentModule,
    consultations,
    salesHistory,
    currentShift,
    showNotification
  } = useStore();

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const waitingConsultations = consultations.filter(c => c.status === 'waiting');
  const inProgressConsultations = consultations.filter(c => c.status === 'in_progress');

  // Calculate real metrics from sales history
  const todaySales = salesHistory.filter(s =>
    new Date(s.createdAt).toDateString() === new Date().toDateString()
  );
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  const stats = [
    {
      label: t('dashboard.salesToday'),
      value: `$${(todayTotal || dailyMetrics.totalSales).toLocaleString()}`,
      change: '+12.5%',
      positive: true,
      icon: DollarSign,
      color: 'teal',
      onClick: () => setCurrentModule('admin')
    },
    {
      label: t('dashboard.transactions'),
      value: todaySales.length || dailyMetrics.totalTransactions,
      change: '+8.3%',
      positive: true,
      icon: ShoppingCart,
      color: 'blue',
      onClick: () => setCurrentModule('pos')
    },
    {
      label: t('dashboard.averageTicket'),
      value: `$${todaySales.length > 0 ? (todayTotal / todaySales.length).toFixed(0) : dailyMetrics.averageTicket}`,
      change: '+3.7%',
      positive: true,
      icon: BarChart3,
      color: 'purple',
      onClick: () => setCurrentModule('admin')
    },
    {
      label: t('dashboard.grossMargin'),
      value: `${dailyMetrics.grossMargin}%`,
      change: '-1.2%',
      positive: false,
      icon: TrendingUp,
      color: 'amber',
      onClick: () => setCurrentModule('admin')
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification(t('dashboard.dashboardUpdated'), 'success');
    }, 1000);
  };

  const handleMarkAllRead = () => {
    alerts.forEach(alert => {
      if (!alert.isRead) {
        markAlertAsRead(alert.id);
      }
    });
    showNotification(t('dashboard.allAlertsMarkedRead'), 'success');
  };

  const handleViewAlert = (alert: typeof alerts[0]) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      markAlertAsRead(alert.id);
    }
  };

  const handleAlertAction = (alert: typeof alerts[0]) => {
    // Navigate based on alert type
    switch (alert.type) {
      case 'low_stock':
      case 'expiring_soon':
      case 'expired':
        setCurrentModule('inventory');
        break;
      case 'cash_discrepancy':
        setCurrentModule('admin');
        break;
      case 'cold_chain_breach':
        setCurrentModule('inventory');
        break;
      default:
        setCurrentModule('admin');
    }
    setSelectedAlert(null);
    dismissAlert(alert.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
          <p className="text-slate-500">
            {format(new Date(), i18n.language === 'es' ? "EEEE, d 'de' MMMM 'de' yyyy" : "EEEE, MMMM d, yyyy", { locale: dateLocale })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {currentShift?.status === 'open' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700">{t('dashboard.shiftOpen')}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className={clsx(
              "flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
            {!isRefreshing && <span>{t('dashboard.lastUpdate')}: {format(new Date(), 'HH:mm')}</span>}
          </button>
        </div>
      </div>

      {/* Consultation Alert Banner */}
      {waitingConsultations.length > 0 && (
        <div
          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all"
          onClick={() => setCurrentModule('consultation')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 className="font-semibold">
                  {waitingConsultations.length} {t('dashboard.patientsWaiting')}
                </h3>
                <p className="text-teal-100 text-sm">
                  {inProgressConsultations.length > 0
                    ? `${inProgressConsultations.length} ${t('dashboard.consultationsInProgress')}`
                    : t('dashboard.clickToGoConsultation')}
                </p>
              </div>
            </div>
            <ArrowRight size={24} className="opacity-75" />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.onClick}
              className="card p-5 animate-slideUp text-left hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="stat-card">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className={clsx('stat-change', stat.positive ? 'positive' : 'negative')}>
                    {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.change} {t('dashboard.vsYesterday')}
                  </span>
                </div>
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  stat.color === 'teal' && 'bg-teal-100',
                  stat.color === 'blue' && 'bg-blue-100',
                  stat.color === 'purple' && 'bg-purple-100',
                  stat.color === 'amber' && 'bg-amber-100'
                )}>
                  <Icon className={clsx(
                    stat.color === 'teal' && 'text-teal-600',
                    stat.color === 'blue' && 'text-blue-600',
                    stat.color === 'purple' && 'text-purple-600',
                    stat.color === 'amber' && 'text-amber-600'
                  )} size={24} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-amber-500" />
              {t('dashboard.alerts')}
              {unreadAlerts.length > 0 && (
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {unreadAlerts.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  {t('dashboard.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setShowAllAlerts(true)}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={clsx(
                  'alert-card m-3 cursor-pointer',
                  alert.severity,
                  !alert.isRead && 'ring-2 ring-offset-2',
                  alert.severity === 'critical' && 'ring-red-300',
                  alert.severity === 'high' && 'ring-amber-300'
                )}
                onClick={() => handleViewAlert(alert)}
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
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAlertAction(alert); }}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Eye size={12} />
                      {t('dashboard.viewDetails')}
                    </button>
                    {!alert.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAlertAsRead(alert.id); }}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        {t('dashboard.markRead')}
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      <X size={12} />
                      {t('dashboard.dismiss')}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Bell size={40} className="mx-auto mb-2 opacity-50" />
                <p>{t('dashboard.noAlertsTitle')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4">
          <h2 className="font-semibold text-slate-900 mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentModule('pos')}
              className="w-full p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl text-white text-left hover:from-teal-600 hover:to-teal-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t('dashboard.openPOS')}</p>
                  <p className="text-sm text-teal-100">{t('dashboard.startSale')}</p>
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
                  <p className="font-semibold text-slate-900">{t('nav.inventory')}</p>
                  <p className="text-sm text-slate-500">
                    {lowStockProducts.length > 0
                      ? <span className="text-amber-600 font-medium">{lowStockProducts.length} {t('dashboard.lowStock').toLowerCase()}</span>
                      : t('dashboard.stockInOrder')}
                  </p>
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
                  <p className="font-semibold text-slate-900">{t('nav.consultation')}</p>
                  <p className="text-sm text-slate-500">
                    {waitingConsultations.length > 0
                      ? <span className="text-teal-600 font-medium">{waitingConsultations.length} {t('dashboard.inWaiting')}</span>
                      : t('dashboard.viewPatients')}
                  </p>
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
                  <p className="font-semibold text-slate-900">{t('dashboard.cashRegister')}</p>
                  <p className="text-sm text-slate-500">
                    {currentShift?.status === 'open' ? t('dashboard.activeShift') : t('dashboard.performCut')}
                  </p>
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
              {t('dashboard.lowStock')}
            </h3>
            <span className="badge badge-warning">{lowStockProducts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {lowStockProducts.slice(0, 5).map(product => {
              const stock = getProductStock(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => setCurrentModule('inventory')}
                  className="w-full p-3 hover:bg-slate-50 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={clsx(
                        'font-bold',
                        stock === 0 ? 'text-red-600' : 'text-amber-600'
                      )}>
                        {stock}
                      </p>
                      <p className="text-xs text-slate-400">Min: {product.reorderPoint}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {lowStockProducts.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">
                <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
                {t('dashboard.allProductsHaveStock')}
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrentModule('inventory')}
            className="w-full p-3 text-sm text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1 border-t border-slate-100"
          >
            {t('dashboard.viewAllInventory')} <ArrowRight size={16} />
          </button>
        </div>

        {/* Expiring Soon */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-red-500" />
              {t('dashboard.expiringSoon')}
            </h3>
            <span className="badge badge-danger">{expiringLots.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {expiringLots.slice(0, 5).map(lot => {
              const product = products.find(p => p.id === lot.productId);
              const daysLeft = differenceInDays(lot.expiryDate, new Date());
              return (
                <button
                  key={lot.id}
                  onClick={() => setCurrentModule('inventory')}
                  className="w-full p-3 hover:bg-slate-50 text-left"
                >
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
                        {daysLeft} {t('dashboard.days')}
                      </p>
                      <p className="text-xs text-slate-400">{lot.quantity} {t('dashboard.units')}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {expiringLots.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm">
                <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
                {t('dashboard.noLotsExpiring')}
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrentModule('inventory')}
            className="w-full p-3 text-sm text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1 border-t border-slate-100"
          >
            {t('dashboard.viewAllLots')} <ArrowRight size={16} />
          </button>
        </div>

        {/* Cold Chain */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Snowflake size={18} className="text-blue-500" />
              {t('dashboard.coldChain')}
            </h3>
            <span className="badge badge-info">{coldChainProducts.length}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {coldChainProducts.map(product => {
              const stock = getProductStock(product.id);
              const lots = productLots.filter(l => l.productId === product.id);
              const allVerified = lots.every(l => l.coldChainVerified);

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    if (!allVerified) {
                      showNotification('Verificar temperatura del refrigerador', 'info');
                    }
                    setCurrentModule('inventory');
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left"
                >
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
                </button>
              );
            })}
          </div>
          <div className="p-3 bg-blue-50 text-center border-t border-blue-100">
            <p className="text-sm text-blue-700">
              {t('dashboard.currentTemperature')}: <span className="font-bold">4.2°C</span>
              <span className="text-blue-500 ml-2">({t('dashboard.normalRange')})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">{t('dashboard.salesByHour')}</h3>
          <div className="text-sm text-slate-500">
            {t('common.total')}: <span className="font-bold text-slate-900">${dailyMetrics.totalSales.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-48">
          {Object.entries(dailyMetrics.salesByHour).map(([hour, amount]) => {
            const maxAmount = Math.max(...Object.values(dailyMetrics.salesByHour));
            const height = (amount / maxAmount * 100);
            const isCurrentHour = parseInt(hour) === new Date().getHours();

            return (
              <div key={hour} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className={clsx(
                      'w-full rounded-t transition-all duration-500 cursor-pointer',
                      isCurrentHour ? 'bg-teal-500' : 'bg-teal-300 hover:bg-teal-400'
                    )}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${amount.toLocaleString()}
                  </div>
                </div>
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
            <span className="text-slate-600">{t('dashboard.currentHour')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal-300" />
            <span className="text-slate-600">{t('dashboard.otherHours')}</span>
          </div>
        </div>
      </div>

      {/* All Alerts Modal */}
      <Modal
        isOpen={showAllAlerts}
        onClose={() => setShowAllAlerts(false)}
        title={t('dashboard.alerts')}
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={clsx(
                'p-4 rounded-lg border cursor-pointer',
                !alert.isRead && 'bg-slate-50 border-slate-200',
                alert.isRead && 'bg-white border-slate-100'
              )}
              onClick={() => handleViewAlert(alert)}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className={clsx(
                    alert.severity === 'critical' && 'text-red-600',
                    alert.severity === 'high' && 'text-amber-600',
                    alert.severity === 'medium' && 'text-blue-600',
                    alert.severity === 'low' && 'text-green-600'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">{alert.title}</h4>
                    <span className={clsx(
                      'badge text-xs',
                      alert.severity === 'critical' && 'badge-danger',
                      alert.severity === 'high' && 'badge-warning',
                      alert.severity === 'medium' && 'badge-info',
                      alert.severity === 'low' && 'badge-success'
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAlertAction(alert); }}
                      className="text-xs text-teal-600 hover:text-teal-700"
                    >
                      {t('dashboard.goToResolve')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      {t('dashboard.dismiss')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle size={40} className="mx-auto mb-2 text-green-500" />
              <p>{t('dashboard.noAlertsTitle')}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={t('dashboard.alertDetail')}
        size="md"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className={clsx(
              'p-4 rounded-lg',
              selectedAlert.severity === 'critical' && 'bg-red-50 border border-red-200',
              selectedAlert.severity === 'high' && 'bg-amber-50 border border-amber-200',
              selectedAlert.severity === 'medium' && 'bg-blue-50 border border-blue-200',
              selectedAlert.severity === 'low' && 'bg-green-50 border border-green-200'
            )}>
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={24}
                  className={clsx(
                    selectedAlert.severity === 'critical' && 'text-red-600',
                    selectedAlert.severity === 'high' && 'text-amber-600',
                    selectedAlert.severity === 'medium' && 'text-blue-600',
                    selectedAlert.severity === 'low' && 'text-green-600'
                  )}
                />
                <div>
                  <h4 className="font-semibold text-slate-900">{selectedAlert.title}</h4>
                  <span className={clsx(
                    'badge text-xs mt-1',
                    selectedAlert.severity === 'critical' && 'badge-danger',
                    selectedAlert.severity === 'high' && 'badge-warning',
                    selectedAlert.severity === 'medium' && 'badge-info',
                    selectedAlert.severity === 'low' && 'badge-success'
                  )}>
                    {t('dashboard.priority')}: {selectedAlert.severity}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-slate-500 mb-1">{t('common.description')}</h5>
              <p className="text-slate-700">{selectedAlert.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">{t('dashboard.type')}:</span>
                <p className="font-medium text-slate-900 capitalize">{selectedAlert.type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500">{t('common.date')}:</span>
                <p className="font-medium text-slate-900">
                  {format(selectedAlert.createdAt, "dd/MM/yyyy HH:mm", { locale: dateLocale })}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 btn btn-secondary"
              >
                {t('common.close')}
              </button>
              <button
                onClick={() => handleAlertAction(selectedAlert)}
                className="flex-1 btn btn-primary"
              >
                <ArrowRight size={18} />
                {t('dashboard.goToResolve')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

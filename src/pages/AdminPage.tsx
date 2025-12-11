import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  Wallet,
  Receipt,
  PieChart,
  Download,
  Plus,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { expenseCategories, dailyMetrics, products } from '../data/mockData';
import { useStore } from '../store/useStore';
import { Modal } from '../components/common/Modal';
import type { PaymentMethod } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

type TabType = 'overview' | 'expenses' | 'cash' | 'reports';

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'es' ? es : enUS;
  const {
    expenses,
    addExpense,
    currentShift,
    openShift,
    closeShift,
    salesHistory,
    showNotification,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState('today');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [closingBalance, setClosingBalance] = useState('');
  const [openingBalance, setOpeningBalance] = useState('1000');
  const [showExpenseDetail, setShowExpenseDetail] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    categoryId: '',
    amount: '',
    description: '',
    vendor: '',
    paymentMethod: 'cash' as PaymentMethod,
  });

  const tabs = [
    { id: 'overview', label: t('admin.overview'), icon: PieChart },
    { id: 'expenses', label: t('admin.expenses'), icon: Receipt },
    { id: 'cash', label: t('admin.cashRegister'), icon: Wallet },
    { id: 'reports', label: t('admin.reports'), icon: FileText },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todaySales = salesHistory.reduce((sum, s) => sum + s.total, 0);

  const handleAddExpense = () => {
    if (!newExpense.categoryId || !newExpense.amount || !newExpense.description) {
      showNotification('Por favor completa los campos requeridos', 'error');
      return;
    }

    addExpense({
      branchId: 'branch-1',
      categoryId: newExpense.categoryId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      vendor: newExpense.vendor || undefined,
      paymentMethod: newExpense.paymentMethod,
      date: new Date(),
      createdBy: currentUser?.id || '',
      createdAt: new Date(),
    });

    setShowAddExpense(false);
    setNewExpense({
      categoryId: '',
      amount: '',
      description: '',
      vendor: '',
      paymentMethod: 'cash',
    });
  };

  const handleOpenShift = () => {
    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      showNotification('Por favor ingresa un monto válido', 'error');
      return;
    }
    openShift(balance);
    setShowOpenShift(false);
    setOpeningBalance('1000');
  };

  const handleCloseShift = () => {
    const balance = parseFloat(closingBalance);
    if (isNaN(balance) || balance < 0) {
      showNotification('Por favor ingresa el monto en caja', 'error');
      return;
    }
    closeShift(balance);
    setShowCloseShift(false);
    setClosingBalance('');
  };

  const expectedCash = currentShift
    ? currentShift.openingBalance + currentShift.cashPayments - currentShift.returnsTotal
    : 0;

  const handleExportReport = (reportName: string) => {
    showNotification(`Generando reporte: ${reportName}...`, 'info');
    setTimeout(() => {
      showNotification(`Reporte "${reportName}" generado exitosamente`, 'success');
    }, 1500);
  };

  const selectedExpense = showExpenseDetail
    ? expenses.find(e => e.id === showExpenseDetail)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
          <p className="text-slate-500">Finanzas, gastos y reportes</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-auto"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
          <button
            onClick={() => handleExportReport('General')}
            className="btn btn-secondary"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Ventas del día</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${(dailyMetrics.totalSales + todaySales).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} />
            {salesHistory.length} ventas hoy
          </p>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Ticket promedio</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Receipt className="text-blue-600" size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${dailyMetrics.averageTicket.toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">
            {dailyMetrics.totalTransactions + salesHistory.length} transacciones
          </p>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Margen bruto</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <PieChart className="text-purple-600" size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {dailyMetrics.grossMargin}%
          </p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} />
            +2.3% vs promedio
          </p>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Gastos del mes</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="text-red-600" size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${totalExpenses.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">
            {expenses.length} registros
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={clsx(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Ventas por Categoría</h3>
            <div className="space-y-4">
              {Object.entries(dailyMetrics.salesByCategory).map(([catId, amount]) => {
                const percentage = (amount / dailyMetrics.totalSales * 100).toFixed(1);
                const colors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];
                const colorIndex = Object.keys(dailyMetrics.salesByCategory).indexOf(catId) % colors.length;

                return (
                  <div key={catId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Categoría {catId.split('-')[1]}</span>
                      <span className="font-medium">${amount.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full transition-all duration-500', colors[colorIndex])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales by Hour */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Ventas por Hora</h3>
            <div className="flex items-end gap-1 h-48">
              {Object.entries(dailyMetrics.salesByHour).map(([hour, amount]) => {
                const maxAmount = Math.max(...Object.values(dailyMetrics.salesByHour));
                const height = (amount / maxAmount * 100);
                const isCurrentHour = parseInt(hour) === new Date().getHours();

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="relative w-full">
                      <div
                        className={clsx(
                          'w-full rounded-t transition-all duration-500',
                          isCurrentHour ? 'bg-teal-600' : 'bg-teal-400 group-hover:bg-teal-500'
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
                    )}>{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Productos Estrella</h3>
            <div className="space-y-3">
              {dailyMetrics.topProducts.map((product, index) => {
                const productData = products.find(p => p.id === product.productId);
                return (
                  <div key={product.productId} className="flex items-center gap-3">
                    <span className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {productData?.name || `Producto #${product.productId.split('-')[1]}`}
                      </p>
                      <p className="text-sm text-slate-500">{product.quantity} unidades</p>
                    </div>
                    <span className="font-bold text-teal-600">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPIs */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">KPIs del Día</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Rotación de Inventario</p>
                <p className="text-2xl font-bold text-slate-900">{dailyMetrics.inventoryTurnover}x</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Mermas</p>
                <p className="text-2xl font-bold text-red-600">${dailyMetrics.shrinkageValue}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Ventas/Hora</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${Math.round(dailyMetrics.totalSales / 12).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Transacciones/Hora</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(dailyMetrics.totalTransactions / 12)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Registro de Gastos</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Nuevo Gasto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Método</th>
                  <th className="text-right">Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No hay gastos registrados
                    </td>
                  </tr>
                ) : (
                  expenses.map(expense => {
                    const category = expenseCategories.find(c => c.id === expense.categoryId);
                    return (
                      <tr key={expense.id} className="hover:bg-slate-50">
                        <td>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: dateLocale })}</td>
                        <td>
                          <span className="badge badge-primary">{category?.name || 'Sin categoría'}</span>
                        </td>
                        <td className="max-w-xs truncate">{expense.description}</td>
                        <td className="capitalize">{expense.paymentMethod}</td>
                        <td className="text-right font-medium text-red-600">
                          -${expense.amount.toLocaleString()}
                        </td>
                        <td>
                          <button
                            onClick={() => setShowExpenseDetail(expense.id)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {expenses.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Total de gastos:</span>
                <span className="text-xl font-bold text-red-600">
                  -${totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cash' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Shift */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-teal-500" />
              Turno Actual
            </h3>
            {currentShift && currentShift.status === 'open' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <span className="text-slate-600">Fondo inicial</span>
                  <span className="font-bold text-slate-900">
                    ${currentShift.openingBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-slate-600">Ventas en efectivo</span>
                  <span className="font-bold text-green-600">
                    +${currentShift.cashPayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-slate-600">Ventas con tarjeta</span>
                  <span className="font-bold text-blue-600">
                    ${currentShift.cardPayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <span className="text-slate-600">Devoluciones</span>
                  <span className="font-bold text-red-600">
                    -${currentShift.returnsTotal.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Efectivo esperado</span>
                  <span className="text-xl font-bold text-teal-600">
                    ${expectedCash.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setShowCloseShift(true)}
                  className="btn btn-danger w-full"
                >
                  Realizar Corte de Caja
                </button>
              </div>
            ) : currentShift && currentShift.status === 'closed' ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 rounded-lg text-center">
                  <CheckCircle size={40} className="mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-slate-900">Turno cerrado</p>
                  <p className="text-sm text-slate-500">
                    Cerrado el {format(new Date(currentShift.closedAt!), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                  </p>
                  {currentShift.difference !== undefined && currentShift.difference !== 0 && (
                    <p className={clsx(
                      'mt-2 font-bold',
                      currentShift.difference > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      Diferencia: {currentShift.difference > 0 ? '+' : ''}${currentShift.difference.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowOpenShift(true)}
                  className="btn btn-primary w-full"
                >
                  Abrir Nuevo Turno
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Wallet size={40} className="mx-auto mb-2 opacity-50" />
                <p>No hay turno abierto</p>
                <button
                  onClick={() => setShowOpenShift(true)}
                  className="btn btn-primary mt-4"
                >
                  Abrir Turno
                </button>
              </div>
            )}
          </div>

          {/* Cash Movements / Sales History */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" />
              Movimientos del Día
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {salesHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Receipt size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No hay movimientos hoy</p>
                </div>
              ) : (
                salesHistory.map((sale, index) => (
                  <div
                    key={sale.id}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <TrendingUp className="text-green-600" size={20} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Venta #{(1234 + index).toString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(sale.createdAt), 'HH:mm', { locale: dateLocale })} - {sale.items.length} items
                      </p>
                    </div>
                    <span className="font-bold text-green-600">
                      +${sale.total.toFixed(2)}
                    </span>
                  </div>
                ))
              )}

              {/* Static example movements */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg opacity-60">
                <TrendingUp className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Venta #1234</p>
                  <p className="text-xs text-slate-500">10:30 AM</p>
                </div>
                <span className="font-bold text-green-600">+$289.00</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg opacity-60">
                <TrendingDown className="text-red-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Retiro - Cambio</p>
                  <p className="text-xs text-slate-500">12:00 PM</p>
                </div>
                <span className="font-bold text-red-600">-$500.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Ventas Diarias', icon: TrendingUp, color: 'bg-teal-100', iconColor: 'text-teal-600' },
            { name: 'Margen por Producto', icon: PieChart, color: 'bg-blue-100', iconColor: 'text-blue-600' },
            { name: 'Inventario Valorizado', icon: DollarSign, color: 'bg-purple-100', iconColor: 'text-purple-600' },
            { name: 'Control de Mermas', icon: TrendingDown, color: 'bg-red-100', iconColor: 'text-red-600' },
            { name: 'Comisiones Médicas', icon: FileText, color: 'bg-amber-100', iconColor: 'text-amber-600' },
            { name: 'Auditoría de Caja', icon: Wallet, color: 'bg-green-100', iconColor: 'text-green-600' },
          ].map(report => (
            <button
              key={report.name}
              onClick={() => handleExportReport(report.name)}
              className="card p-6 text-left hover:shadow-lg transition-all card-hover"
            >
              <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center mb-4`}>
                <report.icon className={report.iconColor} size={24} />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">{report.name}</h4>
              <p className="text-sm text-slate-500">Generar reporte</p>
            </button>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Registrar Gasto"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoría *
            </label>
            <select
              value={newExpense.categoryId}
              onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
              className="input"
            >
              <option value="">Seleccionar categoría</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="input pl-8"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="input"
              placeholder="Descripción del gasto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proveedor (opcional)
            </label>
            <input
              type="text"
              value={newExpense.vendor}
              onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
              className="input"
              placeholder="Nombre del proveedor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Método de pago
            </label>
            <select
              value={newExpense.paymentMethod}
              onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as PaymentMethod })}
              className="input"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowAddExpense(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddExpense}
              className="btn btn-primary flex-1"
            >
              <Plus size={18} />
              Registrar Gasto
            </button>
          </div>
        </div>
      </Modal>

      {/* View Expense Detail Modal */}
      <Modal
        isOpen={!!showExpenseDetail}
        onClose={() => setShowExpenseDetail(null)}
        title="Detalle del Gasto"
        size="sm"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600">
                -${selectedExpense.amount.toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha:</span>
                <span className="font-medium">
                  {format(new Date(selectedExpense.date), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría:</span>
                <span className="font-medium">
                  {expenseCategories.find(c => c.id === selectedExpense.categoryId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Descripción:</span>
                <span className="font-medium text-right max-w-[200px]">
                  {selectedExpense.description}
                </span>
              </div>
              {selectedExpense.vendor && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Proveedor:</span>
                  <span className="font-medium">{selectedExpense.vendor}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Método de pago:</span>
                <span className="font-medium capitalize">{selectedExpense.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setShowExpenseDetail(null)}
              className="btn btn-secondary w-full"
            >
              Cerrar
            </button>
          </div>
        )}
      </Modal>

      {/* Open Shift Modal */}
      <Modal
        isOpen={showOpenShift}
        onClose={() => setShowOpenShift(false)}
        title="Abrir Turno"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Ingresa el fondo inicial de caja para comenzar el turno.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fondo inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="input pl-8 text-center text-2xl font-bold"
                placeholder="1000.00"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[500, 1000, 1500, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => setOpeningBalance(amount.toString())}
                className="btn btn-secondary btn-sm flex-1"
              >
                ${amount}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowOpenShift(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleOpenShift}
              className="btn btn-primary flex-1"
            >
              Abrir Turno
            </button>
          </div>
        </div>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        isOpen={showCloseShift}
        onClose={() => setShowCloseShift(false)}
        title="Cerrar Turno"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Efectivo esperado en caja:</p>
            <p className="text-2xl font-bold text-teal-600">
              ${expectedCash.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Efectivo contado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                className="input pl-8 text-center text-2xl font-bold"
                placeholder={expectedCash.toFixed(2)}
                step="0.01"
              />
            </div>
          </div>
          {closingBalance && (
            <div className={clsx(
              'p-3 rounded-lg text-center',
              parseFloat(closingBalance) === expectedCash ? 'bg-green-50' :
              parseFloat(closingBalance) > expectedCash ? 'bg-blue-50' : 'bg-red-50'
            )}>
              <p className="text-sm text-slate-600">Diferencia:</p>
              <p className={clsx(
                'font-bold',
                parseFloat(closingBalance) === expectedCash ? 'text-green-600' :
                parseFloat(closingBalance) > expectedCash ? 'text-blue-600' : 'text-red-600'
              )}>
                {parseFloat(closingBalance) >= expectedCash ? '+' : ''}
                ${(parseFloat(closingBalance) - expectedCash).toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowCloseShift(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleCloseShift}
              className="btn btn-danger flex-1"
            >
              Cerrar Turno
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

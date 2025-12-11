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
  Plus
} from 'lucide-react';
import { expenses, expenseCategories, shifts, dailyMetrics } from '../data/mockData';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TabType = 'overview' | 'expenses' | 'cash' | 'reports';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState('today');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: PieChart },
    { id: 'expenses', label: 'Gastos', icon: Receipt },
    { id: 'cash', label: 'Caja', icon: Wallet },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentShift = shifts.find(s => s.status === 'open');

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
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Ventas del día</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${dailyMetrics.totalSales.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} />
            +12.5% vs ayer
          </p>
        </div>

        <div className="card p-4">
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
            {dailyMetrics.totalTransactions} transacciones
          </p>
        </div>

        <div className="card p-4">
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

        <div className="card p-4">
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
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={clsx(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
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

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-teal-500 rounded-t transition-all duration-500 hover:bg-teal-600"
                      style={{ height: `${height}%` }}
                      title={`$${amount.toLocaleString()}`}
                    />
                    <span className="text-xs text-slate-400 mt-2">{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Productos Estrella</h3>
            <div className="space-y-3">
              {dailyMetrics.topProducts.map((product, index) => (
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
                    <p className="font-medium text-slate-900">Producto #{product.productId.split('-')[1]}</p>
                    <p className="text-sm text-slate-500">{product.quantity} unidades</p>
                  </div>
                  <span className="font-bold text-teal-600">
                    ${product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
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
            <button className="btn btn-primary btn-sm">
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
                {expenses.map(expense => {
                  const category = expenseCategories.find(c => c.id === expense.categoryId);
                  return (
                    <tr key={expense.id}>
                      <td>{format(expense.date, 'dd/MM/yyyy', { locale: es })}</td>
                      <td>
                        <span className="badge badge-primary">{category?.name}</span>
                      </td>
                      <td>{expense.description}</td>
                      <td className="capitalize">{expense.paymentMethod}</td>
                      <td className="text-right font-medium text-red-600">
                        -${expense.amount.toLocaleString()}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm">Ver</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            {currentShift ? (
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
                    ${(currentShift.openingBalance + currentShift.cashPayments - currentShift.returnsTotal).toLocaleString()}
                  </span>
                </div>
                <button className="btn btn-danger w-full">
                  Realizar Corte de Caja
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Wallet size={40} className="mx-auto mb-2 opacity-50" />
                <p>No hay turno abierto</p>
                <button className="btn btn-primary mt-4">Abrir Turno</button>
              </div>
            )}
          </div>

          {/* Cash Movements */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" />
              Movimientos del Día
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Venta #1234</p>
                  <p className="text-xs text-slate-500">10:30 AM</p>
                </div>
                <span className="font-bold text-green-600">+$289.00</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Venta #1235</p>
                  <p className="text-xs text-slate-500">11:15 AM</p>
                </div>
                <span className="font-bold text-green-600">+$156.50</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <TrendingDown className="text-red-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Retiro - Cambio</p>
                  <p className="text-xs text-slate-500">12:00 PM</p>
                </div>
                <span className="font-bold text-red-600">-$500.00</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Venta #1236</p>
                  <p className="text-xs text-slate-500">12:45 PM</p>
                </div>
                <span className="font-bold text-green-600">+$420.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Ventas Diarias', icon: TrendingUp, color: 'teal' },
            { name: 'Margen por Producto', icon: PieChart, color: 'blue' },
            { name: 'Inventario Valorizado', icon: DollarSign, color: 'purple' },
            { name: 'Control de Mermas', icon: TrendingDown, color: 'red' },
            { name: 'Comisiones Médicas', icon: FileText, color: 'amber' },
            { name: 'Auditoría de Caja', icon: Wallet, color: 'green' },
          ].map(report => (
            <button
              key={report.name}
              className="card p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-${report.color}-100 flex items-center justify-center mb-4`}>
                <report.icon className={`text-${report.color}-600`} size={24} />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">{report.name}</h4>
              <p className="text-sm text-slate-500">Generar reporte</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

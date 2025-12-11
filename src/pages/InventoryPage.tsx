import { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Snowflake,
  Calendar,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  FileDown,
  Mail
} from 'lucide-react';
import { products, productLots, productPrices, categories } from '../data/mockData';
import clsx from 'clsx';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

type TabType = 'products' | 'lots' | 'movements' | 'transfers' | 'shrinkage';

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'lots', label: 'Lotes y Caducidad', icon: Calendar },
    { id: 'movements', label: 'Movimientos', icon: TrendingUp },
    { id: 'transfers', label: 'Traspasos', icon: ArrowRightLeft },
    { id: 'shrinkage', label: 'Mermas', icon: TrendingDown },
  ];

  const getProductStock = (productId: string) => {
    return productLots
      .filter(l => l.productId === productId)
      .reduce((sum, lot) => sum + lot.quantity, 0);
  };

  const getProductPrice = (productId: string) => {
    return productPrices.find(p => p.productId === productId)?.price || 0;
  };

  const getProductCost = (productId: string) => {
    const lots = productLots.filter(l => l.productId === productId);
    if (lots.length === 0) return 0;
    return lots.reduce((sum, lot) => sum + lot.costPrice, 0) / lots.length;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const stock = getProductStock(product.id);
    const matchesLowStock = !showLowStock || stock <= product.reorderPoint;
    return matchesSearch && matchesCategory && matchesLowStock && product.isActive;
  });

  const expiringLots = productLots.filter(lot => {
    const daysUntilExpiry = differenceInDays(lot.expiryDate, new Date());
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  }).sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const lowStockProducts = products.filter(p => {
    const stock = getProductStock(p.id);
    return stock <= p.reorderPoint;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500">Gestión de productos, lotes y movimientos</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary">
            <Mail size={18} />
            Enviar Pedido Sugerido
          </button>
          <button className="btn btn-secondary">
            <FileDown size={18} />
            Exportar
          </button>
          <button className="btn btn-primary">
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-amber-500 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{lowStockProducts.length}</p>
              <p className="text-sm text-amber-600">Productos con stock bajo</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Calendar className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{expiringLots.length}</p>
              <p className="text-sm text-red-600">Lotes próximos a caducar</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Snowflake className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {products.filter(p => p.requiresColdChain).length}
              </p>
              <p className="text-sm text-blue-600">Productos cadena fría</p>
            </div>
          </div>
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
      {activeTab === 'products' && (
        <div className="card">
          {/* Filters */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-auto"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-600">Solo stock bajo</span>
            </label>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Costo Prom.</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Margen</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stock = getProductStock(product.id);
                  const price = getProductPrice(product.id);
                  const cost = getProductCost(product.id);
                  const margin = price > 0 ? ((price - cost) / price * 100) : 0;
                  const category = categories.find(c => c.id === product.categoryId);
                  const isLowStock = stock <= product.reorderPoint;
                  const isOutOfStock = stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.barcode}</p>
                          </div>
                          {product.requiresColdChain && (
                            <span title="Cadena fría">
                              <Snowflake size={16} className="text-blue-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-600">{product.sku}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                        >
                          {category?.name}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={clsx(
                          'font-medium',
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
                        )}>
                          {stock}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">/ {product.maxStock}</span>
                      </td>
                      <td className="text-right text-slate-600">${cost.toFixed(2)}</td>
                      <td className="text-right font-medium">${price.toFixed(2)}</td>
                      <td className="text-right">
                        <span className={clsx(
                          'font-medium',
                          margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Sin stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">Stock bajo</span>
                        ) : (
                          <span className="badge badge-success">Normal</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm">Editar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'lots' && (
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Lotes por Fecha de Caducidad</h3>
            <p className="text-sm text-slate-500">Control PEPS (Primeras Entradas, Primeras Salidas)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Costo</th>
                  <th>Fecha Recepción</th>
                  <th>Fecha Caducidad</th>
                  <th>Días Restantes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productLots
                  .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
                  .map(lot => {
                    const product = products.find(p => p.id === lot.productId);
                    const daysUntilExpiry = differenceInDays(lot.expiryDate, new Date());
                    const isExpired = daysUntilExpiry < 0;
                    const isExpiringSoon = daysUntilExpiry <= 30;
                    const isExpiringMedium = daysUntilExpiry <= 90;

                    return (
                      <tr key={lot.id} className="hover:bg-slate-50">
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product?.name}</span>
                            {lot.coldChainVerified && (
                              <Snowflake size={14} className="text-blue-500" />
                            )}
                          </div>
                        </td>
                        <td className="font-mono text-sm">{lot.lotNumber}</td>
                        <td className="text-right font-medium">{lot.quantity}</td>
                        <td className="text-right">${lot.costPrice.toFixed(2)}</td>
                        <td>{format(lot.receivedDate, 'dd/MM/yyyy', { locale: es })}</td>
                        <td>{format(lot.expiryDate, 'dd/MM/yyyy', { locale: es })}</td>
                        <td>
                          <span className={clsx(
                            'font-medium',
                            isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : isExpiringMedium ? 'text-yellow-600' : 'text-green-600'
                          )}>
                            {isExpired ? 'Vencido' : `${daysUntilExpiry} días`}
                          </span>
                        </td>
                        <td>
                          {isExpired ? (
                            <span className="badge badge-danger">Vencido</span>
                          ) : isExpiringSoon ? (
                            <span className="badge badge-warning">Urgente</span>
                          ) : isExpiringMedium ? (
                            <span className="badge badge-info">Próximo</span>
                          ) : (
                            <span className="badge badge-success">OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="card p-8 text-center text-slate-500">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">Historial de Movimientos</p>
          <p className="text-sm">Entradas, salidas, ajustes y transferencias</p>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="card p-8 text-center text-slate-500">
          <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">Traspasos entre Sucursales</p>
          <p className="text-sm">Gestión de movimientos inter-sucursal</p>
        </div>
      )}

      {activeTab === 'shrinkage' && (
        <div className="card p-8 text-center text-slate-500">
          <TrendingDown size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">Control de Mermas</p>
          <p className="text-sm">Registro de productos vencidos, dañados o pérdidas</p>
        </div>
      )}
    </div>
  );
}

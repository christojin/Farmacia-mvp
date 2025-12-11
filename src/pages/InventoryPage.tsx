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
  Mail,
  Edit2,
  Save,
  BarChart3,
  Minus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { products, productLots, productPrices, categories } from '../data/mockData';
import { useStore } from '../store/useStore';
import { Modal } from '../components/common/Modal';
import clsx from 'clsx';
import { format, differenceInDays } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Product, ProductLot } from '../types';

type TabType = 'products' | 'lots' | 'movements' | 'transfers' | 'shrinkage';

interface StockAdjustment {
  type: 'add' | 'remove';
  quantity: number;
  reason: string;
}

interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'merma';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
}

export function InventoryPage() {
  const { t, i18n } = useTranslation();
  const { showNotification } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const dateLocale = i18n.language === 'es' ? es : enUS;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Modal states
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [showShrinkageModal, setShowShrinkageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);

  // Mock movements data
  const [movements, setMovements] = useState<Movement[]>([
    { id: '1', productId: 'prod-1', productName: 'Paracetamol 500mg', type: 'venta', quantity: 5, reason: 'Venta #V001', date: new Date(), user: 'Ana García' },
    { id: '2', productId: 'prod-2', productName: 'Ibuprofeno 400mg', type: 'entrada', quantity: 100, reason: 'Compra #C123', date: new Date(Date.now() - 86400000), user: 'Carlos López' },
    { id: '3', productId: 'prod-3', productName: 'Amoxicilina 500mg', type: 'ajuste', quantity: -3, reason: 'Conteo físico', date: new Date(Date.now() - 172800000), user: 'María Sánchez' },
  ]);

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    genericName: '',
    requiresPrescription: false,
    requiresColdChain: false,
    minStock: '10',
    maxStock: '100',
    reorderPoint: '20',
    price: '',
    cost: ''
  });

  const [stockAdjustment, setStockAdjustment] = useState<StockAdjustment>({
    type: 'add',
    quantity: 0,
    reason: ''
  });

  const [shrinkageForm, setShrinkageForm] = useState({
    reason: 'expired' as 'expired' | 'damaged' | 'theft' | 'count_discrepancy' | 'other',
    quantity: '',
    notes: ''
  });

  const tabs = [
    { id: 'products', label: t('inventory.products'), icon: Package },
    { id: 'lots', label: t('inventory.lots'), icon: Calendar },
    { id: 'movements', label: t('inventory.movements'), icon: TrendingUp },
    { id: 'transfers', label: t('inventory.transfers'), icon: ArrowRightLeft },
    { id: 'shrinkage', label: t('inventory.shrinkage'), icon: TrendingDown },
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

  const handleNewProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.categoryId) {
      showNotification(t('inventory.fillRequiredFields'), 'error');
      return;
    }
    showNotification(t('inventory.productCreated'), 'success');
    setNewProduct({
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      genericName: '',
      requiresPrescription: false,
      requiresColdChain: false,
      minStock: '10',
      maxStock: '100',
      reorderPoint: '20',
      price: '',
      cost: ''
    });
    setShowNewProductModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!selectedProduct) return;
    showNotification(t('inventory.productUpdated'), 'success');
    setShowEditProductModal(false);
    setSelectedProduct(null);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment({ type: 'add', quantity: 0, reason: '' });
    setShowAdjustStockModal(true);
  };

  const handleSaveStockAdjustment = () => {
    if (!selectedProduct || stockAdjustment.quantity <= 0) {
      showNotification(t('inventory.enterValidQuantity'), 'error');
      return;
    }

    const adjustedQty = stockAdjustment.type === 'add' ? stockAdjustment.quantity : -stockAdjustment.quantity;
    const newMovement: Movement = {
      id: Math.random().toString(36).substring(7),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: 'ajuste',
      quantity: adjustedQty,
      reason: stockAdjustment.reason || t('inventory.adjustStock'),
      date: new Date(),
      user: 'Usuario actual'
    };

    setMovements(prev => [newMovement, ...prev]);
    showNotification(
      stockAdjustment.type === 'add' ? t('inventory.stockIncreased') : t('inventory.stockDecreased'),
      'success'
    );
    setShowAdjustStockModal(false);
    setSelectedProduct(null);
  };

  const handleRegisterShrinkage = (lot: ProductLot) => {
    setSelectedLot(lot);
    setShrinkageForm({ reason: 'expired', quantity: '', notes: '' });
    setShowShrinkageModal(true);
  };

  const handleSaveShrinkage = () => {
    if (!selectedLot || !shrinkageForm.quantity) {
      showNotification(t('inventory.enterValidQuantity'), 'error');
      return;
    }

    const qty = parseInt(shrinkageForm.quantity);
    if (qty > selectedLot.quantity) {
      showNotification(t('inventory.quantityExceedsStock'), 'error');
      return;
    }

    const product = products.find(p => p.id === selectedLot.productId);
    const reasonLabels: Record<string, string> = {
      expired: t('inventory.expiredProduct'),
      damaged: t('inventory.damagedProduct'),
      theft: t('inventory.theft'),
      count_discrepancy: t('inventory.countDiscrepancy'),
      other: t('inventory.other')
    };

    const newMovement: Movement = {
      id: Math.random().toString(36).substring(7),
      productId: selectedLot.productId,
      productName: product?.name || '',
      type: 'merma',
      quantity: -qty,
      reason: `${reasonLabels[shrinkageForm.reason]}${shrinkageForm.notes ? ': ' + shrinkageForm.notes : ''}`,
      date: new Date(),
      user: 'Usuario actual'
    };

    setMovements(prev => [newMovement, ...prev]);
    showNotification(t('inventory.shrinkageRegistered'), 'success');
    setShowShrinkageModal(false);
    setSelectedLot(null);
  };

  const handleExport = () => {
    showNotification(t('inventory.exportingInventory'), 'info');
  };

  const handleSendSuggestedOrder = () => {
    showNotification(t('inventory.sendingOrder'), 'info');
  };

  const getMovementColor = (type: Movement['type']) => {
    switch (type) {
      case 'entrada': return 'text-green-600 bg-green-50';
      case 'salida': case 'venta': return 'text-red-600 bg-red-50';
      case 'ajuste': return 'text-blue-600 bg-blue-50';
      case 'merma': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('inventory.title')}</h1>
          <p className="text-slate-500">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSendSuggestedOrder} className="btn btn-secondary">
            <Mail size={18} />
            {t('inventory.sendSuggestedOrder')}
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            <FileDown size={18} />
            {t('common.export')}
          </button>
          <button onClick={() => setShowNewProductModal(true)} className="btn btn-primary">
            <Plus size={18} />
            {t('inventory.newProduct')}
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setShowLowStock(true); setActiveTab('products'); }}
          className="card p-4 border-l-4 border-l-amber-500 bg-amber-50 text-left hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{lowStockProducts.length}</p>
              <p className="text-sm text-amber-600">{t('inventory.lowStockProducts')}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('lots')}
          className="card p-4 border-l-4 border-l-red-500 bg-red-50 text-left hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Calendar className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{expiringLots.length}</p>
              <p className="text-sm text-red-600">{t('inventory.expiringLots')}</p>
            </div>
          </div>
        </button>

        <div className="card p-4 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Snowflake className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {products.filter(p => p.requiresColdChain).length}
              </p>
              <p className="text-sm text-blue-600">{t('inventory.coldChainProducts')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
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
              <option value="">{t('inventory.allCategories')}</option>
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
              <span className="text-sm text-slate-600">{t('inventory.lowStockOnly')}</span>
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
                  <th className="text-right">{t('inventory.avgCost')}</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">{t('inventory.margin')}</th>
                  <th>Estado</th>
                  <th>Acciones</th>
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
                          <span className="badge badge-danger">{t('inventory.outOfStock')}</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">{t('dashboard.lowStock')}</span>
                        ) : (
                          <span className="badge badge-success">{t('inventory.normal')}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAdjustStock(product)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            title="Ajustar stock"
                          >
                            <BarChart3 size={16} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t('inventory.noProductsFound')}</p>
              <p className="text-sm">{t('inventory.adjustFilters')}</p>
            </div>
          )}
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
                  <th>Acciones</th>
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
                        <td>{format(lot.receivedDate, 'dd/MM/yyyy', { locale: dateLocale })}</td>
                        <td>{format(lot.expiryDate, 'dd/MM/yyyy', { locale: dateLocale })}</td>
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
                        <td>
                          {(isExpired || isExpiringSoon) && (
                            <button
                              onClick={() => handleRegisterShrinkage(lot)}
                              className="btn btn-ghost btn-sm text-red-600"
                            >
                              <TrendingDown size={14} />
                              Merma
                            </button>
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
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Historial de Movimientos</h3>
              <p className="text-sm text-slate-500">Entradas, salidas, ajustes y mermas</p>
            </div>
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <FileDown size={16} />
              Exportar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th className="text-right">Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(movement => (
                  <tr key={movement.id} className="hover:bg-slate-50">
                    <td className="text-slate-600">
                      {format(movement.date, "dd/MM/yyyy HH:mm", { locale: dateLocale })}
                    </td>
                    <td className="font-medium">{movement.productName}</td>
                    <td>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium capitalize',
                        getMovementColor(movement.type)
                      )}>
                        {movement.type}
                      </span>
                    </td>
                    <td className={clsx(
                      'text-right font-medium',
                      movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </td>
                    <td className="text-slate-600">{movement.reason}</td>
                    <td className="text-slate-500">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movements.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="card p-8 text-center text-slate-500">
          <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">Traspasos entre Sucursales</p>
          <p className="text-sm mb-4">Gestión de movimientos inter-sucursal</p>
          <button
            onClick={() => showNotification('Función disponible en versión multi-sucursal', 'info')}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Nuevo Traspaso
          </button>
        </div>
      )}

      {activeTab === 'shrinkage' && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Control de Mermas</h3>
              <p className="text-sm text-slate-500">Registro de productos vencidos, dañados o pérdidas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th className="text-right">Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.filter(m => m.type === 'merma').map(movement => (
                  <tr key={movement.id} className="hover:bg-slate-50">
                    <td className="text-slate-600">
                      {format(movement.date, "dd/MM/yyyy HH:mm", { locale: dateLocale })}
                    </td>
                    <td className="font-medium">{movement.productName}</td>
                    <td className="text-right font-medium text-red-600">
                      {movement.quantity}
                    </td>
                    <td className="text-slate-600">{movement.reason}</td>
                    <td className="text-slate-500">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movements.filter(m => m.type === 'merma').length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <TrendingDown size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hay mermas registradas</p>
              <p className="text-sm">Las mermas se registran desde la pestaña de Lotes</p>
            </div>
          )}
        </div>
      )}

      {/* New Product Modal */}
      <Modal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Nuevo Producto"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ej: Paracetamol 500mg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ej: MED-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código de Barras
              </label>
              <input
                type="text"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="7501234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoría *
              </label>
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre Genérico
              </label>
              <input
                type="text"
                value={newProduct.genericName}
                onChange={(e) => setNewProduct({ ...newProduct, genericName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ej: Acetaminofén"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio de Venta
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Costo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={newProduct.minStock}
                onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Máximo
              </label>
              <input
                type="number"
                value={newProduct.maxStock}
                onChange={(e) => setNewProduct({ ...newProduct, maxStock: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Punto de Reorden
              </label>
              <input
                type="number"
                value={newProduct.reorderPoint}
                onChange={(e) => setNewProduct({ ...newProduct, reorderPoint: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProduct.requiresPrescription}
                onChange={(e) => setNewProduct({ ...newProduct, requiresPrescription: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-500"
              />
              <span className="text-sm text-slate-600">Requiere receta</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newProduct.requiresColdChain}
                onChange={(e) => setNewProduct({ ...newProduct, requiresColdChain: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-500"
              />
              <span className="text-sm text-slate-600">Cadena fría</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowNewProductModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleNewProduct}
              className="flex-1 btn btn-primary"
            >
              <Save size={18} />
              Guardar Producto
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditProductModal}
        onClose={() => { setShowEditProductModal(false); setSelectedProduct(null); }}
        title="Editar Producto"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={selectedProduct.sku}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={selectedProduct.barcode}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, barcode: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={selectedProduct.minStock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, minStock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Máximo
                </label>
                <input
                  type="number"
                  value={selectedProduct.maxStock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, maxStock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Punto de Reorden
                </label>
                <input
                  type="number"
                  value={selectedProduct.reorderPoint}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, reorderPoint: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowEditProductModal(false); setSelectedProduct(null); }}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 btn btn-primary"
              >
                <Save size={18} />
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showAdjustStockModal}
        onClose={() => { setShowAdjustStockModal(false); setSelectedProduct(null); }}
        title="Ajustar Stock"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium text-slate-900">{selectedProduct.name}</p>
              <p className="text-sm text-slate-500">Stock actual: {getProductStock(selectedProduct.id)} unidades</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Ajuste
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'add' })}
                  className={clsx(
                    'flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors',
                    stockAdjustment.type === 'add'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Plus size={18} />
                  Entrada
                </button>
                <button
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'remove' })}
                  className={clsx(
                    'flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors',
                    stockAdjustment.type === 'remove'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Minus size={18} />
                  Salida
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                value={stockAdjustment.quantity || ''}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ej: Conteo físico, Compra, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowAdjustStockModal(false); setSelectedProduct(null); }}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStockAdjustment}
                className={clsx(
                  'flex-1 btn',
                  stockAdjustment.type === 'add'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                )}
              >
                <Save size={18} />
                Aplicar Ajuste
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Shrinkage Modal */}
      <Modal
        isOpen={showShrinkageModal}
        onClose={() => { setShowShrinkageModal(false); setSelectedLot(null); }}
        title="Registrar Merma"
        size="md"
      >
        {selectedLot && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium text-red-900">
                {products.find(p => p.id === selectedLot.productId)?.name}
              </p>
              <p className="text-sm text-red-700">Lote: {selectedLot.lotNumber}</p>
              <p className="text-sm text-red-700">Stock disponible: {selectedLot.quantity} unidades</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo de la Merma
              </label>
              <select
                value={shrinkageForm.reason}
                onChange={(e) => setShrinkageForm({ ...shrinkageForm, reason: e.target.value as typeof shrinkageForm.reason })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="expired">Producto vencido</option>
                <option value="damaged">Producto dañado</option>
                <option value="theft">Robo/Hurto</option>
                <option value="count_discrepancy">Discrepancia en conteo</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cantidad a dar de baja
              </label>
              <input
                type="number"
                value={shrinkageForm.quantity}
                onChange={(e) => setShrinkageForm({ ...shrinkageForm, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="1"
                max={selectedLot.quantity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={shrinkageForm.notes}
                onChange={(e) => setShrinkageForm({ ...shrinkageForm, notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                rows={2}
                placeholder="Observaciones..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowShrinkageModal(false); setSelectedLot(null); }}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveShrinkage}
                className="flex-1 btn bg-red-500 hover:bg-red-600 text-white"
              >
                <TrendingDown size={18} />
                Registrar Merma
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

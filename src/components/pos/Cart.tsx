import { useState } from 'react';
import { Trash2, Plus, Minus, Tag, Pause, QrCode, Search, UserPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loyaltyAccounts } from '../../data/mockData';
import { Modal } from '../common/Modal';
import clsx from 'clsx';

export function Cart() {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    holdCurrentSale,
    heldSales,
    resumeHeldSale,
    currentCustomer,
    setCurrentCustomer,
    customers,
    searchCustomers,
    addCustomer,
    showNotification,
  } = useStore();

  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const { subtotal, discount, total } = getCartTotal();

  const searchResults = searchQuery.length >= 2 ? searchCustomers(searchQuery) : [];

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    setCurrentCustomer(customer);
    setShowCustomerSearch(false);
    setSearchQuery('');
    const loyalty = loyaltyAccounts.find(l => l.customerId === customer.id);
    showNotification(`Cliente ${customer.firstName} agregado - ${loyalty?.points || 0} puntos`, 'success');
  };

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      showNotification('Por favor completa los campos requeridos', 'error');
      return;
    }

    const customer = addCustomer({
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      phone: newCustomer.phone,
      email: newCustomer.email || undefined,
      address: undefined,
      birthDate: undefined,
    });

    setCurrentCustomer(customer);
    setShowAddCustomer(false);
    setNewCustomer({ firstName: '', lastName: '', phone: '', email: '' });
    showNotification(`Cliente ${customer.firstName} creado y agregado`, 'success');
  };

  const customerLoyalty = currentCustomer
    ? loyaltyAccounts.find(l => l.customerId === currentCustomer.id)
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Customer Section */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900">Cliente</h3>
          {currentCustomer && (
            <button
              onClick={() => setCurrentCustomer(null)}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Quitar
            </button>
          )}
        </div>
        {currentCustomer ? (
          <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              {currentCustomer.firstName[0]}{currentCustomer.lastName[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                {currentCustomer.firstName} {currentCustomer.lastName}
              </p>
              <p className="text-xs text-slate-500">{currentCustomer.phone}</p>
            </div>
            {customerLoyalty && (
              <div className="text-right">
                <p className="font-bold text-teal-600">{customerLoyalty.points}</p>
                <p className="text-xs text-slate-400">puntos</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowCustomerSearch(true)}
            className="btn btn-secondary w-full"
          >
            <QrCode size={18} />
            Escanear QR / Buscar cliente
          </button>
        )}
      </div>

      {/* Held Sales */}
      {heldSales.length > 0 && (
        <div className="p-4 border-b border-slate-200 bg-amber-50">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Ventas en espera ({heldSales.length})
          </h4>
          <div className="flex gap-2 overflow-x-auto">
            {heldSales.map(sale => (
              <button
                key={sale.id}
                onClick={() => resumeHeldSale(sale.id)}
                className="px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm whitespace-nowrap hover:bg-amber-100 transition-colors"
              >
                ${sale.total.toFixed(2)} - {sale.items.length} items
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Carrito vacío</p>
            <p className="text-sm">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-lg animate-slideUp"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 text-sm">
                      {item.productName}
                    </h4>
                    {item.promotionName && (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-600 mt-1">
                        <Tag size={12} />
                        {item.promotionName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    {item.discount > 0 && (
                      <p className="text-xs text-slate-400 line-through">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    )}
                    <p className={clsx(
                      'font-semibold',
                      item.discount > 0 ? 'text-teal-600' : 'text-slate-900'
                    )}>
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-teal-600">Descuentos</span>
              <span className="text-teal-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-teal-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => holdCurrentSale()}
            disabled={cart.length === 0}
            className="btn btn-secondary"
          >
            <Pause size={18} />
            En espera
          </button>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="btn btn-danger"
          >
            <Trash2 size={18} />
            Cancelar
          </button>
        </div>
      </div>

      {/* Customer Search Modal */}
      <Modal
        isOpen={showCustomerSearch}
        onClose={() => {
          setShowCustomerSearch(false);
          setSearchQuery('');
        }}
        title="Buscar Cliente"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono o QR..."
              className="input pl-10"
              autoFocus
            />
          </div>

          {searchQuery.length >= 2 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map(customer => {
                  const loyalty = loyaltyAccounts.find(l => l.customerId === customer.id);
                  return (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full p-3 text-left bg-slate-50 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{customer.phone}</p>
                      </div>
                      {loyalty && (
                        <div className="text-right">
                          <p className="font-bold text-teal-600">{loyalty.points}</p>
                          <p className="text-xs text-slate-400 capitalize">{loyalty.level}</p>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <p>No se encontraron clientes</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setShowCustomerSearch(false);
              setShowAddCustomer(true);
            }}
            className="btn btn-secondary w-full"
          >
            <UserPlus size={18} />
            Crear nuevo cliente
          </button>
        </div>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        title="Nuevo Cliente"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                className="input"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                className="input"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="input"
              placeholder="555-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="input"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowAddCustomer(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddCustomer}
              className="btn btn-primary flex-1"
            >
              <UserPlus size={18} />
              Crear Cliente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

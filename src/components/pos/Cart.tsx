import { Trash2, Plus, Minus, Tag, Pause, QrCode } from 'lucide-react';
import { useStore } from '../../store/useStore';
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
  } = useStore();

  const { subtotal, discount, total } = getCartTotal();

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
            <div>
              <p className="font-medium text-slate-900">
                {currentCustomer.firstName} {currentCustomer.lastName}
              </p>
              <p className="text-xs text-slate-500">{currentCustomer.phone}</p>
            </div>
          </div>
        ) : (
          <button className="btn btn-secondary w-full">
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
    </div>
  );
}

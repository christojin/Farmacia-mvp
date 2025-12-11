import { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Ticket,
  Check,
  X,
  Calculator,
  Star
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { PaymentMethod } from '../../types';
import clsx from 'clsx';

interface PaymentPanelProps {
  onClose: () => void;
}

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: 'cash', label: 'Efectivo', icon: Banknote },
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia', icon: Smartphone },
  { id: 'voucher', label: 'Vale', icon: Ticket },
  { id: 'points', label: 'Puntos', icon: Star },
];

const quickAmounts = [20, 50, 100, 200, 500, 1000];

export function PaymentPanel({ onClose }: PaymentPanelProps) {
  const { getCartTotal, payments, addPayment, clearPayments, completeSale, currentCustomer } = useStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const { total } = getCartTotal();
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;
  const change = totalPaid > total ? totalPaid - total : 0;

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    addPayment({
      method: selectedMethod,
      amount: paymentAmount,
      reference: reference || undefined,
    });

    setAmount('');
    setReference('');
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleExactAmount = () => {
    setAmount(remaining.toFixed(2));
  };

  const handleCompleteSale = () => {
    const sale = completeSale();
    if (sale) {
      onClose();
      // Toast notification is handled by the store's completeSale function
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-500 to-teal-600">
          <div>
            <h2 className="text-xl font-bold text-white">Procesar Pago</h2>
            <p className="text-teal-100 text-sm">Total a pagar: ${total.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-sm text-slate-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl text-center">
              <p className="text-sm text-teal-600 mb-1">Pagado</p>
              <p className="text-2xl font-bold text-teal-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className={clsx(
              'p-4 rounded-xl text-center',
              remaining > 0 ? 'bg-amber-50' : 'bg-green-50'
            )}>
              <p className={clsx(
                'text-sm mb-1',
                remaining > 0 ? 'text-amber-600' : 'text-green-600'
              )}>
                {remaining > 0 ? 'Restante' : 'Cambio'}
              </p>
              <p className={clsx(
                'text-2xl font-bold',
                remaining > 0 ? 'text-amber-600' : 'text-green-600'
              )}>
                ${(remaining > 0 ? remaining : change).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Método de pago
            </label>
            <div className="flex gap-2 flex-wrap">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                const isDisabled = method.id === 'points' && !currentCustomer;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isDisabled}
                    className={clsx(
                      'btn',
                      selectedMethod === method.id ? 'btn-primary' : 'btn-secondary',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    title={isDisabled ? 'Requiere cliente con cuenta de lealtad' : undefined}
                  >
                    <Icon size={18} />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Monto
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input input-lg pl-8 text-right text-2xl font-bold"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleExactAmount}
                className="btn btn-secondary"
                title="Monto exacto"
              >
                <Calculator size={20} />
              </button>
            </div>
          </div>

          {/* Quick Amounts */}
          {selectedMethod === 'cash' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Montos rápidos
              </label>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map(value => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className="btn btn-secondary btn-sm"
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reference (for card/transfer) */}
          {(selectedMethod === 'card' || selectedMethod === 'transfer' || selectedMethod === 'voucher') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {selectedMethod === 'card' ? 'Últimos 4 dígitos' :
                 selectedMethod === 'voucher' ? 'Código de vale' : 'Referencia'}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={selectedMethod === 'card' ? '1234' : 'Referencia'}
                className="input"
                maxLength={selectedMethod === 'card' ? 4 : undefined}
              />
            </div>
          )}

          {/* Add Payment Button */}
          <button
            onClick={handleAddPayment}
            disabled={!amount || parseFloat(amount) <= 0}
            className="btn btn-primary w-full mb-4"
          >
            Agregar Pago
          </button>

          {/* Payment List */}
          {payments.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Pagos registrados
                </label>
                <button
                  onClick={clearPayments}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Limpiar todos
                </button>
              </div>
              <div className="space-y-2">
                {payments.map((payment, index) => {
                  const method = paymentMethods.find(m => m.id === payment.method);
                  const Icon = method?.icon || Banknote;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-slate-400" />
                        <span className="font-medium">{method?.label}</span>
                        {payment.reference && (
                          <span className="text-sm text-slate-400">({payment.reference})</span>
                        )}
                      </div>
                      <span className="font-bold text-teal-600">${payment.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCompleteSale}
            disabled={remaining > 0}
            className="btn btn-success btn-lg w-full"
          >
            <Check size={20} />
            Completar Venta {remaining <= 0 && `(Cambio: $${change.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

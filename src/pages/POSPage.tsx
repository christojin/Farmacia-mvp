import { useState } from 'react';
import { CreditCard, Keyboard, RotateCcw, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProductGrid } from '../components/pos/ProductGrid';
import { Cart } from '../components/pos/Cart';
import { PaymentPanel } from '../components/pos/PaymentPanel';
import { useStore } from '../store/useStore';

export function POSPage() {
  const { t } = useTranslation();
  const [showPayment, setShowPayment] = useState(false);
  const { cart, getCartTotal, isTrainingMode } = useStore();
  const { total } = getCartTotal();

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">{t('inventory.products')}</h2>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm">
              <Keyboard size={16} />
              F1 - {t('common.search')}
            </button>
            <button className="btn btn-secondary btn-sm">
              <RotateCcw size={16} />
              F2 - {t('pos.holdSale')}
            </button>
            <button className="btn btn-secondary btn-sm">
              <FileText size={16} />
              F3 - {t('consultation.prescription')}
            </button>
          </div>
        </div>
        <ProductGrid />
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 card flex flex-col">
        <Cart />

        {/* Checkout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="btn btn-success btn-lg w-full"
          >
            <CreditCard size={20} />
            {t('pos.completeSale')} ${total.toFixed(2)}
          </button>
          {isTrainingMode && (
            <p className="text-xs text-center text-amber-600 mt-2">
              {t('auth.trainingMode')}
            </p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentPanel onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Sale,
  SaleItem,
  Payment,
  Customer,
  Product,
  Consultation,
  Alert,
  Shift,
} from '../types';
import type { Language } from '../utils/translations';
import {
  products,
  productPrices,
  productLots,
  customers,
  loyaltyAccounts,
  promotions,
  users,
  consultations as mockConsultations,
  alerts as mockAlerts,
  shifts as mockShifts,
} from '../data/mockData';

interface CartItem extends Omit<SaleItem, 'id'> {
  id: string;
}

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isTrainingMode: boolean;

  // POS
  cart: CartItem[];
  heldSales: Sale[];
  currentCustomer: Customer | null;
  payments: Payment[];

  // Data
  products: Product[];
  consultations: Consultation[];
  alerts: Alert[];
  currentShift: Shift | null;

  // UI
  sidebarOpen: boolean;
  currentModule: string;
  language: Language;

  // Actions - Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  toggleTrainingMode: () => void;

  // Actions - POS
  addToCart: (productId: string, quantity?: number, isFractional?: boolean) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  holdCurrentSale: (reason?: string) => void;
  resumeHeldSale: (saleId: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  clearPayments: () => void;
  completeSale: () => Sale | null;

  // Actions - Consultations
  updateConsultationStatus: (id: string, status: Consultation['status']) => void;
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt'>) => void;

  // Actions - Alerts
  markAlertAsRead: (id: string) => void;
  dismissAlert: (id: string) => void;

  // Actions - UI
  toggleSidebar: () => void;
  setCurrentModule: (module: string) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;

  // Computed
  getCartTotal: () => { subtotal: number; discount: number; total: number };
  getProductById: (id: string) => Product | undefined;
  getProductPrice: (productId: string) => number;
  getProductStock: (productId: string) => number;
  applyPromotions: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      isTrainingMode: false,
      cart: [],
      heldSales: [],
      currentCustomer: null,
      payments: [],
      products: products,
      consultations: mockConsultations,
      alerts: mockAlerts,
      currentShift: mockShifts[0],
      sidebarOpen: true,
      currentModule: 'dashboard',
      language: 'es' as Language,

      // Auth actions
      login: (email: string, _password: string) => {
        const user = users.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, cart: [], payments: [], currentCustomer: null });
      },

      toggleTrainingMode: () => {
        set(state => ({ isTrainingMode: !state.isTrainingMode }));
      },

      // POS actions
      addToCart: (productId: string, quantity = 1, isFractional = false) => {
        const product = products.find(p => p.id === productId);
        const price = productPrices.find(p => p.productId === productId);
        const lot = productLots.find(l => l.productId === productId && l.quantity > 0);

        if (!product || !price || !lot) return;

        set(state => {
          const existingItem = state.cart.find(item => item.productId === productId && !item.isFractional);

          if (existingItem && !isFractional) {
            return {
              cart: state.cart.map(item =>
                item.id === existingItem.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      subtotal: (item.quantity + quantity) * item.unitPrice,
                      total: (item.quantity + quantity) * item.unitPrice - item.discount,
                    }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: generateId(),
            productId,
            lotId: lot.id,
            productName: product.name,
            quantity,
            unitPrice: price.price,
            discount: 0,
            discountType: 'fixed',
            subtotal: quantity * price.price,
            total: quantity * price.price,
            isFractional,
          };

          return { cart: [...state.cart, newItem] };
        });

        // Apply promotions after adding item
        get().applyPromotions();
      },

      removeFromCart: (itemId: string) => {
        set(state => ({ cart: state.cart.filter(item => item.id !== itemId) }));
        get().applyPromotions();
      },

      updateCartItemQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        set(state => ({
          cart: state.cart.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  subtotal: quantity * item.unitPrice,
                  total: quantity * item.unitPrice - item.discount,
                }
              : item
          ),
        }));
        get().applyPromotions();
      },

      clearCart: () => {
        set({ cart: [], payments: [], currentCustomer: null });
      },

      setCurrentCustomer: (customer: Customer | null) => {
        set({ currentCustomer: customer });
      },

      holdCurrentSale: (reason?: string) => {
        const state = get();
        if (state.cart.length === 0) return;

        const heldSale: Sale = {
          id: generateId(),
          branchId: 'branch-1',
          cashRegisterId: 'register-1',
          customerId: state.currentCustomer?.id,
          items: state.cart,
          payments: [],
          subtotal: state.getCartTotal().subtotal,
          discountTotal: state.getCartTotal().discount,
          taxTotal: 0,
          total: state.getCartTotal().total,
          status: 'held',
          isHeld: true,
          holdReason: reason,
          isTrainingMode: state.isTrainingMode,
          createdBy: state.currentUser?.id || '',
          createdAt: new Date(),
        };

        set(state => ({
          heldSales: [...state.heldSales, heldSale],
          cart: [],
          payments: [],
          currentCustomer: null,
        }));
      },

      resumeHeldSale: (saleId: string) => {
        const state = get();
        const heldSale = state.heldSales.find(s => s.id === saleId);
        if (!heldSale) return;

        const customer = heldSale.customerId
          ? customers.find(c => c.id === heldSale.customerId) || null
          : null;

        set(state => ({
          cart: heldSale.items as CartItem[],
          currentCustomer: customer,
          heldSales: state.heldSales.filter(s => s.id !== saleId),
        }));
      },

      addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => {
        set(state => ({
          payments: [...state.payments, { ...payment, id: generateId(), createdAt: new Date() }],
        }));
      },

      clearPayments: () => {
        set({ payments: [] });
      },

      completeSale: () => {
        const state = get();
        if (state.cart.length === 0) return null;

        const totals = state.getCartTotal();
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid < totals.total) return null;

        const sale: Sale = {
          id: generateId(),
          branchId: 'branch-1',
          cashRegisterId: 'register-1',
          customerId: state.currentCustomer?.id,
          items: state.cart,
          payments: state.payments,
          subtotal: totals.subtotal,
          discountTotal: totals.discount,
          taxTotal: 0,
          total: totals.total,
          status: 'completed',
          isHeld: false,
          isTrainingMode: state.isTrainingMode,
          createdBy: state.currentUser?.id || '',
          createdAt: new Date(),
          completedAt: new Date(),
        };

        // Award loyalty points if customer exists
        if (state.currentCustomer) {
          const loyalty = loyaltyAccounts.find(l => l.customerId === state.currentCustomer?.id);
          if (loyalty) {
            const pointsEarned = Math.floor(totals.total / 10); // 1 point per $10
            loyalty.points += pointsEarned;
            loyalty.totalPointsEarned += pointsEarned;
          }
        }

        set({ cart: [], payments: [], currentCustomer: null });
        return sale;
      },

      // Consultation actions
      updateConsultationStatus: (id: string, status: Consultation['status']) => {
        set(state => ({
          consultations: state.consultations.map(c =>
            c.id === id ? { ...c, status, completedAt: status === 'completed' ? new Date() : undefined } : c
          ),
        }));
      },

      addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt'>) => {
        set(state => ({
          consultations: [
            ...state.consultations,
            { ...consultation, id: generateId(), createdAt: new Date() },
          ],
        }));
      },

      // Alert actions
      markAlertAsRead: (id: string) => {
        set(state => ({
          alerts: state.alerts.map(a => (a.id === id ? { ...a, isRead: true } : a)),
        }));
      },

      dismissAlert: (id: string) => {
        set(state => ({
          alerts: state.alerts.filter(a => a.id !== id),
        }));
      },

      // UI actions
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setCurrentModule: (module: string) => {
        set({ currentModule: module });
      },

      setLanguage: (lang: Language) => {
        set({ language: lang });
      },

      toggleLanguage: () => {
        set(state => ({ language: state.language === 'es' ? 'en' : 'es' }));
      },

      // Computed values
      getCartTotal: () => {
        const cart = get().cart;
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const discount = cart.reduce((sum, item) => sum + item.discount, 0);
        return {
          subtotal,
          discount,
          total: subtotal - discount,
        };
      },

      getProductById: (id: string) => {
        return products.find(p => p.id === id);
      },

      getProductPrice: (productId: string) => {
        const price = productPrices.find(p => p.productId === productId);
        return price?.price || 0;
      },

      getProductStock: (productId: string) => {
        return productLots
          .filter(l => l.productId === productId)
          .reduce((sum, lot) => sum + lot.quantity, 0);
      },

      applyPromotions: () => {
        set(state => {
          const updatedCart: CartItem[] = state.cart.map(item => ({
            ...item,
            discount: 0,
            promotionId: undefined as string | undefined,
            promotionName: undefined as string | undefined
          }));

          // Group items by category for promotion matching
          const itemsByCategory: Record<string, CartItem[]> = {};
          updatedCart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              if (!itemsByCategory[product.categoryId]) {
                itemsByCategory[product.categoryId] = [];
              }
              itemsByCategory[product.categoryId].push(item);
            }
          });

          // Apply promotions
          promotions
            .filter(p => p.isActive && new Date() >= p.startDate && new Date() <= p.endDate)
            .sort((a, b) => a.priority - b.priority)
            .forEach(promo => {
              promo.categoryIds?.forEach(catId => {
                const categoryItems = itemsByCategory[catId] || [];

                if (promo.type === '2x1') {
                  // For 2x1: Buy 2, get cheapest free
                  const totalQty = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
                  if (totalQty >= 2) {
                    const sortedItems = [...categoryItems].sort((a, b) => a.unitPrice - b.unitPrice);
                    const freeItems = Math.floor(totalQty / 2);
                    let remainingFree = freeItems;

                    sortedItems.forEach(item => {
                      if (remainingFree > 0) {
                        const freeFromThis = Math.min(item.quantity, remainingFree);
                        const cartItem = updatedCart.find(c => c.id === item.id);
                        if (cartItem) {
                          cartItem.discount = freeFromThis * cartItem.unitPrice;
                          cartItem.promotionId = promo.id;
                          cartItem.promotionName = promo.name;
                          cartItem.total = cartItem.subtotal - cartItem.discount;
                        }
                        remainingFree -= freeFromThis;
                      }
                    });
                  }
                } else if (promo.type === '3x2') {
                  // For 3x2: Buy 3, get cheapest free
                  const totalQty = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
                  if (totalQty >= 3) {
                    const sortedItems = [...categoryItems].sort((a, b) => a.unitPrice - b.unitPrice);
                    const freeItems = Math.floor(totalQty / 3);
                    let remainingFree = freeItems;

                    sortedItems.forEach(item => {
                      if (remainingFree > 0) {
                        const freeFromThis = Math.min(item.quantity, remainingFree);
                        const cartItem = updatedCart.find(c => c.id === item.id);
                        if (cartItem) {
                          cartItem.discount = freeFromThis * cartItem.unitPrice;
                          cartItem.promotionId = promo.id;
                          cartItem.promotionName = promo.name;
                          cartItem.total = cartItem.subtotal - cartItem.discount;
                        }
                        remainingFree -= freeFromThis;
                      }
                    });
                  }
                } else if (promo.type === 'second_unit_discount') {
                  // Second unit at discount
                  categoryItems.forEach(item => {
                    if (item.quantity >= 2) {
                      const discountUnits = Math.floor(item.quantity / 2);
                      const cartItem = updatedCart.find(c => c.id === item.id);
                      if (cartItem && promo.config.discountPercentage) {
                        cartItem.discount = discountUnits * cartItem.unitPrice * (promo.config.discountPercentage / 100);
                        cartItem.promotionId = promo.id;
                        cartItem.promotionName = promo.name;
                        cartItem.total = cartItem.subtotal - cartItem.discount;
                      }
                    }
                  });
                } else if (promo.type === 'percentage') {
                  // Percentage discount on all items
                  categoryItems.forEach(item => {
                    const cartItem = updatedCart.find(c => c.id === item.id);
                    if (cartItem && promo.config.discountPercentage) {
                      cartItem.discount = cartItem.subtotal * (promo.config.discountPercentage / 100);
                      cartItem.promotionId = promo.id;
                      cartItem.promotionName = promo.name;
                      cartItem.total = cartItem.subtotal - cartItem.discount;
                    }
                  });
                }
              });
            });

          return { cart: updatedCart };
        });
      },
    }),
    {
      name: 'farmacia-store',
      partialize: (state) => ({
        isTrainingMode: state.isTrainingMode,
        heldSales: state.heldSales,
        language: state.language,
      }),
    }
  )
);

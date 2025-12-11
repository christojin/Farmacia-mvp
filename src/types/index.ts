// ==================== CORE ENTITIES ====================

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  plan: 'basic' | 'professional' | 'enterprise';
  createdAt: Date;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  settings: BranchSettings;
}

export interface BranchSettings {
  independentPricing: boolean;
  timezone: string;
  currency: string;
}

export interface User {
  id: string;
  tenantId: string;
  branchId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'cashier' | 'doctor' | 'pharmacist' | 'inventory';

// ==================== PRODUCT & INVENTORY ====================

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  genericName?: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  requiresPrescription: boolean;
  requiresColdChain: boolean;
  isControlled: boolean;
  isFractional: boolean;
  unitsPerPackage: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductLot {
  id: string;
  productId: string;
  branchId: string;
  lotNumber: string;
  quantity: number;
  costPrice: number;
  expiryDate: Date;
  receivedDate: Date;
  coldChainVerified: boolean;
}

export interface ProductPrice {
  id: string;
  productId: string;
  branchId: string;
  price: number;
  minPrice: number;
  maxDiscount: number;
  lastUpdated: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays: number;
}

// ==================== INVENTORY MOVEMENTS ====================

export interface StockMovement {
  id: string;
  productId: string;
  branchId: string;
  lotId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId: string;
  createdAt: Date;
}

export type StockMovementType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'shrinkage' | 'expired';

export interface Transfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  status: TransferStatus;
  items: TransferItem[];
  requestedBy: string;
  approvedBy?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'received' | 'cancelled';

export interface TransferItem {
  productId: string;
  lotId: string;
  quantity: number;
}

export interface Shrinkage {
  id: string;
  branchId: string;
  productId: string;
  lotId: string;
  quantity: number;
  reason: ShrinkageReason;
  notes?: string;
  reportedBy: string;
  createdAt: Date;
}

export type ShrinkageReason = 'expired' | 'damaged' | 'theft' | 'count_discrepancy' | 'other';

// ==================== SALES & POS ====================

export interface Sale {
  id: string;
  branchId: string;
  cashRegisterId: string;
  customerId?: string;
  prescriptionId?: string;
  items: SaleItem[];
  payments: Payment[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  status: SaleStatus;
  isHeld: boolean;
  holdReason?: string;
  isTrainingMode: boolean;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export type SaleStatus = 'in_progress' | 'held' | 'completed' | 'cancelled' | 'returned';

export interface SaleItem {
  id: string;
  productId: string;
  lotId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  promotionId?: string;
  promotionName?: string;
  subtotal: number;
  total: number;
  isFractional: boolean;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  cardLast4?: string;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'voucher' | 'points' | 'mixed';

// ==================== PROMOTIONS ====================

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  config: PromotionConfig;
  productIds?: string[];
  categoryIds?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  priority: number;
  maxUsesPerCustomer?: number;
  minPurchaseAmount?: number;
}

export type PromotionType = '2x1' | '3x2' | 'percentage' | 'fixed' | 'second_unit_discount' | 'bundle';

export interface PromotionConfig {
  buyQuantity?: number;
  getQuantity?: number;
  discountPercentage?: number;
  discountFixed?: number;
  applyToCheapest?: boolean;
}

// ==================== RETURNS & VOUCHERS ====================

export interface Return {
  id: string;
  saleId: string;
  branchId: string;
  items: ReturnItem[];
  reason: string;
  refundMethod: 'cash' | 'voucher' | 'card_reversal';
  refundAmount: number;
  voucherId?: string;
  processedBy: string;
  createdAt: Date;
}

export interface ReturnItem {
  saleItemId: string;
  productId: string;
  quantity: number;
  returnToStock: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'return' | 'promotional' | 'gift';
  amount: number;
  balance: number;
  customerId?: string;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// ==================== CUSTOMER & LOYALTY ====================

export interface Customer {
  id: string;
  qrCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: Date;
  address?: string;
  createdAt: Date;
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  level: LoyaltyLevel;
  createdAt: Date;
}

export type LoyaltyLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  referenceType?: 'sale' | 'return' | 'promotion' | 'manual';
  referenceId?: string;
  description?: string;
  createdAt: Date;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'voucher';
  value: number;
  minLevel: LoyaltyLevel;
  isActive: boolean;
}

// ==================== MEDICAL CONSULTATION ====================

export interface Consultation {
  id: string;
  branchId: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  chiefComplaint: string;
  diagnosis?: string;
  notes?: string;
  vitalSigns?: VitalSigns;
  status: ConsultationStatus;
  fee: number;
  createdAt: Date;
  completedAt?: Date;
}

export type ConsultationStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  consultations: Consultation[];
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface Prescription {
  id: string;
  consultationId: string;
  doctorId: string;
  patientName: string;
  items: PrescriptionItem[];
  diagnosis: string;
  notes?: string;
  qrCode: string;
  isDispensed: boolean;
  dispensedSaleId?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface PrescriptionItem {
  productId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface DoctorCommission {
  id: string;
  doctorId: string;
  consultationId?: string;
  saleId?: string;
  type: 'consultation' | 'prescription_sale';
  amount: number;
  percentage: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  paidAt?: Date;
}

// ==================== CASH REGISTER ====================

export interface CashRegister {
  id: string;
  branchId: string;
  name: string;
  isOpen: boolean;
  currentShiftId?: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  cashRegisterId: string;
  userId: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  salesTotal: number;
  returnsTotal: number;
  cashPayments: number;
  cardPayments: number;
  voucherPayments: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: 'cash_in' | 'cash_out' | 'sale' | 'return';
  amount: number;
  reason?: string;
  referenceId?: string;
  createdBy: string;
  createdAt: Date;
}

// ==================== EXPENSES & FINANCE ====================

export interface Expense {
  id: string;
  branchId: string;
  categoryId: string;
  amount: number;
  description: string;
  vendor?: string;
  receiptUrl?: string;
  paymentMethod: PaymentMethod;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  budget?: number;
}

// ==================== AUDIT & SECURITY ====================

export interface AuditLog {
  id: string;
  tenantId: string;
  branchId?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  branchId?: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
}

export type AlertType =
  | 'low_stock'
  | 'expiring_soon'
  | 'expired'
  | 'cash_discrepancy'
  | 'suspicious_activity'
  | 'cold_chain_breach'
  | 'high_shrinkage';

// ==================== KPIs & REPORTS ====================

export interface DailyMetrics {
  date: Date;
  branchId: string;
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
  salesByHour: Record<number, number>;
  salesByCategory: Record<string, number>;
  topProducts: { productId: string; quantity: number; revenue: number }[];
  grossMargin: number;
  inventoryTurnover: number;
  shrinkageValue: number;
}

export interface InventoryMetrics {
  branchId: string;
  totalValue: number;
  totalSku: number;
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
  coldChainItems: number;
}

// ==================== E-COMMERCE ====================

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  branchId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  fulfillmentType: 'delivery' | 'pickup';
  pickupDate?: Date;
  deliveryAddress?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

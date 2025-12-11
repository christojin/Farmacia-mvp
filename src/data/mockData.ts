import type {
  Product,
  Category,
  ProductLot,
  ProductPrice,
  Customer,
  LoyaltyAccount,
  Promotion,
  User,
  Branch,
  CashRegister,
  Shift,
  Sale,
  Consultation,
  Prescription,
  DoctorCommission,
  Alert,
  Expense,
  ExpenseCategory,
  DailyMetrics,
  Voucher,
  Supplier,
} from '../types';

// ==================== CATEGORIES ====================
export const categories: Category[] = [
  { id: 'cat-1', name: 'Medicamentos', icon: 'pill', color: '#3B82F6' },
  { id: 'cat-2', name: 'Antibióticos', parentId: 'cat-1', icon: 'pill', color: '#EF4444' },
  { id: 'cat-3', name: 'Analgésicos', parentId: 'cat-1', icon: 'pill', color: '#F59E0B' },
  { id: 'cat-4', name: 'Vitaminas', icon: 'sparkles', color: '#10B981' },
  { id: 'cat-5', name: 'Cuidado Personal', icon: 'heart', color: '#EC4899' },
  { id: 'cat-6', name: 'Bebé', icon: 'baby', color: '#8B5CF6' },
  { id: 'cat-7', name: 'Dermatológicos', icon: 'droplet', color: '#06B6D4' },
  { id: 'cat-8', name: 'Material de Curación', icon: 'bandaid', color: '#84CC16' },
  { id: 'cat-9', name: 'Controlados', icon: 'shield', color: '#DC2626' },
  { id: 'cat-10', name: 'Biológicos (Cadena Fría)', icon: 'snowflake', color: '#0EA5E9' },
];

// ==================== SUPPLIERS ====================
export const suppliers: Supplier[] = [
  { id: 'sup-1', name: 'Nadro', contactName: 'Carlos García', email: 'ventas@nadro.com', phone: '555-0100', leadTimeDays: 2 },
  { id: 'sup-2', name: 'Casa Saba', contactName: 'María López', email: 'pedidos@casasaba.com', phone: '555-0200', leadTimeDays: 3 },
  { id: 'sup-3', name: 'Marzam', contactName: 'Juan Pérez', email: 'ventas@marzam.com', phone: '555-0300', leadTimeDays: 2 },
];

// ==================== PRODUCTS ====================
export const products: Product[] = [
  {
    id: 'prod-1',
    sku: 'MED-001',
    barcode: '7501234567890',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    description: 'Analgésico y antipirético. Caja con 20 tabletas.',
    categoryId: 'cat-3',
    supplierId: 'sup-1',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: true,
    unitsPerPackage: 20,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 80,
    imageUrl: '/products/paracetamol.jpg',
    isActive: true,
  },
  {
    id: 'prod-2',
    sku: 'MED-002',
    barcode: '7501234567891',
    name: 'Ibuprofeno 400mg',
    genericName: 'Ibuprofeno',
    description: 'Antiinflamatorio no esteroideo. Caja con 10 tabletas.',
    categoryId: 'cat-3',
    supplierId: 'sup-1',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: true,
    unitsPerPackage: 10,
    minStock: 40,
    maxStock: 150,
    reorderPoint: 60,
    isActive: true,
  },
  {
    id: 'prod-3',
    sku: 'MED-003',
    barcode: '7501234567892',
    name: 'Amoxicilina 500mg',
    genericName: 'Amoxicilina',
    description: 'Antibiótico de amplio espectro. Caja con 21 cápsulas.',
    categoryId: 'cat-2',
    supplierId: 'sup-2',
    requiresPrescription: true,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 21,
    minStock: 30,
    maxStock: 100,
    reorderPoint: 40,
    isActive: true,
  },
  {
    id: 'prod-4',
    sku: 'MED-004',
    barcode: '7501234567893',
    name: 'Omeprazol 20mg',
    genericName: 'Omeprazol',
    description: 'Inhibidor de bomba de protones. Caja con 14 cápsulas.',
    categoryId: 'cat-1',
    supplierId: 'sup-1',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 14,
    minStock: 25,
    maxStock: 100,
    reorderPoint: 35,
    isActive: true,
  },
  {
    id: 'prod-5',
    sku: 'VIT-001',
    barcode: '7501234567894',
    name: 'Vitamina C 1000mg',
    genericName: 'Ácido Ascórbico',
    description: 'Suplemento vitamínico. Frasco con 30 tabletas efervescentes.',
    categoryId: 'cat-4',
    supplierId: 'sup-3',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 30,
    minStock: 20,
    maxStock: 80,
    reorderPoint: 30,
    isActive: true,
  },
  {
    id: 'prod-6',
    sku: 'VIT-002',
    barcode: '7501234567895',
    name: 'Complejo B Inyectable',
    genericName: 'Vitaminas del Complejo B',
    description: 'Solución inyectable. Caja con 3 ampolletas.',
    categoryId: 'cat-4',
    supplierId: 'sup-2',
    requiresPrescription: false,
    requiresColdChain: true,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 3,
    minStock: 15,
    maxStock: 50,
    reorderPoint: 20,
    isActive: true,
  },
  {
    id: 'prod-7',
    sku: 'CUI-001',
    barcode: '7501234567896',
    name: 'Alcohol 96° 250ml',
    description: 'Alcohol etílico para uso externo.',
    categoryId: 'cat-8',
    supplierId: 'sup-3',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 1,
    minStock: 30,
    maxStock: 100,
    reorderPoint: 40,
    isActive: true,
  },
  {
    id: 'prod-8',
    sku: 'CUI-002',
    barcode: '7501234567897',
    name: 'Gasas Estériles 10x10cm',
    description: 'Gasas estériles para curación. Sobre con 10 piezas.',
    categoryId: 'cat-8',
    supplierId: 'sup-3',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 10,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 70,
    isActive: true,
  },
  {
    id: 'prod-9',
    sku: 'BEB-001',
    barcode: '7501234567898',
    name: 'Fórmula Infantil Etapa 1',
    description: 'Fórmula para lactantes 0-6 meses. Lata 400g.',
    categoryId: 'cat-6',
    supplierId: 'sup-1',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 1,
    minStock: 10,
    maxStock: 40,
    reorderPoint: 15,
    isActive: true,
  },
  {
    id: 'prod-10',
    sku: 'DER-001',
    barcode: '7501234567899',
    name: 'Protector Solar FPS 50+',
    description: 'Protección solar de amplio espectro. Tubo 60ml.',
    categoryId: 'cat-7',
    supplierId: 'sup-2',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 1,
    minStock: 15,
    maxStock: 60,
    reorderPoint: 25,
    isActive: true,
  },
  {
    id: 'prod-11',
    sku: 'CON-001',
    barcode: '7501234567900',
    name: 'Clonazepam 2mg',
    genericName: 'Clonazepam',
    description: 'Medicamento controlado. Caja con 30 tabletas.',
    categoryId: 'cat-9',
    supplierId: 'sup-1',
    requiresPrescription: true,
    requiresColdChain: false,
    isControlled: true,
    isFractional: false,
    unitsPerPackage: 30,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    isActive: true,
  },
  {
    id: 'prod-12',
    sku: 'BIO-001',
    barcode: '7501234567901',
    name: 'Insulina NPH 100UI/ml',
    genericName: 'Insulina Humana',
    description: 'Insulina de acción intermedia. Frasco 10ml.',
    categoryId: 'cat-10',
    supplierId: 'sup-2',
    requiresPrescription: true,
    requiresColdChain: true,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 1,
    minStock: 8,
    maxStock: 30,
    reorderPoint: 12,
    isActive: true,
  },
  {
    id: 'prod-13',
    sku: 'MED-005',
    barcode: '7501234567902',
    name: 'Loratadina 10mg',
    genericName: 'Loratadina',
    description: 'Antihistamínico. Caja con 10 tabletas.',
    categoryId: 'cat-1',
    supplierId: 'sup-1',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: true,
    unitsPerPackage: 10,
    minStock: 30,
    maxStock: 120,
    reorderPoint: 50,
    isActive: true,
  },
  {
    id: 'prod-14',
    sku: 'MED-006',
    barcode: '7501234567903',
    name: 'Metformina 850mg',
    genericName: 'Metformina',
    description: 'Antidiabético oral. Caja con 30 tabletas.',
    categoryId: 'cat-1',
    supplierId: 'sup-1',
    requiresPrescription: true,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 30,
    minStock: 20,
    maxStock: 80,
    reorderPoint: 30,
    isActive: true,
  },
  {
    id: 'prod-15',
    sku: 'CUI-003',
    barcode: '7501234567904',
    name: 'Cubrebocas KN95 (5 pzas)',
    description: 'Mascarillas de alta filtración. Paquete con 5 piezas.',
    categoryId: 'cat-8',
    supplierId: 'sup-3',
    requiresPrescription: false,
    requiresColdChain: false,
    isControlled: false,
    isFractional: false,
    unitsPerPackage: 5,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    isActive: true,
  },
];

// ==================== PRODUCT LOTS ====================
export const productLots: ProductLot[] = [
  { id: 'lot-1', productId: 'prod-1', branchId: 'branch-1', lotNumber: 'L2024-001', quantity: 150, costPrice: 25.00, expiryDate: new Date('2026-06-15'), receivedDate: new Date('2024-01-15'), coldChainVerified: false },
  { id: 'lot-2', productId: 'prod-1', branchId: 'branch-1', lotNumber: 'L2024-045', quantity: 80, costPrice: 26.50, expiryDate: new Date('2026-09-20'), receivedDate: new Date('2024-03-10'), coldChainVerified: false },
  { id: 'lot-3', productId: 'prod-2', branchId: 'branch-1', lotNumber: 'L2024-012', quantity: 95, costPrice: 35.00, expiryDate: new Date('2025-12-31'), receivedDate: new Date('2024-02-20'), coldChainVerified: false },
  { id: 'lot-4', productId: 'prod-3', branchId: 'branch-1', lotNumber: 'L2024-089', quantity: 45, costPrice: 85.00, expiryDate: new Date('2025-08-15'), receivedDate: new Date('2024-01-25'), coldChainVerified: false },
  { id: 'lot-5', productId: 'prod-4', branchId: 'branch-1', lotNumber: 'L2024-033', quantity: 60, costPrice: 45.00, expiryDate: new Date('2026-03-10'), receivedDate: new Date('2024-02-05'), coldChainVerified: false },
  { id: 'lot-6', productId: 'prod-5', branchId: 'branch-1', lotNumber: 'L2024-077', quantity: 35, costPrice: 120.00, expiryDate: new Date('2025-11-30'), receivedDate: new Date('2024-03-01'), coldChainVerified: false },
  { id: 'lot-7', productId: 'prod-6', branchId: 'branch-1', lotNumber: 'L2024-055', quantity: 25, costPrice: 95.00, expiryDate: new Date('2025-04-20'), receivedDate: new Date('2024-01-10'), coldChainVerified: true },
  { id: 'lot-8', productId: 'prod-7', branchId: 'branch-1', lotNumber: 'L2024-099', quantity: 70, costPrice: 18.00, expiryDate: new Date('2027-01-15'), receivedDate: new Date('2024-02-28'), coldChainVerified: false },
  { id: 'lot-9', productId: 'prod-8', branchId: 'branch-1', lotNumber: 'L2024-066', quantity: 120, costPrice: 22.00, expiryDate: new Date('2026-08-25'), receivedDate: new Date('2024-03-15'), coldChainVerified: false },
  { id: 'lot-10', productId: 'prod-9', branchId: 'branch-1', lotNumber: 'L2024-044', quantity: 18, costPrice: 280.00, expiryDate: new Date('2025-07-10'), receivedDate: new Date('2024-02-10'), coldChainVerified: false },
  { id: 'lot-11', productId: 'prod-10', branchId: 'branch-1', lotNumber: 'L2024-022', quantity: 40, costPrice: 150.00, expiryDate: new Date('2026-05-20'), receivedDate: new Date('2024-01-20'), coldChainVerified: false },
  { id: 'lot-12', productId: 'prod-11', branchId: 'branch-1', lotNumber: 'L2024-008', quantity: 12, costPrice: 180.00, expiryDate: new Date('2025-10-15'), receivedDate: new Date('2024-02-15'), coldChainVerified: false },
  { id: 'lot-13', productId: 'prod-12', branchId: 'branch-1', lotNumber: 'L2024-003', quantity: 20, costPrice: 450.00, expiryDate: new Date('2025-03-01'), receivedDate: new Date('2024-01-05'), coldChainVerified: true },
  { id: 'lot-14', productId: 'prod-13', branchId: 'branch-1', lotNumber: 'L2024-078', quantity: 85, costPrice: 28.00, expiryDate: new Date('2026-04-15'), receivedDate: new Date('2024-03-05'), coldChainVerified: false },
  { id: 'lot-15', productId: 'prod-14', branchId: 'branch-1', lotNumber: 'L2024-091', quantity: 50, costPrice: 65.00, expiryDate: new Date('2026-01-20'), receivedDate: new Date('2024-02-25'), coldChainVerified: false },
  { id: 'lot-16', productId: 'prod-15', branchId: 'branch-1', lotNumber: 'L2024-111', quantity: 200, costPrice: 45.00, expiryDate: new Date('2027-06-01'), receivedDate: new Date('2024-03-20'), coldChainVerified: false },
];

// ==================== PRODUCT PRICES ====================
export const productPrices: ProductPrice[] = [
  { id: 'price-1', productId: 'prod-1', branchId: 'branch-1', price: 45.00, minPrice: 38.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-2', productId: 'prod-2', branchId: 'branch-1', price: 65.00, minPrice: 55.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-3', productId: 'prod-3', branchId: 'branch-1', price: 165.00, minPrice: 140.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-4', productId: 'prod-4', branchId: 'branch-1', price: 89.00, minPrice: 75.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-5', productId: 'prod-5', branchId: 'branch-1', price: 199.00, minPrice: 170.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-6', productId: 'prod-6', branchId: 'branch-1', price: 175.00, minPrice: 150.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-7', productId: 'prod-7', branchId: 'branch-1', price: 35.00, minPrice: 28.00, maxDiscount: 20, lastUpdated: new Date('2024-03-01') },
  { id: 'price-8', productId: 'prod-8', branchId: 'branch-1', price: 42.00, minPrice: 35.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-9', productId: 'prod-9', branchId: 'branch-1', price: 425.00, minPrice: 380.00, maxDiscount: 10, lastUpdated: new Date('2024-03-01') },
  { id: 'price-10', productId: 'prod-10', branchId: 'branch-1', price: 285.00, minPrice: 240.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-11', productId: 'prod-11', branchId: 'branch-1', price: 350.00, minPrice: 320.00, maxDiscount: 8, lastUpdated: new Date('2024-03-01') },
  { id: 'price-12', productId: 'prod-12', branchId: 'branch-1', price: 750.00, minPrice: 680.00, maxDiscount: 10, lastUpdated: new Date('2024-03-01') },
  { id: 'price-13', productId: 'prod-13', branchId: 'branch-1', price: 55.00, minPrice: 45.00, maxDiscount: 18, lastUpdated: new Date('2024-03-01') },
  { id: 'price-14', productId: 'prod-14', branchId: 'branch-1', price: 125.00, minPrice: 105.00, maxDiscount: 15, lastUpdated: new Date('2024-03-01') },
  { id: 'price-15', productId: 'prod-15', branchId: 'branch-1', price: 89.00, minPrice: 72.00, maxDiscount: 20, lastUpdated: new Date('2024-03-01') },
];

// ==================== PROMOTIONS ====================
export const promotions: Promotion[] = [
  {
    id: 'promo-1',
    name: '2x1 en Vitaminas',
    description: 'Llévate 2 y paga 1 en vitaminas seleccionadas',
    type: '2x1',
    config: { buyQuantity: 2, getQuantity: 1, applyToCheapest: true },
    categoryIds: ['cat-4'],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    priority: 1,
  },
  {
    id: 'promo-2',
    name: '3x2 en Cuidado Personal',
    description: 'Llévate 3 y paga 2 en productos de cuidado personal',
    type: '3x2',
    config: { buyQuantity: 3, getQuantity: 1, applyToCheapest: true },
    categoryIds: ['cat-5', 'cat-7'],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    priority: 2,
  },
  {
    id: 'promo-3',
    name: '2da unidad al 50%',
    description: 'Segunda unidad a mitad de precio en analgésicos',
    type: 'second_unit_discount',
    config: { buyQuantity: 2, discountPercentage: 50, applyToCheapest: true },
    categoryIds: ['cat-3'],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    priority: 3,
  },
  {
    id: 'promo-4',
    name: '15% en Material de Curación',
    description: 'Descuento especial en todo material de curación',
    type: 'percentage',
    config: { discountPercentage: 15 },
    categoryIds: ['cat-8'],
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-04-15'),
    isActive: true,
    priority: 4,
  },
];

// ==================== CUSTOMERS ====================
export const customers: Customer[] = [
  { id: 'cust-1', qrCode: 'QR-FARM-001', firstName: 'María', lastName: 'González', email: 'maria.gonzalez@email.com', phone: '555-1234', birthDate: new Date('1985-06-15'), createdAt: new Date('2023-06-01') },
  { id: 'cust-2', qrCode: 'QR-FARM-002', firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@email.com', phone: '555-5678', birthDate: new Date('1978-11-22'), createdAt: new Date('2023-07-15') },
  { id: 'cust-3', qrCode: 'QR-FARM-003', firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@email.com', phone: '555-9012', birthDate: new Date('1992-03-08'), createdAt: new Date('2023-08-20') },
  { id: 'cust-4', qrCode: 'QR-FARM-004', firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com', phone: '555-3456', birthDate: new Date('1965-09-30'), createdAt: new Date('2023-09-10') },
  { id: 'cust-5', qrCode: 'QR-FARM-005', firstName: 'Laura', lastName: 'Sánchez', phone: '555-7890', createdAt: new Date('2023-10-05') },
];

// ==================== LOYALTY ACCOUNTS ====================
export const loyaltyAccounts: LoyaltyAccount[] = [
  { id: 'loyalty-1', customerId: 'cust-1', points: 2450, totalPointsEarned: 5200, totalPointsRedeemed: 2750, level: 'gold', createdAt: new Date('2023-06-01') },
  { id: 'loyalty-2', customerId: 'cust-2', points: 890, totalPointsEarned: 1500, totalPointsRedeemed: 610, level: 'silver', createdAt: new Date('2023-07-15') },
  { id: 'loyalty-3', customerId: 'cust-3', points: 3100, totalPointsEarned: 6800, totalPointsRedeemed: 3700, level: 'platinum', createdAt: new Date('2023-08-20') },
  { id: 'loyalty-4', customerId: 'cust-4', points: 320, totalPointsEarned: 450, totalPointsRedeemed: 130, level: 'bronze', createdAt: new Date('2023-09-10') },
  { id: 'loyalty-5', customerId: 'cust-5', points: 150, totalPointsEarned: 150, totalPointsRedeemed: 0, level: 'bronze', createdAt: new Date('2023-10-05') },
];

// ==================== BRANCH ====================
export const branches: Branch[] = [
  {
    id: 'branch-1',
    tenantId: 'tenant-1',
    name: 'Farmacia Central',
    address: 'Av. Reforma 123, Col. Centro, CDMX',
    phone: '555-0001',
    isActive: true,
    settings: { independentPricing: false, timezone: 'America/Mexico_City', currency: 'MXN' },
  },
  {
    id: 'branch-2',
    tenantId: 'tenant-1',
    name: 'Farmacia Norte',
    address: 'Blvd. Insurgentes 456, Col. Del Valle, CDMX',
    phone: '555-0002',
    isActive: true,
    settings: { independentPricing: false, timezone: 'America/Mexico_City', currency: 'MXN' },
  },
];

// ==================== USERS ====================
export const users: User[] = [
  { id: 'user-1', tenantId: 'tenant-1', branchId: 'branch-1', email: 'admin@farmacia.com', name: 'Administrador', role: 'admin', isActive: true, twoFactorEnabled: true, createdAt: new Date('2023-01-01') },
  { id: 'user-2', tenantId: 'tenant-1', branchId: 'branch-1', email: 'gerente@farmacia.com', name: 'Roberto Méndez', role: 'manager', isActive: true, twoFactorEnabled: true, createdAt: new Date('2023-01-15') },
  { id: 'user-3', tenantId: 'tenant-1', branchId: 'branch-1', email: 'cajero1@farmacia.com', name: 'Patricia Ruiz', role: 'cashier', isActive: true, twoFactorEnabled: false, createdAt: new Date('2023-02-01') },
  { id: 'user-4', tenantId: 'tenant-1', branchId: 'branch-1', email: 'doctor@farmacia.com', name: 'Dr. Alejandro Vega', role: 'doctor', isActive: true, twoFactorEnabled: true, createdAt: new Date('2023-03-01') },
  { id: 'user-5', tenantId: 'tenant-1', branchId: 'branch-1', email: 'farmaceutico@farmacia.com', name: 'Lic. Sandra Torres', role: 'pharmacist', isActive: true, twoFactorEnabled: false, createdAt: new Date('2023-03-15') },
];

// ==================== CASH REGISTERS ====================
export const cashRegisters: CashRegister[] = [
  { id: 'register-1', branchId: 'branch-1', name: 'Caja 1', isOpen: true, currentShiftId: 'shift-1', isActive: true },
  { id: 'register-2', branchId: 'branch-1', name: 'Caja 2', isOpen: false, isActive: true },
];

// ==================== SHIFTS ====================
export const shifts: Shift[] = [
  {
    id: 'shift-1',
    cashRegisterId: 'register-1',
    userId: 'user-3',
    openingBalance: 2000,
    salesTotal: 15680,
    returnsTotal: 450,
    cashPayments: 8500,
    cardPayments: 6730,
    voucherPayments: 450,
    status: 'open',
    openedAt: new Date(),
  },
];

// ==================== SALES ====================
export const sales: Sale[] = [
  {
    id: 'sale-1',
    branchId: 'branch-1',
    cashRegisterId: 'register-1',
    customerId: 'cust-1',
    items: [
      { id: 'item-1', productId: 'prod-1', lotId: 'lot-1', productName: 'Paracetamol 500mg', quantity: 2, unitPrice: 45, discount: 0, discountType: 'percentage', subtotal: 90, total: 90, isFractional: false },
      { id: 'item-2', productId: 'prod-5', lotId: 'lot-6', productName: 'Vitamina C 1000mg', quantity: 2, unitPrice: 199, discount: 199, discountType: 'fixed', promotionId: 'promo-1', promotionName: '2x1 en Vitaminas', subtotal: 398, total: 199, isFractional: false },
    ],
    payments: [{ id: 'pay-1', method: 'card', amount: 289, cardLast4: '4532', createdAt: new Date() }],
    subtotal: 488,
    discountTotal: 199,
    taxTotal: 0,
    total: 289,
    status: 'completed',
    isHeld: false,
    isTrainingMode: false,
    createdBy: 'user-3',
    createdAt: new Date(),
    completedAt: new Date(),
  },
];

// ==================== CONSULTATIONS ====================
export const consultations: Consultation[] = [
  {
    id: 'cons-1',
    branchId: 'branch-1',
    doctorId: 'user-4',
    patientName: 'María González',
    patientId: 'cust-1',
    patientAge: 38,
    patientGender: 'female',
    chiefComplaint: 'Dolor de garganta y fiebre desde hace 3 días',
    diagnosis: 'Faringitis bacteriana',
    notes: 'Se recomienda reposo y abundantes líquidos',
    vitalSigns: { bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 72, temperature: 38.2, weight: 65 },
    status: 'completed',
    fee: 150,
    createdAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: 'cons-2',
    branchId: 'branch-1',
    doctorId: 'user-4',
    patientName: 'Carlos López',
    patientAge: 58,
    patientGender: 'male',
    chiefComplaint: 'Control de glucosa mensual',
    status: 'in_progress',
    fee: 150,
    createdAt: new Date(),
  },
  {
    id: 'cons-3',
    branchId: 'branch-1',
    doctorId: 'user-4',
    patientName: 'Ana Martínez',
    patientAge: 31,
    patientGender: 'female',
    chiefComplaint: 'Dolor de cabeza intenso',
    status: 'waiting',
    fee: 150,
    createdAt: new Date(),
  },
];

// ==================== PRESCRIPTIONS ====================
export const prescriptions: Prescription[] = [
  {
    id: 'rx-1',
    consultationId: 'cons-1',
    doctorId: 'user-4',
    patientName: 'María González',
    items: [
      { productId: 'prod-3', medicationName: 'Amoxicilina 500mg', dosage: '500mg', frequency: 'Cada 8 horas', duration: '7 días', quantity: 21, instructions: 'Tomar con alimentos' },
      { productId: 'prod-1', medicationName: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Cada 6 horas si hay fiebre', duration: 'PRN', quantity: 10, instructions: 'No exceder 4g al día' },
    ],
    diagnosis: 'Faringitis bacteriana',
    qrCode: 'RX-2024-0001',
    isDispensed: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

// ==================== DOCTOR COMMISSIONS ====================
export const doctorCommissions: DoctorCommission[] = [
  { id: 'comm-1', doctorId: 'user-4', consultationId: 'cons-1', type: 'consultation', amount: 75, percentage: 50, status: 'pending', createdAt: new Date() },
];

// ==================== ALERTS ====================
export const alerts: Alert[] = [
  { id: 'alert-1', branchId: 'branch-1', type: 'expiring_soon', severity: 'high', title: 'Productos próximos a caducar', message: '5 productos caducan en los próximos 30 días', isRead: false, createdAt: new Date() },
  { id: 'alert-2', branchId: 'branch-1', type: 'low_stock', severity: 'medium', title: 'Stock bajo', message: '3 productos por debajo del punto de reorden', isRead: false, createdAt: new Date() },
  { id: 'alert-3', branchId: 'branch-1', type: 'cold_chain_breach', severity: 'critical', title: 'Alerta Cadena Fría', message: 'Temperatura fuera de rango en refrigerador 2', isRead: false, createdAt: new Date() },
  { id: 'alert-4', type: 'cash_discrepancy', severity: 'high', title: 'Diferencia en corte', message: 'Diferencia de $150 en corte de caja del turno anterior', isRead: true, createdAt: new Date(Date.now() - 86400000) },
];

// ==================== EXPENSES ====================
export const expenseCategories: ExpenseCategory[] = [
  { id: 'exp-cat-1', name: 'Nómina', budget: 50000 },
  { id: 'exp-cat-2', name: 'Servicios (Luz, Agua, Internet)', budget: 8000 },
  { id: 'exp-cat-3', name: 'Renta', budget: 25000 },
  { id: 'exp-cat-4', name: 'Mantenimiento', budget: 5000 },
  { id: 'exp-cat-5', name: 'Papelería y consumibles', budget: 2000 },
  { id: 'exp-cat-6', name: 'Otros', budget: 3000 },
];

export const expenses: Expense[] = [
  { id: 'exp-1', branchId: 'branch-1', categoryId: 'exp-cat-2', amount: 2500, description: 'Pago de luz - Marzo 2024', paymentMethod: 'transfer', date: new Date('2024-03-05'), createdBy: 'user-2', createdAt: new Date('2024-03-05') },
  { id: 'exp-2', branchId: 'branch-1', categoryId: 'exp-cat-3', amount: 25000, description: 'Renta mensual - Marzo 2024', paymentMethod: 'transfer', date: new Date('2024-03-01'), createdBy: 'user-2', createdAt: new Date('2024-03-01') },
  { id: 'exp-3', branchId: 'branch-1', categoryId: 'exp-cat-4', amount: 1200, description: 'Reparación de aire acondicionado', paymentMethod: 'cash', date: new Date('2024-03-10'), createdBy: 'user-2', createdAt: new Date('2024-03-10') },
];

// ==================== VOUCHERS ====================
export const vouchers: Voucher[] = [
  { id: 'voucher-1', code: 'DEV-2024-001', type: 'return', amount: 150, balance: 150, customerId: 'cust-2', expiryDate: new Date('2024-06-15'), isActive: true, createdAt: new Date() },
  { id: 'voucher-2', code: 'PROMO-MAR-50', type: 'promotional', amount: 50, balance: 50, expiryDate: new Date('2024-04-30'), isActive: true, createdAt: new Date() },
];

// ==================== DAILY METRICS ====================
export const dailyMetrics: DailyMetrics = {
  date: new Date(),
  branchId: 'branch-1',
  totalSales: 45680,
  totalTransactions: 87,
  averageTicket: 525,
  salesByHour: {
    8: 2500, 9: 4200, 10: 5800, 11: 6200, 12: 4500, 13: 3200,
    14: 3800, 15: 4100, 16: 4800, 17: 3500, 18: 2100, 19: 980,
  },
  salesByCategory: {
    'cat-1': 18500,
    'cat-3': 8200,
    'cat-4': 6500,
    'cat-8': 5200,
    'cat-5': 4100,
    'cat-7': 3180,
  },
  topProducts: [
    { productId: 'prod-1', quantity: 45, revenue: 2025 },
    { productId: 'prod-2', quantity: 32, revenue: 2080 },
    { productId: 'prod-4', quantity: 28, revenue: 2492 },
    { productId: 'prod-5', quantity: 22, revenue: 4378 },
    { productId: 'prod-13', quantity: 38, revenue: 2090 },
  ],
  grossMargin: 32.5,
  inventoryTurnover: 4.2,
  shrinkageValue: 450,
};

// ==================== HELPER FUNCTIONS ====================
export const getProductWithDetails = (productId: string) => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  const lots = productLots.filter(l => l.productId === productId);
  const price = productPrices.find(p => p.productId === productId);
  const category = categories.find(c => c.id === product.categoryId);
  const totalStock = lots.reduce((sum, lot) => sum + lot.quantity, 0);

  return {
    ...product,
    lots,
    price: price?.price || 0,
    minPrice: price?.minPrice || 0,
    category,
    totalStock,
    avgCost: lots.length > 0 ? lots.reduce((sum, lot) => sum + lot.costPrice, 0) / lots.length : 0,
  };
};

export const getCustomerWithLoyalty = (customerId: string) => {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;

  const loyalty = loyaltyAccounts.find(l => l.customerId === customerId);

  return {
    ...customer,
    loyalty,
  };
};

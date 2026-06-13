export interface Brand {
  id: number;
  name: string;
  description: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface AlternatePrice {
  type: 'wholesale' | 'cost' | 'offer' | 'promotion' | 'alternate1';
  priceVES: number;
  priceUSD: number;
  minQuantity?: number;
}

export interface CompositeItem {
  productId: number;
  productName?: string;
  quantity: number;
  useOwnStock: boolean;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  brandId: number;
  brandName?: string;
  departmentId: number;
  categoryId: number;
  unit: string;
  stock: number;
  minStock: number;
  isComposite: boolean;
  compositeItems: CompositeItem[];
  costPrice: number;
  profitPercentage: number;
  priceUSD: number;
  priceVES: number;
  hasIVA: boolean;
  ivaRate: number;
  alternatePrices: AlternatePrice[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  departmentId: number;
  description: string;
}

export interface Customer {
  id: number;
  name: string;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  purchases: number;
  totalSpent: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'cashier' | 'seller';
  active: boolean;
  lastLogin: string | null;
  assignedCashId?: number;
}

export interface CashDrawer {
  id: number;
  userId: number;
  userName: string;
  openingDate: string;
  closingDate?: string;
  initialVES: number;
  initialUSD: number;
  finalVES?: number;
  finalUSD?: number;
  exchangeRate: number;
  isOpen: boolean;
  sales: Sale[];
  movements: CashMovement[];
}

export interface CashMovement {
  id: number;
  type: 'opening' | 'closing' | 'sale' | 'refund' | 'withdrawal';
  amountVES: number;
  amountUSD: number;
  description: string;
  createdAt: string;
  referenceId?: number;
}

export interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  priceType: 'retail' | 'wholesale' | 'offer' | 'promotion' | 'alternate1';
  unitPriceVES: number;
  unitPriceUSD: number;
  subtotalVES: number;
  subtotalUSD: number;
  unit: string;
  hasIVA: boolean;
  ivaRate: number;
}

export interface PaymentEntry {
  type: 'cash_ves' | 'cash_usd' | 'card' | 'biopago' | 'zelle_usd' | 'pagomovil' | 'credit';
  amountVES: number;
  amountUSD: number;
  reference?: string;
}

export interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  payments: PaymentEntry[];
  subtotalVES: number;
  subtotalUSD: number;
  iva: number;
  igtf: number;
  totalVES: number;
  totalUSD: number;
  cashierId: number;
  cashierName: string;
  customerId: number;
  customerName: string;
  orderId?: number;
  tableId?: number;
  refundOf?: number;
  status: 'completed' | 'refunded' | 'cancelled';
}

export interface Order {
  id: number;
  tableId: number;
  tableName: string;
  items: SaleItem[];
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  serviceCharge: number;
  createdAt: string;
  updatedAt: string;
  sentToKitchen: boolean;
  notes?: string;
}

export interface Table {
  id: number;
  number: number;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrderId?: number;
}

export interface KardexEntry {
  id: number;
  productId: number;
  productName: string;
  date: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'initial';
  quantity: number;
  unitCostVES: number;
  unitCostUSD: number;
  totalCostVES: number;
  totalCostUSD: number;
  balanceVES: number;
  balanceUSD: number;
  referenceId: number;
  notes: string;
}

export interface InventoryAdjustment {
  id: number;
  productId: number;
  productName: string;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  userId: number;
  userName: string;
}

export interface Config {
  businessName: string;
  rif: string;
  address: string;
  phone: string;
  exchangeRate: number;
  exchangeRateUpdatedAt: string;
  ivaRate: number;
  igtfRate: number;
  currency: 'VES' | 'USD';
  cashDrawer?: CashDrawer;
  lastCashClosing?: CashDrawer;
}

export interface StoreState {
  users: User[];
  departments: Department[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  orders: Order[];
  tables: Table[];
  kardex: KardexEntry[];
  adjustments: InventoryAdjustment[];
  config: Config;
  currentUser: User | null;
  currentCurrency: 'VES' | 'USD';
  cashDrawers: CashDrawer[];
  setCurrentUser: (user: User | null) => void;
  setCurrentCurrency: (currency: 'VES' | 'USD') => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  updateProductStock: (id: number, stock: number, reason?: string) => void;
  addToKardex: (entry: KardexEntry) => void;
  getProductKardex: (productId: number) => KardexEntry[];
  addDepartment: (department: Department) => void;
  updateDepartment: (department: Department) => void;
  deleteDepartment: (id: number) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (id: number) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: number) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: number) => void;
  addSale: (sale: Sale) => void;
  refundSale: (saleId: number, reason: string) => void;
  updateConfig: (config: Partial<Config>) => void;
  openCashDrawer: (drawer: CashDrawer) => void;
  closeCashDrawer: (finalVES: number, finalUSD: number) => CashDrawer | null;
  getZReport: (cashDrawerId: number) => ZReport | null;
  resetStore: () => void;
}

export interface ZReport {
  cashDrawerId: number;
  date: string;
  openingTime: string;
  closingTime: string;
  initialVES: number;
  initialUSD: number;
  finalVES: number;
  finalUSD: number;
  expectedVES: number;
  expectedUSD: number;
  differenceVES: number;
  differenceUSD: number;
  salesByPaymentMethod: {
    cash_ves: number;
    cash_usd: number;
    card: number;
    biopago: number;
    zelle_usd: number;
    pagomovil: number;
    credit: number;
  };
  totalSalesVES: number;
  totalSalesUSD: number;
  refundsByPaymentMethod: {
    cash_ves: number;
    cash_usd: number;
    pagomovil: number;
  };
  totalRefundsVES: number;
  totalRefundsUSD: number;
  netSalesVES: number;
  netSalesUSD: number;
}
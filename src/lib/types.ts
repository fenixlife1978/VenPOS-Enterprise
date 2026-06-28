export interface Brand {
  id: number;
  name: string;
  description?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  departmentId: number;
  description?: string;
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
  description?: string;
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
}

export interface Supplier {
  id: number;
  name: string;
  code?: string;
  rif?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
  active: boolean;
}

export interface Terminal {
  id: number;
  name: string;
  location?: string;
  active: boolean;
  lastSync?: string;
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

export interface CashMovement {
  id: number;
  type: 'opening' | 'closing' | 'sale' | 'refund' | 'withdrawal';
  amountVES: number;
  amountUSD: number;
  description: string;
  createdAt: string;
  referenceId?: number;
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

export interface Comanda {
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

export interface InventoryMovement {
  id: number;
  productId: number;
  type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
  userId: number;
  notes?: string;
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

export interface AppStore {
  users: User[];
  categories: Category[];
  departments: Department[];
  brands: Brand[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  terminals: Terminal[];
  sales: Sale[];
  comandas: Comanda[];
  tables: Table[];
  movements: InventoryMovement[];
  cashDrawers: CashDrawer[];
  config: Config;
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
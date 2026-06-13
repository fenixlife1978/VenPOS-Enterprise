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

export interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  priceVES: number;
  priceUSD: number;
}

export interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  subtotal: number;
  iva: number;
  igtf: number;
  total: number;
  cashier: string;
  customerName: string;
  status?: 'completed' | 'refunded' | 'cancelled';
  payments?: any[];
}

export interface CashOpening {
  isOpen: boolean;
  openedAt: string;
  initialVES: number;
  initialUSD: number;
}

export interface Config {
  businessName: string;
  rif: string;
  address: string;
  phone: string;
  exchangeRate: number;
  ivaRate: number;
  igtfRate: number;
  currency: 'VES' | 'USD';
  cashOpening?: CashOpening;
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

export interface Comanda {
  id: number;
  tableId: number;
  items: any[];
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AppStore {
  users: User[];
  categories: Category[];
  departments: Department[];
  brands: Brand[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  comandas: Comanda[];
  movements: InventoryMovement[];
  config: Config;
}

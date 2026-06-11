export interface User {
  id: number;
  username: string;
  password?: string;
  fullName: string;
  role: 'admin' | 'cashier' | 'seller';
  active: boolean;
  lastLogin: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface AlternativePrice {
  id: string;
  name: string;
  priceVES: number;
  priceUSD: number;
  enabled: boolean;
}

export interface ProductComponent {
  productId: number;
  quantity: number;
  ownStock: boolean;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  unit: string;
  departmentId?: number;
  categoryId: number;
  costUSD: number;
  margin: number; // Percentage
  priceVES: number;
  priceUSD: number;
  stock: number;
  initialStock: number;
  minStock: number;
  active: boolean;
  appliesIva: boolean;
  ivaPercent: number;
  isComposite: boolean;
  components?: ProductComponent[];
  alternativePrices?: {
    mayor: number;
    costo: number;
    oferta: number;
    promocion: number;
    precio1: number;
  };
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

export interface SaleItem {
  productId: number;
  name: string;
  priceVES: number;
  priceUSD: number;
  quantity: number;
  priceType: 'detal' | 'mayor' | 'costo' | 'oferta' | 'promocion' | 'precio1';
}

export interface PaymentEntry {
  method: 'cash_ves' | 'cash_usd' | 'card' | 'biopago' | 'zelle' | 'pagomovil' | 'credit';
  amount: number; // Always in VES for accounting, except Zelle/Cash USD which are tracked separately
  amountUSD?: number;
}

export interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  subtotal: number;
  iva: number;
  igtf: number;
  total: number;
  payments: PaymentEntry[];
  cashier: string;
  customerName: string;
  status: 'completed' | 'returned';
}

export interface Comanda {
  id: number;
  table: string;
  items: SaleItem[];
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  servicePercent: number;
  createdAt: string;
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
  cashOpening?: {
    isOpen: boolean;
    openedAt: string;
    initialVES: number;
    initialUSD: number;
  };
}

export interface InventoryMovement {
  id: number;
  productId: number;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
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

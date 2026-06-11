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

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  categoryId: number;
  priceVES: number;
  priceUSD?: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
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
}

export interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  subtotal: number;
  iva: number;
  igtf: number;
  total: number;
  method: string;
  cashier: string;
  customerName: string;
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
}

export interface AppStore {
  users: User[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  config: Config;
}

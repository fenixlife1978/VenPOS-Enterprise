import { useState, useEffect, useCallback } from 'react';
import type { AppStore, User, Product, Category, Customer, Sale, Config } from '@/lib/types';

const INITIAL_DATA: AppStore = {
  users: [
    { id: 1, username: 'admin', password: 'admin', fullName: 'Administrador', role: 'admin', active: true, lastLogin: new Date().toISOString() },
    { id: 2, username: 'cajero', password: 'cajero', fullName: 'Cajero Principal', role: 'cashier', active: true, lastLogin: null }
  ],
  categories: [
    { id: 1, name: 'General', description: 'Productos generales' },
    { id: 2, name: 'Alimentos', description: 'Productos alimenticios' },
    { id: 3, name: 'Bebidas', description: 'Bebidas y refrescos' },
    { id: 4, name: 'Limpieza', description: 'Productos de limpieza' },
    { id: 5, name: 'Higiene', description: 'Productos de higiene personal' }
  ],
  products: [
    { id: 1, code: 'P001', name: 'Harina Pan 1kg', description: 'Harina de maíz precocida', categoryId: 2, priceVES: 25.50, priceUSD: 0.70, stock: 50, minStock: 10, unit: 'unidad', active: true },
    { id: 2, code: 'P002', name: 'Arroz 1kg', description: 'Arroz blanco', categoryId: 2, priceVES: 18.00, priceUSD: 0.49, stock: 45, minStock: 10, unit: 'unidad', active: true },
    { id: 3, code: 'P003', name: 'Aceite 1L', description: 'Aceite vegetal', categoryId: 2, priceVES: 32.00, priceUSD: 0.88, stock: 30, minStock: 8, unit: 'unidad', active: true },
    { id: 4, code: 'P004', name: 'Pasta Dental', description: 'Pasta dental 100g', categoryId: 5, priceVES: 15.00, priceUSD: 0.41, stock: 25, minStock: 5, unit: 'unidad', active: true }
  ],
  customers: [
    { id: 1, name: 'Consumidor Final', idCard: 'V-00000000', phone: '', email: '', address: '', purchases: 0, totalSpent: 0 },
    { id: 2, name: 'Juan Pérez', idCard: 'V-12345678', phone: '0414-1234567', email: 'juan@email.com', address: 'Caracas', purchases: 0, totalSpent: 0 }
  ],
  sales: [],
  config: {
    businessName: 'VenPOS Corporativo C.A.',
    rif: 'J-12345678-9',
    address: 'Av. Principal, Caracas, Venezuela',
    phone: '0212-1234567',
    exchangeRate: 36.50,
    ivaRate: 16,
    igtfRate: 3,
    currency: 'VES'
  }
};

export function useVenPos() {
  const [store, setStore] = useState<AppStore>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<'VES' | 'USD'>('VES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('venpos_data');
    if (saved) {
      try {
        setStore(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load store", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('venpos_data', JSON.stringify(store));
  }, [store]);

  const updateStore = useCallback((updater: (prev: AppStore) => AppStore) => {
    setStore(prev => updater(prev));
  }, []);

  const login = (username: string, password?: string) => {
    const user = store.users.find(u => u.username === username && u.password === password && u.active);
    if (user) {
      const loggedUser = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(loggedUser);
      updateStore(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === user.id ? loggedUser : u)
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveModule('dashboard');
  };

  const addSale = (sale: Sale) => {
    updateStore(prev => ({
      ...prev,
      sales: [...prev.sales, sale],
      products: prev.products.map(p => {
        const item = sale.items.find(si => si.productId === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      })
    }));
  };

  const formatMoney = useCallback((amount: number, overrideCurrency?: 'VES' | 'USD') => {
    const c = overrideCurrency || currency;
    if (c === 'USD') {
      return `$ ${amount.toFixed(2).replace('.', ',')}`;
    }
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  return {
    store,
    updateStore,
    currentUser,
    activeModule,
    setActiveModule,
    currency,
    setCurrency,
    login,
    logout,
    addSale,
    formatMoney,
    isSidebarOpen,
    setIsSidebarOpen
  };
}

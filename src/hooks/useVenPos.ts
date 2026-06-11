import { useState, useEffect, useCallback } from 'react';
import type { AppStore, User, Product, Category, Customer, Sale, Config, InventoryMovement, Comanda } from '@/lib/types';

const INITIAL_DATA: AppStore = {
  users: [
    { id: 1, username: 'admin', password: 'admin', fullName: 'Administrador', role: 'admin', active: true, lastLogin: new Date().toISOString() },
    { id: 2, username: 'cajero', password: 'cajero', fullName: 'Cajero Principal', role: 'cashier', active: true, lastLogin: null }
  ],
  categories: [
    { id: 1, name: 'General', description: 'Productos generales' },
    { id: 2, name: 'Alimentos', description: 'Productos alimenticios' }
  ],
  departments: [
    { id: 1, name: 'Víveres' },
    { id: 2, name: 'Higiene' }
  ],
  brands: [
    { id: 1, name: 'Polar' },
    { id: 2, name: 'Nestlé' }
  ],
  products: [
    { 
      id: 1, 
      code: 'P001', 
      name: 'Harina Pan 1kg', 
      brand: 'Polar', 
      unit: 'unidad', 
      categoryId: 2, 
      departmentId: 1, 
      costUSD: 0.80, 
      margin: 20, 
      priceVES: 36.50, 
      priceUSD: 1.00, 
      stock: 50, 
      initialStock: 50, 
      minStock: 10, 
      active: true, 
      appliesIva: false, 
      ivaPercent: 16, 
      isComposite: false,
      alternativePrices: {
        mayor: 0.95,
        costo: 0.80,
        oferta: 0.90,
        promocion: 0.85,
        precio1: 0.98
      }
    },
  ],
  customers: [
    { id: 1, name: 'Consumidor Final', idCard: 'V-00000000', phone: '', email: '', address: '', purchases: 0, totalSpent: 0 }
  ],
  sales: [],
  comandas: [],
  movements: [],
  config: {
    businessName: 'VenPOS Corporativo C.A.',
    rif: 'J-12345678-9',
    address: 'Av. Principal, Caracas, Venezuela',
    phone: '0212-1234567',
    exchangeRate: 36.50,
    ivaRate: 16,
    igtfRate: 3,
    currency: 'VES',
    cashOpening: {
      isOpen: false,
      openedAt: '',
      initialVES: 0,
      initialUSD: 0
    }
  }
};

export function useVenPos() {
  const [store, setStore] = useState<AppStore>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<'VES' | 'USD'>('VES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('venpos_data_v2');
    if (saved) {
      try {
        setStore(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load store", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('venpos_data_v2', JSON.stringify(store));
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

  const calculatePrice = useCallback((cost: number, margin: number, rate: number) => {
    if (margin === 100) return { usd: 0, ves: 0 };
    const usd = cost / (1 - (margin / 100));
    return {
      usd: usd,
      ves: usd * rate
    };
  }, []);

  const calculateMargin = useCallback((cost: number, priceUSD: number) => {
    if (priceUSD === 0) return 0;
    return (1 - (cost / priceUSD)) * 100;
  }, []);

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
    setIsSidebarOpen,
    calculatePrice,
    calculateMargin
  };
}
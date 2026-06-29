import { useState, useEffect, useCallback } from 'react';
import type { AppStore, User, Product, Category, Customer, Sale, Config, AlternatePrice } from '@/lib/types';

const INITIAL_DATA: AppStore = {
  users: [
    { id: 1, username: 'admin', password: 'admin', fullName: 'Administrador', role: 'admin', active: true, lastLogin: new Date().toISOString() },
    { id: 2, username: 'cajero', password: 'cajero', fullName: 'Cajero Principal', role: 'cashier', active: true, lastLogin: null },
    { id: 3, username: 'cocina', password: '123', fullName: 'Chef Principal', role: 'kitchen', active: true, lastLogin: null }
  ],
  categories: [
    { id: 1, name: 'General', departmentId: 1, description: 'Productos generales' },
    { id: 2, name: 'Alimentos', departmentId: 1, description: 'Productos alimenticios' }
  ],
  departments: [
    { id: 1, name: 'Víveres', description: 'Productos de despensa' },
    { id: 2, name: 'Higiene', description: 'Cuidado personal' }
  ],
  brands: [
    { id: 1, name: 'Polar', description: 'Productos Polar' },
    { id: 2, name: 'Nestlé', description: 'Productos Nestlé' }
  ],
  products: [
    { 
      id: 1, 
      code: 'P001', 
      name: 'Harina Pan 1kg', 
      description: 'Harina de maíz precocida',
      brandId: 1, 
      brandName: 'Polar',
      departmentId: 1,
      categoryId: 2,
      unit: 'unidad', 
      costPrice: 0.80, 
      profitPercentage: 20,
      priceUSD: 1.00, 
      priceVES: 36.50, 
      stock: 50, 
      minStock: 10, 
      isComposite: false,
      compositeItems: [],
      hasIVA: false,
      ivaRate: 16,
      alternatePrices: [],
      active: true, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ],
  customers: [
    { id: 1, name: 'Consumidor Final', idCard: 'V-00000000', phone: '', email: '', address: '', purchases: 0, totalSpent: 0 }
  ],
  sales: [],
  comandas: [],
  movements: [],
  cashDrawers: [],
  tables: [],
  suppliers: [],
  terminals: [],
  config: {
    businessName: 'VenPOS Corporativo C.A.',
    rif: 'J-12345678-9',
    address: 'Av. Principal, Caracas, Venezuela',
    phone: '0212-1234567',
    exchangeRate: 36.50,
    exchangeRateUpdatedAt: new Date().toISOString(),
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

  useEffect(() => {
    // Cargar datos de la tienda
    const savedStore = localStorage.getItem('venpos_data_v3');
    if (savedStore) {
      try {
        const parsed = JSON.parse(savedStore);
        setStore(parsed);
      } catch (e) {
        console.error("Failed to load store", e);
      }
    }

    // Cargar sesión del usuario
    const savedUser = localStorage.getItem('venpos_user_session');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to load user session", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('venpos_data_v3', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('venpos_user_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('venpos_user_session');
    }
  }, [currentUser]);

  const updateStore = useCallback((updater: (prev: AppStore) => AppStore | any) => {
    setStore(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      return newState;
    });
  }, []);

  const login = (username: string, password?: string) => {
    const user = store.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password && u.active);
    if (user) {
      const loggedUser = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(loggedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveModule('dashboard');
  };

  const addSale = (sale: Sale) => {
    updateStore((prev: AppStore) => ({
      ...prev,
      sales: [...prev.sales, sale],
      products: prev.products.map(p => {
        const item = sale.items.find(si => si.productId === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      })
    }));
  };

  const formatMoney = useCallback((amount: number, overrideCurrency?: 'VES' | 'USD') => {
    const safeAmount = (typeof amount !== 'number' || isNaN(amount)) ? 0 : amount;
    const c = overrideCurrency || currency;
    
    if (c === 'USD') {
      return `$ ${safeAmount.toFixed(2).replace('.', ',')}`;
    }
    return `Bs. ${safeAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  const calculatePrice = useCallback((cost: number, margin: number, rate: number) => {
    if (margin >= 100) return { usd: 0, ves: 0 };
    const usd = cost / (1 - (margin / 100));
    return {
      usd: usd,
      ves: usd * rate
    };
  }, []);

  const calculateMargin = useCallback((cost: number, priceUSD: number) => {
    if (!priceUSD || priceUSD === 0) return 0;
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
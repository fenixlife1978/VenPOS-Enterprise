'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Product, Category, Customer, User, Sale, Config, 
  Brand, Department, KardexEntry, InventoryAdjustment, CashDrawer, 
  Order, Table, ZReport, PaymentEntry, SaleItem, CashMovement
} from '@/types';

// ==================== DATOS INICIALES ====================

const initialDepartments: Department[] = [
  { id: 1, name: 'Abarrotes', description: 'Productos de despensa' },
  { id: 2, name: 'Bebidas', description: 'Bebidas alcohólicas y no alcohólicas' },
  { id: 3, name: 'Limpieza', description: 'Productos de limpieza del hogar' },
  { id: 4, name: 'Higiene', description: 'Cuidado personal' },
  { id: 5, name: 'Electrónica', description: 'Artículos electrónicos' }
];

const initialBrands: Brand[] = [
  { id: 1, name: 'Polar', description: 'Productos Polar' },
  { id: 2, name: 'Coca-Cola', description: 'Bebidas Coca-Cola' },
  { id: 3, name: 'Pepsico', description: 'Productos Pepsi' },
  { id: 4, name: 'Procter & Gamble', description: 'Productos P&G' },
  { id: 5, name: 'Unilever', description: 'Productos Unilever' }
];

const initialCategories: Category[] = [
  { id: 1, name: 'Harinas', departmentId: 1, description: 'Harinas y preparados' },
  { id: 2, name: 'Granos', departmentId: 1, description: 'Arroz, caraotas, lentejas' },
  { id: 3, name: 'Gaseosas', departmentId: 2, description: 'Bebidas carbonatadas' },
  { id: 4, name: 'Jugos', departmentId: 2, description: 'Jugos y néctares' },
  { id: 5, name: 'Desinfectantes', departmentId: 3, description: 'Limpieza profunda' }
];

const initialProducts: Product[] = [
  { 
    id: 1, code: 'P001', name: 'Harina Pan 1kg', description: 'Harina de maíz precocida',
    brandId: 1, brandName: 'Polar', departmentId: 1, categoryId: 1,
    unit: 'unidad', stock: 50, minStock: 10, isComposite: false, compositeItems: [],
    costPrice: 0.35, profitPercentage: 30, priceUSD: 0.70, priceVES: 25.50,
    hasIVA: true, ivaRate: 16, alternatePrices: [],
    active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: 2, code: 'P002', name: 'Arroz 1kg', description: 'Arroz blanco',
    brandId: 1, brandName: 'Polar', departmentId: 1, categoryId: 2,
    unit: 'unidad', stock: 45, minStock: 10, isComposite: false, compositeItems: [],
    costPrice: 0.25, profitPercentage: 30, priceUSD: 0.49, priceVES: 18.00,
    hasIVA: true, ivaRate: 16, alternatePrices: [],
    active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

const initialCustomers: Customer[] = [
  { id: 1, name: 'Consumidor Final', idCard: 'V-00000000', phone: '', email: '', address: '', purchases: 0, totalSpent: 0 },
  { id: 2, name: 'Juan Pérez', idCard: 'V-12345678', phone: '0414-1234567', email: 'juan@email.com', address: 'Caracas', purchases: 5, totalSpent: 150 },
  { id: 3, name: 'María García', idCard: 'V-87654321', phone: '0424-7654321', email: 'maria@email.com', address: 'Valencia', purchases: 3, totalSpent: 89.50 }
];

const initialUsers: User[] = [
  { id: 1, username: 'admin', password: 'admin', fullName: 'Administrador', role: 'admin', active: true, lastLogin: new Date().toISOString() },
  { id: 2, username: 'cajero', password: 'cajero', fullName: 'Cajero Principal', role: 'cashier', active: true, lastLogin: null }
];

const initialTables: Table[] = [
  { id: 1, number: 1, name: 'Mesa 1', capacity: 4, status: 'free' },
  { id: 2, number: 2, name: 'Mesa 2', capacity: 2, status: 'free' },
  { id: 3, number: 3, name: 'Mesa 3', capacity: 6, status: 'free' },
  { id: 4, number: 4, name: 'Mesa 4', capacity: 4, status: 'free' }
];

const initialConfig: Config = {
  businessName: 'Mi Negocio C.A.',
  rif: 'J-12345678-9',
  address: 'Av. Principal, Caracas, Venezuela',
  phone: '0212-1234567',
  exchangeRate: 36.50,
  exchangeRateUpdatedAt: new Date().toISOString(),
  ivaRate: 16,
  igtfRate: 3,
  currency: 'VES'
};

// Definir la interfaz del store
interface StoreState {
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
  // Acciones
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
  updateConfig: (newConfig: Partial<Config>) => void;
  openCashDrawer: (drawer: CashDrawer) => void;
  closeCashDrawer: (finalVES: number, finalUSD: number) => CashDrawer | null;
  getZReport: (cashDrawerId: number) => ZReport | null;
  resetStore: () => void;
}

// ==================== STORE ====================

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      users: initialUsers,
      departments: initialDepartments,
      brands: initialBrands,
      categories: initialCategories,
      products: initialProducts,
      customers: initialCustomers,
      sales: [],
      orders: [],
      tables: initialTables,
      kardex: [],
      adjustments: [],
      config: initialConfig,
      currentUser: null,
      currentCurrency: 'VES',
      cashDrawers: [],

      // Setters básicos
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      setCurrentCurrency: (currency: 'VES' | 'USD') => set({ currentCurrency: currency }),

      // Productos
      addProduct: (product: Product) => {
        set((state) => ({ products: [...state.products, product] }));
        // Agregar entrada inicial al kardex
        const kardexEntry: KardexEntry = {
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          date: new Date().toISOString(),
          type: 'initial',
          quantity: product.stock,
          unitCostVES: product.costPrice,
          unitCostUSD: product.costPrice / get().config.exchangeRate,
          totalCostVES: product.stock * product.costPrice,
          totalCostUSD: product.stock * (product.costPrice / get().config.exchangeRate),
          balanceVES: product.stock * product.costPrice,
          balanceUSD: product.stock * (product.costPrice / get().config.exchangeRate),
          referenceId: product.id,
          notes: 'Stock inicial'
        };
        set((state) => ({ kardex: [...state.kardex, kardexEntry] }));
      },
      
      updateProduct: (product: Product) => set((state) => ({ 
        products: state.products.map((p) => p.id === product.id ? product : p) 
      })),
      
      deleteProduct: (id: number) => set((state) => ({ 
        products: state.products.filter((p) => p.id !== id) 
      })),
      
      updateProductStock: (id: number, stock: number, reason: string = 'Ajuste manual') => {
        const product = get().products.find(p => p.id === id);
        if (!product) return;
        
        const previousStock = product.stock;
        const quantityDiff = stock - previousStock;
        
        // Actualizar producto
        set((state) => ({ 
          products: state.products.map((p) => p.id === id ? { ...p, stock } : p) 
        }));
        
        // Registrar ajuste
        const adjustment: InventoryAdjustment = {
          id: Date.now(),
          productId: id,
          productName: product.name,
          previousStock,
          newStock: stock,
          reason,
          createdAt: new Date().toISOString(),
          userId: get().currentUser?.id || 0,
          userName: get().currentUser?.fullName || 'Sistema'
        };
        set((state) => ({ adjustments: [...state.adjustments, adjustment] }));
        
        // Agregar al kardex
        const kardexEntry: KardexEntry = {
          id: Date.now(),
          productId: id,
          productName: product.name,
          date: new Date().toISOString(),
          type: quantityDiff > 0 ? 'purchase' : 'adjustment',
          quantity: Math.abs(quantityDiff),
          unitCostVES: product.costPrice,
          unitCostUSD: product.costPrice / get().config.exchangeRate,
          totalCostVES: Math.abs(quantityDiff) * product.costPrice,
          totalCostUSD: Math.abs(quantityDiff) * (product.costPrice / get().config.exchangeRate),
          balanceVES: stock * product.costPrice,
          balanceUSD: stock * (product.costPrice / get().config.exchangeRate),
          referenceId: adjustment.id,
          notes: reason
        };
        set((state) => ({ kardex: [...state.kardex, kardexEntry] }));
      },
      
      addToKardex: (entry: KardexEntry) => set((state) => ({ 
        kardex: [...state.kardex, entry] 
      })),
      
      getProductKardex: (productId: number) => {
        return get().kardex.filter(k => k.productId === productId).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      // Departamentos
      addDepartment: (department: Department) => set((state) => ({ 
        departments: [...state.departments, department] 
      })),
      updateDepartment: (department: Department) => set((state) => ({ 
        departments: state.departments.map((d) => d.id === department.id ? department : d) 
      })),
      deleteDepartment: (id: number) => set((state) => ({ 
        departments: state.departments.filter((d) => d.id !== id) 
      })),

      // Marcas
      addBrand: (brand: Brand) => set((state) => ({ 
        brands: [...state.brands, brand] 
      })),
      updateBrand: (brand: Brand) => set((state) => ({ 
        brands: state.brands.map((b) => b.id === brand.id ? brand : b) 
      })),
      deleteBrand: (id: number) => set((state) => ({ 
        brands: state.brands.filter((b) => b.id !== id) 
      })),

      // Categorías
      addCategory: (category: Category) => set((state) => ({ 
        categories: [...state.categories, category] 
      })),
      updateCategory: (category: Category) => set((state) => ({ 
        categories: state.categories.map((c) => c.id === category.id ? category : c) 
      })),
      deleteCategory: (id: number) => set((state) => ({ 
        categories: state.categories.filter((c) => c.id !== id) 
      })),

      // Clientes
      addCustomer: (customer: Customer) => set((state) => ({ 
        customers: [...state.customers, customer] 
      })),
      updateCustomer: (customer: Customer) => set((state) => ({ 
        customers: state.customers.map((c) => c.id === customer.id ? customer : c) 
      })),
      deleteCustomer: (id: number) => set((state) => ({ 
        customers: state.customers.filter((c) => c.id !== id) 
      })),

      // Usuarios
      addUser: (user: User) => set((state) => ({ 
        users: [...state.users, user] 
      })),
      updateUser: (user: User) => set((state) => ({ 
        users: state.users.map((u) => u.id === user.id ? user : u) 
      })),
      deleteUser: (id: number) => set((state) => ({ 
        users: state.users.filter((u) => u.id !== id) 
      })),

      // Ventas
      addSale: (sale: Sale) => {
        // Actualizar stock de productos
        sale.items.forEach(item => {
          const product = get().products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock - item.quantity;
            // Agregar al kardex por venta
            const kardexEntry: KardexEntry = {
              id: Date.now() + item.productId,
              productId: item.productId,
              productName: product.name,
              date: new Date().toISOString(),
              type: 'sale',
              quantity: item.quantity,
              unitCostVES: product.costPrice,
              unitCostUSD: product.costPrice / get().config.exchangeRate,
              totalCostVES: item.quantity * product.costPrice,
              totalCostUSD: item.quantity * (product.costPrice / get().config.exchangeRate),
              balanceVES: newStock * product.costPrice,
              balanceUSD: newStock * (product.costPrice / get().config.exchangeRate),
              referenceId: sale.id,
              notes: `Venta #${sale.id}`
            };
            set((state) => ({ kardex: [...state.kardex, kardexEntry] }));
            // Actualizar stock
            set((state) => ({ 
              products: state.products.map(p => 
                p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
              )
            }));
          }
        });
        
        set((state) => ({ sales: [...state.sales, sale] }));
        
        // Actualizar caja si está abierta
        const cashDrawer = get().config.cashDrawer;
        if (cashDrawer && cashDrawer.isOpen) {
          const movement: CashMovement = {
            id: Date.now(),
            type: 'sale',
            amountVES: sale.totalVES,
            amountUSD: sale.totalUSD,
            description: `Venta #${sale.id}`,
            createdAt: new Date().toISOString(),
            referenceId: sale.id
          };
          const updatedDrawer: CashDrawer = {
            ...cashDrawer,
            sales: [...cashDrawer.sales, sale],
            movements: [...cashDrawer.movements, movement]
          };
          set((state) => ({ config: { ...state.config, cashDrawer: updatedDrawer } }));
        }
      },
      
      refundSale: (saleId: number, reason: string) => {
        const sale = get().sales.find(s => s.id === saleId);
        if (!sale || sale.status === 'refunded') return;
        
        // Marcar venta original como reembolsada
        set((state) => ({ 
          sales: state.sales.map(s => s.id === saleId ? { ...s, status: 'refunded' as const } : s) 
        }));
        
        // Registrar devolución en kardex y restaurar stock
        sale.items.forEach(item => {
          const product = get().products.find(p => p.id === item.productId);
          if (product) {
            const kardexEntry: KardexEntry = {
              id: Date.now() + item.productId,
              productId: item.productId,
              productName: product.name,
              date: new Date().toISOString(),
              type: 'return',
              quantity: item.quantity,
              unitCostVES: product.costPrice,
              unitCostUSD: product.costPrice / get().config.exchangeRate,
              totalCostVES: item.quantity * product.costPrice,
              totalCostUSD: item.quantity * (product.costPrice / get().config.exchangeRate),
              balanceVES: (product.stock + item.quantity) * product.costPrice,
              balanceUSD: (product.stock + item.quantity) * (product.costPrice / get().config.exchangeRate),
              referenceId: saleId,
              notes: `Devolución de venta #${saleId}: ${reason}`
            };
            set((state) => ({ kardex: [...state.kardex, kardexEntry] }));
            // Restaurar stock
            set((state) => ({ 
              products: state.products.map(p => 
                p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p
              )
            }));
          }
        });
      },

      // Configuración
      updateConfig: (newConfig: Partial<Config>) => set((state) => ({ 
        config: { ...state.config, ...newConfig } 
      })),

      // Caja
      openCashDrawer: (drawer: CashDrawer) => set((state) => ({ 
        config: { ...state.config, cashDrawer: drawer },
        cashDrawers: [...state.cashDrawers, drawer]
      })),
      
      closeCashDrawer: (finalVES: number, finalUSD: number) => {
        const drawer = get().config.cashDrawer;
        if (!drawer || !drawer.isOpen) return null;
        
        const closedDrawer: CashDrawer = {
          ...drawer,
          closingDate: new Date().toISOString(),
          finalVES,
          finalUSD,
          isOpen: false
        };
        
        set((state) => ({ 
          config: { ...state.config, cashDrawer: undefined, lastCashClosing: closedDrawer },
          cashDrawers: state.cashDrawers.map(d => d.id === drawer.id ? closedDrawer : d)
        }));
        
        return closedDrawer;
      },
      
      getZReport: (cashDrawerId: number) => {
        const drawer = get().cashDrawers.find(d => d.id === cashDrawerId);
        if (!drawer) return null;
        
        const salesByMethod = {
          cash_ves: 0, cash_usd: 0, card: 0, biopago: 0, zelle_usd: 0, pagomovil: 0, credit: 0
        };
        const refundsByMethod = {
          cash_ves: 0, cash_usd: 0, pagomovil: 0
        };
        
        let totalSalesVES = 0, totalSalesUSD = 0, totalRefundsVES = 0, totalRefundsUSD = 0;
        
        drawer.sales.forEach(sale => {
          if (sale.status === 'refunded') {
            totalRefundsVES += sale.totalVES;
            totalRefundsUSD += sale.totalUSD;
            sale.payments.forEach(p => {
              if (p.type === 'cash_ves') refundsByMethod.cash_ves += p.amountVES;
              if (p.type === 'cash_usd') refundsByMethod.cash_usd += p.amountUSD;
              if (p.type === 'pagomovil') refundsByMethod.pagomovil += p.amountVES;
            });
          } else if (sale.status === 'completed') {
            totalSalesVES += sale.totalVES;
            totalSalesUSD += sale.totalUSD;
            sale.payments.forEach(p => {
              if (p.type === 'cash_ves') salesByMethod.cash_ves += p.amountVES;
              else if (p.type === 'cash_usd') salesByMethod.cash_usd += p.amountUSD;
              else if (p.type === 'card') salesByMethod.card += p.amountVES;
              else if (p.type === 'biopago') salesByMethod.biopago += p.amountVES;
              else if (p.type === 'zelle_usd') salesByMethod.zelle_usd += p.amountUSD;
              else if (p.type === 'pagomovil') salesByMethod.pagomovil += p.amountVES;
              else if (p.type === 'credit') salesByMethod.credit += p.amountVES;
            });
          }
        });
        
        const expectedVES = drawer.initialVES + totalSalesVES - totalRefundsVES;
        const expectedUSD = drawer.initialUSD + totalSalesUSD - totalRefundsUSD;
        
        const report: ZReport = {
          cashDrawerId: drawer.id,
          date: drawer.closingDate || new Date().toISOString(),
          openingTime: drawer.openingDate,
          closingTime: drawer.closingDate || new Date().toISOString(),
          initialVES: drawer.initialVES,
          initialUSD: drawer.initialUSD,
          finalVES: drawer.finalVES || 0,
          finalUSD: drawer.finalUSD || 0,
          expectedVES,
          expectedUSD,
          differenceVES: (drawer.finalVES || 0) - expectedVES,
          differenceUSD: (drawer.finalUSD || 0) - expectedUSD,
          salesByPaymentMethod: salesByMethod,
          totalSalesVES,
          totalSalesUSD,
          refundsByPaymentMethod: refundsByMethod,
          totalRefundsVES,
          totalRefundsUSD,
          netSalesVES: totalSalesVES - totalRefundsVES,
          netSalesUSD: totalSalesUSD - totalRefundsUSD
        };
        
        return report;
      },

      resetStore: () => set({ 
        users: initialUsers,
        departments: initialDepartments,
        brands: initialBrands,
        categories: initialCategories,
        products: initialProducts,
        customers: initialCustomers,
        sales: [],
        orders: [],
        tables: initialTables,
        kardex: [],
        adjustments: [],
        config: initialConfig,
        currentUser: null,
        currentCurrency: 'VES',
        cashDrawers: []
      })
    }),
    { name: 'venpos-storage-v2' }
  )
);

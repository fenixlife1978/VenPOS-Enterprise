'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  ChartLine, 
  Shield, 
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Terminal,
  UserCheck,
  KeyRound,
  RefreshCw,
  History,
  AlertCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppStore, User } from '@/lib/types';
import { ProductForm } from './Inventory/ProductForm';
import { UserForm } from './Users/UserForm';

interface DashboardAdminProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
  store: AppStore;
  currentUser: User | null;
  formatMoney: (amount: number) => string;
  updateStore: (updater: any) => void;
}

export default function DashboardAdmin({ 
  activeModule, 
  setActiveModule, 
  onLogout, 
  store, 
  currentUser,
  formatMoney,
  updateStore
}: DashboardAdminProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'admin', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'customers', name: 'Clientes', icon: Users },
    { id: 'sales', name: 'Ventas', icon: FileText },
    { id: 'reports', name: 'Reportes', icon: ChartLine },
    { id: 'users', name: 'Usuarios', icon: Shield },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case 'admin':
        return <DashboardHome store={store} formatMoney={formatMoney} updateStore={updateStore} setActiveModule={setActiveModule} />;
      case 'inventory':
        return <InventoryModule store={store} formatMoney={formatMoney} updateStore={updateStore} />;
      case 'customers':
        return <CustomersModule store={store} formatMoney={formatMoney} />;
      case 'sales':
        return <SalesModule store={store} formatMoney={formatMoney} />;
      case 'reports':
        return <ReportsModule store={store} formatMoney={formatMoney} />;
      case 'users':
        return <UsersModule store={store} updateStore={updateStore} />;
      case 'config':
        return <ConfigModule store={store} updateStore={updateStore} />;
      default:
        return <DashboardHome store={store} formatMoney={formatMoney} updateStore={updateStore} setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#d4d4d4]">
      {/* Sidebar Azul Colapsable */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } bg-[#0a1628] shadow-2xl flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        {/* Header del Sidebar */}
        <div className={`p-5 border-b border-white/10 flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!sidebarCollapsed && (
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">
                Ven<span className="text-[#c9a227]">POS</span>
              </h1>
              <p className="text-xs text-white/60 mt-1 font-medium">System PRO</p>
              <p className="text-[10px] text-white/40 mt-2">Panel de Administración</p>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mb-2">
              <div className="w-10 h-10 bg-[#c9a227] rounded-xl flex items-center justify-center">
                <span className="text-[#0a1628] font-black text-lg">V</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[#c9a227]" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-[#c9a227]" />
            )}
          </button>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeModule === item.id 
                  ? 'bg-[#c9a227] text-[#0a1628] shadow-lg font-bold' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? item.name : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeModule === item.id ? 'text-[#0a1628]' : 'text-[#c9a227]'}`} />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Footer del Sidebar - Usuario */}
        <div className={`p-4 border-t border-white/10 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex ${sidebarCollapsed ? 'flex-col items-center gap-2' : 'items-center gap-3'}`}>
            <div className="w-10 h-10 bg-[#c9a227] rounded-xl flex items-center justify-center text-[#0a1628] font-bold text-lg flex-shrink-0">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentUser?.fullName}</p>
                <p className="text-[10px] text-[#c9a227] uppercase font-medium">Administrador</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button 
                onClick={onLogout} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 text-[#c9a227]" />
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button 
              onClick={onLogout} 
              className="mt-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-[#c9a227]" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#d4d4d4]">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Dashboard Home
function DashboardHome({ store, formatMoney, updateStore, setActiveModule }: { store: AppStore; formatMoney: (amount: number) => string; updateStore: (updater: any) => void; setActiveModule: (m: string) => void }) {
  const totalProducts = store.products.length;
  const totalSales = store.sales.length;
  const totalCustomers = store.customers.length;
  const totalRevenue = store.sales.reduce((sum, s) => sum + s.totalVES, 0);
  const totalRevenueUSD = totalRevenue / store.config.exchangeRate;
  
  const monthlyExpenses = 449.59;
  const monthlyRevenueUSD = totalRevenueUSD;

  const [exchangeRate, setExchangeRate] = useState(store.config.exchangeRate.toString());

  const handleUpdateRate = () => {
    const newRate = parseFloat(exchangeRate);
    if (!isNaN(newRate) && newRate > 0) {
      updateStore((prev: any) => ({
        ...prev,
        config: { ...prev.config, exchangeRate: newRate, exchangeRateUpdatedAt: new Date().toISOString() }
      }));
      alert(`Tasa actualizada a ${newRate.toFixed(2)} Bs.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#d4d4d4] rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-3xl font-black text-gray-900">Panel de Administración</h2>
          <p className="text-sm text-gray-600 mt-1">Gestiona tu negocio desde un solo lugar</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0a1628] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a227]/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#c9a227]" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Tasa BCV</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-20 bg-white/10 text-white font-bold text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
                />
                <button 
                  onClick={handleUpdateRate} 
                  className="bg-[#c9a227] text-[#0a1628] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d4b43a] transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Actualizar
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveModule('reports')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <History className="w-4 h-4" /> HISTORIAL CIERRES
          </button>

          <button 
            onClick={() => { if(confirm('¿Desea reiniciar el sistema? Se borrarán datos locales.')) localStorage.clear(); window.location.reload(); }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Trash2 className="w-4 h-4" /> RESET SISTEMA
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button 
            onClick={() => setActiveModule('admin')}
            className="bg-[#c9a227] text-[#0a1628] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveModule('reports')}
            className="bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> Reportes
          </button>
          <button 
            onClick={() => setActiveModule('inventory')}
            className="bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Package className="w-4 h-4" /> Inventario
          </button>
          <button 
            onClick={() => setActiveModule('users')}
            className="bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button 
            onClick={() => setActiveModule('config')}
            className="bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-none shadow-md bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Productos</p>
              <p className="text-4xl font-black text-gray-900 mt-2">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-md bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clientes</p>
              <p className="text-4xl font-black text-gray-900 mt-2">{totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-md bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ventas</p>
              <p className="text-4xl font-black text-gray-900 mt-2">{totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-md bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ingresos del Mes</p>
              <p className="text-3xl font-black text-green-600 mt-2">USD ${monthlyRevenueUSD.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Reinicia cada 1ro del mes</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-md bg-white rounded-2xl md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Gastos del Mes</p>
              <p className="text-3xl font-black text-red-600 mt-2">USD ${monthlyExpenses.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Incluye compras, devoluciones, ajustes y colaboraciones</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-none shadow-md bg-white rounded-2xl">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
          <Terminal className="w-5 h-5 text-[#c9a227]" /> Terminales y Gestión
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Terminales</p>
                <p className="text-[10px] text-gray-500">2 activas</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">Gestionar</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Usuarios</p>
                <p className="text-[10px] text-gray-500">{store.users.length} registrados</p>
              </div>
            </div>
            <Button onClick={() => setActiveModule('users')} variant="outline" size="sm" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">Gestionar</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Supervisión</p>
                <p className="text-[10px] text-gray-500">Actividad en tiempo real</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">Ver</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">PIN Autorización</p>
                <p className="text-[10px] text-gray-500">Configurar permisos</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">Configurar</Button>
          </div>
        </div>
      </Card>

      <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Ventas Recientes</h3>
          <Button onClick={() => setActiveModule('sales')} variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 font-bold">
            Ver todas
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {store.sales.slice(-5).reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">#{sale.id.toString().slice(-6)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{sale.customerName}</td>
                  <td className="px-4 py-3 text-right font-bold text-xs text-gray-900">{formatMoney(sale.totalVES)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completada</Badge>
                  </td>
                </tr>
              ))}
              {store.sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Inventory Module (Simplified for context, assumes ProductForm exists)
function InventoryModule({ store, formatMoney, updateStore }: { store: AppStore; formatMoney: (amount: number) => string; updateStore: (updater: any) => void }) {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = store.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#0a1628]">Inventario</h2>
          <p className="text-sm text-gray-500">Administra tus productos</p>
        </div>
        <Button 
          onClick={() => { setEditingProduct(null); setShowProductForm(true); }} 
          className="bg-[#0a1628] hover:bg-[#1e3a5f] rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>
      
      <Card className="border-none shadow-md bg-white">
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Buscar producto..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 border-gray-200 focus:border-[#c9a227] focus:ring-[#c9a227]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0a1628]">{p.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-[10px] text-gray-400">{p.brandName || 'Sin marca'}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={p.stock <= p.minStock ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-green-100 text-green-700 hover:bg-green-100"}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0a1628]">{formatMoney(p.priceVES)}</td>
                  <td className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                      className="hover:bg-[#c9a227]/10 hover:text-[#c9a227]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {showProductForm && (
        <ProductForm 
          isOpen={showProductForm} 
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }} 
          store={store} 
          updateStore={updateStore} 
          editingProduct={editingProduct} 
        />
      )}
    </div>
  );
}

// Customers Module (Simplified)
function CustomersModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#0a1628]">Clientes</h2>
        <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Cliente</Button>
      </div>
      <Card className="bg-white border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Cédula/RIF</th>
                <th className="px-4 py-3 text-right">Total Compras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {store.customers.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.idCard}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Sales Module (Simplified)
function SalesModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0a1628]">Historial de Ventas</h2>
      <Card className="bg-white border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {store.sales.slice().reverse().map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono">#{s.id.toString().slice(-6)}</td>
                  <td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{s.customerName}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(s.totalVES)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Reports Module (Simplified)
function ReportsModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  const total = store.sales.reduce((a, b) => a + b.totalVES, 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0a1628]">Reportes</h2>
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-none shadow-md">
          <p className="text-xs font-bold text-gray-500 uppercase">Ventas Totales</p>
          <p className="text-3xl font-black text-[#0a1628] mt-2">{formatMoney(total)}</p>
        </Card>
      </div>
    </div>
  );
}

// Users Module
function UsersModule({ store, updateStore }: { store: AppStore; updateStore: any }) {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const getRoleLabel = (role: string) => {
    const roles: any = { admin: 'Administrador', cashier: 'Cajero', kitchen: 'Cocina', seller: 'Vendedor' };
    return roles[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#0a1628]">Gestión de Usuarios</h2>
        <Button 
          onClick={() => { setEditingUser(null); setShowUserForm(true); }}
          className="bg-[#0a1628] hover:bg-[#1e3a5f] rounded-xl text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>
      
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Nombre Completo</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {store.users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#0a1628]">{u.username}</td>
                  <td className="px-4 py-3 text-gray-800">{u.fullName}</td>
                  <td className="px-4 py-3">
                    <Badge className={u.role === 'admin' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                      {getRoleLabel(u.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={u.active ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setEditingUser(u); setShowUserForm(true); }}
                      className="hover:bg-[#c9a227]/10 hover:text-[#c9a227]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {store.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showUserForm && (
        <UserForm 
          isOpen={showUserForm}
          onClose={() => { setShowUserForm(false); setEditingUser(null); }}
          updateStore={updateStore}
          editingUser={editingUser}
        />
      )}
    </div>
  );
}

// Config Module (Simplified)
function ConfigModule({ store, updateStore }: { store: AppStore; updateStore: (updater: any) => void }) {
  const [rate, setRate] = useState(store.config.exchangeRate.toString());
  const handleUpdate = () => { 
    const newRate = parseFloat(rate); 
    if (!isNaN(newRate) && newRate > 0) { 
      updateStore((prev: any) => ({ ...prev, config: { ...prev.config, exchangeRate: newRate } })); 
      alert('Tasa actualizada');
    } 
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0a1628]">Configuración</h2>
      <Card className="p-6 bg-white border-none shadow-md max-w-md">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Tasa de Cambio (Bs.)</p>
        <div className="flex gap-2">
          <Input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} />
          <Button onClick={handleUpdate} className="bg-[#0a1628]">Actualizar</Button>
        </div>
      </Card>
    </div>
  );
}

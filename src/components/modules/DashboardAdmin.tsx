"use client";

import React from 'react';
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
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppStore, User } from '@/lib/types';

interface DashboardAdminProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
  store: AppStore;
  currentUser: User | null;
  formatMoney: (amount: number) => string;
}

export default function DashboardAdmin({ 
  activeModule, 
  setActiveModule, 
  onLogout, 
  store, 
  currentUser,
  formatMoney 
}: DashboardAdminProps) {
  
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
        return <DashboardHome store={store} formatMoney={formatMoney} />;
      case 'inventory':
        return <InventoryModule store={store} formatMoney={formatMoney} />;
      case 'customers':
        return <CustomersModule store={store} formatMoney={formatMoney} />;
      case 'sales':
        return <SalesModule store={store} formatMoney={formatMoney} />;
      case 'reports':
        return <ReportsModule store={store} formatMoney={formatMoney} />;
      case 'users':
        return <UsersModule store={store} />;
      case 'config':
        return <ConfigModule store={store} />;
      default:
        return <DashboardHome store={store} formatMoney={formatMoney} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {/* Sidebar Admin */}
      <aside className="w-72 bg-[#0a1628] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-[#c9a227]">VenPOS</h1>
          <p className="text-xs text-white/50 mt-1">Sistema Corporativo</p>
          <p className="text-[10px] text-white/30 mt-2">Administrador</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeModule === item.id 
                  ? 'bg-[#c9a227] text-[#0a1628] font-bold shadow-lg' 
                  : 'hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-[#0a1628] font-bold text-lg">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser?.fullName}</p>
              <p className="text-[10px] text-white/50 uppercase">Administrador</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Componentes internos de cada módulo
function DashboardHome({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  const totalSales = store.sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = store.products.length;
  const totalCustomers = store.customers.length;
  const lowStock = store.products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0a1628]">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Ventas Totales</p>
          <p className="text-3xl font-bold text-[#0a1628]">{formatMoney(totalSales)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Productos</p>
          <p className="text-3xl font-bold text-[#0a1628]">{totalProducts}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Clientes</p>
          <p className="text-3xl font-bold text-[#0a1628]">{totalCustomers}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">{lowStock}</p>
        </Card>
      </div>
    </div>
  );
}

function InventoryModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0a1628]">Inventario</h2>
        <Button className="bg-[#0a1628] rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Precio Bs</th>
                <th className="px-4 py-3 text-right">Precio USD</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{product.code}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge className={product.stock <= product.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{formatMoney(product.priceVES)}</td>
                  <td className="px-4 py-3 text-right">$ {product.priceUSD.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CustomersModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0a1628]">Clientes</h2>
        <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Cliente</Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Cédula/RIF</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-right">Compras</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {store.customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.idCard}</td>
                  <td className="px-4 py-3">{customer.phone || '-'}</td>
                  <td className="px-4 py-3 text-right">{customer.purchases}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(customer.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SalesModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#0a1628]">Historial de Ventas</h2>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cajero</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {store.sales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">#{sale.id}</td>
                  <td className="px-4 py-3">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{sale.cashier}</td>
                  <td className="px-4 py-3">{sale.customerName}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(sale.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-100 text-green-700">Completada</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReportsModule({ store, formatMoney }: { store: AppStore; formatMoney: (amount: number) => string }) {
  const totalSales = store.sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = store.sales.filter((s) => 
    new Date(s.date).toDateString() === new Date().toDateString()
  ).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0a1628]">Reportes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Ventas Hoy</p>
          <p className="text-2xl font-bold text-[#0a1628]">{formatMoney(todaySales)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Ventas Totales</p>
          <p className="text-2xl font-bold text-[#0a1628]">{formatMoney(totalSales)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Transacciones</p>
          <p className="text-2xl font-bold text-[#0a1628]">{store.sales.length}</p>
        </Card>
      </div>
    </div>
  );
}

function UsersModule({ store }: { store: AppStore }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0a1628]">Usuarios</h2>
        <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Usuario</Button>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {store.users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{user.username}</td>
                  <td className="px-4 py-3">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <Badge className={user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'cashier' ? 'Cajero' : 'Vendedor'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ConfigModule({ store }: { store: AppStore }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#0a1628]">Configuración</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Información del Negocio</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Razón Social</p>
              <p className="font-medium">{store.config.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RIF</p>
              <p className="font-mono text-sm">{store.config.rif}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="text-sm">{store.config.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="text-sm">{store.config.phone}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold mb-4">Configuración Fiscal</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Cambio</p>
              <p className="font-medium">1 USD = {store.config.exchangeRate.toFixed(2)} Bs.</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IVA</p>
              <p className="font-medium">{store.config.ivaRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IGTF</p>
              <p className="font-medium">{store.config.igtfRate}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect } from 'react';
import { useVenPos } from '@/hooks/useVenPos';
import Shell from '@/components/layout/Shell';
import Login from '@/components/modules/Login';
import Dashboard from '@/components/modules/Dashboard';
import POS from '@/components/modules/POS';
import Reports from '@/components/modules/Reports';
import Inventory from '@/components/modules/Inventory';
import DashboardAdmin from '@/components/modules/DashboardAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Package, 
  Tags, 
  Users as UsersIcon, 
  FileText, 
  Shield, 
  Settings, 
  CheckCircle,
  Clock,
  LayoutDashboard,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const {
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
  } = useVenPos();

  // ✅ FORZAR módulo POS cuando es cajero
  useEffect(() => {
    if (currentUser?.role === 'cashier' && activeModule !== 'pos') {
      setActiveModule('pos');
    }
  }, [currentUser, activeModule, setActiveModule]);

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard store={store} setActiveModule={setActiveModule} formatMoney={formatMoney} />;
      case 'pos':
        if (currentUser.role !== 'cashier' && currentUser.role !== 'admin') {
          return <div className="p-8 text-center font-bold">Acceso Denegado</div>;
        }
        return <POS store={store} currency={currency} formatMoney={formatMoney} addSale={addSale} updateStore={updateStore} currentUser={currentUser} />;
      case 'reports':
        return <Reports store={store} formatMoney={formatMoney} />;
      case 'inventory':
        return <Inventory store={store} updateStore={updateStore} formatMoney={formatMoney} />;
      
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Clientes</h2>
              <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Cliente</Button>
            </div>
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-3 text-left">Nombre</th>
                      <th className="px-6 py-3 text-left">ID / RIF</th>
                      <th className="px-6 py-3 text-left">Teléfono</th>
                      <th className="px-6 py-3 text-left">Compras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {store.customers.map(c => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-bold">{c.name}</td>
                        <td className="px-6 py-4 font-mono">{c.idCard}</td>
                        <td className="px-6 py-4">{c.phone || '-'}</td>
                        <td className="px-6 py-4 font-bold"><Badge className="bg-[#c9a227] text-white border-none">{c.purchases}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Historial de Ventas</h2>
              <div className="flex gap-2">
                <Input type="date" className="h-10 rounded-xl" />
                <Button variant="outline" className="rounded-xl flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filtrar
                </Button>
              </div>
            </div>
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Fecha</th>
                      <th className="px-6 py-3 text-left">Cliente</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {store.sales.length > 0 ? store.sales.slice().reverse().map(s => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-bold text-[#0a1628]">#{String(s.id).padStart(4, '0')}</td>
                        <td className="px-6 py-4">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{s.customerName}</td>
                        <td className="px-6 py-4 font-bold">{formatMoney(s.total)}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-50 text-green-700 border-none uppercase text-[10px] font-bold">{s.status}</Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No hay ventas registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Usuarios del Sistema</h2>
              <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Usuario</Button>
            </div>
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-3 text-left">Usuario</th>
                      <th className="px-6 py-3 text-left">Nombre</th>
                      <th className="px-6 py-3 text-left">Rol</th>
                      <th className="px-6 py-3 text-left">Último Acceso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {store.users.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-bold">{u.username}</td>
                        <td className="px-6 py-4">{u.fullName}</td>
                        <td className="px-6 py-4"><Badge className="bg-[#0a1628] text-white border-none uppercase text-[10px]">{u.role}</Badge></td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Nunca'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'config':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#c9a227]" /> Información del Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Razón Social</label>
                  <Input defaultValue={store.config.businessName} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">RIF</label>
                  <Input defaultValue={store.config.rif} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Dirección</label>
                  <Input defaultValue={store.config.address} className="rounded-xl" />
                </div>
                <Button className="w-full bg-[#0a1628] font-bold rounded-xl">Guardar Cambios</Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#c9a227]" /> Configuración Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">IVA (%)</label>
                    <Input defaultValue={store.config.ivaRate} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">IGTF (%)</label>
                    <Input defaultValue={store.config.igtfRate} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Tasa de Cambio (VES/USD)</label>
                  <Input defaultValue={store.config.exchangeRate} className="rounded-xl" />
                </div>
                <Button className="w-full bg-[#0a1628} font-bold rounded-xl">Actualizar Tasas</Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Module not implemented</div>;
    }
  };

  // ✅ ADMIN: Dashboard con menú lateral completo
  if (currentUser.role === 'admin') {
    return (
      <DashboardAdmin 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onLogout={logout}
        store={store}
        currentUser={currentUser}
        formatMoney={formatMoney}
      />
    );
  }

  // ✅ CAJERO: SOLO EL POS (pantalla completa, sin menú lateral)
  return (
    <div className="h-screen overflow-hidden bg-[#f0f2f5]">
      {renderModule()}
    </div>
  );
}
"use client";

import React from 'react';
import { useVenPos } from '@/hooks/useVenPos';
import Shell from '@/components/layout/Shell';
import Login from '@/components/modules/Login';
import Dashboard from '@/components/modules/Dashboard';
import POS from '@/components/modules/POS';
import Reports from '@/components/modules/Reports';
// Simple list views for other modules
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Boxes, Tags, Users as UsersIcon, FileText, Settings, UserRound } from 'lucide-react';

export default function HomePage() {
  const {
    store,
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

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard store={store} setActiveModule={setActiveModule} formatMoney={formatMoney} />;
      case 'pos':
        return <POS store={store} currency={currency} formatMoney={formatMoney} addSale={addSale} currentUser={currentUser} />;
      case 'reports':
        return <Reports store={store} formatMoney={formatMoney} />;
      
      // Basic views for other modules to complete the app structure
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestión de Productos</h2>
              <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button>
            </div>
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-3 text-left">Código</th>
                      <th className="px-6 py-3 text-left">Nombre</th>
                      <th className="px-6 py-3 text-left">Precio (Bs)</th>
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {store.products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-mono font-bold">{p.code}</td>
                        <td className="px-6 py-4 font-bold">{p.name}</td>
                        <td className="px-6 py-4">{formatMoney(p.priceVES, 'VES')}</td>
                        <td className="px-6 py-4 font-bold">{p.stock}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-50 text-green-700 border-none">Activo</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Categorías</h2>
              <Button className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4 mr-2" /> Nueva Categoría</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {store.categories.map(c => (
                <Card key={c.id} className="border-none shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-md font-bold flex items-center gap-2">
                      <Tags className="w-4 h-4 text-[#c9a227]" />
                      {c.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <p className="text-[10px] font-bold uppercase mt-4 text-[#0a1628]">
                      {store.products.filter(p => p.categoryId === c.id).length} Productos
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

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
                <Button variant="outline" className="rounded-xl">Filtrar</Button>
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
                      <th className="px-6 py-3 text-left">Método</th>
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
                          <Badge className="bg-green-50 text-green-700 border-none uppercase text-[10px] font-bold">{s.method}</Badge>
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
              <h2 className="text-xl font-bold">Usuarios</h2>
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
                <CardTitle className="text-lg font-bold">Información del Negocio</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Razón Social</label>
                  <Input defaultValue={store.config.businessName} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">RIF</label>
                  <Input defaultValue={store.config.rif} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Dirección</label>
                  <Input defaultValue={store.config.address} />
                </div>
                <Button className="w-full bg-[#0a1628] font-bold">Guardar Cambios</Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-bold">Configuración Fiscal</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">IVA (%)</label>
                    <Input defaultValue={store.config.ivaRate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">IGTF (%)</label>
                    <Input defaultValue={store.config.igtfRate} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Tasa de Cambio (VES/USD)</label>
                  <Input defaultValue={store.config.exchangeRate} />
                </div>
                <Button className="w-full bg-[#0a1628] font-bold">Actualizar Tasas</Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Module not implemented</div>;
    }
  };

  return (
    <Shell
      currentUser={currentUser}
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      currency={currency}
      setCurrency={setCurrency}
      logout={logout}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="max-w-7xl mx-auto">
        {renderModule()}
      </div>
    </Shell>
  );
}

import React from 'react';
import { 
  ShoppingBag, 
  Coins, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import type { AppStore } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardProps {
  store: AppStore;
  setActiveModule: (m: string) => void;
  formatMoney: (amount: number) => string;
}

export default function Dashboard({ store, setActiveModule, formatMoney }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = store.sales.filter(s => s.date.startsWith(today));
  const totalSalesCount = todaySales.length;
  const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalProducts = store.products.filter(p => p.active).length;
  const lowStockCount = store.products.filter(p => p.stock <= p.minStock).length;

  const stats = [
    { label: 'Ventas Hoy', value: totalSalesCount, icon: ShoppingBag, color: 'navy', trend: 'Activo', trendDir: 'up' },
    { label: 'Ingresos Hoy', value: formatMoney(totalRevenue), icon: Coins, color: 'gold', trend: 'En línea', trendDir: 'up' },
    { label: 'Productos Activos', value: totalProducts, icon: Package, color: 'success', trend: 'Inventario', trendDir: 'up' },
    { label: 'Stock Bajo', value: lowStockCount, icon: AlertCircle, color: 'danger', trend: 'Revisar', trendDir: 'down' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0",
                stat.color === 'navy' && "bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] text-white",
                stat.color === 'gold' && "bg-gradient-to-br from-[#c9a227] to-[#d4b43a] text-[#0a1628]",
                stat.color === 'success' && "bg-green-50 text-green-700",
                stat.color === 'danger' && "bg-red-50 text-red-700",
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tight">{stat.value}</h3>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-[10px] font-bold uppercase",
                  stat.trendDir === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {stat.trendDir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#c9a227]" />
              Ventas Recientes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setActiveModule('sales')}>Ver Todo</Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Hora</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {store.sales.length > 0 ? store.sales.slice(-5).reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0a1628]">#{String(sale.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4">{sale.customerName}</td>
                    <td className="px-6 py-4 font-bold">{formatMoney(sale.total)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(sale.date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" /> Completada
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No hay ventas recientes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#c9a227]" />
              Alertas de Inventario
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setActiveModule('products')}>Gestionar</Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-3 text-left">Producto</th>
                  <th className="px-6 py-3 text-left">Stock</th>
                  <th className="px-6 py-3 text-left">Mínimo</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {store.products.filter(p => p.stock <= p.minStock).length > 0 ? store.products.filter(p => p.stock <= p.minStock).map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{product.name}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{product.stock}</td>
                    <td className="px-6 py-4 text-muted-foreground">{product.minStock}</td>
                    <td className="px-6 py-4">
                      <Badge variant="destructive" className="border-none flex items-center gap-1 w-fit">
                        Crítico
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">Sin alertas de stock</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

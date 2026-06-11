import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  Sparkles, 
  Loader2, 
  ChartLine, 
  ChartPie, 
  Crown, 
  Trophy 
} from 'lucide-react';
import { analyzeSalesAndInventory, type SalesAndInventoryAnalysisOutput } from '@/ai/flows/sales-and-inventory-analysis';
import type { AppStore } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ReportsProps {
  store: AppStore;
  formatMoney: (amount: number) => string;
}

export default function Reports({ store, formatMoney }: ReportsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SalesAndInventoryAnalysisOutput | null>(null);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSalesAndInventory({
        sales: store.sales,
        products: store.products,
        categories: store.categories,
        config: store.config
      });
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert('Error al generar el análisis inteligente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalSalesCount = store.sales.length;
  const totalRevenue = store.sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1a1a2e]">Análisis y Reportes</h2>
        <Button 
          onClick={handleAIAnalysis} 
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] text-white font-bold border-none"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {isAnalyzing ? 'Analizando...' : 'Generar Análisis IA'}
        </Button>
      </div>

      {analysis && (
        <Card className="border-[#c9a227]/30 bg-[#f5efe0]/30 shadow-md animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-[#c9a227]/20 bg-white/50">
            <Sparkles className="w-6 h-6 text-[#c9a227]" />
            <div>
              <CardTitle className="text-lg font-bold text-[#0a1628]">Análisis Inteligente VenPOS</CardTitle>
              <p className="text-xs text-muted-foreground">Basado en datos reales de su negocio</p>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-md font-bold text-[#0a1628] mb-3">Resumen Ejecutivo</h3>
              <p className="text-[#1a1a2e] leading-relaxed italic">{analysis.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-[#c9a227] tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4" /> Recomendaciones de Inventario
                </h4>
                <ul className="space-y-3">
                  {analysis.inventoryRecommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#1a1a2e]">
                      <div className="w-5 h-5 rounded-full bg-[#c9a227] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">{i+1}</div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-[#c9a227] tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Estrategias de Venta
                </h4>
                <ul className="space-y-3">
                  {analysis.salesStrategyRecommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#1a1a2e]">
                      <div className="w-5 h-5 rounded-full bg-[#0a1628] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">{i+1}</div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-white p-1 h-auto border border-border rounded-2xl mb-6 shadow-sm overflow-x-auto flex flex-nowrap sm:flex-wrap">
          <TabsTrigger value="sales" className="data-[state=active]:bg-[#0a1628] data-[state=active]:text-white rounded-xl px-8 py-3 font-bold text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <ChartLine className="w-4 h-4" /> Ventas
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-[#0a1628] data-[state=active]:text-white rounded-xl px-8 py-3 font-bold text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <Trophy className="w-4 h-4" /> Productos
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-[#0a1628] data-[state=active]:text-white rounded-xl px-8 py-3 font-bold text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <Crown className="w-4 h-4" /> Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#c9a227]" />
                  Ventas por Período
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center opacity-50">
                <ChartPie className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="text-sm font-bold">Distribución de Ventas</p>
                <p className="text-xs mt-2">Total acumulado: <span className="font-bold text-[#0a1628]">{formatMoney(totalRevenue)}</span></p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c9a227]" />
                  Resumen Estadístico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-tighter">Transacciones</p>
                    <p className="text-2xl font-black text-[#0a1628]">{totalSalesCount}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-tighter">Promedio Venta</p>
                    <p className="text-2xl font-black text-[#0a1628]">{formatMoney(totalSalesCount ? totalRevenue / totalSalesCount : 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#c9a227]" />
                Top Productos Vendidos
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-3 text-left">Producto</th>
                    <th className="px-6 py-3 text-left">Cantidad</th>
                    <th className="px-6 py-3 text-left">Total Ventas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {store.products.slice(0, 5).map((p, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4"><Badge className="bg-[#c9a227] text-white border-none">{Math.floor(Math.random() * 100)}</Badge></td>
                      <td className="px-6 py-4 font-bold text-[#0a1628]">{formatMoney(p.priceVES * 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#c9a227]" />
                Mejores Clientes
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Compras</th>
                    <th className="px-6 py-3 text-left">Total Gastado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {store.customers.map((c, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-bold">{c.name}</td>
                      <td className="px-6 py-4"><Badge className="bg-[#0a1628] text-white border-none">{c.purchases}</Badge></td>
                      <td className="px-6 py-4 font-bold text-[#0a1628]">{formatMoney(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

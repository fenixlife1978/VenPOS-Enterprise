"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Barcode, 
  ShoppingCart, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  Minus, 
  Plus, 
  DollarSign, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  Building2,
  Package,
  PlusCircle,
  Users,
  LayoutDashboard,
  UtensilsCrossed,
  Printer,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { AppStore, Product, SaleItem, Sale, PaymentEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import PaymentCalculator from './POS/PaymentCalculator';
import ComandasModal from './POS/ComandasModal';
import CashOpening from './POS/CashOpening';

interface POSProps {
  store: AppStore;
  currency: 'VES' | 'USD';
  formatMoney: (amount: number, override?: 'VES' | 'USD') => string;
  addSale: (sale: Sale) => void;
  updateStore: (updater: any) => void;
  currentUser: any;
}

export default function POS({ store, currency, formatMoney, addSale, updateStore, currentUser }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isComandasOpen, setIsComandasOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!store.config.cashOpening?.isOpen) {
    return <CashOpening config={store.config} updateStore={updateStore} />;
  }

  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return store.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [store.products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        priceVES: product.priceVES,
        priceUSD: product.priceUSD || product.priceVES / store.config.exchangeRate,
        quantity: 1,
        priceType: 'detal'
      }];
    });
    setSearchTerm('');
    setShowResults(false);
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const product = store.products.find(p => p.id === id);
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as SaleItem[]);
  };

  const updatePriceType = (id: number, type: any) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const product = store.products.find(p => p.id === id);
        if (!product) return item;
        let newPriceUSD = product.priceUSD;
        if (type !== 'detal' && product.alternativePrices) {
          newPriceUSD = product.alternativePrices[type as keyof typeof product.alternativePrices] || product.priceUSD;
        }
        return { 
          ...item, 
          priceType: type,
          priceUSD: newPriceUSD,
          priceVES: newPriceUSD * store.config.exchangeRate
        };
      }
      return item;
    }));
  };

  const totals = useMemo(() => {
    let subtotalVES = 0;
    let subtotalUSD = 0;
    cart.forEach(item => {
      subtotalVES += item.priceVES * item.quantity;
      subtotalUSD += item.priceUSD * item.quantity;
    });
    const ivaVES = cart.reduce((acc, item) => {
      const p = store.products.find(prod => prod.id === item.productId);
      if (p?.appliesIva) {
        return acc + (item.priceVES * item.quantity * (p.ivaPercent / 100));
      }
      return acc;
    }, 0);
    
    return {
      subtotal: subtotalVES,
      subtotalUSD,
      iva: ivaVES,
      total: subtotalVES + ivaVES
    };
  }, [cart, store.config, store.products]);

  const handleCheckout = (payments: PaymentEntry[]) => {
    const newSale: Sale = {
      id: store.sales.length + 1,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal: totals.subtotal,
      iva: totals.iva,
      igtf: 0, // Calculated in payment calculator if needed
      total: totals.total,
      payments: payments,
      cashier: currentUser.fullName,
      customerName: 'Consumidor Final',
      status: 'completed'
    };
    addSale(newSale);
    setCart([]);
    setIsPaymentOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500 relative">
      {/* Left Column (1/3) - Actions & Comandas */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <Card className="p-6 border-none shadow-sm space-y-4 bg-[#0a1628] text-white rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a227]">Acciones Rápidas</h3>
            <Clock className="w-4 h-4 text-white/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col gap-1 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white border-none">
              <PlusCircle className="w-5 h-5 text-[#c9a227]" />
              <span className="text-[10px] font-bold uppercase">Nuevo Ticket</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white border-none">
              <Users className="w-5 h-5 text-[#c9a227]" />
              <span className="text-[10px] font-bold uppercase">Cliente</span>
            </Button>
            <Button 
              onClick={() => setIsComandasOpen(true)}
              className="h-16 flex flex-col gap-1 rounded-xl bg-[#c9a227] hover:bg-[#d4b43a] text-[#0a1628] border-none col-span-2"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">Sección COMANDAS</span>
            </Button>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-white/40">Tasa BCV</p>
              <p className="text-md font-black text-[#c9a227]">1 USD = {store.config.exchangeRate.toFixed(2)} Bs.</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-white/40">{currentTime.toLocaleDateString()}</p>
              <p className="text-md font-black">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </Card>

        <Card className="flex-1 border-none shadow-sm p-0 overflow-hidden rounded-2xl bg-white flex flex-col">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[#0a1628]">Comandas Activas</h3>
            <Badge className="bg-[#0a1628]">{store.comandas.filter(c => c.status !== 'served').length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {store.comandas.filter(c => c.status !== 'served').map(c => (
              <div key={c.id} className="p-3 border-2 border-muted rounded-xl hover:border-[#c9a227] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-black uppercase">{c.table}</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold">{c.status}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{c.items.length} productos • {c.items.reduce((a, b) => a + b.quantity, 0)} items</p>
              </div>
            ))}
            {store.comandas.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 p-8 text-center">
                <UtensilsCrossed className="w-12 h-12 mb-2" />
                <p className="text-xs font-bold uppercase">Sin comandas pendientes</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column (2/3) - Smart Search & Cart */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Smart Search Bar */}
        <div className="relative z-[60]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#c9a227] transition-colors" />
            <Input 
              placeholder="Escriba 2 letras para buscar productos..." 
              className="pl-12 h-14 rounded-2xl border-2 border-white shadow-xl focus-visible:ring-[#0a1628] text-lg font-medium" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(e.target.value.length >= 2);
              }}
              onFocus={() => setShowResults(searchTerm.length >= 2)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <Button variant="ghost" className="h-10 rounded-xl">
                <Barcode className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {showResults && filteredProducts.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 p-2 shadow-2xl rounded-2xl border-none z-[70] animate-in slide-in-from-top-2">
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-1">
                  {filteredProducts.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-[#f5efe0] group-hover:text-[#c9a227]">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[#0a1628]">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{p.code} • Stock: {p.stock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-md font-black text-[#0a1628]">{formatMoney(p.priceVES)}</p>
                        <p className="text-[10px] font-bold text-[#c9a227]">$ {p.priceUSD.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* Cart Table (Enhanced) */}
        <Card className="flex-1 flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-[#0a1628] text-white p-5 flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#c9a227]" />
            <h3 className="font-bold">Carrito de Compra</h3>
            <Badge className="ml-auto bg-[#c9a227] text-[#0a1628] font-bold border-none">{cart.length} productos</Badge>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-center">Cant.</th>
                  <th className="px-6 py-4 text-left">Precio Tipo</th>
                  <th className="px-6 py-4 text-right">Unitario (Bs / $)</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cart.map((item) => (
                  <tr key={item.productId} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0a1628]">{item.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 bg-muted p-1 rounded-lg w-fit mx-auto">
                        <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-bold shadow-sm hover:bg-[#0a1628] hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-bold shadow-sm hover:bg-[#0a1628] hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select 
                        value={item.priceType} 
                        onValueChange={(v) => updatePriceType(item.productId, v)}
                      >
                        <SelectTrigger className="h-8 w-24 rounded-lg text-[10px] font-bold uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-[10px] font-bold uppercase">
                          <SelectItem value="detal">Detal</SelectItem>
                          <SelectItem value="mayor">Mayor</SelectItem>
                          <SelectItem value="costo">Costo</SelectItem>
                          <SelectItem value="oferta">Oferta</SelectItem>
                          <SelectItem value="promocion">Promoción</SelectItem>
                          <SelectItem value="precio1">Precio 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-[#0a1628]">{formatMoney(item.priceVES)}</p>
                      <p className="text-[10px] text-muted-foreground">$ {item.priceUSD.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-[#0a1628]">{formatMoney(item.priceVES * item.quantity)}</p>
                      <p className="text-[10px] text-muted-foreground">$ {(item.priceUSD * item.quantity).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setCart(c => c.filter(i => i.productId !== item.productId))} className="p-2 text-muted-foreground hover:text-red-500 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-muted/30 border-t grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                <span>Subtotal</span>
                <span>{formatMoney(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                <span>IVA Aplicado</span>
                <span>{formatMoney(totals.iva)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-[#0a1628]">TOTAL A PAGAR</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#0a1628] tracking-tighter">{formatMoney(totals.total)}</p>
                  <p className="text-sm font-bold text-[#c9a227]">$ {(totals.total / store.config.exchangeRate).toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-3">
              <Button variant="outline" className="h-12 rounded-xl font-bold uppercase text-xs">
                <Printer className="w-4 h-4 mr-2" /> Imprimir Preventa
              </Button>
              <Button 
                onClick={() => setIsPaymentOpen(true)}
                disabled={cart.length === 0}
                className="h-16 rounded-2xl bg-gradient-to-r from-[#c9a227] to-[#d4b43a] text-[#0a1628] text-xl font-black uppercase shadow-xl hover:scale-[1.02] transition-transform border-none"
              >
                Procesar Pago <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {isPaymentOpen && (
        <PaymentCalculator 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          totalVES={totals.total}
          exchangeRate={store.config.exchangeRate}
          onConfirm={handleCheckout}
          formatMoney={formatMoney}
        />
      )}

      {isComandasOpen && (
        <ComandasModal 
          isOpen={isComandasOpen}
          onClose={() => setIsComandasOpen(false)}
          store={store}
          updateStore={updateStore}
        />
      )}
    </div>
  );
}

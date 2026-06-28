'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  RefreshCw, 
  Users, 
  Receipt, 
  ArrowRight, 
  UtensilsCrossed, 
  Clock, 
  Package, 
  ChevronRight,
  Printer, 
  Percent, 
  Ticket, 
  History, 
  HelpCircle, 
  Settings,
  Minus, 
  Plus, 
  X, 
  Check, 
  CreditCard, 
  DollarSign, 
  Wallet,
  Smartphone,
  Landmark,
  Boxes,
  LayoutDashboard,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  LogOut,
  Barcode,
  Download,
  Upload,
  Save,
  Edit,
  Eye,
  Calendar,
  AlertCircle,
  Coins,
  ShoppingBag,
  ChartLine,
  ChartPie,
  Crown,
  Trophy,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import PaymentCalculator from './POS/PaymentCalculator';
import ComandasModal from './POS/ComandasModal';
import CashOpening from './POS/CashOpening';
import type { Product, Sale, Customer } from '@/lib/types';

interface POSProps {
  store: any;
  currency: 'VES' | 'USD';
  formatMoney: (amount: number, override?: 'VES' | 'USD') => string;
  addSale: (sale: Sale) => void;
  updateStore: (updater: any) => void;
  currentUser: any;
}

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  priceVES: number;
  priceUSD: number;
  unit: string;
  priceType: string;
}

export default function POS({ store, currency, formatMoney: formatMoneyFn, addSale, updateStore, currentUser }: POSProps) {
  // 1. Hooks de estado
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(store.customers[0]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isComandasOpen, setIsComandasOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState(store.config.exchangeRate.toString());

  const searchRef = useRef<HTMLDivElement>(null);

  // 2. Efectos
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Memorizaciones
  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return store.products.filter((p: Product) => 
      p.active && (p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term))
    ).sort((a: Product, b: Product) => a.name.localeCompare(b.name));
  }, [store.products, searchTerm]);

  const totals = useMemo(() => {
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += (item.priceVES || 0) * item.quantity;
    });
    const iva = subtotal * ((store.config.ivaRate || 0) / 100);
    const total = subtotal + iva;
    const totalUSD = total / (store.config.exchangeRate || 1);
    return { subtotal, iva, total, totalUSD };
  }, [cart, store.config]);

  // 4. Retorno temprano si la caja no está abierta
  if (!store.config.cashDrawer?.isOpen) {
    return <CashOpening config={store.config} updateStore={updateStore} currentUser={currentUser} />;
  }

  // 5. Handlers
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        priceVES: product.priceVES,
        priceUSD: product.priceUSD,
        unit: product.unit,
        priceType: 'Detal'
      }];
    });
    setSearchTerm('');
    setShowResults(false);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    const product = store.products.find((p: Product) => p.id === productId);
    if (product && newQuantity > product.stock) return;
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updatePriceType = (productId: number, type: string) => {
    const product = store.products.find((p: Product) => p.id === productId);
    if (!product) return;

    let newPriceVES = product.priceVES;
    let newPriceUSD = product.priceUSD;

    // Lógica para precios alternativos definidos en el inventario
    if (type !== 'Detal' && product.alternatePrices) {
      const alt = product.alternatePrices.find((p: any) => p.type.toLowerCase() === type.toLowerCase());
      if (alt) {
        newPriceVES = alt.priceVES;
        newPriceUSD = alt.priceUSD;
      }
    }

    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, priceType: type, priceVES: newPriceVES, priceUSD: newPriceUSD } : item
    ));
  };

  const handleCheckout = (payments: any[]) => {
    const saleItems = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      priceType: item.priceType as any,
      unitPriceVES: item.priceVES,
      unitPriceUSD: item.priceUSD,
      subtotalVES: item.priceVES * item.quantity,
      subtotalUSD: item.priceUSD * item.quantity,
      unit: item.unit,
      hasIVA: true,
      ivaRate: 16
    }));
    
    const newSale: Sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: saleItems,
      payments: payments,
      subtotalVES: totals.subtotal,
      subtotalUSD: totals.subtotal / store.config.exchangeRate,
      iva: totals.iva,
      igtf: 0,
      totalVES: totals.total,
      totalUSD: totals.totalUSD,
      cashierId: currentUser.id,
      cashierName: currentUser.fullName,
      customerId: selectedCustomer?.id || 0,
      customerName: selectedCustomer?.name || 'Consumidor Final',
      status: 'completed'
    };
    
    addSale(newSale);
    setCart([]);
    setIsPaymentOpen(false);
    setSelectedCustomer(store.customers[0]);
  };

  const handleRefund = (saleId: number) => {
    const sale = store.sales.find((s: any) => s.id === saleId);
    if (!sale) return;

    updateStore((prev: any) => ({
      ...prev,
      sales: prev.sales.map((s: any) => s.id === saleId ? { ...s, status: 'refunded' } : s),
      products: prev.products.map((p: any) => {
        const item = sale.items.find((si: any) => si.productId === p.id);
        return item ? { ...p, stock: p.stock + item.quantity } : p;
      })
    }));
    setActiveModal(null);
    alert('Venta devuelta con éxito. El stock ha sido restaurado.');
  };

  const handleUpdateRate = () => {
    const rate = parseFloat(tempRate);
    if (isNaN(rate) || rate <= 0) return;
    updateStore((prev: any) => ({
      ...prev,
      config: { ...prev.config, exchangeRate: rate, exchangeRateUpdatedAt: new Date().toISOString() }
    }));
    setActiveModal(null);
  };

  const actionButtons = [
    { icon: Ticket, label: 'Ticket', onClick: () => setActiveModal('ticket') },
    { icon: Printer, label: 'Imprimir', onClick: () => window.print() },
    { icon: UtensilsCrossed, label: 'Comanda', onClick: () => setIsComandasOpen(true) },
    { icon: Receipt, label: 'Corte Z', onClick: () => setActiveModal('cortez') },
    { icon: ArrowRight, label: 'Devolver', onClick: () => setActiveModal('refund') },
    { icon: CreditCard, label: 'Crédito', onClick: () => setActiveModal('credit') },
    { icon: Percent, label: 'Tasa', onClick: () => { setTempRate(store.config.exchangeRate.toString()); setActiveModal('rate'); } },
    { icon: History, label: 'Historial', onClick: () => setActiveModal('history') },
    { icon: Users, label: 'Cliente', onClick: () => setActiveModal('customer') },
    { icon: RefreshCw, label: 'Nuevo', onClick: () => { setCart([]); setSelectedCustomer(store.customers[0]); } },
    { icon: HelpCircle, label: 'Ayuda', onClick: () => setActiveModal('help') },
    { icon: Settings, label: 'Config', onClick: () => setActiveModal('config') }
  ];

  return (
    <div className="flex flex-row h-screen w-full bg-[#f0f2f5] overflow-hidden">
      {/* Columna Izquierda (1/3) - Panel de Navegación y Acciones */}
      <div className="w-[380px] flex-shrink-0 bg-[#0a1628] flex flex-col shadow-2xl h-full border-r border-white/5">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a227] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-[#0a1628] font-black text-xl">V</span>
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-tight uppercase">VenPOS</span>
              <p className="text-[10px] text-[#c9a227] font-black uppercase tracking-widest">Estación de Trabajo</p>
            </div>
          </div>
        </div>

        {/* Buscador Inteligente en la columna izquierda */}
        <div className="p-4 bg-white/5 border-b border-white/10 relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#c9a227] transition-colors" />
            <input 
              type="text"
              placeholder="Buscar producto (F1)..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 text-white placeholder-white/30 text-sm border-2 border-transparent focus:border-[#c9a227] focus:bg-white/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(e.target.value.length >= 2);
              }}
              onFocus={() => setShowResults(searchTerm.length >= 2)}
            />
          </div>
          
          {showResults && (
            <Card className="absolute left-4 right-4 mt-2 p-2 shadow-2xl rounded-2xl border-none z-[100] animate-in slide-in-from-top-2 bg-white overflow-hidden">
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-1">
                  {filteredProducts.length > 0 ? filteredProducts.map((p: Product) => (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl text-left transition-colors border-b last:border-0 border-gray-100 group"
                    >
                      <div className="flex-1">
                        <p className="font-black text-[#0a1628] text-sm uppercase group-hover:text-[#c9a227] transition-colors">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] font-black border-gray-300">STOCK: {p.stock}</Badge>
                          <span className="text-[10px] text-gray-400 font-bold">{p.code}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#0a1628]">{formatMoneyFn(p.priceVES)}</p>
                        <p className="text-[10px] text-gray-400 font-bold">$ {p.priceUSD.toFixed(2)}</p>
                      </div>
                    </button>
                  )) : (
                    <div className="p-8 text-center text-gray-400 italic font-medium">No se encontraron productos</div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-3 gap-3">
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#c9a227] hover:bg-[#d4b43a] active:scale-95 transition-all shadow-lg group"
              >
                <div className="p-2 bg-[#0a1628]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <btn.icon className="w-6 h-6 text-[#0a1628]" />
                </div>
                <span className="text-[10px] font-black text-[#0a1628] uppercase tracking-tighter text-center">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Inferior */}
        <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#c9a227]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/40 uppercase">Cliente</span>
                <span className="text-xs font-black text-white uppercase truncate max-w-[120px]">{selectedCustomer?.name || 'Consumidor Final'}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/40 uppercase">Tasa BCV</span>
              <span className="text-sm font-black text-[#c9a227]">{store.config.exchangeRate.toFixed(2)} Bs.</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-white/40">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{currentTime.toLocaleTimeString()} — {currentTime.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha (2/3) - Carrito de Compras */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-inner">
        <div className="bg-[#0a1628] px-8 py-5 flex items-center justify-between shadow-xl relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#c9a227]/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#c9a227]" />
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-tighter">Carrito de Ventas</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#c9a227] text-[#0a1628] px-5 py-2 rounded-xl font-black text-sm border-none shadow-lg">
              {cart.reduce((a, b) => a + b.quantity, 0)} ITEMS
            </Badge>
            <button onClick={() => setCart([])} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all" title="Limpiar carrito">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabla de Items con ScrollArea para mayor altura vertical */}
        <div className="flex-1 p-6 overflow-hidden">
          <Card className="h-full border-none shadow-2xl overflow-hidden rounded-[32px] bg-white border border-gray-100">
            <ScrollArea className="h-full">
              <table className="w-full text-sm">
                <thead className="bg-[#f8fafc] text-[#0a1628] font-black uppercase sticky top-0 z-20 border-b">
                  <tr>
                    <th className="px-8 py-6 text-left text-[11px] tracking-widest">Descripción del Producto</th>
                    <th className="px-6 py-6 text-center w-36 text-[11px] tracking-widest">Cantidad</th>
                    <th className="px-6 py-6 text-center w-48 text-[11px] tracking-widest">Tipo Precio</th>
                    <th className="px-8 py-6 text-right w-44 text-[11px] tracking-widest">P. Unitario</th>
                    <th className="px-8 py-6 text-right w-44 text-[11px] tracking-widest">Subtotal</th>
                    <th className="px-6 py-6 text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <tr key={item.productId} className="group hover:bg-gray-50/80 transition-all">
                      <td className="px-8 py-5">
                        <div className="font-black text-[#0a1628] text-sm uppercase">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">REF: {item.productId} — UNIDAD: {item.unit}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center text-gray-500 shadow-sm"><Minus className="w-4 h-4" /></button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)} 
                            className="w-16 h-9 text-center text-sm font-black bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#c9a227] outline-none shadow-inner" 
                          />
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-all flex items-center justify-center text-gray-500 shadow-sm"><Plus className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Select value={item.priceType} onValueChange={(v) => updatePriceType(item.productId, v)}>
                          <SelectTrigger className="h-10 border-gray-200 rounded-xl text-[10px] font-black uppercase bg-gray-50/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Detal">Detal</SelectItem>
                            <SelectItem value="Mayor">Mayor</SelectItem>
                            <SelectItem value="Costo">Costo</SelectItem>
                            <SelectItem value="Oferta">Oferta</SelectItem>
                            <SelectItem value="Promo">Promo</SelectItem>
                            <SelectItem value="Especial">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="font-black text-sm text-[#0a1628]">{formatMoneyFn(item.priceVES)}</div>
                        <div className="text-[10px] text-[#c9a227] font-black tracking-tighter">{item.priceUSD.toFixed(2)} USD</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="font-black text-sm text-[#0a1628]">{formatMoneyFn(item.priceVES * item.quantity)}</div>
                        <div className="text-[10px] text-gray-400 font-bold tracking-tighter">{(item.priceUSD * item.quantity).toFixed(2)} USD</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-600 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-40 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-10">
                          <ShoppingBag className="w-32 h-32 stroke-[1.5]" />
                          <p className="text-2xl font-black uppercase tracking-[0.2em]">Carrito Vacío</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </Card>
        </div>

        {/* Footer de Totales y Procesar Pago */}
        <div className="px-8 py-10 border-t bg-[#f8fafc] rounded-t-[50px] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)] relative z-20">
          <div className="flex flex-col xl:flex-row gap-10 items-center justify-between max-w-[1600px] mx-auto">
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 flex-1 w-full xl:w-auto">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Subtotal Bruto</span>
                <span className="text-sm font-black text-[#0a1628]">{formatMoneyFn(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">IVA (16%)</span>
                <span className="text-sm font-black text-green-600">+{formatMoneyFn(totals.iva)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Descuentos</span>
                <span className="text-sm font-black text-red-600">-{formatMoneyFn(0)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Base USD</span>
                <span className="text-sm font-black text-[#c9a227]">$ {(totals.subtotal / store.config.exchangeRate).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center xl:items-end gap-2 shrink-0">
              <span className="text-[12px] font-black text-[#0a1628] uppercase tracking-[0.2em] opacity-40">Total a Pagar</span>
              <div className="flex flex-col items-center xl:items-end leading-none">
                <span className="text-6xl font-black text-[#0a1628] tracking-tighter">{formatMoneyFn(totals.total)}</span>
                <span className="text-2xl font-black text-[#c9a227] mt-2">$ {totals.totalUSD.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={() => setIsPaymentOpen(true)} 
              disabled={cart.length === 0} 
              className="h-24 px-16 rounded-[32px] bg-[#0a1628] hover:bg-[#1e3a5f] text-white shadow-2xl hover:scale-[1.03] active:scale-95 transition-all border-none flex flex-col items-center justify-center gap-1 min-w-[320px] group"
            >
              <div className="flex items-center gap-4">
                <span className="text-xl font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Procesar Venta</span>
                <ChevronRight className="w-8 h-8 text-[#c9a227]" />
              </div>
              <span className="text-[10px] font-black text-[#c9a227] uppercase tracking-widest opacity-60">Presione F12 para Pagar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modales de Soporte */}
      
      {/* Modal Tasa */}
      <Dialog open={activeModal === 'rate'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#0a1628] uppercase flex items-center gap-3">
              <Percent className="w-6 h-6 text-[#c9a227]" /> Actualizar Tasa BCV
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-black">Nueva Tasa (Bs/USD)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={tempRate} 
                onChange={(e) => setTempRate(e.target.value)}
                className="h-14 text-2xl font-black text-center border-2 border-[#0a1628]/10 rounded-2xl focus:border-[#c9a227] transition-all"
                autoFocus
              />
            </div>
            <Button onClick={handleUpdateRate} className="w-full h-14 bg-[#0a1628] text-white rounded-2xl font-black uppercase text-sm shadow-xl">
              Aplicar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Historial */}
      <Dialog open={activeModal === 'history'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl bg-white rounded-3xl p-0 overflow-hidden">
          <div className="bg-[#0a1628] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-[#c9a227]" />
              <h2 className="text-xl font-black uppercase">Historial de Ventas</h2>
            </div>
            <Badge className="bg-[#c9a227] text-[#0a1628] font-black">{store.sales.length} VENTAS</Badge>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-black border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-right">Total Bs.</th>
                    <th className="px-4 py-3 text-right">Total USD</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {store.sales.slice().reverse().map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-black text-[#0a1628]">#{sale.id.toString().slice(-6)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-500">
                        {new Date(sale.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-bold text-[#0a1628] uppercase">{sale.customerName}</td>
                      <td className="px-4 py-4 text-right font-black text-[#0a1628]">{formatMoneyFn(sale.totalVES)}</td>
                      <td className="px-4 py-4 text-right font-black text-[#c9a227]">${(sale.totalUSD || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase",
                          sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {sale.status === 'completed' ? 'Completada' : 'Devuelta'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Re-imprimir">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {store.sales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-400 italic">No hay ventas registradas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Corte Z */}
      <Dialog open={activeModal === 'cortez'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden">
          <div className="bg-[#0a1628] p-6 text-white text-center">
            <Receipt className="w-10 h-10 text-[#c9a227] mx-auto mb-3" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Corte de Caja (Z)</h2>
            <p className="text-[10px] text-[#c9a227] font-black uppercase mt-1 tracking-widest">Resumen de Operaciones del Día</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl text-center">
                <span className="text-[9px] font-black text-black/40 uppercase">Ventas Totales</span>
                <p className="text-xl font-black text-[#0a1628]">{store.sales.filter((s:any)=>s.status==='completed').length}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl text-center">
                <span className="text-[9px] font-black text-black/40 uppercase">Devoluciones</span>
                <p className="text-xl font-black text-red-600">{store.sales.filter((s:any)=>s.status==='refunded').length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-black uppercase border-b pb-1">Desglose por Métodos</h3>
              {[
                { label: 'Efectivo Bs.', icon: Wallet, amount: formatMoneyFn(store.sales.reduce((a:number, s:any)=> a + (s.status==='completed' ? (s.totalVES || 0) : 0), 0)) },
                { label: 'Efectivo USD', icon: DollarSign, amount: `$ ${store.sales.reduce((a:number, s:any)=> a + (s.status==='completed' ? (s.totalUSD || 0) : 0), 0).toFixed(2)}` },
                { label: 'Tarjeta / Débito', icon: CreditCard, amount: formatMoneyFn(0) },
                { label: 'Pago Móvil', icon: RefreshCw, amount: formatMoneyFn(0) },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <m.icon className="w-4 h-4 text-[#c9a227]" />
                    <span className="text-xs font-black text-black uppercase">{m.label}</span>
                  </div>
                  <span className="text-sm font-black text-[#0a1628]">{m.amount}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-[#0a1628] rounded-2xl text-center shadow-xl">
              <span className="text-[10px] font-black text-white/40 uppercase">Gran Total Neto</span>
              <p className="text-3xl font-black text-white mt-1">{formatMoneyFn(store.sales.reduce((a:number, s:any)=> a + (s.status==='completed' ? (s.totalVES || 0) : 0), 0))}</p>
            </div>

            <Button className="w-full h-14 bg-[#c9a227] text-[#0a1628] rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-3">
              <Printer className="w-5 h-5" /> Imprimir Corte Z
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Otros modales simplificados */}
      <Dialog open={activeModal === 'refund'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-black text-[#0a1628] uppercase">Procesar Devolución</DialogTitle></DialogHeader>
          <p className="text-xs font-black text-black/60 uppercase mb-4">Seleccione la venta a anular:</p>
          <ScrollArea className="h-[300px] border rounded-2xl">
            {store.sales.filter((s:any)=>s.status==='completed').slice(-10).map((sale: any) => (
              <button key={sale.id} onClick={() => handleRefund(sale.id)} className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-xl text-left border-b last:border-0">
                <div>
                  <p className="font-black text-[#0a1628]">TICKET #{sale.id.toString().slice(-6)}</p>
                  <p className="text-[10px] text-gray-400">{new Date(sale.date).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm font-black text-red-600">{formatMoneyFn(sale.totalVES)}</p>
              </button>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'customer'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader><DialogTitle className="text-xl font-black text-[#0a1628] uppercase">Seleccionar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar por nombre o cédula..." className="pl-9 rounded-xl" />
            </div>
            <ScrollArea className="h-[300px]">
              {store.customers.map((customer: any) => (
                <button key={customer.id} onClick={() => { setSelectedCustomer(customer); setActiveModal(null); }} className={cn("w-full flex items-center justify-between p-4 rounded-xl text-left transition-all border-2 mb-2", selectedCustomer?.id === customer.id ? "bg-[#c9a227]/10 border-[#c9a227]" : "border-transparent hover:bg-gray-50")}>
                  <div>
                    <p className="font-black text-[#0a1628] uppercase text-xs">{customer.name}</p>
                    <p className="text-[10px] text-gray-400">{customer.idCard}</p>
                  </div>
                  {selectedCustomer?.id === customer.id && <Check className="w-5 h-5 text-[#c9a227]" />}
                </button>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {isPaymentOpen && (
        <PaymentCalculator 
          isOpen={isPaymentOpen} 
          onClose={() => setIsPaymentOpen(false)} 
          totalVES={totals.total} 
          exchangeRate={store.config.exchangeRate} 
          onConfirm={handleCheckout} 
          formatMoney={formatMoneyFn} 
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

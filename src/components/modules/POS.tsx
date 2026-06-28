
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

  if (!store.config.cashDrawer?.isOpen) {
    return <CashOpening config={store.config} updateStore={updateStore} currentUser={currentUser} />;
  }

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
    { icon: Ticket, label: 'TICKET', onClick: () => setActiveModal('ticket') },
    { icon: Printer, label: 'IMPRIMIR', onClick: () => window.print() },
    { icon: UtensilsCrossed, label: 'COMANDA', onClick: () => setIsComandasOpen(true) },
    { icon: Receipt, label: 'CORTE Z', onClick: () => setActiveModal('cortez') },
    { icon: ArrowRight, label: 'DEVOLVER', onClick: () => setActiveModal('refund') },
    { icon: CreditCard, label: 'CRÉDITO', onClick: () => setActiveModal('credit') },
    { icon: Percent, label: 'TASA', onClick: () => { setTempRate(store.config.exchangeRate.toString()); setActiveModal('rate'); } },
    { icon: History, label: 'HISTORIAL', onClick: () => setActiveModal('history') },
    { icon: Users, label: 'CLIENTE', onClick: () => setActiveModal('customer') },
    { icon: RefreshCw, label: 'NUEVO', onClick: () => { setCart([]); setSelectedCustomer(store.customers[0]); } },
    { icon: HelpCircle, label: 'AYUDA', onClick: () => setActiveModal('help') },
    { icon: Settings, label: 'CONFIG', onClick: () => setActiveModal('config') }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden">
      {/* Columna Izquierda (1/3) - Panel de Control */}
      <div className="w-[340px] flex-shrink-0 bg-[#0a1628] flex flex-col h-full border-r border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-[#0a1628] font-black text-xl">
              P
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none">VenPOS</h1>
              <p className="text-white/40 text-[10px] uppercase font-bold mt-1">Sistema Corporativo</p>
            </div>
          </div>

          <div className="mt-8 relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input 
              placeholder="Buscar producto..." 
              className="bg-[#1e293b] border-none text-white placeholder:text-white/30 pl-9 rounded-xl h-11 focus-visible:ring-[#c9a227]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(e.target.value.length >= 2);
              }}
              onFocus={() => setShowResults(searchTerm.length >= 2)}
            />
            {showResults && (
              <Card className="absolute top-full left-0 right-0 mt-2 p-2 shadow-2xl rounded-xl border-none z-[100] bg-white overflow-hidden">
                <ScrollArea className="max-h-[300px]">
                  {filteredProducts.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left transition-colors border-b last:border-0 border-gray-100"
                    >
                      <div>
                        <p className="font-bold text-[#0a1628] text-xs uppercase">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">STOCK: {p.stock}</p>
                      </div>
                      <p className="text-xs font-black text-[#0a1628]">{formatMoneyFn(p.priceVES)}</p>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && <div className="p-4 text-center text-gray-400 text-xs italic">No se encontraron productos</div>}
                </ScrollArea>
              </Card>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl bg-[#c9a227] hover:bg-[#d4b43a] transition-all"
              >
                <btn.icon className="w-5 h-5 text-[#0a1628]" />
                <span className="text-[9px] font-black text-[#0a1628] uppercase tracking-tighter">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Tasa BCV</p>
          <p className="text-[#c9a227] font-black text-lg">1 USD = {store.config.exchangeRate.toFixed(2)} Bs.</p>
        </div>
      </div>

      {/* Columna Derecha (2/3) - Carrito */}
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#c9a227]" />
            <h2 className="text-white font-black uppercase text-sm tracking-widest">Carrito de Compras</h2>
          </div>
          <Badge className="bg-[#c9a227] text-[#0a1628] rounded-full px-4 py-1 font-black text-[11px] border-none">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </Badge>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-[#f1f5f9] border-b">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Cantidad</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Precio</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Subtotal</th>
              </tr>
            </thead>
          </table>
          <ScrollArea className="flex-1">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#0a1628] text-sm uppercase">{item.name}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-red-500 font-bold uppercase hover:underline mt-1">Eliminar</button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold text-sm w-8">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded"><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-sm text-[#0a1628]">{formatMoneyFn(item.priceVES)}</p>
                      <p className="text-[10px] text-gray-400 font-bold">$ {item.priceUSD.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-sm text-[#0a1628]">{formatMoneyFn(item.priceVES * item.quantity)}</p>
                      <p className="text-[10px] text-gray-400 font-bold">$ {(item.priceUSD * item.quantity).toFixed(2)}</p>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-32 text-center opacity-30">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-xl font-bold text-gray-500">No hay productos en el carrito</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        <div className="border-t bg-white p-8">
          <div className="max-w-md ml-auto space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Subtotal</span>
              <span className="text-sm font-black text-[#0a1628]">{formatMoneyFn(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">IVA 16%</span>
              <span className="text-sm font-black text-green-600">{formatMoneyFn(totals.iva)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-black text-[#0a1628] uppercase tracking-tighter">Total a Pagar</span>
              <div className="text-right">
                <span className="text-3xl font-black text-[#0a1628] leading-none">{formatMoneyFn(totals.total)}</span>
                <p className="text-xs font-bold text-gray-400 mt-1">$ {totals.totalUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full h-16 bg-[#e0c080] hover:bg-[#d4b43a] text-[#0a1628] font-black text-xl rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all border-none"
          >
            Procesar Venta <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Modales */}
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

      {/* Modal Tasa */}
      <Dialog open={activeModal === 'rate'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-black font-black uppercase text-center">Actualizar Tasa BCV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="number" step="0.01" value={tempRate} onChange={(e) => setTempRate(e.target.value)} className="h-12 text-lg font-bold text-center" autoFocus />
            <Button onClick={handleUpdateRate} className="w-full h-12 bg-[#0a1628] text-white font-black uppercase rounded-xl">Aplicar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Historial */}
      <Dialog open={activeModal === 'history'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl bg-white rounded-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Historial de Ventas</DialogTitle>
          <div className="bg-[#0a1628] p-4 text-white flex items-center justify-between">
            <h2 className="font-black uppercase text-sm">Historial de Ventas</h2>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setActiveModal(null)} />
          </div>
          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-black uppercase text-[10px]">Ticket</th>
                  <th className="px-4 py-3 text-left font-black uppercase text-[10px]">Fecha</th>
                  <th className="px-4 py-3 text-left font-black uppercase text-[10px]">Cliente</th>
                  <th className="px-4 py-3 text-right font-black uppercase text-[10px]">Total Bs.</th>
                  <th className="px-4 py-3 text-center font-black uppercase text-[10px]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {store.sales.slice().reverse().map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">#{sale.id.toString().slice(-6)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(sale.date).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold uppercase">{sale.customerName}</td>
                    <td className="px-4 py-3 text-right font-black">{formatMoneyFn(sale.totalVES)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("text-[9px] font-black uppercase", sale.status === 'completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {sale.status === 'completed' ? 'Completada' : 'Devuelta'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Corte Z */}
      <Dialog open={activeModal === 'cortez'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Corte de Caja (Z)</DialogTitle>
          <div className="bg-[#0a1628] p-6 text-white text-center">
            <Receipt className="w-10 h-10 text-[#c9a227] mx-auto mb-2" />
            <h2 className="text-xl font-black uppercase tracking-tight">Corte de Caja (Z)</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ventas Totales</p>
                <p className="text-xl font-black text-[#0a1628]">{store.sales.filter((s:any)=>s.status==='completed').length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Neto</p>
                <p className="text-xl font-black text-[#0a1628]">{formatMoneyFn(store.sales.reduce((a:number, s:any)=> a + (s.status==='completed' ? (s.totalVES || 0) : 0), 0))}</p>
              </div>
            </div>
            <Button className="w-full h-12 bg-[#c9a227] text-[#0a1628] font-black uppercase rounded-xl">Imprimir Reporte</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

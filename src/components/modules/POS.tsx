'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Trash2, RefreshCw, Users, Receipt, 
  ArrowRight, UtensilsCrossed, Clock, Package, ChevronRight,
  Printer, CreditCard, Percent, Ticket, Landmark, QrCode,
  DollarSign, Wallet, Minus, Plus, X, Check, History,
  HelpCircle, Settings, LogOut, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PaymentCalculator from './POS/PaymentCalculator';
import ComandasModal from './POS/ComandasModal';
import CashOpening from './POS/CashOpening';
import type { Product, Sale, Config } from '@/lib/types';

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
}

export default function POS({ store, currency, formatMoney: formatMoneyFn, addSale, updateStore, currentUser }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isComandasOpen, setIsComandasOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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
      subtotal += item.priceVES * item.quantity;
    });
    const iva = subtotal * (store.config.ivaRate / 100);
    const total = subtotal + iva;
    const totalUSD = total / store.config.exchangeRate;
    return { subtotal, iva, total, totalUSD };
  }, [cart, store.config]);

  if (!store.config.cashOpening?.isOpen) {
    return <CashOpening config={store.config} updateStore={updateStore} currentUser={currentUser} />;
  }

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
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
        unit: product.unit
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

  const handleCheckout = (payments: Array<{ type: string; amountVES: number; amountUSD: number }>) => {
    const saleItems = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      priceVES: item.priceVES,
      priceUSD: item.priceUSD
    }));
    
    const newSale: Sale = {
      id: store.sales.length + 1,
      date: new Date().toISOString(),
      items: saleItems,
      subtotal: totals.subtotal,
      iva: totals.iva,
      igtf: 0,
      total: totals.total,
      cashier: currentUser.fullName,
      customerName: 'Consumidor Final'
    };
    
    addSale(newSale);
    setCart([]);
    setIsPaymentOpen(false);
  };

  const actionButtons = [
    { icon: Ticket, label: 'Ticket', onClick: () => {} },
    { icon: Printer, label: 'Imprimir', onClick: () => {} },
    { icon: UtensilsCrossed, label: 'Comanda', onClick: () => setIsComandasOpen(true) },
    { icon: Receipt, label: 'Corte Z', onClick: () => {} },
    { icon: ArrowRight, label: 'Devolver', onClick: () => {} },
    { icon: CreditCard, label: 'Crédito', onClick: () => {} },
    { icon: Percent, label: 'Tasa', onClick: () => {} },
    { icon: History, label: 'Historial', onClick: () => {} },
    { icon: Users, label: 'Cliente', onClick: () => {} },
    { icon: RefreshCw, label: 'Nuevo', onClick: () => setCart([]) },
    { icon: HelpCircle, label: 'Ayuda', onClick: () => {} },
    { icon: Settings, label: 'Config', onClick: () => {} }
  ];

  return (
    <div className="flex flex-row h-full w-full bg-[#f0f2f5]">
      <div className="w-80 flex-shrink-0 bg-[#0a1628] flex flex-col shadow-xl h-full overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a227] rounded-lg flex items-center justify-center">
              <span className="text-[#0a1628] font-black text-sm">P</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm">VenPOS</span>
              <p className="text-[9px] text-white/40">Sistema Corporativo</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-white/10" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Buscar producto..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 text-sm border-none focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(e.target.value.length >= 2);
              }}
              onFocus={() => setShowResults(searchTerm.length >= 2)}
            />
          </div>
          
          {showResults && filteredProducts.length > 0 && (
            <div className="absolute left-3 right-3 mt-1 bg-white rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
              {filteredProducts.map((p: Product) => (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                >
                  <div>
                    <p className="font-medium text-[#0a1628] text-sm">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">Stock: {p.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{formatMoneyFn(p.priceVES)}</p>
                    <p className="text-[8px] text-muted-foreground">${p.priceUSD.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 p-3">
          <div className="grid grid-cols-3 gap-2">
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl bg-[#c9a227] hover:bg-[#d4b43a] transition-all shadow-md"
                title={btn.label}
              >
                <btn.icon className="w-5 h-5 text-[#0a1628]" />
                <span className="text-[8px] font-bold text-[#0a1628] uppercase">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="text-center space-y-1">
            <p className="text-[8px] font-black uppercase text-white/40">TASA BCV</p>
            <p className="text-sm font-black text-[#c9a227]">1 USD = {store.config.exchangeRate.toFixed(2)} Bs.</p>
            <p className="text-[10px] text-white/50">{currentTime.toLocaleTimeString()}</p>
            <p className="text-[8px] text-white/30">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="bg-[#0a1628] px-5 py-3 flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-[#c9a227]" />
          <h2 className="text-white font-bold text-base uppercase tracking-wide">Carrito de Compras</h2>
          <Badge className="ml-auto bg-[#c9a227] text-[#0a1628] font-bold border-none">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </Badge>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase sticky top-0 text-[10px]">
              <tr><th className="p-2 text-left">Producto</th><th className="p-2 text-center w-24">Cantidad</th><th className="p-2 text-right w-36">Precio</th><th className="p-2 text-right w-36">Subtotal</th><th className="p-2 text-center w-8"></th></tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2"><div className="font-medium text-[#0a1628] text-sm">{item.name}</div><div className="text-[9px] text-muted-foreground">{item.unit}</div></td>
                  <td className="p-2 text-center"><div className="flex items-center justify-center gap-1"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200"><Minus className="w-3 h-3" /></button><input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)} className="w-14 h-7 text-center text-xs p-1 border rounded" min="1" /><button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200"><Plus className="w-3 h-3" /></button></div></td>
                  <td className="p-2 text-right"><div className="font-bold text-sm">{formatMoneyFn(item.priceVES)}</div><div className="text-[9px] text-muted-foreground">${item.priceUSD.toFixed(2)}</div></td>
                  <td className="p-2 text-right"><div className="font-bold text-[#0a1628] text-sm">{formatMoneyFn(item.priceVES * item.quantity)}</div><div className="text-[9px] text-muted-foreground">${(item.priceUSD * item.quantity).toFixed(2)}</div></td>
                  <td className="p-2 text-center"><button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {cart.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />No hay productos en el carrito</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-white flex-shrink-0 p-4">
          <div className="flex justify-end"><div className="w-96 space-y-1 text-right"><div className="flex justify-between text-xs py-1"><span className="text-gray-500">Subtotal</span><span className="font-mono font-bold">{formatMoneyFn(totals.subtotal)}</span></div><div className="flex justify-between text-xs py-1"><span className="text-gray-500">IVA {store.config.ivaRate}%</span><span className="font-mono text-green-600">{formatMoneyFn(totals.iva)}</span></div><div className="flex justify-between text-base font-black pt-2 border-t border-gray-200 mt-1"><span>TOTAL A PAGAR</span><span className="font-mono text-xl">{formatMoneyFn(totals.total)}</span></div><div className="text-[10px] text-gray-400 text-right">$ {totals.totalUSD.toFixed(2)}</div></div></div>
          <div className="mt-4"><Button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0} className="w-full h-12 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#d4b43a] text-[#0a1628] font-bold text-base uppercase tracking-wide">Procesar Venta <ChevronRight className="w-5 h-5 ml-2" /></Button></div>
        </div>
      </div>

      {isPaymentOpen && <PaymentCalculator isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} totalVES={totals.total} exchangeRate={store.config.exchangeRate} onConfirm={handleCheckout} formatMoney={formatMoneyFn} />}
      {isComandasOpen && <ComandasModal isOpen={isComandasOpen} onClose={() => setIsComandasOpen(false)} store={store} updateStore={updateStore} />}
    </div>
  );
}

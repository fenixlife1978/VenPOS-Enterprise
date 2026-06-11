import React, { useState, useMemo } from 'react';
import { Search, Barcode, ShoppingBasket, Trash2, CheckCircle, Info, RefreshCcw } from 'lucide-react';
import type { AppStore, Product, SaleItem, Sale } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface POSProps {
  store: AppStore;
  currency: 'VES' | 'USD';
  formatMoney: (amount: number, override?: 'VES' | 'USD') => string;
  addSale: (sale: Sale) => void;
  currentUser: any;
}

export default function POS({ store, currency, formatMoney, addSale, currentUser }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
      return p.active && matchesSearch && matchesCategory;
    });
  }, [store.products, searchTerm, activeCategory]);

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
        quantity: 1
      }];
    });
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

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const totals = useMemo(() => {
    let subtotalVES = 0;
    let subtotalUSD = 0;
    cart.forEach(item => {
      subtotalVES += item.priceVES * item.quantity;
      subtotalUSD += item.priceUSD * item.quantity;
    });
    const ivaVES = subtotalVES * (store.config.ivaRate / 100);
    const igtfVES = paymentMethod === 'usd' ? subtotalUSD * (store.config.igtfRate / 100) * store.config.exchangeRate : 0;
    const totalVES = subtotalVES + ivaVES + igtfVES;
    
    return {
      subtotal: currency === 'USD' ? subtotalUSD : subtotalVES,
      iva: currency === 'USD' ? ivaVES / store.config.exchangeRate : ivaVES,
      igtf: currency === 'USD' ? igtfVES / store.config.exchangeRate : igtfVES,
      total: currency === 'USD' ? totalVES / store.config.exchangeRate : totalVES,
      rawVES: { subtotal: subtotalVES, iva: ivaVES, igtf: igtfVES, total: totalVES }
    };
  }, [cart, paymentMethod, currency, store.config]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: store.sales.length + 1,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal: totals.rawVES.subtotal,
      iva: totals.rawVES.iva,
      igtf: totals.rawVES.igtf,
      total: totals.rawVES.total,
      method: paymentMethod,
      cashier: currentUser.fullName,
      customerName: 'Consumidor Final'
    };
    addSale(newSale);
    setCart([]);
    alert('Venta procesada con éxito');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] animate-in fade-in duration-500">
      {/* Products Side */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Exchange Banner */}
        <div className="bg-[#f5efe0] border-b border-[#c9a227]/30 px-6 py-3 flex items-center gap-3 text-xs font-bold text-[#0a1628]">
          <RefreshCcw className="w-4 h-4 text-[#c9a227]" />
          Tasa oficial: <span className="text-[#c9a227]">1 USD = {store.config.exchangeRate.toFixed(2)} Bs.</span>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o código..." 
              className="pl-10 h-11 border-border focus-visible:ring-[#0a1628]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 px-4">
            <Barcode className="w-5 h-5" />
          </Button>
        </div>

        {/* Categories */}
        <div className="bg-muted/30 px-4 py-2 border-b flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveCategory('all')}
            className={cn(
              "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
              activeCategory === 'all' 
                ? "bg-[#0a1628] border-[#0a1628] text-white" 
                : "bg-white border-border text-muted-foreground hover:border-[#c9a227]"
            )}
          >
            Todos
          </button>
          {store.categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                activeCategory === cat.id 
                  ? "bg-[#0a1628] border-[#0a1628] text-white" 
                  : "bg-white border-border text-muted-foreground hover:border-[#c9a227]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => {
            const price = currency === 'USD' ? (p.priceUSD || p.priceVES / store.config.exchangeRate) : p.priceVES;
            return (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="group p-5 bg-white border-2 border-border rounded-2xl text-center hover:border-[#c9a227] hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-3 flex items-center justify-center text-muted-foreground group-hover:bg-[#f5efe0] group-hover:text-[#c9a227] transition-colors">
                  <Boxes className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold truncate text-[#1a1a2e]">{p.name}</h4>
                <p className="text-lg font-black text-[#0a1628] mt-1 tracking-tight">{formatMoney(price)}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Disp: {p.stock} {p.unit}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart Side */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-[#0a1628] text-white p-5 flex items-center gap-3">
          <ShoppingBasket className="w-5 h-5 text-[#c9a227]" />
          <h3 className="font-bold">Carrito de Compra</h3>
          <Badge className="ml-auto bg-[#c9a227] text-[#0a1628] font-bold border-none">{cart.length}</Badge>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length > 0 ? cart.map((item, idx) => {
            const price = currency === 'USD' ? item.priceUSD : item.priceVES;
            return (
              <div key={idx} className="p-4 border-b flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-[#1a1a2e]">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{formatMoney(price)} c/u</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                  <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-bold text-[#0a1628] shadow-sm hover:bg-[#0a1628] hover:text-white transition-colors">-</button>
                  <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                  <button onClick={() => addToCart(store.products.find(p => p.id === item.productId)!)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center font-bold text-[#0a1628] shadow-sm hover:bg-[#0a1628] hover:text-white transition-colors">+</button>
                </div>
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-black text-[#0a1628]">{formatMoney(price * item.quantity)}</p>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
              <ShoppingBasket className="w-16 h-16 mb-4" />
              <h3 className="text-sm font-bold">Carrito Vacío</h3>
              <p className="text-xs">Seleccione productos para comenzar</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>IVA ({store.config.ivaRate}%)</span>
              <span>{formatMoney(totals.iva)}</span>
            </div>
            {paymentMethod === 'usd' && (
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>IGTF ({store.config.igtfRate}%)</span>
                <span>{formatMoney(totals.igtf)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black uppercase text-[#0a1628] tracking-wider">TOTAL A PAGAR</span>
              <span className="text-2xl font-black text-[#0a1628] tracking-tighter">{formatMoney(totals.total)}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-3 block">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'usd', 'transfer', 'mobile', 'biopago', 'card'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setPaymentMethod(m)}
                  className={cn(
                    "px-1 py-2 text-[10px] font-bold rounded-lg border-2 uppercase transition-all",
                    paymentMethod === m ? "bg-[#0a1628] border-[#0a1628] text-white" : "bg-white border-border text-muted-foreground hover:border-[#c9a227]"
                  )}
                >
                  {m === 'cash' ? 'Bs. Efec.' : m === 'usd' ? 'Divisas' : m === 'transfer' ? 'Transf.' : m === 'mobile' ? 'P. Móvil' : m === 'biopago' ? 'Biopago' : 'Tarjeta'}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCheckout}
            className="w-full h-14 bg-gradient-to-r from-[#c9a227] to-[#d4b43a] hover:brightness-110 text-[#0a1628] text-lg font-black uppercase tracking-tight shadow-lg shadow-[#c9a227]/20 border-none"
            disabled={cart.length === 0}
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Procesar Venta
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

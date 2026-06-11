"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  CheckCircle, 
  Trash2, 
  Plus, 
  ArrowRight,
  Calculator,
  DollarSign,
  Smartphone,
  CreditCard,
  Landmark,
  Building2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PaymentEntry } from '@/lib/types';

interface PaymentCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  totalVES: number;
  exchangeRate: number;
  onConfirm: (payments: PaymentEntry[]) => void;
  formatMoney: (amount: number) => string;
}

export default function PaymentCalculator({ isOpen, onClose, totalVES, exchangeRate, onConfirm, formatMoney }: PaymentCalculatorProps) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [activeMethod, setActiveMethod] = useState<any>('cash_ves');

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = totalVES - totalPaid;

  const methods = [
    { id: 'cash_ves', label: 'Efectivo Bs.', icon: DollarSign, color: 'bg-green-500' },
    { id: 'cash_usd', label: 'Efectivo USD', icon: DollarSign, color: 'bg-[#c9a227]' },
    { id: 'card', label: 'Tarjeta', icon: CreditCard, color: 'bg-blue-600' },
    { id: 'biopago', label: 'Biopago', icon: Landmark, color: 'bg-purple-600' },
    { id: 'zelle', label: 'Zelle USD', icon: Building2, color: 'bg-indigo-600' },
    { id: 'pagomovil', label: 'Pagomovil', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'credit', label: 'Crédito', icon: Wallet, color: 'bg-gray-600' }
  ];

  const addPayment = useCallback(() => {
    const amount = parseFloat(currentAmount);
    if (!amount || amount <= 0) return;

    let vesAmount = amount;
    let usdAmount = 0;

    if (activeMethod === 'cash_usd' || activeMethod === 'zelle') {
      usdAmount = amount;
      vesAmount = amount * exchangeRate;
    }

    setPayments([...payments, { method: activeMethod, amount: vesAmount, amountUSD: usdAmount }]);
    setCurrentAmount('');
  }, [currentAmount, activeMethod, payments, exchangeRate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentAmount) {
        addPayment();
      } else if (totalPaid >= totalVES) {
        onConfirm(payments);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <Card className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-300">
        <div className="flex flex-col md:flex-row h-full">
          {/* Methods & Input (Left) */}
          <div className="flex-1 p-8 space-y-8 bg-muted/20">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-[#0a1628]" />
              <h2 className="text-2xl font-black text-[#0a1628]">Calculadora de Pago</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                    activeMethod === m.id 
                      ? "bg-[#0a1628] border-[#0a1628] text-white shadow-lg" 
                      : "bg-white border-white hover:border-[#c9a227] text-[#0a1628]"
                  )}
                >
                  <m.icon className={cn("w-6 h-6 transition-colors", activeMethod === m.id ? "text-[#c9a227]" : "text-muted-foreground group-hover:text-[#c9a227]")} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Monto a pagar ({activeMethod.includes('usd') ? 'USD' : 'Bs.'})
              </Label>
              <div className="flex gap-4">
                <Input 
                  autoFocus
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  placeholder={remaining > 0 ? (activeMethod.includes('usd') ? (remaining / exchangeRate).toFixed(2) : remaining.toFixed(2)) : '0.00'}
                  className="h-16 rounded-2xl text-2xl font-black border-2 focus-visible:ring-[#0a1628]"
                />
                <Button onClick={addPayment} className="h-16 w-16 rounded-2xl bg-[#0a1628] hover:scale-105 transition-transform">
                  <Plus className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>

          {/* Totals & Payments (Right) */}
          <div className="w-full md:w-[400px] p-8 flex flex-col bg-[#0a1628] text-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/30 hover:text-white rounded-full">
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6 flex-1">
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Monto Total</p>
                <p className="text-4xl font-black tracking-tighter">{formatMoney(totalVES)}</p>
                <p className="text-sm font-bold text-[#c9a227]">$ {(totalVES / exchangeRate).toFixed(2)} USD</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-white/40 border-b border-white/10 pb-2 tracking-widest">Pagos Realizados</p>
                <ScrollArea className="h-[200px] -mx-2 px-2">
                  <div className="space-y-2">
                    {payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-white/50">{methods.find(m => m.id === p.method)?.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black">{p.amountUSD ? `$ ${p.amountUSD.toFixed(2)}` : formatMoney(p.amount)}</p>
                          <button onClick={() => setPayments(payments.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && <p className="text-center py-8 text-white/20 text-xs font-bold uppercase italic">No se han agregado pagos</p>}
                  </div>
                </ScrollArea>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/40 mb-1">Restante</p>
                    <p className={cn("text-2xl font-black", remaining <= 0 ? "text-green-400" : "text-white")}>
                      {remaining > 0 ? formatMoney(remaining) : formatMoney(0)}
                    </p>
                  </div>
                  {remaining < 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-1">Cambio</p>
                      <p className="text-2xl font-black text-blue-400">{formatMoney(Math.abs(remaining))}</p>
                    </div>
                  )}
                </div>

                <Button 
                  disabled={totalPaid < totalVES}
                  onClick={() => onConfirm(payments)}
                  className={cn(
                    "w-full h-16 rounded-2xl text-xl font-black uppercase tracking-tight shadow-xl transition-all border-none",
                    totalPaid >= totalVES ? "bg-[#c9a227] text-[#0a1628] hover:scale-[1.02]" : "bg-white/10 text-white/30"
                  )}
                >
                  Finalizar Venta <CheckCircle className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

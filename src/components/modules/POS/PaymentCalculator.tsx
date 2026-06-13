'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, DollarSign, CreditCard, Banknote, Smartphone, Fingerprint, Plane, Plus, Trash2, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format';

interface PaymentItem {
  id: string;
  method: string;
  amount: number;
  usdAmount?: number;
}

interface PaymentCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  totalVES: number;
  exchangeRate: number;
  onConfirm: (payments: Array<{ type: string; amountVES: number; amountUSD: number }>) => void;
  formatMoney: (amount: number, currency?: 'VES' | 'USD') => string;
}

const methods = [
  { id: 'cash_ves', label: 'EFECTIVO Bs', icon: Banknote, currency: 'Bs' },
  { id: 'cash_usd', label: 'EFECTIVO USD', icon: DollarSign, currency: 'USD' },
  { id: 'card', label: 'TARJETA', icon: CreditCard, currency: 'Bs' },
  { id: 'biopago', label: 'BIOPAGO', icon: Fingerprint, currency: 'Bs' },
  { id: 'pagomovil', label: 'PAGO MÓVIL', icon: Smartphone, currency: 'Bs' },
  { id: 'zelle_usd', label: 'ZELLE', icon: Plane, currency: 'USD' },
];

export default function PaymentCalculator({
  isOpen,
  onClose,
  totalVES,
  exchangeRate,
  onConfirm,
  formatMoney
}: PaymentCalculatorProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [currentMethod, setCurrentMethod] = useState('cash_ves');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMethodObj = methods.find(m => m.id === currentMethod);
  const isUsd = currentMethodObj?.currency === 'USD';

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalUsd = totalVES / exchangeRate;
  const totalPaidUsd = payments.reduce((sum, p) => sum + (p.usdAmount || p.amount / exchangeRate), 0);

  const isPaidByUsd = totalPaidUsd >= totalUsd - 0.001;
  const isFullyPaid = isPaidByUsd || totalPaid >= totalVES - 0.01;
  const remaining = isFullyPaid ? 0 : Math.max(0, totalVES - totalPaid);
  const change = Math.max(0, totalPaid - totalVES);
  const ajusteRedondeo = isPaidByUsd && totalPaid < totalVES ? Math.round((totalVES - totalPaid) * 100) / 100 : 0;
  const displayedTotalPaid = isPaidByUsd && ajusteRedondeo > 0 ? totalVES : totalPaid;

  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setInputValue('');
      setCurrentMethod('cash_ves');
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addPayment = () => {
    let rawAmount = parseFloat(inputValue);
    if (isNaN(rawAmount) || rawAmount <= 0) return;

    if (isUsd) {
      const usdAmount = rawAmount;
      const bsAmount = Math.round(usdAmount * exchangeRate * 100) / 100;
      const newPayment: PaymentItem = {
        id: crypto.randomUUID(),
        method: currentMethod,
        amount: bsAmount,
        usdAmount: usdAmount,
      };
      setPayments([...payments, newPayment]);
    } else {
      const bsAmount = rawAmount;
      const newPayment: PaymentItem = {
        id: crypto.randomUUID(),
        method: currentMethod,
        amount: bsAmount,
      };
      setPayments([...payments, newPayment]);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const setExactAmount = () => {
    const currentRemaining = Math.max(0, totalVES - totalPaid);
    if (currentRemaining <= 0) return;
    
    let amountToAdd = currentRemaining;
    if (isUsd) {
      amountToAdd = payments.length === 0 ? totalUsd : Math.round((currentRemaining / exchangeRate) * 100) / 100;
    }
    setInputValue(amountToAdd.toFixed(2));
  };

  const handleConfirm = useCallback(() => {
    if (!isFullyPaid) return;
    setIsProcessing(true);
    
    const formattedPayments = payments.map(p => {
      const method = methods.find(m => m.id === p.method);
      const isUsdPayment = method?.currency === 'USD';
      return {
        type: p.method,
        amountVES: isUsdPayment ? 0 : p.amount,
        amountUSD: isUsdPayment ? (p.usdAmount || p.amount / exchangeRate) : 0
      };
    });
    
    onConfirm(formattedPayments);
    setIsProcessing(false);
    onClose();
  }, [payments, isFullyPaid, onConfirm, onClose, exchangeRate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === 'Space' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        if (isFullyPaid) handleConfirm();
      }
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        e.preventDefault();
        addPayment();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullyPaid, handleConfirm, addPayment, onClose]);

  if (!isOpen) return null;

  const formatPaymentAmount = (payment: PaymentItem) => {
    const methodInfo = methods.find(m => m.id === payment.method);
    if (methodInfo?.currency === 'USD') {
      const usdValue = payment.usdAmount ?? payment.amount / exchangeRate;
      return formatMoney(usdValue, 'USD');
    }
    return formatMoney(payment.amount, 'VES');
  };

  return (
    <div className="fixed z-[200] inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header - VenPOS colors */}
        <div className="bg-[#0a1628] p-3 text-white flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#c9a227]" />
            <h3 className="font-black text-sm">Procesar Pago</h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Totales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl text-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Total a pagar</span>
              <p className="text-2xl font-black mt-1 text-[#0a1628]">{formatMoney(totalVES)}</p>
              <p className="text-xs font-bold text-gray-400 mt-0.5">≈ {formatMoney(totalUsd, 'USD')}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl text-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Pagado</span>
              <p className="text-2xl font-black mt-1 text-emerald-600">{formatMoney(displayedTotalPaid)}</p>
              {totalPaidUsd > 0 && <p className="text-xs font-bold text-emerald-500 mt-0.5">{formatMoney(totalPaidUsd, 'USD')}</p>}
            </div>
          </div>

          {/* Lista de pagos */}
          <div className="max-h-32 overflow-y-auto border rounded-xl divide-y">
            {payments.length === 0 ? (
              <div className="text-center py-3 text-xs text-gray-400">No hay pagos registrados</div>
            ) : (
              payments.map(p => {
                const methodInfo = methods.find(m => m.id === p.method);
                return (
                  <div key={p.id} className="flex justify-between items-center p-2 text-xs">
                    <div className="flex items-center gap-2">
                      {methodInfo?.icon && <methodInfo.icon size={14} className="text-gray-500" />}
                      <span className="font-bold text-gray-700">{methodInfo?.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{formatPaymentAmount(p)}</span>
                      <button onClick={() => removePayment(p.id)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Método y monto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Método de pago</label>
              <select
                value={currentMethod}
                onChange={(e) => setCurrentMethod(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-[#c9a227] focus:outline-none"
              >
                {methods.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Monto</label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-right focus:border-[#c9a227] focus:outline-none"
                  placeholder="0.00"
                />
                <button onClick={addPayment} className="bg-[#c9a227] px-3 rounded-xl text-[#0a1628] font-bold text-xs hover:bg-[#d4b43a] transition">
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-[8px] text-gray-400 mt-1 text-right">
                {isUsd ? 'Monto en USD' : 'Monto en Bs'}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={setExactAmount}
              className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-200 transition"
            >
              Monto Exacto
            </button>
          </div>

          {/* Banner de estado */}
          <div className={cn(
            "rounded-xl p-3 text-center border transition-all",
            remaining > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
          )}>
            {remaining > 0 ? (
              <>
                <p className="text-[9px] font-black text-red-600 uppercase tracking-wider">Faltante</p>
                <p className="text-2xl font-black text-red-600 mt-0.5">{formatMoney(remaining)}</p>
                <p className="text-xs font-bold text-red-500 mt-0.5">≈ {formatMoney(remaining / exchangeRate, 'USD')}</p>
              </>
            ) : change > 0 ? (
              <>
                <p className="text-[9px] font-black text-green-600 uppercase tracking-wider">Vuelto</p>
                <p className="text-2xl font-black text-green-600 mt-0.5">{formatMoney(change)}</p>
                <p className="text-xs font-bold text-green-500 mt-0.5">≈ {formatMoney(change / exchangeRate, 'USD')}</p>
              </>
            ) : (
              <p className="text-sm font-black text-green-600 py-1">✓ Pago completado</p>
            )}
          </div>

          {/* Botón finalizar */}
          <button
            onClick={handleConfirm}
            disabled={!isFullyPaid || isProcessing}
            className={cn(
              "w-full py-3 rounded-xl text-white font-black text-sm transition-all",
              isFullyPaid 
                ? "bg-gradient-to-r from-[#c9a227] to-[#d4b43a] text-[#0a1628] hover:scale-[1.02] shadow-md" 
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {isProcessing ? "Procesando..." : (change > 0 ? `COMPLETAR - Vuelto ${formatMoney(change)}` : "COMPLETAR PAGO")}
          </button>

          <p className="text-center text-[8px] text-gray-400">
            ␣ Espacio para finalizar | ESC para cerrar | Enter agrega monto
          </p>
        </div>
      </div>
    </div>
  );
}

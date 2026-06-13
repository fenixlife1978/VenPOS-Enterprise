'use client';

import React, { useState } from 'react';
import { 
  Building2, DollarSign, Lock, RefreshCw, TrendingUp, 
  Wallet, CheckCircle2, Calendar, Clock, Shield, KeyRound,
  Eye, EyeOff, User, CreditCard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CashOpeningProps {
  config: any;
  updateStore: any;
  currentUser: any;
}

export default function CashOpening({ config, updateStore, currentUser }: CashOpeningProps) {
  const [initialVES, setInitialVES] = useState('');
  const [initialUSD, setInitialUSD] = useState('');
  const [rate, setRate] = useState(config.exchangeRate.toString());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    if (currentUser?.role === 'cashier' && password !== currentUser?.password) {
      setError('Contraseña incorrecta');
      return;
    }
    
    const parsedVES = parseFloat(initialVES) || 0;
    const parsedUSD = parseFloat(initialUSD) || 0;
    
    if (parsedVES === 0 && parsedUSD === 0) {
      setError('Debe ingresar al menos un fondo inicial');
      return;
    }
    
    const newDrawer = {
      id: Date.now(),
      userId: currentUser?.id || 0,
      userName: currentUser?.fullName || 'Cajero',
      openingDate: new Date().toISOString(),
      initialVES: parsedVES,
      initialUSD: parsedUSD,
      exchangeRate: parseFloat(rate) || config.exchangeRate,
      isOpen: true,
      sales: [],
      movements: [{
        id: Date.now(),
        type: 'opening',
        amountVES: parsedVES,
        amountUSD: parsedUSD,
        description: 'Apertura de caja',
        createdAt: new Date().toISOString()
      }]
    };
    
    updateStore((prev: any) => ({
      ...prev,
      config: {
        ...prev.config,
        exchangeRate: parseFloat(rate) || prev.config.exchangeRate,
        exchangeRateUpdatedAt: new Date().toISOString(),
        cashDrawer: newDrawer
      },
      cashDrawers: [...(prev.cashDrawers || []), newDrawer]
    }));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-500">
        {/* Header más compacto */}
        <div className="bg-[#0a1628] py-4 px-6 text-white text-center">
          <div className="w-12 h-12 bg-[#c9a227] rounded-xl flex items-center justify-center text-[#0a1628] mx-auto mb-2 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Apertura de Caja</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Ingrese los fondos iniciales</p>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Información del cajero - más compacta */}
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 bg-[#0a1628] rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Cajero</p>
              <p className="font-bold text-sm truncate">{currentUser?.fullName || 'Administrador'}</p>
              <p className="text-[10px] text-muted-foreground">{currentUser?.role === 'cashier' ? 'Cajero' : 'Administrador'}</p>
            </div>
          </div>

          {/* Fondos iniciales - dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground">Fondo Inicial (Bs.)</Label>
              <div className="relative">
                <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  type="number"
                  placeholder="0,00"
                  value={initialVES}
                  onChange={e => setInitialVES(e.target.value)}
                  className="pl-8 h-9 rounded-lg text-sm font-bold border"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground">Fondo Inicial (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={initialUSD}
                  onChange={e => setInitialUSD(e.target.value)}
                  className="pl-8 h-9 rounded-lg text-sm font-bold border"
                />
              </div>
            </div>
          </div>

          {/* Tasa BCV */}
          <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Tasa BCV del Día</Label>
            <div className="relative">
              <TrendingUp className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#c9a227]" />
              <Input 
                type="number"
                step="0.01"
                value={rate}
                onChange={e => setRate(e.target.value)}
                className="pl-8 h-10 rounded-lg text-base font-black border-2 border-[#c9a227]/20"
              />
            </div>
            <p className="text-[9px] text-muted-foreground font-medium">
              Última: {config.exchangeRate.toFixed(2)} Bs.
            </p>
          </div>

          {/* Contraseña para cajeros */}
          {currentUser?.role === 'cashier' && (
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase text-muted-foreground">Contraseña</Label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="pl-8 pr-8 h-9 rounded-lg text-sm border"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0a1628]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Fecha y hora - línea horizontal compacta */}
          <div className="flex items-center justify-between gap-3 p-2 bg-muted/30 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">{new Date().toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono font-bold">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Botón de apertura */}
          <Button 
            onClick={handleOpen}
            className="w-full h-11 rounded-xl bg-[#0a1628] hover:bg-[#1e3a5f] text-white text-sm font-bold uppercase tracking-wide shadow-lg transition-all"
          >
            Abrir Caja <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
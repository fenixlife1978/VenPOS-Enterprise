"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Lock, 
  RefreshCw, 
  TrendingUp, 
  Wallet, 
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CashOpening({ config, updateStore }: { config: any, updateStore: any }) {
  const [initialVES, setInitialVES] = useState('0');
  const [initialUSD, setInitialUSD] = useState('0');
  const [rate, setRate] = useState(config.exchangeRate.toString());

  const handleOpen = () => {
    updateStore((prev: any) => ({
      ...prev,
      config: {
        ...prev.config,
        exchangeRate: parseFloat(rate) || prev.config.exchangeRate,
        cashOpening: {
          isOpen: true,
          openedAt: new Date().toISOString(),
          initialVES: parseFloat(initialVES) || 0,
          initialUSD: parseFloat(initialUSD) || 0
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-500">
        <div className="bg-[#0a1628] p-8 text-white text-center space-y-2">
          <div className="w-16 h-16 bg-[#c9a227] rounded-2xl flex items-center justify-center text-[#0a1628] mx-auto mb-4 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Apertura de Caja</h1>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Ingrese los fondos iniciales para comenzar</p>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Fondo Inicial (Bs.)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="number"
                  value={initialVES}
                  onChange={e => setInitialVES(e.target.value)}
                  className="pl-10 h-12 rounded-xl font-bold border-2 focus-visible:ring-[#0a1628]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Fondo Inicial (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="number"
                  value={initialUSD}
                  onChange={e => setInitialUSD(e.target.value)}
                  className="pl-10 h-12 rounded-xl font-bold border-2 focus-visible:ring-[#0a1628]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Tasa BCV del Día</Label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a227]" />
              <Input 
                type="number"
                step="0.01"
                value={rate}
                onChange={e => setRate(e.target.value)}
                className="pl-10 h-14 rounded-xl text-xl font-black border-2 border-[#c9a227]/20 focus-visible:ring-[#0a1628]"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold italic">Se sugiere la última tasa registrada: {config.exchangeRate.toFixed(2)} Bs.</p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Fecha del Sistema</p>
              <p className="text-xs font-bold">{new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <Button 
            onClick={handleOpen}
            className="w-full h-16 rounded-2xl bg-[#0a1628] hover:bg-[#1e3a5f] text-white text-lg font-black uppercase tracking-tight shadow-xl shadow-[#0a1628]/20 transition-all border-none group"
          >
            Abrir Caja Ahora <CheckCircle2 className="w-6 h-6 ml-2 group-hover:scale-110 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Plus, 
  ChefHat, 
  Clock, 
  CheckCircle2,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ComandasModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  updateStore: (updater: any) => void;
}

export default function ComandasModal({ isOpen, onClose, store, updateStore }: ComandasModalProps) {
  const [newTableName, setNewTableName] = useState('');

  const addComanda = () => {
    if (!newTableName) return;
    const newComanda = {
      id: Date.now(),
      table: newTableName,
      items: [],
      status: 'pending',
      servicePercent: 10,
      createdAt: new Date().toISOString()
    };
    updateStore((prev: any) => ({
      ...prev,
      comandas: [...(prev.comandas || []), newComanda]
    }));
    setNewTableName('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-300">
        <div className="bg-[#0a1628] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-[#c9a227]" />
            <h2 className="text-xl font-black uppercase tracking-tight">Gestión de Comandas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* Left Panel - New Comanda */}
          <div className="w-full md:w-80 p-6 border-r bg-muted/20 space-y-6">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-black">Nueva Mesa / Orden</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Mesa 01, Delivery..." 
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="rounded-xl h-11 bg-white border-gray-200"
                />
                <Button onClick={addComanda} className="h-11 w-11 rounded-xl bg-[#0a1628] p-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <p className="text-[10px] font-black uppercase text-black">Resumen de Sala</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                  <span className="text-2xl font-black text-[#0a1628]">{store.comandas?.length || 0}</span>
                  <span className="text-[8px] font-black uppercase text-black">Activas</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
                  <span className="text-2xl font-black text-blue-600">{store.comandas?.filter((c: any) => c.status === 'preparing').length || 0}</span>
                  <span className="text-[8px] font-black uppercase text-black">Cocina</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - List */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase text-[#0a1628]">Listado de Órdenes Pendientes</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                {(store.comandas || []).map((c: any) => (
                  <Card key={c.id} className="p-5 border-2 hover:border-[#c9a227] transition-all rounded-2xl shadow-sm relative group bg-white border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-[#c9a227]" />
                        <span className="font-black text-sm uppercase text-black">{c.table}</span>
                      </div>
                      <Badge className={cn(
                        "text-[9px] uppercase font-bold",
                        c.status === 'pending' ? 'bg-orange-50 text-orange-700' : 
                        c.status === 'preparing' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      )}>
                        {c.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-black">
                        <Clock className="w-3 h-3 text-[#c9a227]" />
                        <span className="text-[10px] font-black uppercase">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black">
                        <ChefHat className="w-3 h-3 text-[#c9a227]" />
                        <span className="text-[10px] font-black uppercase">{c.items?.length || 0} productos en espera</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-9 rounded-lg text-[9px] font-black uppercase text-black border-gray-300">
                        Ver Items
                      </Button>
                      <Button className="h-9 rounded-lg text-[9px] font-black uppercase bg-[#0a1628] text-white">
                        Enviar Cocina
                      </Button>
                    </div>

                    <button 
                      onClick={() => updateStore((prev: any) => ({ ...prev, comandas: prev.comandas.filter((com: any) => com.id !== c.id) }))}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Card>
                ))}
                {(!store.comandas || store.comandas.length === 0) && (
                  <div className="col-span-full py-20 text-center opacity-20">
                    <UtensilsCrossed className="w-20 h-20 mx-auto mb-4 text-[#0a1628]" />
                    <p className="text-lg font-black uppercase text-[#0a1628]">No hay comandas que mostrar</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}

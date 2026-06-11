"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Barcode, 
  Calculator, 
  Plus, 
  Trash2, 
  Settings2,
  PackagePlus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVenPos } from '@/hooks/useVenPos';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  updateStore: (updater: any) => void;
  editingProduct: any;
}

const DEFAULT_FORM_STATE = {
  code: '',
  name: '',
  brand: '',
  unit: 'unidad',
  departmentId: '',
  categoryId: '',
  initialStock: 0,
  minStock: 0,
  costUSD: 0,
  margin: 30,
  priceUSD: 0,
  priceVES: 0,
  appliesIva: false,
  ivaPercent: 16,
  isComposite: false,
  components: [],
  alternativePrices: {
    mayor: 0,
    costo: 0,
    oferta: 0,
    promocion: 0,
    precio1: 0
  }
};

export default function ProductForm({ isOpen, onClose, store, updateStore, editingProduct }: ProductFormProps) {
  const { calculatePrice, calculateMargin } = useVenPos();
  const [formData, setFormData] = useState<any>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...DEFAULT_FORM_STATE,
        ...editingProduct,
        alternativePrices: {
          ...DEFAULT_FORM_STATE.alternativePrices,
          ...(editingProduct.alternativePrices || {})
        }
      });
    } else {
      setFormData(DEFAULT_FORM_STATE);
    }
  }, [editingProduct]);

  const handlePriceCalc = (field: string, value: string) => {
    const val = parseFloat(value) || 0;
    const rate = store.config.exchangeRate;
    
    let newFormData = { ...formData, [field]: val };

    if (field === 'margin') {
      const prices = calculatePrice(formData.costUSD, val, rate);
      newFormData.priceUSD = prices.usd;
      newFormData.priceVES = prices.ves;
    } else if (field === 'priceUSD') {
      newFormData.margin = calculateMargin(formData.costUSD, val);
      newFormData.priceVES = val * rate;
    } else if (field === 'priceVES') {
      const usd = val / rate;
      newFormData.priceUSD = usd;
      newFormData.margin = calculateMargin(formData.costUSD, usd);
    } else if (field === 'costUSD') {
      const prices = calculatePrice(val, formData.margin, rate);
      newFormData.priceUSD = prices.usd;
      newFormData.priceVES = prices.ves;
    }

    setFormData(newFormData);
  };

  const handleSave = () => {
    updateStore((prev: any) => {
      const newProduct = {
        ...formData,
        id: editingProduct ? editingProduct.id : prev.products.length + 1,
        stock: editingProduct ? formData.stock : formData.initialStock,
        active: true
      };
      
      if (editingProduct) {
        return {
          ...prev,
          products: prev.products.map((p: any) => p.id === editingProduct.id ? newProduct : p)
        };
      } else {
        return {
          ...prev,
          products: [...prev.products, newProduct]
        };
      }
    });
    onClose();
  };

  const simulateScan = () => {
    const randomCode = '750' + Math.floor(Math.random() * 1000000000);
    setFormData({ ...formData, code: randomCode });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-300">
        <div className="bg-[#0a1628] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c9a227] rounded-xl flex items-center justify-center text-[#0a1628]">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Módulo de Inventario Avanzado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <ScrollArea className="h-[75vh]">
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Código del Producto</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={formData.code} 
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Código de barras..."
                        className="rounded-xl h-11"
                      />
                      <Button onClick={simulateScan} variant="outline" className="rounded-xl h-11 w-11 p-0">
                        <Barcode className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Nombre / Descripción</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Harina Pan 1kg"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Marca</Label>
                    <Input 
                      value={formData.brand} 
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Unidad</Label>
                    <Select value={formData.unit} onValueChange={v => setFormData({ ...formData, unit: v })}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidad">Unidad (UN)</SelectItem>
                        <SelectItem value="kg">Kilogramos (KG)</SelectItem>
                        <SelectItem value="litro">Litros (LT)</SelectItem>
                        <SelectItem value="par">Par</SelectItem>
                        <SelectItem value="bulto">Bulto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Stock Inicial</Label>
                    <Input 
                      type="number"
                      value={formData.initialStock} 
                      onChange={e => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
                      disabled={!!editingProduct}
                      className="rounded-xl h-11 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Departamento</Label>
                    <Select value={String(formData.departmentId)} onValueChange={v => setFormData({ ...formData, departmentId: parseInt(v) })}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {store.departments.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Categoría</Label>
                    <Select value={String(formData.categoryId)} onValueChange={v => setFormData({ ...formData, categoryId: parseInt(v) })}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {store.categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox 
                    id="isComposite" 
                    checked={formData.isComposite} 
                    onCheckedChange={v => setFormData({ ...formData, isComposite: !!v })}
                  />
                  <Label htmlFor="isComposite" className="text-xs font-bold uppercase cursor-pointer">Es Producto Compuesto</Label>
                </div>
                {formData.isComposite ? (
                  <Button variant="outline" className="w-full rounded-xl text-xs font-bold border-[#c9a227] text-[#c9a227]">
                    <Settings2 className="w-4 h-4 mr-2" /> Configurar Combo
                  </Button>
                ) : (
                  <p className="text-[10px] text-muted-foreground font-medium uppercase leading-tight">
                    Marque esta casilla si este producto es un KIT o COMBO conformado por otros productos.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#f5efe0]/30 p-8 rounded-[24px] border-2 border-[#c9a227]/20">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-5 h-5 text-[#c9a227]" />
                <h3 className="text-sm font-black uppercase text-[#0a1628]">Estructura de Precios</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Costo USD</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.costUSD} 
                    onChange={e => handlePriceCalc('costUSD', e.target.value)}
                    className="rounded-xl h-11 font-black text-[#0a1628] border-2 focus:border-[#c9a227]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">% Ganancia</Label>
                  <Input 
                    type="number"
                    value={formData.margin} 
                    onChange={e => handlePriceCalc('margin', e.target.value)}
                    className="rounded-xl h-11 font-black text-green-700 border-2 border-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Precio Detalle USD</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.priceUSD} 
                    onChange={e => handlePriceCalc('priceUSD', e.target.value)}
                    className="rounded-xl h-11 font-black text-[#0a1628] bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Precio Final Bs.</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.priceVES} 
                    onChange={e => handlePriceCalc('priceVES', e.target.value)}
                    className="rounded-xl h-11 font-black text-[#c9a227] bg-[#0a1628] border-none"
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(formData.alternativePrices || {}).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground">Precio {key}</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.alternativePrices[key]}
                      onChange={e => setFormData({
                        ...formData,
                        alternativePrices: { ...formData.alternativePrices, [key]: parseFloat(e.target.value) || 0 }
                      })}
                      className="rounded-lg h-9 text-xs font-bold"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-6 p-4 bg-white/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="appliesIva" 
                    checked={formData.appliesIva} 
                    onCheckedChange={v => setFormData({ ...formData, appliesIva: !!v })}
                  />
                  <Label htmlFor="appliesIva" className="text-xs font-bold uppercase">Aplica IVA</Label>
                </div>
                {formData.appliesIva && (
                  <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">% IVA</Label>
                    <Input 
                      type="number"
                      value={formData.ivaPercent}
                      onChange={e => setFormData({ ...formData, ivaPercent: parseInt(e.target.value) || 0 })}
                      className="w-20 h-9 rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-muted/20 border-t flex gap-4 justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-xs">Cancelar</Button>
          <Button onClick={handleSave} className="bg-[#0a1628] rounded-xl font-bold uppercase px-8 shadow-lg shadow-[#0a1628]/20">
            <Save className="w-4 h-4 mr-2" /> {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
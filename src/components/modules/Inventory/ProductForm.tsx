'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Plus, Trash2, Package, QrCode, Scan, RefreshCw, 
  DollarSign, TrendingUp, Calculator, Layers, AlertCircle,
  Check, Minus, ChevronDown, ChevronUp, Copy, Barcode,
  Save, Search, Boxes, LayoutDashboard, ShoppingCart, Tags,
  Users, FileText, Shield, Settings, LogOut, CreditCard,
  Building2, Wallet, Smartphone, Landmark, CheckCircle,
  Menu, ChevronLeft, ChevronRight, Download, Upload,
  Edit, Eye, Printer, Calendar, Clock, TrendingDown,
  Coins, ShoppingBag, ChartLine, ChartPie, Crown, Trophy,
  Database
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatMoney } from '@/utils/format';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  updateStore: any;
  editingProduct?: any | null;
}

const unidades = ['unidad', 'kg', 'lt', 'caja', 'paquete', 'docena', 'botella', 'lata'];

export const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, onClose, store, updateStore, editingProduct 
}) => {
  const [activeTab, setActiveTab] = useState('basicos');
  const [scanning, setScanning] = useState(false);
  const [compositeItems, setCompositeItems] = useState<any[]>([]);
  const [selectedProductForComposite, setSelectedProductForComposite] = useState<number | null>(null);
  const [compositeQuantity, setCompositeQuantity] = useState(1);
  const [useOwnStock, setUseOwnStock] = useState(false);
  
  // Precios base
  const [costPrice, setCostPrice] = useState(0);
  const [marginOnSale, setMarginOnSale] = useState(30);
  const [marginOnCost, setMarginOnCost] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);
  const [priceVES, setPriceVES] = useState(0);
  
  // Precios alternativos requeridos: Mayor, Costo, Oferta, Promoción, Precio 1
  const [alternativePrices, setAlternativePrices] = useState({
    mayor: { ves: 0, usd: 0 },
    costo: { ves: 0, usd: 0 },
    oferta: { ves: 0, usd: 0 },
    promocion: { ves: 0, usd: 0 },
    precio1: { ves: 0, usd: 0 }
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    brandId: 0,
    departmentId: 0,
    categoryId: 0,
    unit: 'unidad',
    stock: 0,
    minStock: 5,
    isComposite: false,
    hasIVA: true,
    ivaRate: 16,
    active: true
  });

  // Cálculos tridireccionales
  const calculatePrices = useCallback((type: 'cost' | 'margin' | 'usd' | 'ves', value: number) => {
    const rate = store.config.exchangeRate || 36.5;
    let newCost = costPrice;
    let newMargin = marginOnSale;
    let newUSD = priceUSD;
    let newVES = priceVES;

    if (type === 'cost') {
      newCost = value;
      newUSD = newCost / (1 - (newMargin / 100));
      newVES = newUSD * rate;
    } else if (type === 'margin') {
      newMargin = value;
      if (newMargin < 100) {
        newUSD = newCost / (1 - (newMargin / 100));
        newVES = newUSD * rate;
      }
    } else if (type === 'usd') {
      newUSD = value;
      newVES = newUSD * rate;
      newMargin = newUSD > 0 ? ((newUSD - newCost) / newUSD) * 100 : 0;
    } else if (type === 'ves') {
      newVES = value;
      newUSD = newVES / rate;
      newMargin = newUSD > 0 ? ((newUSD - newCost) / newUSD) * 100 : 0;
    }

    setCostPrice(newCost);
    setMarginOnSale(newMargin);
    setPriceUSD(newUSD);
    setPriceVES(newVES);
    setMarginOnCost(newCost > 0 ? ((newUSD - newCost) / newCost) * 100 : 0);
  }, [costPrice, marginOnSale, priceUSD, priceVES, store.config.exchangeRate]);

  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setFormData(prev => ({ ...prev, code: 'SCAN-' + Math.floor(Math.random() * 1000000) }));
        setScanning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        code: editingProduct.code,
        name: editingProduct.name,
        description: editingProduct.description || '',
        brandId: editingProduct.brandId || 0,
        departmentId: editingProduct.departmentId || 0,
        categoryId: editingProduct.categoryId || 0,
        unit: editingProduct.unit || 'unidad',
        stock: editingProduct.stock || 0,
        minStock: editingProduct.minStock || 5,
        isComposite: editingProduct.isComposite || false,
        hasIVA: editingProduct.hasIVA ?? true,
        ivaRate: editingProduct.ivaRate || 16,
        active: editingProduct.active ?? true
      });
      setCostPrice(editingProduct.costPrice || 0);
      setMarginOnSale(editingProduct.profitPercentage || 30);
      setPriceUSD(editingProduct.priceUSD || 0);
      setPriceVES(editingProduct.priceVES || 0);
      setCompositeItems(editingProduct.compositeItems || []);
      if (editingProduct.alternativePrices && typeof editingProduct.alternativePrices === 'object') {
        setAlternativePrices({
          mayor: editingProduct.alternativePrices.mayor || { ves: 0, usd: 0 },
          costo: editingProduct.alternativePrices.costo || { ves: 0, usd: 0 },
          oferta: editingProduct.alternativePrices.oferta || { ves: 0, usd: 0 },
          promocion: editingProduct.alternativePrices.promocion || { ves: 0, usd: 0 },
          precio1: editingProduct.alternativePrices.precio1 || { ves: 0, usd: 0 }
        });
      }
    }
  }, [editingProduct]);

  const handleAltPriceChange = (key: string, field: 'ves' | 'usd', val: string) => {
    const num = parseFloat(val) || 0;
    const rate = store.config.exchangeRate || 36.5;
    
    setAlternativePrices(prev => {
      const updated = { ...prev[key as keyof typeof prev] };
      updated[field] = num;
      if (field === 'ves') updated.usd = num / rate;
      else updated.ves = num * rate;
      
      return { ...prev, [key]: updated };
    });
  };

  const addCompositeItem = () => {
    if (!selectedProductForComposite) return;
    const prod = store.products.find((p: any) => p.id === selectedProductForComposite);
    if (!prod) return;
    setCompositeItems(prev => [...prev, {
      productId: prod.id,
      productName: prod.name,
      quantity: compositeQuantity,
      useOwnStock
    }]);
    setSelectedProductForComposite(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) return;

    const finalProduct = {
      ...editingProduct,
      id: editingProduct?.id || Date.now(),
      ...formData,
      costPrice,
      profitPercentage: marginOnSale,
      priceUSD,
      priceVES,
      alternativePrices,
      compositeItems: formData.isComposite ? compositeItems : [],
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      updateStore((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) => p.id === finalProduct.id ? finalProduct : p)
      }));
    } else {
      updateStore((prev: any) => ({
        ...prev,
        products: [...prev.products, { ...finalProduct, createdAt: new Date().toISOString() }]
      }));
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-[28px]">
        <DialogHeader className="p-6 bg-[#0a1628] text-white">
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            <Package className="w-6 h-6 text-[#c9a227]" />
            {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 bg-muted/30 border-b">
            <TabsList className="bg-transparent gap-2 h-auto p-0">
              {['basicos', 'precios', 'composicion', 'alternativos'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="rounded-xl px-6 py-2.5 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#0a1628] data-[state=active]:text-white"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="basicos" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Código de Barras</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="rounded-xl font-mono text-sm"
                      placeholder="Escanee o ingrese código"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setScanning(true)}
                      className={scanning ? "bg-[#c9a227] text-white" : "rounded-xl"}
                    >
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Nombre del Producto</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Marca</Label>
                  <Input 
                    placeholder="Marca"
                    value={store.brands.find((b: any) => b.id === formData.brandId)?.name || ''}
                    readOnly
                    className="rounded-xl bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Departamento</Label>
                  <Select value={formData.departmentId.toString()} onValueChange={v => setFormData({...formData, departmentId: parseInt(v)})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {store.departments.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Categoría</Label>
                  <Select value={formData.categoryId.toString()} onValueChange={v => setFormData({...formData, categoryId: parseInt(v)})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {store.categories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Stock Inicial</Label>
                  <Input 
                    type="number" 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    disabled={!!editingProduct}
                    className="rounded-xl font-bold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Stock Mínimo</Label>
                  <Input 
                    type="number"
                    value={formData.minStock}
                    onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                    className="rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Unidad</Label>
                  <Select value={formData.unit} onValueChange={v => setFormData({...formData, unit: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <Switch checked={formData.isComposite} onCheckedChange={v => setFormData({...formData, isComposite: v})} />
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Compuesto</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="precios" className="mt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6 border-none bg-muted/20 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-[#c9a227] tracking-widest flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Base de Cálculo
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Costo del Producto (USD)</Label>
                      <Input 
                        type="number" 
                        value={costPrice}
                        onChange={e => calculatePrices('cost', parseFloat(e.target.value) || 0)}
                        className="rounded-xl font-black text-lg h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">% Ganancia</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={marginOnSale.toFixed(1)}
                          onChange={e => calculatePrices('margin', parseFloat(e.target.value) || 0)}
                          className="rounded-xl font-black text-lg h-12 pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-none bg-[#0a1628] text-white space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-[#c9a227] tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Precio de Venta
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-white/70">Precio Detalle USD</Label>
                      <Input 
                        type="number"
                        value={priceUSD.toFixed(2)}
                        onChange={e => calculatePrices('usd', parseFloat(e.target.value) || 0)}
                        className="rounded-xl bg-white/10 border-white/20 text-white font-black text-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-white/70">Precio Final Bs.</Label>
                      <Input 
                        type="number"
                        value={priceVES.toFixed(2)}
                        onChange={e => calculatePrices('ves', parseFloat(e.target.value) || 0)}
                        className="rounded-xl bg-white/10 border-white/20 text-white font-black text-xl h-12"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch checked={formData.hasIVA} onCheckedChange={v => setFormData({...formData, hasIVA: v})} />
                  <div>
                    <Label className="text-[10px] font-black uppercase">Aplica IVA</Label>
                    <p className="text-[10px] text-muted-foreground">Impuesto al Valor Agregado</p>
                  </div>
                </div>
                {formData.hasIVA && (
                  <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">% IVA</Label>
                    <Input 
                      type="number"
                      value={formData.ivaRate}
                      onChange={e => setFormData({...formData, ivaRate: parseFloat(e.target.value) || 0})}
                      className="w-20 rounded-xl font-bold"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alternativos" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(alternativePrices).map((key) => (
                  <Card key={key} className="p-4 border-2 border-muted/50 rounded-2xl hover:border-[#c9a227] transition-all">
                    <Label className="text-[10px] font-black uppercase text-[#0a1628] mb-3 block">Precio {key}</Label>
                    <div className="space-y-3">
                      <div className="relative">
                        <Label className="text-[9px] font-bold uppercase text-muted-foreground absolute left-3 top-2">Bs.</Label>
                        <Input 
                          type="number"
                          value={alternativePrices[key as keyof typeof alternativePrices].ves.toFixed(2)}
                          onChange={e => handleAltPriceChange(key, 'ves', e.target.value)}
                          className="rounded-xl pt-6 font-bold"
                        />
                      </div>
                      <div className="relative">
                        <Label className="text-[9px] font-bold uppercase text-muted-foreground absolute left-3 top-2">USD</Label>
                        <Input 
                          type="number"
                          value={alternativePrices[key as keyof typeof alternativePrices].usd.toFixed(2)}
                          onChange={e => handleAltPriceChange(key, 'usd', e.target.value)}
                          className="rounded-xl pt-6 font-bold"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="composicion" className="mt-0 space-y-6">
              <div className="bg-muted/20 p-6 rounded-[24px] space-y-4">
                <Label className="text-[10px] font-black uppercase text-[#0a1628]">Agregar Componente</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductForComposite?.toString() || ''} onValueChange={v => setSelectedProductForComposite(parseInt(v))}>
                    <SelectTrigger className="flex-1 rounded-xl"><SelectValue placeholder="Buscar producto..." /></SelectTrigger>
                    <SelectContent>
                      {store.products.filter((p: any) => p.id !== editingProduct?.id).map((p: any) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.stock})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Cant."
                    value={compositeQuantity}
                    onChange={e => setCompositeQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-xl font-bold"
                  />
                  <Button onClick={addCompositeItem} className="bg-[#0a1628] rounded-xl"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={useOwnStock} onCheckedChange={setUseOwnStock} />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Con stock propio</span>
                </div>
              </div>

              <div className="space-y-2">
                {compositeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Boxes className="w-4 h-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-xs font-black uppercase text-[#0a1628]">{item.productName}</p>
                        <p className="text-[9px] font-bold text-muted-foreground">Cantidad: {item.quantity} | Stock Propio: {item.useOwnStock ? 'SÍ' : 'NO'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setCompositeItems(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-6 bg-muted/20 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold px-8 h-12 uppercase text-[10px] tracking-widest">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-[#0a1628] hover:bg-[#1e3a5f] rounded-xl font-black px-12 h-12 uppercase text-[10px] tracking-widest shadow-xl">
            <Save className="w-4 h-4 mr-2" /> {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

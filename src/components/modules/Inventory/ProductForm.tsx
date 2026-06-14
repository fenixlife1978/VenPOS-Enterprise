'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Plus, Trash2, Package, Scan, Calculator, AlertCircle,
  Check, DollarSign, Barcode, TrendingUp, PlusCircle, Edit2
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/utils/format';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  store: any;
  updateStore: any;
  editingProduct?: any | null;
}

const unidades = ['unidad', 'kilogramo', 'litro', 'caja', 'paquete', 'docena', 'botella', 'lata'];

export const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, onClose, store, updateStore, editingProduct 
}) => {
  const [scanning, setScanning] = useState(false);
  const [compositeItems, setCompositeItems] = useState<any[]>([]);
  const [selectedProductForComposite, setSelectedProductForComposite] = useState<number | null>(null);
  const [compositeQuantity, setCompositeQuantity] = useState(1);
  const [useOwnStock, setUseOwnStock] = useState(false);
  
  // Estados independientes para cada modal
  const [modalMarca, setModalMarca] = useState({ open: false, name: '' });
  const [modalDepto, setModalDepto] = useState({ open: false, name: '' });
  const [modalCategoria, setModalCategoria] = useState({ open: false, name: '' });
  
  const [costPrice, setCostPrice] = useState(0);
  const [marginOnSale, setMarginOnSale] = useState(30);
  const [marginOnCost, setMarginOnCost] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);
  const [priceVES, setPriceVES] = useState(0);
  
  const [alternatePrices, setAlternatePrices] = useState<any[]>([]);
  
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

  const round2 = (num: number) => Math.round(num * 100) / 100;
  const round4 = (num: number) => Math.round(num * 10000) / 10000;

  const calculateFromCostAndMargin = useCallback((cost: number, margin: number) => {
    if (margin >= 100) return { usd: 0, ves: 0, marginOnCost: 0 };
    const usd = round4(cost / (1 - (margin / 100)));
    const ves = round4(usd * store.config.exchangeRate);
    const marginOnCostCalc = ((usd - cost) / cost) * 100;
    return { usd, ves, marginOnCost: marginOnCostCalc };
  }, [store.config.exchangeRate]);

  const calculateFromPriceUSD = useCallback((usd: number, cost: number) => {
    const ves = round4(usd * store.config.exchangeRate);
    const marginOnSaleCalc = ((usd - cost) / usd) * 100;
    const marginOnCostCalc = ((usd - cost) / cost) * 100;
    return { ves, marginOnSale: marginOnSaleCalc, marginOnCost: marginOnCostCalc };
  }, [store.config.exchangeRate]);

  const calculateFromPriceVES = useCallback((ves: number, cost: number) => {
    const usd = round4(ves / store.config.exchangeRate);
    const marginOnSaleCalc = ((usd - cost) / usd) * 100;
    const marginOnCostCalc = ((usd - cost) / cost) * 100;
    return { usd, marginOnSale: marginOnSaleCalc, marginOnCost: marginOnCostCalc };
  }, [store.config.exchangeRate]);

  const updateCost = (cost: number) => {
    setCostPrice(round4(cost));
    const { usd, ves, marginOnCost: moc } = calculateFromCostAndMargin(round4(cost), marginOnSale);
    setPriceUSD(round2(usd));
    setPriceVES(round2(ves));
    setMarginOnCost(moc);
  };

  const updateMarginOnSale = (margin: number) => {
    setMarginOnSale(margin);
    const { usd, ves, marginOnCost: moc } = calculateFromCostAndMargin(costPrice, margin);
    setPriceUSD(round2(usd));
    setPriceVES(round2(ves));
    setMarginOnCost(moc);
  };

  const updatePriceUSD = (usd: number) => {
    setPriceUSD(round2(usd));
    const { ves, marginOnSale: mos, marginOnCost: moc } = calculateFromPriceUSD(round4(usd), costPrice);
    setPriceVES(round2(ves));
    setMarginOnSale(Math.round(mos));
    setMarginOnCost(moc);
  };

  const updatePriceVES = (ves: number) => {
    setPriceVES(round2(ves));
    const { usd, marginOnSale: mos, marginOnCost: moc } = calculateFromPriceVES(round4(ves), costPrice);
    setPriceUSD(round2(usd));
    setMarginOnSale(Math.round(mos));
    setMarginOnCost(moc);
  };

  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setFormData(prev => ({ ...prev, code: 'PROD' + Math.floor(Math.random() * 10000) }));
        setScanning(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        code: editingProduct.code,
        name: editingProduct.name,
        description: editingProduct.description || '',
        brandId: editingProduct.brandId,
        departmentId: editingProduct.departmentId,
        categoryId: editingProduct.categoryId,
        unit: editingProduct.unit,
        stock: editingProduct.stock,
        minStock: editingProduct.minStock,
        isComposite: editingProduct.isComposite,
        hasIVA: editingProduct.hasIVA,
        ivaRate: editingProduct.ivaRate,
        active: editingProduct.active
      });
      setCostPrice(round4(editingProduct.costPrice || 0));
      setMarginOnSale(editingProduct.profitPercentage || 30);
      setPriceUSD(round2(editingProduct.priceUSD || 0));
      setPriceVES(round2(editingProduct.priceVES || 0));
      setCompositeItems(editingProduct.compositeItems || []);
      setAlternatePrices(editingProduct.alternatePrices || []);
      const { marginOnCost: moc } = calculateFromCostAndMargin(editingProduct.costPrice || 0, editingProduct.profitPercentage || 30);
      setMarginOnCost(moc);
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setFormData({
      code: '', name: '', description: '', brandId: 0, departmentId: 0, categoryId: 0,
      unit: 'unidad', stock: 0, minStock: 5, isComposite: false, hasIVA: true, ivaRate: 16, active: true
    });
    setCostPrice(0); setMarginOnSale(30); setMarginOnCost(0); setPriceUSD(0); setPriceVES(0);
    setCompositeItems([]); setAlternatePrices([]);
  };

  const handleCreateMarca = () => {
    if (modalMarca.name.trim()) {
      const newId = Math.max(...store.brands.map((b: any) => b.id), 0) + 1;
      updateStore((prev: any) => ({
        ...prev,
        brands: [...prev.brands, { id: newId, name: modalMarca.name }]
      }));
      setFormData(prev => ({ ...prev, brandId: newId }));
      setModalMarca({ open: false, name: '' });
    }
  };

  const handleCreateDepto = () => {
    if (modalDepto.name.trim()) {
      const newId = Math.max(...store.departments.map((d: any) => d.id), 0) + 1;
      updateStore((prev: any) => ({
        ...prev,
        departments: [...prev.departments, { id: newId, name: modalDepto.name }]
      }));
      setFormData(prev => ({ ...prev, departmentId: newId, categoryId: 0 }));
      setModalDepto({ open: false, name: '' });
    }
  };

  const handleCreateCategoria = () => {
    if (modalCategoria.name.trim() && formData.departmentId) {
      const newId = Math.max(...store.categories.map((c: any) => c.id), 0) + 1;
      updateStore((prev: any) => ({
        ...prev,
        categories: [...prev.categories, { id: newId, name: modalCategoria.name, departmentId: formData.departmentId }]
      }));
      setFormData(prev => ({ ...prev, categoryId: newId }));
      setModalCategoria({ open: false, name: '' });
    } else if (!formData.departmentId) {
      alert('Primero debe seleccionar un departamento');
    }
  };

  const addCompositeItem = () => {
    if (!selectedProductForComposite) return;
    const product = store.products.find((p: any) => p.id === selectedProductForComposite);
    if (!product) return;
    setCompositeItems(prev => [...prev, {
      productId: product.id, productName: product.name, quantity: compositeQuantity, useOwnStock
    }]);
    setSelectedProductForComposite(null);
    setCompositeQuantity(1);
    setUseOwnStock(false);
  };

  const removeCompositeItem = (index: number) => {
    setCompositeItems(prev => prev.filter((_, i) => i !== index));
  };

  const addAlternatePrice = (type: string) => {
    const price = prompt(`Ingrese precio en USD para ${type}:`);
    if (price) {
      const usd = parseFloat(price);
      if (!isNaN(usd)) {
        setAlternatePrices(prev => [...prev, {
          type, 
          priceVES: round2(usd * store.config.exchangeRate), 
          priceUSD: round2(usd)
        }]);
      }
    }
  };

  const removeAlternatePrice = (index: number) => {
    setAlternatePrices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      alert('Complete los campos obligatorios');
      return;
    }

    const newProduct = {
      id: editingProduct?.id || Date.now(),
      code: formData.code,
      name: formData.name,
      description: formData.description,
      brandId: formData.brandId,
      brandName: store.brands.find((b: any) => b.id === formData.brandId)?.name || '',
      departmentId: formData.departmentId,
      categoryId: formData.categoryId,
      unit: formData.unit,
      stock: editingProduct ? formData.stock : 0,
      minStock: formData.minStock,
      isComposite: formData.isComposite,
      compositeItems: formData.isComposite ? compositeItems : [],
      costPrice: round4(costPrice), 
      profitPercentage: marginOnSale, 
      priceUSD: round2(priceUSD), 
      priceVES: round2(priceVES),
      hasIVA: formData.hasIVA, 
      ivaRate: formData.ivaRate,
      alternatePrices: alternatePrices.map(p => ({ ...p, priceVES: round2(p.priceVES), priceUSD: round2(p.priceUSD) })),
      active: formData.active,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      updateStore((prev: any) => ({
        ...prev, products: prev.products.map((p: any) => p.id === editingProduct.id ? newProduct : p)
      }));
    } else {
      updateStore((prev: any) => ({ ...prev, products: [...prev.products, newProduct] }));
    }
    onClose();
  };

  const filteredCategories = store.categories.filter((c: any) => c.departmentId === formData.departmentId);
  const availableProducts = store.products.filter((p: any) => p.id !== editingProduct?.id && p.active);
  const formatNumber = (num: number) => num.toFixed(2);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl p-0 rounded-xl overflow-hidden bg-gray-200 border-gray-300">
          <DialogTitle className="sr-only">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          
          {/* Header */}
          <div className="bg-[#0a1628] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#c9a227] rounded-lg flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-[#0a1628]" />
              </div>
              <span className="text-white font-bold text-sm">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
            </div>
            {scanning && <Badge className="bg-[#c9a227] text-[#0a1628] text-[9px] animate-pulse"><Scan className="w-3 h-3 mr-1" /> Escaneando...</Badge>}
            <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Formulario compacto */}
          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3 bg-gray-200">
            {/* Fila 1: Código y Nombre */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Código</Label>
                <div className="flex gap-1">
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="P001" className="h-8 text-xs bg-white rounded-lg" />
                  <Button type="button" size="icon" variant="outline" onClick={() => setScanning(true)} className="h-8 w-8 bg-white border-gray-300"><Barcode className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Nombre *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" className="h-8 text-xs bg-white rounded-lg" />
              </div>
            </div>

            {/* Fila 2: Marca, Departamento, Categoría */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Marca</Label>
                <div className="flex gap-1">
                  <Select value={formData.brandId?.toString() ?? ''} onValueChange={(v) => setFormData({ ...formData, brandId: parseInt(v) || 0 })}>
                    <SelectTrigger className="flex-1 h-8 bg-white rounded-lg text-xs border-gray-300"><SelectValue placeholder="-" /></SelectTrigger>
                    <SelectContent>{store.brands?.map((b: any) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={() => setModalMarca({ open: true, name: '' })} className="h-8 w-8 bg-white border-gray-300"><PlusCircle className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Departamento</Label>
                <div className="flex gap-1">
                  <Select value={formData.departmentId?.toString() ?? ''} onValueChange={(v) => setFormData({ ...formData, departmentId: parseInt(v) || 0, categoryId: 0 })}>
                    <SelectTrigger className="flex-1 h-8 bg-white rounded-lg text-xs border-gray-300"><SelectValue placeholder="-" /></SelectTrigger>
                    <SelectContent>{store.departments?.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={() => setModalDepto({ open: true, name: '' })} className="h-8 w-8 bg-white border-gray-300"><PlusCircle className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Categoría</Label>
                <div className="flex gap-1">
                  <Select value={formData.categoryId?.toString() ?? ''} onValueChange={(v) => setFormData({ ...formData, categoryId: parseInt(v) || 0 })}>
                    <SelectTrigger className="flex-1 h-8 bg-white rounded-lg text-xs border-gray-300"><SelectValue placeholder="-" /></SelectTrigger>
                    <SelectContent>{filteredCategories?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={() => setModalCategoria({ open: true, name: '' })} className="h-8 w-8 bg-white border-gray-300"><PlusCircle className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>

            {/* Fila 3: Unidad, Compuesto, Activo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Unidad</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="h-8 bg-white rounded-lg text-xs border-gray-300"><SelectValue /></SelectTrigger>
                  <SelectContent>{unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 px-2 bg-white rounded-lg border border-gray-300">
                <Switch checked={formData.isComposite} onCheckedChange={(v) => setFormData({ ...formData, isComposite: v })} className="scale-75" />
                <Label className="text-[9px] font-bold text-gray-600">Producto Compuesto</Label>
              </div>
              <div className="flex items-center gap-2 px-2 bg-white rounded-lg border border-gray-300">
                <Switch checked={formData.active} onCheckedChange={(v) => setFormData({ ...formData, active: v })} className="scale-75" />
                <Label className="text-[9px] font-bold text-gray-600">Producto Activo</Label>
              </div>
            </div>

            {/* Fila 4: Precios */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded-lg border border-gray-300">
              <div>
                <Label className="text-[8px] font-bold uppercase text-gray-500">Costo USD</Label>
                <Input type="number" step="0.01" value={costPrice} onChange={(e) => updateCost(parseFloat(e.target.value) || 0)} className="h-7 text-xs bg-gray-100 rounded-lg" />
              </div>
              <div>
                <Label className="text-[8px] font-bold uppercase text-gray-500">% Margen</Label>
                <Input type="number" step="1" value={marginOnSale} onChange={(e) => updateMarginOnSale(parseFloat(e.target.value) || 0)} className="h-7 text-xs bg-gray-100 rounded-lg" />
                <span className="text-[8px] text-gray-400">costo: {Math.round(marginOnCost)}%</span>
              </div>
              <div>
                <Label className="text-[8px] font-bold uppercase text-gray-500">Precio USD</Label>
                <Input type="number" step="0.01" value={formatNumber(priceUSD)} onChange={(e) => updatePriceUSD(parseFloat(e.target.value) || 0)} className="h-7 text-xs bg-gray-100 rounded-lg font-bold text-[#c9a227]" />
              </div>
              <div>
                <Label className="text-[8px] font-bold uppercase text-gray-500">Precio Bs</Label>
                <Input type="number" step="0.01" value={formatNumber(priceVES)} onChange={(e) => updatePriceVES(parseFloat(e.target.value) || 0)} className="h-7 text-xs bg-gray-100 rounded-lg font-bold" />
              </div>
            </div>

            {/* Fila 5: IVA */}
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-300">
              <div className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-gray-500"/><span className="text-[10px] font-medium">Aplicar IVA</span></div>
              <Switch checked={formData.hasIVA} onCheckedChange={(v) => setFormData({ ...formData, hasIVA: v })} className="scale-75" />
              {formData.hasIVA && <Input type="number" step="0.1" value={formData.ivaRate} onChange={(e) => setFormData({ ...formData, ivaRate: parseFloat(e.target.value) || 0 })} className="w-16 h-7 text-xs bg-gray-100 rounded-lg" />}
              {formData.hasIVA && <span className="text-[9px] text-gray-500">%</span>}
            </div>

            {/* Fila 6: Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Stock Inicial {editingProduct && '(No editable)'}</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} disabled={!!editingProduct} className="h-8 text-xs bg-gray-300 rounded-lg" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Stock Mínimo</Label>
                <Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} className="h-8 text-xs bg-white rounded-lg" />
              </div>
            </div>

            {/* Fila 7: Descripción */}
            <div className="space-y-0.5">
              <Label className="text-[9px] font-bold uppercase text-gray-600">Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Opcional" className="text-xs bg-white rounded-lg" />
            </div>

            {/* Producto Compuesto */}
            {formData.isComposite && (
              <div className="space-y-2 p-2 bg-white rounded-lg border border-gray-300">
                <Label className="text-[9px] font-bold uppercase text-gray-600">Componentes del Kit</Label>
                <div className="flex gap-1">
                  <Select value={selectedProductForComposite?.toString() || ''} onValueChange={(v) => setSelectedProductForComposite(parseInt(v))}>
                    <SelectTrigger className="flex-1 h-7 bg-gray-100 rounded-lg text-xs"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    <SelectContent>{availableProducts.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Cant" value={compositeQuantity} onChange={(e) => setCompositeQuantity(parseInt(e.target.value) || 1)} className="w-16 h-7 text-xs bg-gray-100 rounded-lg" />
                  <Button size="sm" variant="outline" onClick={addCompositeItem} disabled={!selectedProductForComposite} className="h-7 px-2"><Plus className="w-3 h-3" /></Button>
                </div>
                <div className="flex items-center gap-2"><Switch checked={useOwnStock} onCheckedChange={setUseOwnStock} className="scale-75"/><span className="text-[9px]">Usar stock propio</span></div>
                {compositeItems.length > 0 && <div className="space-y-1 max-h-24 overflow-auto">{compositeItems.map((item, idx) => (<div key={idx} className="flex justify-between items-center p-1 bg-gray-100 rounded"><span className="text-xs">{item.productName} x{item.quantity}</span><button onClick={() => removeCompositeItem(idx)} className="text-red-500"><Trash2 className="w-3 h-3" /></button></div>))}</div>}
              </div>
            )}

            {/* Precios Alternativos */}
            <div className="space-y-2 p-2 bg-white rounded-lg border border-gray-300">
              <Label className="text-[9px] font-bold uppercase text-gray-600">Precios Alternativos</Label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { id: 'wholesale', label: 'Precio Mayor' },
                  { id: 'offer', label: 'Precio Oferta' },
                  { id: 'promotion', label: 'Promoción' },
                  { id: 'alternate1', label: 'Precio 1' }
                ].map(t => (
                  <Button key={t.id} size="sm" variant="outline" onClick={() => addAlternatePrice(t.id)} className="h-6 text-[9px] px-2 bg-gray-100 border-gray-300">{t.label}</Button>
                ))}
              </div>
              {alternatePrices.length > 0 && <div className="space-y-1">{alternatePrices.map((p, i) => (<div key={i} className="flex justify-between items-center p-1 bg-gray-100 rounded"><span className="text-xs font-medium">{p.type === 'wholesale' ? 'Mayor' : p.type === 'offer' ? 'Oferta' : p.type === 'promotion' ? 'Promo' : 'Alt 1'}</span><span className="text-xs">{formatMoney(p.priceVES)}</span><button onClick={() => removeAlternatePrice(i)} className="text-red-500"><Trash2 className="w-3 h-3" /></button></div>))}</div>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-gray-300 bg-gray-200">
            <Button size="sm" variant="outline" onClick={onClose} className="rounded-lg text-xs border-gray-400">Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} className="bg-[#0a1628] hover:bg-[#1e3a5f] text-white rounded-lg text-xs font-bold"><Check className="w-3 h-3 mr-1" />{editingProduct ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales con Dialog de shadcn para que funcionen correctamente */}
      <Dialog open={modalMarca.open} onOpenChange={(open) => !open && setModalMarca({ open: false, name: '' })}>
        <DialogContent className="max-w-md bg-gray-200">
          <DialogTitle className="text-[#0a1628]">Nueva Marca</DialogTitle>
          <Input 
            value={modalMarca.name} 
            onChange={(e) => setModalMarca(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre de la marca"
            className="bg-white"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateMarca()}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalMarca({ open: false, name: '' })}>Cancelar</Button>
            <Button onClick={handleCreateMarca} className="bg-[#0a1628]">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalDepto.open} onOpenChange={(open) => !open && setModalDepto({ open: false, name: '' })}>
        <DialogContent className="max-w-md bg-gray-200">
          <DialogTitle className="text-[#0a1628]">Nuevo Departamento</DialogTitle>
          <Input 
            value={modalDepto.name} 
            onChange={(e) => setModalDepto(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre del departamento"
            className="bg-white"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateDepto()}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalDepto({ open: false, name: '' })}>Cancelar</Button>
            <Button onClick={handleCreateDepto} className="bg-[#0a1628]">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalCategoria.open} onOpenChange={(open) => !open && setModalCategoria({ open: false, name: '' })}>
        <DialogContent className="max-w-md bg-gray-200">
          <DialogTitle className="text-[#0a1628]">Nueva Categoría</DialogTitle>
          <Input 
            value={modalCategoria.name} 
            onChange={(e) => setModalCategoria(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre de la categoría"
            className="bg-white"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategoria()}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalCategoria({ open: false, name: '' })}>Cancelar</Button>
            <Button onClick={handleCreateCategoria} className="bg-[#0a1628]">Crear</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Edit, Trash2, Barcode, History, 
  TrendingUp, LayoutGrid, Tag, Tags, Eye, Printer, 
  Download, Upload, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatMoney } from '@/utils/format';
import { ProductForm } from './Inventory/ProductForm';

interface InventoryProps {
  store: any;
  updateStore: any;
  formatMoney: (amount: number) => string;
}

export default function InventoryModule({ store, updateStore, formatMoney: formatMoneyFn }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [viewingKardex, setViewingKardex] = useState<any | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<any | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    let products = store.products || [];
    if (searchTerm) {
      products = products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return products;
  }, [store.products, searchTerm]);

  const productKardex = viewingKardex 
    ? (store.kardex || []).filter((k: any) => k.productId === viewingKardex.id).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const handleAdjustStock = () => {
    if (!adjustingStock) return;
    updateStore((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any) => 
        p.id === adjustingStock.id ? { ...p, stock: adjustmentQuantity } : p
      ),
      kardex: [
        ...(prev.kardex || []),
        {
          id: Date.now(),
          productId: adjustingStock.id,
          productName: adjustingStock.name,
          date: new Date().toISOString(),
          type: 'adjustment',
          quantity: Math.abs(adjustmentQuantity - adjustingStock.stock),
          unitCostUSD: adjustingStock.costPrice,
          totalCostUSD: Math.abs(adjustmentQuantity - adjustingStock.stock) * adjustingStock.costPrice,
          balanceUSD: adjustmentQuantity * adjustingStock.costPrice,
          notes: adjustmentReason || 'Ajuste manual'
        }
      ]
    }));
    setAdjustingStock(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
  };

  const handleDelete = () => {
    if (deleteId) {
      updateStore((prev: any) => ({
        ...prev,
        products: prev.products.filter((p: any) => p.id !== deleteId)
      }));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0a1628] tracking-tight">Gestión de Inventario</h2>
        <Button 
          onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
          className="bg-[#0a1628] rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/20 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o código..." 
              className="pl-10 h-11 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge className="bg-[#0a1628] text-white">{filteredProducts.length} productos</Badge>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold">Código</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">Producto</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-center">Stock</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">Costo (USD)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">Precio Venta</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">Margen</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p: any) => {
                const marginPercent = p.priceUSD && p.costPrice ? ((p.priceUSD - p.costPrice) / p.priceUSD * 100).toFixed(1) : '0';
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-[#0a1628]">
                      <div className="flex items-center gap-2"><Barcode className="w-4 h-4 text-muted-foreground" />{p.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[#0a1628]">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.brandName || 'Sin marca'} | {p.unit}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={p.stock <= p.minStock ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">${p.costPrice?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold">{formatMoneyFn(p.priceVES)}</div>
                      <div className="text-[10px] text-muted-foreground">${p.priceUSD?.toFixed(2)}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#c9a227]">{marginPercent}%</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setIsFormOpen(true); }} className="hover:text-blue-600" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setViewingKardex(p)} className="hover:text-[#c9a227]" title="Ver Kardex">
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setAdjustingStock(p)} className="hover:text-orange-600" title="Ajustar Stock">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="hover:text-red-600" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay productos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal de Kardex */}
      <Dialog open={!!viewingKardex} onOpenChange={() => setViewingKardex(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#c9a227]" />
              Kardex - {viewingKardex?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productKardex.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs">{new Date(entry.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.type === 'purchase' ? 'Compra' :
                         entry.type === 'sale' ? 'Venta' :
                         entry.type === 'adjustment' ? 'Ajuste' : 'Inicial'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{entry.quantity}</TableCell>
                    <TableCell className="text-right">${entry.unitCostUSD?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${entry.totalCostUSD?.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${entry.balanceUSD?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.notes}</TableCell>
                  </TableRow>
                ))}
                {productKardex.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal de Ajuste de Stock */}
      <Dialog open={!!adjustingStock} onOpenChange={() => setAdjustingStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock - {adjustingStock?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Stock Actual</Label>
              <p className="text-2xl font-bold">{adjustingStock?.stock}</p>
            </div>
            <div>
              <Label>Nuevo Stock</Label>
              <Input 
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                placeholder="Ingrese la nueva cantidad"
              />
            </div>
            <div>
              <Label>Motivo del Ajuste</Label>
              <Input 
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Ej: Inventario físico, merma, etc."
              />
            </div>
            <Button onClick={handleAdjustStock} className="w-full bg-[#0a1628]">
              Confirmar Ajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          store={store} 
          updateStore={updateStore} 
          editingProduct={editingProduct}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
          </DialogHeader>
          <p>Esta acción no se puede deshacer. El producto será removido permanentemente.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

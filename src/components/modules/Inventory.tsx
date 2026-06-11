"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Package, 
  Tags, 
  Search, 
  Edit, 
  Trash2, 
  History, 
  BarChart3, 
  Settings2, 
  LayoutGrid, 
  Tag, 
  ArrowRightLeft,
  Barcode
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProductForm from './Inventory/ProductForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InventoryProps {
  store: any;
  updateStore: (updater: any) => void;
  formatMoney: (amount: number) => string;
}

export default function Inventory({ store, updateStore, formatMoney }: InventoryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = () => {
    if (deleteId) {
      updateStore((prev: any) => ({
        ...prev,
        products: prev.products.filter((p: any) => p.id !== deleteId)
      }));
      setDeleteId(null);
    }
  };

  const filteredProducts = store.products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateInventoryValue = (products: any[]) => {
    return products.reduce((acc, p) => acc + (p.stock * p.costUSD * store.config.exchangeRate), 0);
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

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-white p-1 border rounded-2xl mb-6 shadow-sm overflow-x-auto h-auto">
          <TabsTrigger value="products" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Package className="w-4 h-4" /> Productos
          </TabsTrigger>
          <TabsTrigger value="departments" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Departamentos
          </TabsTrigger>
          <TabsTrigger value="brands" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Tag className="w-4 h-4" /> Marcas
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Tags className="w-4 h-4" /> Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
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
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Código</th>
                    <th className="px-6 py-4 text-left">Nombre</th>
                    <th className="px-6 py-4 text-left">Stock</th>
                    <th className="px-6 py-4 text-left">Costo (USD)</th>
                    <th className="px-6 py-4 text-left">Valor Total</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#0a1628] flex items-center gap-2">
                        <Barcode className="w-4 h-4 text-muted-foreground" />
                        {p.code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0a1628]">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{p.brand} | {p.unit}</div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <Badge className={p.stock <= p.minStock ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
                          {p.stock}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">$ {p.costUSD.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-[#0a1628]">
                        {formatMoney(p.stock * p.costUSD * store.config.exchangeRate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setIsFormOpen(true); }} className="hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-[#c9a227]">
                            <History className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {['departments', 'brands', 'categories'].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {store[type].map((item: any) => {
                const productsInItem = store.products.filter((p: any) => {
                  if (type === 'departments') return p.departmentId === item.id;
                  if (type === 'brands') return p.brand === item.name;
                  if (type === 'categories') return p.categoryId === item.id;
                  return false;
                });
                const totalStock = productsInItem.reduce((acc: number, p: any) => acc + p.stock, 0);
                const value = calculateInventoryValue(productsInItem);

                return (
                  <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center justify-between">
                        {item.name}
                        <Badge className="bg-[#0a1628] text-white">{productsInItem.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Stock Total</span>
                        <span className="text-lg font-black">{totalStock}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Valor Estimado</span>
                        <span className="text-md font-bold text-[#c9a227]">{formatMoney(value)}</span>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-wider">
                        Ver Detalles <ArrowRightLeft className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {isFormOpen && (
        <ProductForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          store={store} 
          updateStore={updateStore} 
          editingProduct={editingProduct}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será removido permanentemente de su catálogo e historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

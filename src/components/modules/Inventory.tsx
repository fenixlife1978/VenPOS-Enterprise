'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InventoryModule({ store, updateStore, formatMoney }: any) {
  const [showForm, setShowForm] = useState(false);
  
  console.log("InventoryModule render, showForm:", showForm);

  const handleClick = () => {
    console.log("BOTÓN CLICKEADO!!!");
    setShowForm(true);
    alert("Botón funcionando!");
  };

  if (showForm) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Formulario de Producto</h2>
        <p>El formulario se abrió correctamente</p>
        <Button onClick={() => setShowForm(false)} className="mt-4">Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button 
          onClick={handleClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>
      <div className="bg-gray-100 p-8 text-center rounded">
        <p>Lista de productos vacía</p>
        <p className="text-sm text-gray-500 mt-2">Prueba: {store.products?.length || 0} productos</p>
      </div>
    </div>
  );
}

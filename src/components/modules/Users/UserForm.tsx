'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Shield, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User } from '@/lib/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  updateStore: any;
  editingUser?: User | null;
}

export const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, updateStore, editingUser }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'cashier' as User['role'],
    active: true
  });

  useEffect(() => {
    if (editingUser && isOpen) {
      setFormData({
        fullName: editingUser.fullName,
        username: editingUser.username,
        password: editingUser.password,
        role: editingUser.role,
        active: editingUser.active
      });
    } else if (isOpen) {
      setFormData({
        fullName: '',
        username: '',
        password: '',
        role: 'cashier',
        active: true
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = () => {
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert('Por favor complete todos los campos de seguridad');
      return;
    }

    const userData = {
      id: editingUser?.id || Date.now(),
      ...formData,
      lastLogin: editingUser?.lastLogin || null
    };

    updateStore((prev: any) => {
      const users = [...(prev.users || [])];
      if (editingUser) {
        const index = users.findIndex(u => u.id === editingUser.id);
        if (index !== -1) users[index] = userData;
      } else {
        // Verificar si el nombre de usuario ya existe
        if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
          alert('El nombre de usuario ya está en uso');
          return prev;
        }
        users.push(userData);
      }
      return { ...prev, users };
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 rounded-xl overflow-hidden bg-[#d4d4d4] border-gray-400">
        <DialogTitle className="sr-only">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        
        <div className="bg-[#0a1628] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a227] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#0a1628]" />
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-tight">
              {editingUser ? 'Configuración de Usuario' : 'Registro de Personal'}
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-black ml-1">Nombre Completo</Label>
              <Input 
                value={formData.fullName}
                onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                className="h-11 bg-gray-50 border-gray-200 focus:border-[#c9a227] rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-black ml-1">ID de Usuario</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    placeholder="usuario"
                    className="h-11 pl-10 bg-gray-50 border-gray-200 focus:border-[#c9a227] rounded-xl font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-black ml-1">Contraseña</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="h-11 pl-10 bg-gray-50 border-gray-200 focus:border-[#c9a227] rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-black ml-1">Rol Operativo</Label>
                <Select value={formData.role} onValueChange={(v: any) => setFormData(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-200 rounded-xl font-bold">
                    <SelectValue placeholder="Seleccione Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="cashier">Cajero</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="kitchen">Cocina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-black ml-1">Estado de Acceso</Label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 h-11 border border-gray-200">
                  <Switch 
                    checked={formData.active} 
                    onCheckedChange={(v) => setFormData(p => ({ ...p, active: v }))} 
                    className="scale-90"
                  />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {formData.active ? 'Habilitado' : 'Suspendido'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-gray-400 bg-white font-black uppercase text-xs text-black"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 h-12 rounded-xl bg-[#0a1628] hover:bg-[#1e3a5f] font-black uppercase text-xs text-white shadow-lg"
            >
              <Save className="w-4 h-4 mr-2 text-[#c9a227]" />
              {editingUser ? 'Actualizar Datos' : 'Registrar Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginProps {
  onLogin: (u: string, p: string) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) alert('Credenciales incorrectas');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0a1628] flex items-center justify-center z-[10000] p-4">
      <div className="w-full max-w-[900px] flex flex-col md:flex-row bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Brand Section */}
        <div className="md:w-[45%] bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Subtle overlay decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a227] opacity-[0.05] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 bg-white/10 border-2 border-[#c9a227] rounded-[24px] flex items-center justify-center text-4xl text-[#c9a227] shadow-xl">
              <ShoppingCart className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter">VenPOS</h1>
              <p className="text-white/60 font-light text-sm">Sistema de Punto de Venta Profesional</p>
            </div>

            <ul className="space-y-4">
              {['Gestión completa de inventario', 'Facturación con IVA e IGTF', 'Múltiples métodos de pago', 'Reportes con Inteligencia Artificial'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="max-w-[340px] mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1a1a2e]">Bienvenido</h2>
              <p className="text-sm text-muted-foreground">Inicie sesión para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#1a1a2e] tracking-widest">Usuario</label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border focus-visible:ring-[#1e3a5f]" 
                  placeholder="Ingrese su usuario"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#1a1a2e] tracking-widest">Contraseña</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-2 border-border focus-visible:ring-[#1e3a5f]" 
                  placeholder="Ingrese su contraseña"
                />
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] text-white font-black uppercase tracking-widest shadow-lg shadow-[#0a1628]/20 border-none hover:scale-[1.02] transition-transform">
                Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/50 space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                Demo Admin: <span className="text-[#1a1a2e]">admin / admin</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                Demo Cajero: <span className="text-[#1a1a2e]">cajero / cajero</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

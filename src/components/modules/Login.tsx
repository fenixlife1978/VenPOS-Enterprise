import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  UserCircle, 
  Utensils,
  ArrowLeft,
  Wallet,
  DollarSign,
  TrendingUp,
  KeyRound,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginProps {
  onLogin: (u: string, p: string, o?: any) => boolean;
  store?: any;
}

type RoleType = 'admin' | 'cashier' | 'kitchen' | null;

export default function Login({ onLogin, store }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para apertura de caja
  const [initialVES, setInitialVES] = useState('');
  const [initialUSD, setInitialUSD] = useState('');
  const [rate, setRate] = useState('');

  useEffect(() => {
    if (store?.config?.exchangeRate) {
      setRate(store.config.exchangeRate.toString());
    }
  }, [store]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let openingData = null;
    if (selectedRole === 'cashier' && !store?.config?.cashDrawer?.isOpen) {
      const parsedVES = parseFloat(initialVES) || 0;
      const parsedUSD = parseFloat(initialUSD) || 0;
      
      if (parsedVES === 0 && parsedUSD === 0) {
        setError(true);
        return;
      }

      openingData = {
        id: Date.now(),
        openingDate: new Date().toISOString(),
        initialVES: parsedVES,
        initialUSD: parsedUSD,
        exchangeRate: parseFloat(rate) || store?.config?.exchangeRate || 0,
        sales: [],
        movements: [{
          id: Date.now(),
          type: 'opening',
          amountVES: parsedVES,
          amountUSD: parsedUSD,
          description: 'Apertura de caja al iniciar sesión',
          createdAt: new Date().toISOString()
        }]
      };
    }

    const success = onLogin(username, password, openingData);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const roleConfig = {
    admin: { title: 'Administración', icon: ShieldCheck, color: 'from-[#c9a227] to-[#d4b43a]', defaultUser: 'admin' },
    cashier: { title: 'Cajero / Ventas', icon: UserCircle, color: 'from-[#0a1628] to-[#1e3a5f]', defaultUser: 'cajero' },
    kitchen: { title: 'Cocina / Comandas', icon: Utensils, color: 'from-[#10b981] to-[#059669]', defaultUser: 'cocina' }
  };

  const selectRole = (role: RoleType) => {
    if (role) {
      setSelectedRole(role);
      setUsername(roleConfig[role].defaultUser);
      setPassword(role === 'kitchen' ? '123' : role);
      setError(false);
    }
  };

  const isCashOpeningRequired = selectedRole === 'cashier' && !store?.config?.cashDrawer?.isOpen;

  return (
    <div className="fixed inset-0 bg-[#f0f2f5] flex items-center justify-center z-[10000] p-4 font-body">
      <div className="w-full max-w-[1000px] flex flex-col md:row bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Lado Izquierdo: Branding & Info */}
        <div className="md:w-[40%] bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a227] opacity-[0.05] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-[0.02] rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl backdrop-blur-md">
              <ShoppingCart className="w-8 h-8 text-[#c9a227]" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter">VenPOS</h1>
              <p className="text-white/60 font-medium text-sm uppercase tracking-widest">Corporativo v3.0</p>
            </div>

            <div className="h-1 w-12 bg-[#c9a227] rounded-full"></div>
            
            <p className="text-white/80 text-sm leading-relaxed">
              Gestione su inventario, ventas y personal con la potencia de la inteligencia artificial.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {['Cifrado de grado bancario', 'Soporte 24/7 Premium', 'Respaldos en la nube'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-[11px] font-black uppercase text-[#c9a227] tracking-tighter">
                <CheckCircle2 className="w-4 h-4" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Lado Derecho: Contenido Dinámico */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative overflow-y-auto">
          
          {!selectedRole ? (
            /* PASO 1: Selección de Rol */
            <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-[#0a1628] tracking-tighter">Acceso al Sistema</h2>
                <p className="text-muted-foreground text-sm font-medium">Seleccione su departamento para continuar</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map((role) => (
                  <button
                    key={role}
                    onClick={() => selectRole(role)}
                    className="group relative flex items-center gap-6 p-6 rounded-3xl border-2 border-transparent bg-[#f8fafc] hover:bg-white hover:border-[#c9a227] hover:shadow-xl hover:shadow-[#c9a227]/10 transition-all duration-300 text-left"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500",
                      roleConfig[role].color
                    )}>
                      {React.createElement(roleConfig[role].icon, { className: "w-7 h-7" })}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-[#c9a227] tracking-widest mb-0.5">Entrada</p>
                      <p className="text-lg font-black text-[#0a1628]">{roleConfig[role].title}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#c9a227] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* PASO 2: Formulario de Login / Apertura */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-10 duration-500">
              <button 
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-xs font-black uppercase text-[#0a1628]/40 hover:text-[#c9a227] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al selector
              </button>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md",
                  roleConfig[selectedRole].color
                )}>
                  {isCashOpeningRequired ? <Lock className="w-6 h-6" /> : React.createElement(roleConfig[selectedRole].icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#0a1628] tracking-tight">
                    {isCashOpeningRequired ? 'Apertura de Caja' : roleConfig[selectedRole].title}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    {isCashOpeningRequired ? 'Ingrese fondos iniciales y contraseña' : 'Ingrese sus credenciales de seguridad'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isCashOpeningRequired ? (
                  /* Formulario especializado de Apertura */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Fondo Inicial (Bs.)</Label>
                        <div className="relative">
                          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            type="number"
                            value={initialVES}
                            onChange={e => setInitialVES(e.target.value)}
                            placeholder="0,00"
                            className="h-12 rounded-xl border-2 border-slate-100 bg-[#f8fafc] focus:bg-white focus:border-[#0a1628] focus-visible:ring-0 pl-11 text-sm font-bold transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Fondo Inicial (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            type="number"
                            step="0.01"
                            value={initialUSD}
                            onChange={e => setInitialUSD(e.target.value)}
                            placeholder="0,00"
                            className="h-12 rounded-xl border-2 border-slate-100 bg-[#f8fafc] focus:bg-white focus:border-[#0a1628] focus-visible:ring-0 pl-11 text-sm font-bold transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Tasa BCV del Día</Label>
                      <div className="relative">
                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a227]" />
                        <Input 
                          type="number"
                          step="0.01"
                          value={rate}
                          onChange={e => setRate(e.target.value)}
                          className="h-12 rounded-xl border-2 border-[#c9a227]/20 bg-[#fdfaf3] focus:bg-white focus:border-[#c9a227] focus-visible:ring-0 pl-11 text-lg font-black transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Confirmar con Contraseña</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-xl border-2 border-slate-100 bg-[#f8fafc] focus:bg-white focus:border-[#0a1628] focus-visible:ring-0 pl-11 pr-11 text-sm font-bold transition-all" 
                          placeholder="••••••••"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a1628]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Formulario de Login Estándar */
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Usuario de Sistema</label>
                      <Input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-14 rounded-2xl border-2 border-slate-100 bg-[#f8fafc] focus:bg-white focus:border-[#0a1628] focus-visible:ring-0 text-sm font-bold px-6 transition-all" 
                        placeholder="Ej. admin_01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#0a1628] tracking-widest ml-1">Contraseña de Seguridad</label>
                      <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 rounded-2xl border-2 border-slate-100 bg-[#f8fafc] focus:bg-white focus:border-[#0a1628] focus-visible:ring-0 text-sm font-bold px-6 transition-all" 
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase text-center border border-red-100 animate-shake">
                    Acceso denegado: {isCashOpeningRequired ? 'Ingrese fondos válidos y contraseña correcta' : 'Credenciales inválidas'}
                  </div>
                )}

                <Button type="submit" className="w-full h-14 rounded-2xl bg-[#0a1628] hover:bg-[#1e3a5f] text-white font-black uppercase tracking-[0.1em] shadow-xl shadow-[#0a1628]/20 border-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  {isCashOpeningRequired ? 'Abrir Caja e Iniciar' : 'Iniciar Sesión'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <span>Sesión Protegida VenPOS</span>
                <span className="text-[#c9a227]">Actualizado: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer corporativo */}
      <div className="fixed bottom-8 text-[10px] font-black uppercase text-[#0a1628]/30 tracking-widest flex items-center gap-4">
        <span>© 2024 VenPOS Corporativo</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span>BCV: {store?.config?.exchangeRate || 36.50} Bs.</span>
      </div>
    </div>
  );
}

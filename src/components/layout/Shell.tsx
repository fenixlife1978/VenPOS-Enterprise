"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  Users, 
  FileText, 
  TrendingUp, 
  Shield, 
  Settings, 
  LogOut, 
  Menu,
  ChevronRight,
  User as UserIcon,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ShellProps {
  currentUser: User | null;
  activeModule: string;
  setActiveModule: (m: string) => void;
  currency: 'VES' | 'USD';
  setCurrency: (c: 'VES' | 'USD') => void;
  logout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (b: boolean) => void;
  children: React.ReactNode;
  exchangeRate: number;
}

export default function Shell({
  currentUser,
  activeModule,
  setActiveModule,
  currency,
  setCurrency,
  logout,
  isSidebarOpen,
  setIsSidebarOpen,
  children,
  exchangeRate
}: ShellProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'sales', label: 'Ventas', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: TrendingUp },
    { id: 'users', label: 'Usuarios', icon: Shield },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.id === activeModule);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Collapsible Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-[264px] bg-[#0a1628] flex flex-col z-50 transition-all duration-300 shadow-2xl",
        !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="p-7 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c9a227] rounded-xl flex items-center justify-center text-[#0a1628] text-xl font-bold shadow-lg">V</div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-tight">VenPOS</span>
              <span className="text-[#c9a227] text-[10px] font-bold uppercase tracking-widest">Corporativo</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group",
                activeModule === item.id 
                  ? "bg-gradient-to-r from-[#c9a227]/10 to-transparent text-[#c9a227] border-l-4 border-[#c9a227]" 
                  : "text-white/40 hover:bg-white/5 hover:text-white/80 border-l-4 border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", activeModule === item.id ? "text-[#c9a227]" : "text-white/20 group-hover:text-white/60")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a227] to-[#d4b43a] flex items-center justify-center text-[#0a1628] font-black text-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{currentUser.fullName}</p>
              <p className="text-[#c9a227] text-[9px] font-black uppercase tracking-tighter">{currentUser.role}</p>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isSidebarOpen ? "md:ml-[264px]" : "ml-0"
      )}>
        {/* Modern Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-muted rounded-xl bg-white shadow-sm border transition-all">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter text-[#0a1628]">{getPageTitle()}</h1>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  <Clock className="w-3 h-3" /> {time.toLocaleTimeString()} • {time.toLocaleDateString()}
                </div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-4 bg-[#f5efe0] px-4 py-2 rounded-xl border border-[#c9a227]/20">
                <RefreshCw className="w-4 h-4 text-[#c9a227]" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Tasa BCV</span>
                  <span className="text-sm font-black text-[#0a1628]">1 USD = {exchangeRate.toFixed(2)} Bs.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-muted/30 border border-border rounded-xl">
              <button onClick={() => setCurrency('VES')} className={cn("px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", currency === 'VES' ? "bg-[#0a1628] text-white shadow-md" : "text-muted-foreground")}>Bs.</button>
              <button onClick={() => setCurrency('USD')} className={cn("px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", currency === 'USD' ? "bg-[#0a1628] text-white shadow-md" : "text-muted-foreground")}>USD</button>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-xl border shadow-sm">
              <UserIcon className="w-4 h-4 text-[#c9a227]" />
              <span className="text-xs font-black text-[#0a1628] uppercase">{currentUser.username}</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { 
  PieChart, 
  ShoppingCart, 
  Boxes, 
  Tags, 
  Users, 
  FileText, 
  BarChart3, 
  UserRound, 
  Settings, 
  LogOut, 
  Menu,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

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
  children
}: ShellProps) {
  if (!currentUser) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
    { id: 'products', label: 'Productos', icon: Boxes },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'sales', label: 'Ventas', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: UserRound },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.id === activeModule);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-[264px] bg-[#0a1628] flex flex-col z-50 transition-transform duration-300",
        !isSidebarOpen && "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#d4b43a] rounded-xl flex items-center justify-center text-[#0a1628] text-xl font-bold shadow-lg">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-tight">VenPOS</span>
              <span className="text-[#c9a227] text-[10px] font-bold uppercase tracking-widest">Sistema Corporativo</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                activeModule === item.id 
                  ? "bg-gradient-to-r from-[#c9a227]/10 to-transparent text-[#c9a227] border-l-4 border-[#c9a227]" 
                  : "text-white/50 hover:bg-white/5 hover:text-white/80 border-l-4 border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] flex items-center justify-center text-white font-bold text-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{currentUser.fullName}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-tighter">{currentUser.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-red-400 transition-colors">
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
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-muted rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white border border-border rounded-xl shadow-sm">
              <button 
                onClick={() => setCurrency('VES')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  currency === 'VES' ? "bg-[#0a1628] text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Bs.
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  currency === 'USD' ? "bg-[#0a1628] text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                USD
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
              <UserIcon className="w-4 h-4 text-[#c9a227]" />
              <span className="text-xs font-bold text-[#1a1a2e]">{currentUser.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}

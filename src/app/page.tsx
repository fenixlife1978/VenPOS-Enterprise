"use client";

import React, { useEffect } from 'react';
import { useVenPos } from '@/hooks/useVenPos';
import Login from '@/components/modules/Login';
import DashboardAdmin from '@/components/modules/DashboardAdmin';
import POS from '@/components/modules/POS';
import Reports from '@/components/modules/Reports';
import Inventory from '@/components/modules/Inventory';

export default function HomePage() {
  const {
    store,
    updateStore,
    currentUser,
    activeModule,
    setActiveModule,
    currency,
    login,
    logout,
    addSale,
    formatMoney,
  } = useVenPos();

  useEffect(() => {
    if (currentUser?.role === 'cashier' && activeModule !== 'pos') {
      setActiveModule('pos');
    }
  }, [currentUser, activeModule, setActiveModule]);

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  if (currentUser.role === 'cashier') {
    return (
      <div className="h-screen overflow-hidden bg-[#f0f2f5]">
        <POS 
          store={store}
          currency={currency}
          formatMoney={formatMoney}
          addSale={addSale}
          updateStore={updateStore}
          currentUser={currentUser}
          onLogout={logout}
        />
      </div>
    );
  }

  // Admin: pasar updateStore al DashboardAdmin
  return (
    <DashboardAdmin 
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      onLogout={logout}
      store={store}
      currentUser={currentUser}
      formatMoney={formatMoney}
      updateStore={updateStore}
    />
  );
}

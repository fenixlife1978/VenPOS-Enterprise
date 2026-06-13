// src/utils/format.ts

export const formatMoney = (amount: number, currency: 'VES' | 'USD' = 'VES'): string => {
    if (isNaN(amount)) amount = 0;
    
    if (currency === 'USD') {
      return `$ ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    
    return `Bs. ${amount.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  
  export const convertPrice = (
    priceVES: number, 
    priceUSD: number, 
    targetCurrency: 'VES' | 'USD', 
    exchangeRate: number
  ): number => {
    if (targetCurrency === 'USD') {
      return priceUSD || (priceVES / exchangeRate);
    }
    return priceVES || (priceUSD * exchangeRate);
  };
  
  export const parseMoney = (value: string): number => {
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };
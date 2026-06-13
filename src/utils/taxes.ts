// src/utils/taxes.ts

interface TaxResult {
    iva: number;
    igtf: number;
    total: number;
  }
  
  export const calculateTaxes = (
    subtotalVES: number,
    subtotalUSD: number,
    paymentMethod: string,
    exchangeRate: number,
    ivaRate: number,
    igtfRate: number
  ): TaxResult => {
    const iva = subtotalVES * (ivaRate / 100);
    
    let igtf = 0;
    // IGTF solo se aplica a pagos en divisas (USD)
    if (paymentMethod === 'usd' || paymentMethod === 'mixed') {
      igtf = subtotalUSD * (igtfRate / 100) * exchangeRate;
    }
    
    const total = subtotalVES + iva + igtf;
    
    return { iva, igtf, total };
  };
  
  export const calculateChange = (total: number, received: number): number => {
    return received - total;
  };
  
  export const isValidPayment = (total: number, received: number, method: string): boolean => {
    if (method === 'cash') {
      return received >= total;
    }
    return true;
  };
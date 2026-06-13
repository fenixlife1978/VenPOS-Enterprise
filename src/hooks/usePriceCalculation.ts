import { useState, useCallback, useEffect } from 'react';

interface PriceCalculationState {
  costPrice: number;
  profitPercentage: number;
  priceUSD: number;
  priceVES: number;
  exchangeRate: number;
  ivaRate: number;
  hasIVA: boolean;
}

export const usePriceCalculation = (initialState: Partial<PriceCalculationState> = {}) => {
  const [state, setState] = useState<PriceCalculationState>({
    costPrice: initialState.costPrice || 0,
    profitPercentage: initialState.profitPercentage || 30,
    priceUSD: initialState.priceUSD || 0,
    priceVES: initialState.priceVES || 0,
    exchangeRate: initialState.exchangeRate || 36.5,
    ivaRate: initialState.ivaRate || 16,
    hasIVA: initialState.hasIVA ?? true
  });
  
  const calculateFromCost = useCallback((cost: number, profit: number) => {
    const profitMultiplier = 1 + (profit / 100);
    let priceVES = cost * profitMultiplier;
    if (state.hasIVA) {
      priceVES = priceVES * (1 + state.ivaRate / 100);
    }
    const priceUSD = priceVES / state.exchangeRate;
    return { priceVES, priceUSD };
  }, [state.hasIVA, state.ivaRate, state.exchangeRate]);
  
  const calculateFromPriceVES = useCallback((priceVES: number) => {
    let basePrice = priceVES;
    if (state.hasIVA) {
      basePrice = priceVES / (1 + state.ivaRate / 100);
    }
    const profitPercentage = ((basePrice - state.costPrice) / state.costPrice) * 100;
    const priceUSD = priceVES / state.exchangeRate;
    return { profitPercentage, priceUSD };
  }, [state.costPrice, state.hasIVA, state.ivaRate, state.exchangeRate]);
  
  const calculateFromPriceUSD = useCallback((priceUSD: number) => {
    const priceVES = priceUSD * state.exchangeRate;
    let basePrice = priceVES;
    if (state.hasIVA) {
      basePrice = priceVES / (1 + state.ivaRate / 100);
    }
    const profitPercentage = ((basePrice - state.costPrice) / state.costPrice) * 100;
    return { profitPercentage, priceVES };
  }, [state.costPrice, state.hasIVA, state.ivaRate, state.exchangeRate]);
  
  const updateCost = useCallback((costPrice: number) => {
    setState(prev => ({ ...prev, costPrice }));
    const { priceVES, priceUSD } = calculateFromCost(costPrice, state.profitPercentage);
    setState(prev => ({ ...prev, priceVES, priceUSD }));
  }, [state.profitPercentage, calculateFromCost]);
  
  const updateProfit = useCallback((profitPercentage: number) => {
    setState(prev => ({ ...prev, profitPercentage }));
    const { priceVES, priceUSD } = calculateFromCost(state.costPrice, profitPercentage);
    setState(prev => ({ ...prev, priceVES, priceUSD }));
  }, [state.costPrice, calculateFromCost]);
  
  const updatePriceVES = useCallback((priceVES: number) => {
    setState(prev => ({ ...prev, priceVES }));
    const { profitPercentage, priceUSD } = calculateFromPriceVES(priceVES);
    setState(prev => ({ ...prev, profitPercentage, priceUSD }));
  }, [calculateFromPriceVES]);
  
  const updatePriceUSD = useCallback((priceUSD: number) => {
    setState(prev => ({ ...prev, priceUSD }));
    const { profitPercentage, priceVES } = calculateFromPriceUSD(priceUSD);
    setState(prev => ({ ...prev, profitPercentage, priceVES }));
  }, [calculateFromPriceUSD]);
  
  const updateExchangeRate = useCallback((exchangeRate: number) => {
    setState(prev => ({ ...prev, exchangeRate }));
    const priceUSD = state.priceVES / exchangeRate;
    setState(prev => ({ ...prev, priceUSD }));
  }, [state.priceVES]);
  
  return {
    ...state,
    updateCost,
    updateProfit,
    updatePriceVES,
    updatePriceUSD,
    updateExchangeRate,
    calculateFromCost,
    calculateFromPriceVES,
    calculateFromPriceUSD
  };
};

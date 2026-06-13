export interface Brand {
  id: number;
  name: string;
  description: string;
}

export interface AlternatePrice {
  type: 'wholesale' | 'cost' | 'offer' | 'promotion' | 'alternate1';
  priceVES: number;
  priceUSD: number;
  minQuantity?: number;
}

export interface ProductFormData {
  id?: number;
  code: string;
  name: string;
  brandId: number;
  unit: string;
  departmentId: number;
  categoryId: number;
  stock: number;
  minStock: number;
  isComposite: boolean;
  compositeItems: CompositeItem[];
  costPrice: number;
  profitPercentage: number;
  priceUSD: number;
  priceVES: number;
  hasIVA: boolean;
  ivaRate: number;
  alternatePrices: AlternatePrice[];
  active: boolean;
}

export interface CompositeItem {
  productId: number;
  productName?: string;
  quantity: number;
  useOwnStock: boolean;
}

export interface KardexEntry {
  id: number;
  productId: number;
  date: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'initial';
  quantity: number;
  unitCostVES: number;
  unitCostUSD: number;
  totalCostVES: number;
  totalCostUSD: number;
  balanceVES: number;
  balanceUSD: number;
  referenceId: number;
  notes: string;
}

export interface InventoryAdjustment {
  id: number;
  productId: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  userId: number;
}

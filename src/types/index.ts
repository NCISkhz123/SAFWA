export interface Category {
  id: string;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  product_code: string;
  category_id: string;
  supplier_price: number;
  market_price: number;
  margin_percent: number;
  promotion_cost: number;
  image_path: string | null;
  tipe: 'bordir manual' | 'bordir mesin' | 'tanpa bordir';
  motif: string;
  warna: string;
  bahan: string;
  ukuran: string;
  kelengkapan: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithCategory extends Product {
  categories?: Category;
}

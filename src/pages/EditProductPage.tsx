import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductForm } from '@/components/products/ProductForm';
import type { Product } from '@/types';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Produk tidak ditemukan');
      }

      setProduct(data as Product);
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      toast.error('Gagal memuat data produk');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center min-h-[400px] max-w-2xl mx-auto my-12 border border-white/60 dark:border-white/10">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Memuat detail produk...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">
      {/* Header with Back Button & SKU Badge */}
      <div className="flex items-start sm:items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/products')}
          aria-label="Kembali ke daftar produk"
          className="rounded-2xl h-11 w-11 glass-panel text-zinc-600 dark:text-zinc-300 hover:text-foreground active:scale-[0.95] shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Perbarui Koleksi
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-900">
              SKU: {product.product_code}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Edit {product.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perbarui informasi harga, margin target, biaya promosi, atau foto produk.
          </p>
        </div>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}

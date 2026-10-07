import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ProductForm } from '@/components/products/ProductForm';
import type { Product } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
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
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Memuat data produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null; // Handled by catch block redirect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/products')}
          aria-label="Kembali ke daftar produk"
          className="rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Produk</h1>
          <p className="text-muted-foreground">Ubah informasi produk yang sudah ada.</p>
        </div>
      </div>

      <div className="mt-6">
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}

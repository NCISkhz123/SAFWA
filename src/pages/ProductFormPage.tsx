
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '@/components/products/ProductForm';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductFormPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">
      {/* Header with Back Button */}
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
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 mb-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Entri Katalog Mode
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Tambah Koleksi Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lengkapi data produk. Sistem akan otomatis menetapkan nomor urut SKU unik berdasarkan kategori yang dipilih.
          </p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}


import { useNavigate } from 'react-router-dom';
import { ProductForm } from '@/components/products/ProductForm';
import { ArrowLeft } from 'lucide-react';
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

      </div>

      <ProductForm />
    </div>
  );
}


import { ProductForm } from '@/components/products/ProductForm';

export function ProductFormPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Produk Baru</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tambahkan produk baru ke dalam sistem inventaris.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}

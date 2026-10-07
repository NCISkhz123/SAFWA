import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Search,
  Package,
  LayoutGrid, 
  ListFilter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchProducts, deleteProduct } from '@/lib/api';
import { type ProductWithCategory } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ProductList() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat produk.';
      setError(msg);
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imagePath: string | null) => {
    try {
      await deleteProduct(id, imagePath);
      toast.success('Produk berhasil dihapus');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus produk');
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return supabase.storage.from('product_images').getPublicUrl(path).data.publicUrl;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.categories?.name && item.categories.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Unique categories for filter pills
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.categories) {
        map.set(p.categories.id, p.categories.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const getFinalPrice = (p: ProductWithCategory) => {
    const supplier = p.supplier_price || 0;
    const ppn = supplier * 0.12;
    const margin = supplier * ((p.margin_percent || 0) / 100);
    const promo = p.promotion_cost || 0;
    return Math.round(supplier + ppn + margin + promo);
  };

  // Bento Statistics


  if (error) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-destructive/20">
        <p className="text-destructive font-medium mb-4">{error}</p>
        <Button onClick={loadProducts} variant="outline" className="rounded-xl">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Bento Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">


        <Link 
          to="/products/new" 
          className={cn(
            buttonVariants({ variant: 'default' }), 
            "h-11 px-5 rounded-xl font-semibold shadow-md active:scale-[0.97] transition-all bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2"
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Produk</span>
        </Link>
      </div>



      {/* Filter & View Switcher Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-black/10 dark:border-white/15 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input 
            placeholder="Cari nama produk, SKU (cth: KM001), atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Category Pills & View Switcher */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua ({products.length})
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap active:scale-[0.97] ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Tampilan Kartu Bento"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Tampilan Tabel"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Loading / Empty / Grid / Table */}
      {loading ? (
        <div className="glass-panel rounded-3xl flex flex-col items-center justify-center p-24 text-muted-foreground border border-black/10 dark:border-white/15">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Memuat katalog produk...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl flex flex-col items-center justify-center p-16 sm:p-24 text-center border border-black/10 dark:border-white/15">
          <div className="bg-gradient-to-tr from-violet-500/10 to-rose-500/10 h-20 w-20 rounded-3xl flex items-center justify-center mb-5 border border-violet-500/20 shadow-inner">
            <Package className="h-9 w-9 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1.5">
            {searchQuery || selectedCategory !== 'all' ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            {searchQuery || selectedCategory !== 'all'
              ? 'Tidak ada produk yang cocok dengan kata kunci pencarian Anda. Coba reset filter.'
              : 'Katalog Anda masih kosong. Tambahkan produk fashion pertama Anda untuk mulai mengelola stok dan harga.'}
          </p>
          {searchQuery || selectedCategory !== 'all' ? (
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="rounded-xl border-black/10 dark:border-white/15"
            >
              Bersihkan Filter
            </Button>
          ) : (
            <Link 
              to="/products/new" 
              className={cn(buttonVariants({ variant: 'default' }), "h-11 px-6 rounded-xl font-semibold shadow-md active:scale-[0.97] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk Pertama
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const imageUrl = getImageUrl(product.image_path);
            const finalPrice = getFinalPrice(product);
            const nominalMargin = (product.supplier_price || 0) * ((product.margin_percent || 0) / 100);

            return (
              <div 
                key={product.id}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Tile */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-zinc-800/60 overflow-hidden border-b border-black/[0.04] dark:border-white/[0.06]">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon className="h-8 w-8 stroke-[1.5]" aria-hidden="true" />
                        <span className="text-[11px] font-medium tracking-wide">Tanpa Foto</span>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-950/70 text-white backdrop-blur-md shadow-sm">
                        {product.product_code}
                      </span>
                      {product.categories && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-zinc-900/80 text-foreground backdrop-blur-md shadow-sm border border-black/5 dark:border-white/10">
                          {product.categories.name}
                        </span>
                      )}
                    </div>

                    {/* Margin Badge floating on bottom edge of image */}
                    <div className="absolute bottom-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${
                        product.margin_percent >= 20
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-zinc-800/80 text-zinc-100'
                      }`}>
                        Margin {product.margin_percent}%
                      </span>
                    </div>
                  </div>

                  {/* Product Details Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                      {product.name}
                    </h3>
                    
                    {/* Spesifikasi Grid */}
                    <div className="text-[11px] text-muted-foreground grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
                      <div className="truncate" title={product.tipe}><span className="font-medium text-foreground">Bordir:</span> <span className="capitalize">{product.tipe || '-'}</span></div>
                      <div className="truncate" title={product.motif}><span className="font-medium text-foreground">Motif:</span> {product.motif || '-'}</div>
                      <div className="truncate" title={product.warna}><span className="font-medium text-foreground">Warna:</span> {product.warna || '-'}</div>
                      <div className="truncate" title={product.bahan}><span className="font-medium text-foreground">Bahan:</span> {product.bahan || '-'}</div>
                      <div className="truncate" title={product.ukuran}><span className="font-medium text-foreground">Ukuran:</span> {product.ukuran || '-'}</div>
                      <div className="truncate" title={product.kelengkapan}><span className="font-medium text-foreground">Bonus:</span> {product.kelengkapan || '-'}</div>
                    </div>

                    {/* Pricing Bento Row */}
                    <div className="bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl p-3 border border-black/[0.02] dark:border-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Modal (Supplier):</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatIDR(product.supplier_price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                        <span className="text-muted-foreground">Harga Jual:</span>
                        <span className="font-bold text-sm text-foreground tabular-nums">
                          {formatIDR(finalPrice)}
                        </span>
                      </div>
                      {nominalMargin > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>Laba Kotor:</span>
                          <span className="tabular-nums">+{formatIDR(nominalMargin)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.06] mt-2">
                  <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
                    {product.market_price ? `Info Psr: ${formatIDR(product.market_price)}` : 'Info Psr: -'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'icon' }),
                        "h-8 w-8 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.95]"
                      )}
                      aria-label={`Ubah produk ${product.name}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-destructive hover:bg-destructive/10 active:scale-[0.95]" 
                            aria-label={`Hapus produk ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialogContent className="glass-panel border-black/10 dark:border-white/15 rounded-3xl p-6 sm:p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold">Hapus Produk Ini?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                            Apakah Anda yakin ingin menghapus produk <strong>{product.name}</strong> ({product.product_code})? Seluruh data dan gambar terkait akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6 gap-2">
                          <AlertDialogCancel className="rounded-xl active:scale-[0.97]">
                            Batalkan
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id, product.image_path)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl active:scale-[0.97]"
                          >
                            Hapus Produk
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Frosted Glass Table View */
        <div className="glass-panel rounded-3xl border border-black/10 dark:border-white/15 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.06]">
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Produk & SKU</TableHead>
                <TableHead className="text-right">Modal (Supplier)</TableHead>
                <TableHead className="text-right">Harga Jual Final</TableHead>
                <TableHead className="text-right">Margin Laba</TableHead>
                <TableHead className="text-center w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const imageUrl = getImageUrl(product.image_path);
                const finalPrice = getFinalPrice(product);
                const nominalMargin = (product.supplier_price || 0) * ((product.margin_percent || 0) / 100);

                return (
                  <TableRow key={product.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell>
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 flex items-center justify-center relative border border-black/5 dark:border-white/10">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground line-clamp-1">{product.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">{product.product_code}</span>
                          {product.categories && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-foreground font-medium">
                              {product.categories.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-muted-foreground">
                      {formatIDR(product.supplier_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground">{formatIDR(finalPrice)}</span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {product.market_price ? <span>Info Psr: {formatIDR(product.market_price)}</span> : null}
                          {product.promotion_cost > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">
                              + Promo {formatIDR(product.promotion_cost)}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex flex-col items-end">
                        <Badge 
                          variant={product.margin_percent >= 20 ? 'default' : 'secondary'} 
                          className="flex w-fit rounded-lg font-bold"
                        >
                          {product.margin_percent}%
                        </Badge>
                        {nominalMargin > 0 && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            +{formatIDR(nominalMargin)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link 
                          to={`/products/${product.id}/edit`} 
                          aria-label={`Ubah ${product.name}`}
                          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground")}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                aria-label={`Hapus ${product.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <AlertDialogContent className="glass-panel border-black/10 dark:border-white/15 rounded-3xl p-6 sm:p-8">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">Hapus Produk</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                                Apakah Anda yakin ingin menghapus produk <strong>{product.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-2">
                              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(product.id, product.image_path)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

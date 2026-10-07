import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category, Product } from '@/types';
import { Loader2, ImagePlus, Sparkles, DollarSign, X, Tag } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    supplier_price: initialData?.supplier_price?.toString() || '',
    market_price: initialData?.market_price?.toString() || '',
    margin_percent: initialData?.margin_percent?.toString() || '0',
    promotion_cost: initialData?.promotion_cost?.toString() || '0',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    if (initialData?.image_path) {
      const { data } = supabase.storage.from('product_images').getPublicUrl(initialData.image_path);
      setImagePreview(data.publicUrl);
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Gagal memuat kategori produk');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, category_id: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Live Financial Calculations
  const calculations = useMemo(() => {
    const supplier = parseFloat(formData.supplier_price) || 0;
    const market = parseFloat(formData.market_price) || 0;
    const promo = parseFloat(formData.promotion_cost) || 0;
    const grossProfit = market - supplier;
    const netProfit = market - supplier - promo;
    const calculatedMargin = market > 0 ? Math.round((grossProfit / market) * 100) : 0;

    return { supplier, market, promo, grossProfit, netProfit, calculatedMargin };
  }, [formData.supplier_price, formData.market_price, formData.promotion_cost]);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Nama produk wajib diisi');
      if (!formData.category_id) throw new Error('Kategori produk wajib dipilih');
      if (!formData.supplier_price || calculations.supplier < 0) throw new Error('Harga supplier wajib valid');
      if (!formData.market_price || calculations.market < 0) throw new Error('Harga pasaran wajib valid');

      let image_path = initialData?.image_path || null;
      
      if (imageFile) {
        const new_image_path = await uploadImage(imageFile);
        if (!new_image_path) {
          throw new Error('Gagal mengunggah gambar produk');
        }
        
        if (isEditMode && initialData?.image_path) {
          try {
            await deleteImage(initialData.image_path);
          } catch (deleteErr) {
            console.error('Gagal menghapus gambar lama', deleteErr);
          }
        }
        
        image_path = new_image_path;
      }

      const payload = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        supplier_price: calculations.supplier,
        market_price: calculations.market,
        margin_percent: isEditMode ? (parseFloat(formData.margin_percent) || 0) : 0,
        promotion_cost: isEditMode ? calculations.promo : 0,
        image_path,
      };

      if (isEditMode) {
        const { error } = await supabase.from('products').update(payload).eq('id', initialData.id);
        if (error) throw error;
        toast.success('Produk berhasil diperbarui');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Produk berhasil ditambahkan ke katalog');
      }

      navigate('/products');
    } catch (error: any) {
      toast.error(error.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} produk`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === formData.category_id);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Bento Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bento Tile 1: Photo & Media Showcase (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-md relative overflow-hidden bento-glow-purple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                  <ImagePlus className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Foto Produk</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Opsional</span>
            </div>

            {/* Media Upload Area */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border-2 border-dashed border-zinc-300 dark:border-zinc-700/60 overflow-hidden flex flex-col items-center justify-center group transition-colors hover:border-primary/50">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Pratinjau Foto Produk"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <label 
                      htmlFor="product-image-input"
                      className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-semibold shadow-md cursor-pointer hover:bg-zinc-100 active:scale-[0.97] transition-all"
                    >
                      Ganti Foto
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90 active:scale-[0.97] transition-all"
                      aria-label="Hapus Foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <label 
                  htmlFor="product-image-input"
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer"
                >
                  <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground mb-3 group-hover:scale-105 transition-transform">
                    <ImagePlus className="h-7 w-7 stroke-[1.5]" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Unggah Foto Pakaian</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Klik atau seret file ke area ini. Format JPG, PNG, atau WEBP maks 5MB.
                  </p>
                </label>
              )}
              <input
                id="product-image-input"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                disabled={loading}
                className="sr-only"
                aria-label="Pilih foto produk"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] text-[11px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Foto akan otomatis disimpan aman di Supabase Storage.</span>
          </div>
        </div>

        {/* Bento Tile 2 & 3: Info & Financials (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub-Tile: Identitas Produk */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Tag className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Identitas Produk</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Produk <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Misal: Kemeja Linen Lengan Panjang"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category_id" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kategori Busana <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={handleCategoryChange} 
                  disabled={loading || categories.length === 0}
                  required
                >
                  <SelectTrigger id="category_id" className="rounded-xl glass-input h-11 text-sm">
                    <SelectValue placeholder="Pilih Kategori Busana" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel rounded-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-xl">
                        <span className="font-medium">{cat.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground font-mono">({cat.code})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SKU Generation Note Badge */}
              <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] p-3.5 border border-black/[0.02] dark:border-white/[0.04] flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Kode Produk (SKU) Otomatis:</span>{' '}
                  {isEditMode ? (
                    <span>Kode SKU tetap terkunci (<strong>{initialData?.product_code}</strong>) demi menjaga stabilitas data.</span>
                  ) : (
                    <span>
                      Dibuat oleh trigger database otomatis saat disimpan{' '}
                      {selectedCategoryObj ? `(format: ${selectedCategoryObj.code}001...)` : '(pilih kategori terlebih dahulu)'}.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tile: Finansial & Kalkulator Margin */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-md space-y-4 bento-glow-emerald">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Finansial & Margin Laba</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Real-time Calculation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="supplier_price" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Harga Supplier (Modal) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supplier_price"
                  name="supplier_price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.supplier_price}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="market_price" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Harga Pasaran (Jual) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="market_price"
                  name="market_price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.market_price}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {isEditMode && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="margin_percent" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Target Margin (%)
                    </Label>
                    <Input
                      id="margin_percent"
                      name="margin_percent"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={formData.margin_percent}
                      onChange={handleChange}
                      disabled={loading}
                      className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="promotion_cost" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Biaya Promosi / Ekstra (Rp)
                    </Label>
                    <Input
                      id="promotion_cost"
                      name="promotion_cost"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.promotion_cost}
                      onChange={handleChange}
                      disabled={loading}
                      className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Live Profit Preview Box */}
            <div className="bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground block">Estimasi Keuntungan Kotor:</span>
                <span className="text-lg font-extrabold text-foreground tabular-nums">
                  {formatIDR(calculations.grossProfit)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Margin Kotor:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${
                  calculations.calculatedMargin >= 20 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-foreground'
                }`}>
                  {calculations.calculatedMargin}%
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tile: Bottom Action Footer */}
          <div className="glass-panel rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate('/products')}
              disabled={loading}
              className="rounded-xl active:scale-[0.97]"
            >
              Batalkan
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-11 px-6 rounded-xl font-semibold shadow-md active:scale-[0.97] transition-all bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Menyimpan Produk...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

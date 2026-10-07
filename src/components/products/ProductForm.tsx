import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { Category, Product } from '@/types';
import { Loader2, Camera, DollarSign, X, Tag, List } from 'lucide-react';

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/lib/imageUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
    tipe: initialData?.tipe || 'tanpa bordir',
    motif: initialData?.motif || '',
    warna: initialData?.warna || '',
    bahan: initialData?.bahan || '',
    ukuran: initialData?.ukuran || '',
    kelengkapan: initialData?.kelengkapan || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cropper states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, category_id: value }));
    }
  };
  
  const handleTipeChange = (value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, tipe: value as 'bordir manual' | 'bordir mesin' | 'tanpa bordir' }));
    }
  };

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      streamRef.current = stream;
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error('Gagal mengakses kamera perangkat. Pastikan izin diberikan.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCropImageSrc(dataUrl);
        stopCamera();
        setIsCropModalOpen(true);
      }
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCropComplete = async () => {
    if (completedCrop && cropImageSrc) {
      try {
        const croppedFile = await getCroppedImg(cropImageSrc, completedCrop, 'product-image.webp');
        if (croppedFile) {
          setImageFile(croppedFile);
          setImagePreview(URL.createObjectURL(croppedFile));
          setIsCropModalOpen(false);
          toast.success('Foto berhasil dipotong dan dioptimasi');
        } else {
          toast.error('Gagal memproses gambar');
        }
      } catch (e) {
        toast.error('Gagal memproses gambar');
      }
    } else {
      setIsCropModalOpen(false);
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
    const marginPercent = parseFloat(formData.margin_percent) || 0;
    const promo = parseFloat(formData.promotion_cost) || 0;
    
    const ppn = supplier * 0.12; // PPN 12%
    const nominalMargin = supplier * (marginPercent / 100);
    const finalPrice = Math.round(supplier + ppn + nominalMargin + promo);

    return { supplier, market, promo, ppn, nominalMargin, finalPrice, marginPercent };
  }, [formData.supplier_price, formData.market_price, formData.promotion_cost, formData.margin_percent]);

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
      if (calculations.market < 0) throw new Error('Info Harga pasaran tidak boleh negatif');
      if (!formData.motif.trim()) throw new Error('Motif wajib diisi');
      if (!formData.warna.trim()) throw new Error('Warna wajib diisi');
      if (!formData.bahan.trim()) throw new Error('Bahan wajib diisi');
      if (!formData.ukuran.trim()) throw new Error('Ukuran wajib diisi');
      if (!formData.kelengkapan.trim()) throw new Error('Kelengkapan wajib diisi');
      if (!imageFile && !imagePreview) throw new Error('Foto produk wajib diambil/disertakan');

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
        market_price: calculations.market, // Info Harga Pasaran
        margin_percent: calculations.marginPercent,
        promotion_cost: calculations.promo,
        tipe: formData.tipe,
        motif: formData.motif.trim(),
        warna: formData.warna.trim(),
        bahan: formData.bahan.trim(),
        ukuran: formData.ukuran.trim(),
        kelengkapan: formData.kelengkapan.trim(),
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



  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Bento Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bento Tile 1: Photo & Media Showcase (5 cols) */}
        <div className="lg:col-span-5 order-last lg:order-none glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md relative overflow-hidden bento-glow-purple flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                  <Camera className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Foto Produk</h3>
              </div>
              <span className="text-[11px] text-destructive font-bold">Wajib</span>
            </div>

            {/* Media Upload Area */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border-2 border-dashed border-zinc-300 dark:border-zinc-700/60 overflow-hidden flex flex-col items-center justify-center group transition-colors hover:border-primary/50">
              {isCameraOpen ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-xl bg-black/50 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="h-12 w-12 rounded-full bg-white border-4 border-zinc-300 flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all shadow-lg"
                      aria-label="Jepret Foto"
                    >
                      <div className="h-10 w-10 rounded-full border border-black/10" />
                    </button>
                  </div>
                </>
              ) : imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Pratinjau Foto Produk"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button 
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-semibold shadow-md cursor-pointer hover:bg-zinc-100 active:scale-[0.97] transition-all"
                    >
                      Ganti Foto
                    </button>
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
                <button 
                  type="button"
                  onClick={startCamera}
                  disabled={loading}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer disabled:opacity-50"
                >
                  <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground mb-3 group-hover:scale-105 transition-transform">
                    <Camera className="h-7 w-7 stroke-[1.5]" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Ambil Foto Pakaian</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Nyalakan kamera perangkat untuk memfoto produk (otomatis crop dan hemat storage).
                  </p>
                </button>
              )}
            </div>
          </div>


        </div>

        {/* Bento Tile 2 & 3: Info & Financials (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub-Tile: Identitas Produk */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md space-y-4">
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
                    {formData.category_id ? (
                      <span className="truncate">
                        {categories.find(c => c.id === formData.category_id)?.name} 
                        <span className="ml-2 text-xs text-muted-foreground font-mono">
                          ({categories.find(c => c.id === formData.category_id)?.code})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Pilih Kategori Busana</span>
                    )}
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


            </div>
          </div>

          {/* Sub-Tile: Spesifikasi Detail */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <List className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Spesifikasi Detail</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipe" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tipe Bordir <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.tipe} onValueChange={handleTipeChange} disabled={loading} required>
                  <SelectTrigger id="tipe" className="rounded-xl glass-input h-11 text-sm">
                    {formData.tipe ? <span className="capitalize">{formData.tipe}</span> : <span className="text-muted-foreground">Pilih Tipe</span>}
                  </SelectTrigger>
                  <SelectContent className="glass-panel rounded-2xl">
                    <SelectItem value="bordir manual" className="rounded-xl">Bordir Manual</SelectItem>
                    <SelectItem value="bordir mesin" className="rounded-xl">Bordir Mesin</SelectItem>
                    <SelectItem value="tanpa bordir" className="rounded-xl">Tanpa Bordir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motif" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Motif <span className="text-destructive">*</span>
                </Label>
                <Input id="motif" name="motif" placeholder="Misal: Bunga, Kotak" value={formData.motif} onChange={handleChange} disabled={loading} required className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="warna" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Warna <span className="text-destructive">*</span>
                </Label>
                <Input id="warna" name="warna" placeholder="Misal: Putih, Merah Maroon" value={formData.warna} onChange={handleChange} disabled={loading} required className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bahan" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Bahan <span className="text-destructive">*</span>
                </Label>
                <Input id="bahan" name="bahan" placeholder="Misal: Katun, Linen" value={formData.bahan} onChange={handleChange} disabled={loading} required className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ukuran" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ukuran <span className="text-destructive">*</span>
                </Label>
                <Input id="ukuran" name="ukuran" placeholder="Misal: S, M, L, XL" value={formData.ukuran} onChange={handleChange} disabled={loading} required className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kelengkapan" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kelengkapan <span className="text-destructive">*</span>
                </Label>
                <Input id="kelengkapan" name="kelengkapan" placeholder="Misal: Kancing cadangan, Tali" value={formData.kelengkapan} onChange={handleChange} disabled={loading} required className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
            </div>
          </div>

          {/* Sub-Tile: Finansial & Kalkulator Margin */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md space-y-4 bento-glow-emerald">
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
                  Info Harga Pasaran
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
                  className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">Hanya sbg referensi (tidak masuk perhitungan).</span>
              </div>

              {isEditMode && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="margin_percent" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Target Margin Laba (%) <span className="text-destructive">*</span>
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
                      required={isEditMode}
                      className="rounded-xl glass-input h-11 text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <span className="text-[10px] text-muted-foreground">% laba dari Harga Supplier.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="promotion_cost" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Biaya Ekstra / Promo (Rp)
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

            {/* Live Profit Preview Box - Only on Edit Mode */}
            {isEditMode && (
              <div className="bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-black/[0.03] dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Modal:</span>
                      <span className="font-medium text-foreground">{formatIDR(calculations.supplier)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">PPN (12%):</span>
                      <span className="font-medium text-foreground">{formatIDR(calculations.ppn)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Margin Laba:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatIDR(calculations.nominalMargin)}</span>
                    </div>
                    {calculations.promo > 0 && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Biaya Ekstra:</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">{formatIDR(calculations.promo)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-xs text-muted-foreground block">Harga Jual Final:</span>
                    <span className="text-xl font-extrabold text-foreground tabular-nums">
                      {formatIDR(calculations.finalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status Margin:</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${
                      calculations.marginPercent >= 20 
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                        : 'bg-zinc-200 dark:bg-zinc-800 text-foreground'
                    }`}>
                      {calculations.marginPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer (Outside Grid) */}
      <div className="glass-panel rounded-2xl p-4 border border-black/10 dark:border-white/15 shadow-sm flex items-center justify-end gap-3 mt-6">
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

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-xl glass-panel border-black/10 dark:border-white/15 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle>Sesuaikan Area Foto</DialogTitle>
          </DialogHeader>
          <div className="relative mt-4 flex items-center justify-center max-h-[60vh] overflow-hidden bg-black/5 dark:bg-white/5 rounded-2xl">
            {cropImageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={4 / 3}
                className="max-h-full max-w-full"
              >
                <img 
                  src={cropImageSrc} 
                  alt="Crop preview" 
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCropModalOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button 
              type="button"
              onClick={handleCropComplete} 
              className="rounded-xl"
            >
              Crop & Simpan WebP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

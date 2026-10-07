import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category, Product } from '@/types';
import { Loader2, ImagePlus } from 'lucide-react';

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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.category_id || !formData.supplier_price || !formData.market_price) {
        throw new Error('Semua field wajib diisi');
      }

      const supplierPrice = parseFloat(formData.supplier_price);
      const marketPrice = parseFloat(formData.market_price);
      const marginPercent = parseFloat(formData.margin_percent) || 0;
      const promotionCost = parseFloat(formData.promotion_cost) || 0;

      if (supplierPrice < 0 || marketPrice < 0 || marginPercent < 0 || promotionCost < 0) {
        throw new Error('Nilai tidak boleh negatif');
      }

      let image_path = initialData?.image_path || null;
      
      if (imageFile) {
        const new_image_path = await uploadImage(imageFile);
        if (!new_image_path) {
          throw new Error('Gagal mengupload gambar');
        }
        
        // If updating and there was an old image, delete it
        if (isEditMode && initialData?.image_path) {
          try {
            await deleteImage(initialData.image_path);
          } catch (deleteErr) {
            console.error('Gagal menghapus gambar lama', deleteErr);
            // Continue with saving even if delete fails
          }
        }
        
        image_path = new_image_path;
      }

      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        supplier_price: supplierPrice,
        market_price: marketPrice,
        margin_percent: isEditMode ? marginPercent : 0,
        promotion_cost: isEditMode ? promotionCost : 0,
        image_path,
      };

      if (isEditMode) {
        const { error } = await supabase.from('products').update(payload).eq('id', initialData.id);
        if (error) throw error;
        toast.success('Produk berhasil diperbarui');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Produk berhasil ditambahkan');
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
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">{isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Ubah detail produk yang sudah ada di inventaris.' : 'Masukkan detail produk untuk menambahkannya ke inventaris.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Foto Produk</Label>
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                aria-label="Preview foto produk"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview produk" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full max-w-xs cursor-pointer focus-visible:ring-2"
                  disabled={loading}
                  aria-label="Pilih foto produk"
                />
                <p className="text-xs text-muted-foreground">
                  Format yang didukung: JPG, PNG. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                name="name"
                placeholder="Cth: Kemeja Flanel"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={handleCategoryChange} 
                disabled={loading || categories.length === 0}
                required
              >
                <SelectTrigger id="category_id" aria-required="true">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_price">Harga Modal (Rp)</Label>
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
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="market_price">Harga Jual (Rp)</Label>
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
                aria-required="true"
              />
            </div>

            {isEditMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="margin_percent">Margin (%)</Label>
                  <Input
                    id="margin_percent"
                    name="margin_percent"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.margin_percent}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotion_cost">Biaya Promosi (Rp)</Label>
                  <Input
                    id="promotion_cost"
                    name="promotion_cost"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.promotion_cost}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/products')}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

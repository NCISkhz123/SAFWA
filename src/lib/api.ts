import { supabase } from './supabase';
import type { ProductWithCategory } from '../types';

export const uploadImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('product_images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  return data.path;
};

export const deleteImage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('product_images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const fetchProducts = async (): Promise<ProductWithCategory[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as ProductWithCategory[];
};

export const deleteProduct = async (id: string, imagePath?: string | null): Promise<void> => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error('Failed to delete associated image:', error);
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

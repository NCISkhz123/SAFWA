import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Loader2, Trash2, PlusCircle, Sparkles, Tag, Layers, Info } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat kategori', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Validasi Gagal', { description: 'Nama kategori dan Kode wajib diisi.' });
      return;
    }

    try {
      setSubmitting(true);
      const cleanCode = code.trim().toUpperCase();
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim(), code: cleanCode }])
        .select();

      if (error) throw error;
      
      if (data) {
        setCategories((prev) => [data[0], ...prev]);
        setName('');
        setCode('');
        toast.success('Kategori baru berhasil ditambahkan');
      }
    } catch (error: any) {
      toast.error('Gagal menambahkan kategori', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteId);

      if (error) {
        if (error.code === '23503') {
          throw new Error('Kategori ini tidak dapat dihapus karena masih digunakan oleh produk aktif.');
        }
        throw error;
      }

      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Kategori berhasil dihapus');
    } catch (error: any) {
      toast.error('Gagal menghapus kategori', {
        description: error.message,
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const previewPrefix = code ? code.trim().toUpperCase() : 'KM';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 mb-2">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Konfigurasi Metadata Produk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Pengaturan Kategori & SKU
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Atur kode singkatan kategori (prefix). Sistem database akan otomatis menghasilkan kode produk berurutan yang unik seperti <code className="text-xs font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-semibold">{previewPrefix}001</code> saat Anda menambahkan produk.
        </p>
      </div>

      {/* Bento Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bento Tile 1: Form Tambah Kategori (4 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md relative overflow-hidden bento-glow-purple">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Tambah Kategori</h2>
              <p className="text-xs text-muted-foreground">Daftarkan jenis busana baru</p>
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Kategori
              </Label>
              <Input
                id="category-name"
                placeholder="Misal: Kemeja, Kaos, Celana, Jaket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
                className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-code" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kode Singkatan (Prefix SKU)
              </Label>
              <Input
                id="category-code"
                placeholder="Misal: KM, KS, CL, JK"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={submitting}
                required
                maxLength={6}
                className="rounded-xl glass-input h-11 text-sm font-mono uppercase focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground">Maksimal 6 karakter huruf kapital.</p>
            </div>

            {/* Live SKU Preview Badge */}
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.06] space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                Pratinjau Kode Produk Otomatis:
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-sm font-mono font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 shadow-sm">
                  {code.trim() ? code.trim().toUpperCase() : 'XX'}001
                </span>
                <span className="text-xs text-muted-foreground">
                  → Produk ke-1 untuk {name.trim() || 'kategori ini'}
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center justify-center gap-2" 
              disabled={submitting || !name.trim() || !code.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Simpan Kategori</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Bento Tile 2: Daftar Kategori (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/15 shadow-md">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Kategori Tersimpan</h2>
                <p className="text-xs text-muted-foreground">Daftar prefix aktif di database</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-foreground">
              {categories.length} Kategori
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin mb-3 text-primary" />
              <p className="text-sm font-medium">Memuat data kategori...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-2xl border-2 border-dashed border-border/60 bg-black/[0.01] dark:bg-white/[0.01]">
              <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold text-sm text-foreground">Belum ada kategori</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Tambahkan kategori pertama Anda pada formulir di sebelah kiri untuk mulai menghasilkan kode produk otomatis.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden">
              <Table>
                <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Prefix Kode</TableHead>
                    <TableHead>Contoh SKU</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-lg bg-zinc-950/5 dark:bg-white/10 px-2.5 py-1 text-xs font-mono font-bold text-foreground border border-black/5 dark:border-white/10">
                          {category.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {category.code}001 - {category.code}999
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl text-zinc-500 hover:text-destructive hover:bg-destructive/10 active:scale-[0.95]"
                                onClick={() => setDeleteId(category.id)}
                                aria-label={`Hapus kategori ${category.name}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            }
                          />
                          <AlertDialogContent className="glass-panel rounded-3xl p-6 sm:p-8">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">Hapus Kategori {category.name}?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
                                Apakah Anda yakin ingin menghapus kategori <strong>{category.name}</strong> ({category.code})? Jika masih ada produk yang menggunakan kategori ini, penghapusan akan diblokir demi keamanan data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-2">
                              <AlertDialogCancel 
                                onClick={() => setDeleteId(null)}
                                className="rounded-xl active:scale-[0.97]"
                              >
                                Batalkan
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl active:scale-[0.97]"
                                disabled={deleting}
                              >
                                {deleting ? 'Menghapus...' : 'Hapus Kategori'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

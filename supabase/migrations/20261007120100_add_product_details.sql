-- Migration to add details to products table
ALTER TABLE public.products 
ADD COLUMN tipe text NOT NULL DEFAULT 'tanpa bordir' CHECK (tipe IN ('bordir manual', 'bordir mesin', 'tanpa bordir')),
ADD COLUMN motif text NOT NULL DEFAULT '-',
ADD COLUMN warna text NOT NULL DEFAULT '-',
ADD COLUMN bahan text NOT NULL DEFAULT '-',
ADD COLUMN ukuran text NOT NULL DEFAULT '-',
ADD COLUMN kelengkapan text NOT NULL DEFAULT '-';

-- Remove default constraints for future inserts (they were just to make the migration pass on existing rows)
ALTER TABLE public.products ALTER COLUMN tipe DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN motif DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN warna DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN bahan DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN ukuran DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN kelengkapan DROP DEFAULT;

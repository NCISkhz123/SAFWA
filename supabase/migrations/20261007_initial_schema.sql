-- Create Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    product_code TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) NOT NULL,
    supplier_price NUMERIC NOT NULL DEFAULT 0 CHECK (supplier_price >= 0),
    market_price NUMERIC NOT NULL DEFAULT 0 CHECK (market_price >= 0),
    margin_percent NUMERIC NOT NULL DEFAULT 0 CHECK (margin_percent >= 0),
    promotion_cost NUMERIC NOT NULL DEFAULT 0 CHECK (promotion_cost >= 0),
    image_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create Policies (Require Authentication)
CREATE POLICY "Enable ALL for authenticated users on categories"
ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable ALL for authenticated users on products"
ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atomic Product Code Generation Function
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
    cat_code TEXT;
    next_num INT;
BEGIN
    -- Lock category to avoid race condition and get Category Code
    SELECT code INTO cat_code FROM categories WHERE id = NEW.category_id FOR UPDATE;
    
    SELECT COALESCE(MAX(NULLIF(regexp_replace(product_code, '^' || cat_code, ''), '')::INTEGER), 0) + 1 INTO next_num FROM products WHERE category_id = NEW.category_id;
    
    -- Format like KM001
    NEW.product_code := cat_code || lpad(next_num::text, GREATEST(3, length(next_num::text)), '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_code
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_code();

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product_images');
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product_images');

-- Foreign Key Indexes
CREATE INDEX idx_products_category_id ON products(category_id);

-- updated_at Trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

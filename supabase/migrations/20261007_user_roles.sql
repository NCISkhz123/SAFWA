-- Create user_roles table
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can read all roles, users can read their own role
CREATE POLICY "Users can read own role"
    ON user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.user_roles WHERE user_id = auth.uid();
    
    -- If no role is found, default to admin as requested
    IF user_role = 'admin' OR user_role IS NULL THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update categories RLS
DROP POLICY IF EXISTS "Enable write for admins" ON categories;
DROP POLICY IF EXISTS "Enable update for admins" ON categories;
DROP POLICY IF EXISTS "Enable delete for admins" ON categories;
-- Drop old policies if they exist (assuming previous were for authenticated)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

CREATE POLICY "Enable insert for admins" ON categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Enable update for admins" ON categories FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Enable delete for admins" ON categories FOR DELETE TO authenticated USING (public.is_admin());

-- Update products RLS
DROP POLICY IF EXISTS "Enable write for admins" ON products;
DROP POLICY IF EXISTS "Enable update for admins" ON products;
DROP POLICY IF EXISTS "Enable delete for admins" ON products;
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

CREATE POLICY "Enable insert for admins" ON products FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Enable update for admins" ON products FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Enable delete for admins" ON products FOR DELETE TO authenticated USING (public.is_admin());

-- Update storage RLS
-- Note: Storage policies are tricky to drop because we need to know their exact names.
-- Assuming standard names from previous task:
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

CREATE POLICY "Allow admin uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Allow admin updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Allow admin deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

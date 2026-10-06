# Fashion Inventory App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, responsive inventory web application for fashion products using React, Tailwind, and Supabase.

**Architecture:** A single-page application with React Router. Uses Supabase for Auth (email/password), PostgreSQL for data with Row Level Security, and Storage for images. Features automatic atomic product code generation via PostgreSQL functions.

**Tech Stack:** React, Vite, Tailwind CSS, shadcn/ui, Supabase (Auth, Postgres, Storage), Lucide React.

## Global Constraints
- Must use shadcn/ui components for UI, no custom UI from scratch if available.
- Code generated must be React + Tailwind CSS.
- Authentication must use Supabase Auth.
- Product codes must be automatically generated in backend (atomic), never inputted manually.
- Default margin is 0%. Default promotion_cost is 0.
- Do not expose Supabase service-role keys.
- Do not build complex unnecessary features outside the spec.

---

### Task 1: Initialize Project & Install Core Dependencies

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `.env`
- Create: `.env.example`
- Create: `src/lib/supabase.ts`

**Interfaces:**
- Produces: A running Vite React application with Supabase client configured.

- [ ] **Step 1: Scaffold Vite Project**
```bash
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 2: Install Tailwind CSS & Configure**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Install Supabase Client & Router**
```bash
npm install @supabase/supabase-js react-router-dom lucide-react
```

- [ ] **Step 4: Create Supabase Client**
Write to `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 5: Setup Environment Variables**
Write to `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 6: Basic App Routing Setup**
Write to `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "chore: initial project setup with vite, tailwind, and supabase"
```

---

### Task 2: Configure shadcn/ui & Components

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Produces: Available shadcn/ui components in `src/components/ui`.

- [ ] **Step 1: Initialize shadcn/ui**
```bash
npx shadcn-ui@latest init -y
```

- [ ] **Step 2: Add Required Components**
```bash
npx shadcn-ui@latest add button input label select table dialog alert-dialog dropdown-menu card badge sonner form
```
Wait for installation to complete.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore: init shadcn/ui and add core components"
```

---

### Task 3: Database Schema & RLS Setup (SQL)

**Files:**
- Create: `supabase/migrations/20261007_initial_schema.sql`

**Interfaces:**
- Produces: SQL script to be executed in Supabase SQL Editor.

- [ ] **Step 1: Write SQL Schema**
Create `supabase/migrations/20261007_initial_schema.sql`:
```sql
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
    -- Get Category Code
    SELECT code INTO cat_code FROM categories WHERE id = NEW.category_id;
    
    -- Lock and count existing products in category to avoid race condition
    -- We'll use a sequence table for more robustness if needed, but a simple locked count is acceptable for this scope if we lock the category row
    PERFORM id FROM categories WHERE id = NEW.category_id FOR UPDATE;
    
    SELECT COUNT(*) + 1 INTO next_num FROM products WHERE category_id = NEW.category_id;
    
    -- Format like KM001
    NEW.product_code := cat_code || lpad(next_num::text, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_code
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_code();

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true);
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product_images');
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product_images');
```

- [ ] **Step 2: Commit**
```bash
git add supabase
git commit -m "db: initial schema and RLS policies"
```

---

### Task 4: Authentication & Layout

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/shared/Layout.tsx`
- Create: `src/components/shared/ProtectedRoute.tsx`
- Create: `src/pages/Login.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: Working login system and protected routes shell.

- [ ] **Step 1: Auth Hook**
Create `src/hooks/useAuth.ts` to manage Supabase session state.

- [ ] **Step 2: Login Page**
Create `src/pages/Login.tsx` with email/password form using shadcn/ui.

- [ ] **Step 3: Protected Route & Layout**
Create `src/components/shared/ProtectedRoute.tsx` to redirect to `/login` if no session.
Create `src/components/shared/Layout.tsx` for the Navbar (links to Products, Settings, Logout button).

- [ ] **Step 4: Update App Routing**
Modify `src/App.tsx` to use the layout and routes.

- [ ] **Step 5: Commit**
```bash
git add src/hooks src/components src/pages src/App.tsx
git commit -m "feat: auth system and layout"
```

---

### Task 5: Settings Page (Categories CRUD)

**Files:**
- Create: `src/pages/Settings.tsx`
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: Ability to add and delete categories.

- [ ] **Step 1: Define Types**
Create `src/types/index.ts`:
```typescript
export interface Category {
  id: string;
  name: string;
  code: string;
}
export interface Product {
  id: string;
  name: string;
  product_code: string;
  category_id: string;
  supplier_price: number;
  market_price: number;
  margin_percent: number;
  promotion_cost: number;
  image_path: string | null;
}
```

- [ ] **Step 2: Settings Page UI**
Create `src/pages/Settings.tsx`. Use `supabase.from('categories')` to fetch, insert, and delete categories. Show in a table. Add a simple form for Name and Code.

- [ ] **Step 3: Commit**
```bash
git add src/pages/Settings.tsx src/types/index.ts
git commit -m "feat: settings page for categories"
```

---

### Task 6: Product Service & Utilities

**Files:**
- Create: `src/lib/api.ts`

**Interfaces:**
- Produces: Reusable functions for uploading images and fetching products.

- [ ] **Step 1: API Functions**
Create `src/lib/api.ts` for:
- Uploading image to `product_images` bucket (returns path)
- Deleting image from bucket
- Deleting product (which also calls delete image)

- [ ] **Step 2: Commit**
```bash
git add src/lib/api.ts
git commit -m "feat: api utilities for storage and products"
```

---

### Task 7: Product List Page

**Files:**
- Create: `src/pages/ProductList.tsx`

**Interfaces:**
- Produces: Data table of all products with edit/delete actions.

- [ ] **Step 1: Product List UI**
Create `src/pages/ProductList.tsx`.
- Fetch `products` joined with `categories`.
- Display Image (via Supabase storage public URL), Code, Name, Category, Prices, Margin, Promotion Cost.
- Empty state: "Belum ada produk. Tambahkan produk pertama Anda."
- Implement Delete button with `AlertDialog` for confirmation.

- [ ] **Step 2: Commit**
```bash
git add src/pages/ProductList.tsx
git commit -m "feat: product list page"
```

---

### Task 8: New Product Page

**Files:**
- Create: `src/pages/ProductFormPage.tsx`
- Create: `src/components/products/ProductForm.tsx`

**Interfaces:**
- Produces: Form to create products.

- [ ] **Step 1: Form Component**
Create `src/components/products/ProductForm.tsx`.
- Fields: Image upload (file input), Name, Category (select), Supplier Price, Market Price.
- Hides: Margin (defaults to 0), Promotion Cost (defaults to 0).
- Uses Zod for validation (required fields, >= 0 constraints).
- On submit: Uploads image -> gets path -> inserts to `products` -> redirects to `/products`.

- [ ] **Step 2: Page Component**
Create `src/pages/ProductFormPage.tsx` which renders the form in "create" mode.

- [ ] **Step 3: Commit**
```bash
git add src/pages src/components/products
git commit -m "feat: create product form"
```

---

### Task 9: Edit Product Page

**Files:**
- Modify: `src/components/products/ProductForm.tsx`
- Create: `src/pages/EditProductPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: Form to edit existing products, showing additional fields.

- [ ] **Step 1: Edit Mode in Form**
Modify `ProductForm.tsx` to accept an optional `initialData` prop.
If `initialData` exists (edit mode), show inputs for Margin Percent and Promotion Cost.
On submit, update the existing row. Handle replacing the image if a new one is uploaded.

- [ ] **Step 2: Edit Page Component**
Create `src/pages/EditProductPage.tsx` (fetches product by ID from URL params and passes to form).

- [ ] **Step 3: Update Routes**
Add route `/products/:id/edit` to `src/App.tsx`.

- [ ] **Step 4: Commit**
```bash
git add src/pages src/components src/App.tsx
git commit -m "feat: edit product functionality"
```

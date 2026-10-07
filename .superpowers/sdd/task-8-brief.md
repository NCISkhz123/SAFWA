# Task 8: New Product Page

**Goal:** Build a secure, responsive inventory web application for fashion products using React, Tailwind, and Supabase.

**Tech Stack:** React, Vite, Tailwind CSS, shadcn/ui, Supabase (Auth, Postgres, Storage), Lucide React.

## Global Constraints
- Must use shadcn/ui components for UI, no custom UI from scratch if available.
- Code generated must be React + Tailwind CSS.
- Authentication must use Supabase Auth.
- Product codes must be automatically generated in backend (atomic), never inputted manually.
- Default margin is 0%. Default promotion_cost is 0.
- Do not expose Supabase service-role keys.
- Do not build complex unnecessary features outside the spec.

**Files:**
- Create: `src/pages/ProductFormPage.tsx`
- Create: `src/components/products/ProductForm.tsx`
- Modify: `src/App.tsx` (Update routes)

**Interfaces:**
- Produces: Form to create products.

- [ ] **Step 1: Form Component**
Create `src/components/products/ProductForm.tsx`.
- Since shadcn/ui `form` wrapper is not available, use standard HTML `<form>` with standard React state (or `react-hook-form` if you install it, but standard state is fine) and shadcn UI's `<Input>`, `<Label>`, `<Select>`, `<Button>`, etc.
- Fields: Image upload (file input), Name, Category (select from categories table), Supplier Price, Market Price.
- Hides: Product Code, Margin (defaults to 0), Promotion Cost (defaults to 0).
- Uses simple validation (required fields, prices >= 0).
- On submit: 
  1. Upload image using `uploadImage` from `src/lib/api.ts` (if an image is selected).
  2. Insert to `products` (don't send `product_code`, let the DB trigger generate it).
  3. Redirect to `/products` on success.
- Handle loading state and show errors/success via `toast` (sonner).

- [ ] **Step 2: Page Component**
Create `src/pages/ProductFormPage.tsx` which renders the form in "create" mode (e.g., inside a Card or container with title "Tambah Produk").

- [ ] **Step 3: Update Routes**
Add route `/products/new` to `src/App.tsx`.

- [ ] **Step 4: Commit**
```bash
git add src/pages src/components/products src/App.tsx
git commit -m "feat: create product form"
```

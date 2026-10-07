# Task 7: Product List Page

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
- Create: `src/pages/ProductList.tsx`
- Modify: `src/App.tsx` (to update routing)

**Interfaces:**
- Produces: Data table of all products with edit/delete actions.
- Consumes: `src/lib/api.ts` (fetchProducts, deleteProduct), Supabase client for image public URL generation.

- [ ] **Step 1: Product List UI**
Create `src/pages/ProductList.tsx`.
- Fetch products using the API utility.
- Display Image (via Supabase storage `getPublicUrl`), Code, Name, Category name, Prices (Supplier & Market), Margin, Promotion Cost.
- Empty state: "Belum ada produk. Tambahkan produk pertama Anda."
- Include "Add Product" button that links to `/products/new`.
- Implement Delete button per row with `AlertDialog` for confirmation ("Apakah Anda yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan.").
- Implement Edit button that links to `/products/:id/edit`.
- Handle loading and error states.

- [ ] **Step 2: Update App Routing**
Add `/products` route pointing to `ProductList`.

- [ ] **Step 3: Commit**
```bash
git add src/pages/ProductList.tsx src/App.tsx
git commit -m "feat: product list page"
```

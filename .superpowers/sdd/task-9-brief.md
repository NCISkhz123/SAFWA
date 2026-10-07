# Task 9: Edit Product Page

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
- Modify: `src/components/products/ProductForm.tsx`
- Create: `src/pages/EditProductPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: Form to edit existing products, showing additional fields.

- [ ] **Step 1: Edit Mode in Form**
Modify `ProductForm.tsx` to accept an optional `initialData` prop of type `Product`.
If `initialData` exists (edit mode), show inputs for Margin Percent and Promotion Cost.
On submit, update the existing row instead of inserting. Handle replacing the image if a new one is uploaded (upload new, delete old using the API, update `image_path` in DB).

- [ ] **Step 2: Edit Page Component**
Create `src/pages/EditProductPage.tsx`. It should fetch the product by ID from the URL params (`useParams`) and render `ProductForm` with the fetched `initialData`. Show a loading state while fetching. Handle errors if the product is not found.

- [ ] **Step 3: Update Routes**
Add route `/products/:id/edit` to `src/App.tsx`. Ensure it points to `EditProductPage`.

- [ ] **Step 4: Commit**
```bash
git add src/pages src/components src/App.tsx
git commit -m "feat: edit product functionality"
```

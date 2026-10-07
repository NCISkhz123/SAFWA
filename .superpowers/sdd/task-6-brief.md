# Task 6: Product Service & Utilities

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
- Create: `src/lib/api.ts`

**Interfaces:**
- Produces: Reusable functions for uploading images and fetching products.

- [ ] **Step 1: API Functions**
Create `src/lib/api.ts` for:
- Uploading image to `product_images` bucket (returns path). Function signature: `uploadImage(file: File): Promise<string | null>`
- Deleting image from bucket. Function signature: `deleteImage(path: string): Promise<void>`
- Fetching products joined with categories.
- Deleting product (which also calls delete image if product has an image).

- [ ] **Step 2: Commit**
```bash
git add src/lib/api.ts
git commit -m "feat: api utilities for storage and products"
```

# Task 5: Settings Page (Categories CRUD)

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
- Create: `src/pages/Settings.tsx`
- Create: `src/types/index.ts`
- Modify: `src/App.tsx` (if routing was not set up fully)

**Interfaces:**
- Produces: Ability to add and delete categories.

- [ ] **Step 1: Define Types**
Create `src/types/index.ts`:
```typescript
export interface Category {
  id: string;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}
```

- [ ] **Step 2: Settings Page UI**
Create `src/pages/Settings.tsx`. Use `supabase.from('categories')` to fetch, insert, and delete categories. Show them in a table using shadcn UI components. Add a simple form for Name and Code to add a new category. Handle loading and error states. Implement a delete confirmation using `AlertDialog`.

- [ ] **Step 3: Update Routing**
Ensure `/settings` route in `App.tsx` points to the new `Settings` component.

- [ ] **Step 4: Commit**
```bash
git add src/pages/Settings.tsx src/types/index.ts src/App.tsx
git commit -m "feat: settings page for categories"
```

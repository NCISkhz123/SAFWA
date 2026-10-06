# Task 2: Configure shadcn/ui & Components

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

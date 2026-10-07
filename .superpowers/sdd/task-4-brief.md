# Task 4: Authentication & Layout

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
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/shared/Layout.tsx`
- Create: `src/components/shared/ProtectedRoute.tsx`
- Create: `src/pages/Login.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: Working login system and protected routes shell.

- [ ] **Step 1: Auth Hook**
Create `src/hooks/useAuth.ts` to manage Supabase session state. It should expose the current session, user, and a signOut function.

- [ ] **Step 2: Login Page**
Create `src/pages/Login.tsx` with email/password form using standard HTML form/inputs or shadcn UI if available (note: `form` component might not be available, so use standard html form with tailwind classes and `Input`/`Button` from shadcn). Handle login via Supabase auth.

- [ ] **Step 3: Protected Route & Layout**
Create `src/components/shared/ProtectedRoute.tsx` to redirect to `/login` if no session.
Create `src/components/shared/Layout.tsx` for the Navbar (links to Products, Settings, Logout button). Use `react-router-dom` Link/Outlet.

- [ ] **Step 4: Update App Routing**
Modify `src/App.tsx` to use the layout and routes. Set up `/login` and `/` (redirects to `/products`), and `/products` / `/settings` as empty placeholders for now inside the Layout.

- [ ] **Step 5: Commit**
```bash
git add src/hooks src/components src/pages src/App.tsx
git commit -m "feat: auth system and layout"
```

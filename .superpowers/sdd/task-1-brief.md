# Task 1: Initialize Project & Install Core Dependencies

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

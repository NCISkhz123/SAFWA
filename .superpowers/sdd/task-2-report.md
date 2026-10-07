# Task 2 Report

## What I implemented
- Cleaned up leftover files from Vite initialization (`src/App.css`, `src/assets/hero.png`, `public/icons.svg`).
- Configured path aliases in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts` to allow `shadcn` initialization.
- Initialized `shadcn` using Vite template and `Base UI` components library (as it is the recommended default now).
- Added required components: `button, input, label, select, table, dialog, alert-dialog, dropdown-menu, card, badge, sonner, form`.

## Files changed
- Deleted: `src/App.css`, `src/assets/hero.png`, `public/icons.svg`
- Modified: `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, `package.json`, `src/index.css`
- Created: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`

## Self-review findings
The `shadcn init` command required path aliases to be explicitly configured in both `tsconfig.app.json` and `vite.config.ts` prior to initialization. I've added `@/*` mapped to `./src/*`.
The `npx shadcn add` command successfully downloaded 10 components. 

## Issues or concerns
The `form` component was skipped during `shadcn add form`. This is likely because the CLI recommended using `Base UI` over `Radix UI` as the base component library, and `form` might not yet exist in the `Base UI` registry for shadcn. We may need to manually implement form state or wait until we switch to Radix if forms are heavily reliant on `shadcn/ui` form primitives. Otherwise, standard HTML forms or `react-hook-form` standalone can be used.

# Task 6 Report

## What was implemented
- Created `src/lib/api.ts` with Supabase utility functions.
- Implemented `uploadImage(file: File)` to upload images to the `product_images` bucket.
- Implemented `deleteImage(path: string)` to delete images from the `product_images` bucket.
- Implemented `fetchProducts()` to fetch products and their associated categories.
- Implemented `deleteProduct(id: string, imagePath?: string | null)` which safely attempts to delete the associated image before removing the product record.
- Added `ProductWithCategory` type to `src/types/index.ts` to properly type the fetched products.

## Files Changed
- `src/lib/api.ts` (created)
- `src/types/index.ts` (modified)

## Self-review findings
- Used a generic type for `ProductWithCategory` extending `Product` and holding the nested category result.
- Ensured import was `type { ProductWithCategory }` to comply with `verbatimModuleSyntax` TypeScript config.
- When deleting a product, image deletion failures are caught so that the product deletion itself is not completely blocked, but logged properly instead. This is often the desired behavior rather than leaving a zombie database record.

## Issues / Concerns
- None. Build successfully completed.

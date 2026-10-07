# Task 3 Report: Database Schema & RLS Setup (SQL)

## What was implemented
- Created initial database migration script `supabase/migrations/20261007_initial_schema.sql`.
- Defined schema for `categories` and `products` tables with integrity constraints and defaults.
- Enabled Row Level Security (RLS) and configured policies allowing full access to authenticated users.
- Created `generate_product_code()` trigger function and `set_product_code` trigger for atomic code formatting (e.g. `KM001`) with row locking on `categories` to prevent race conditions.
- Configured Supabase Storage bucket `product_images` along with RLS storage policies for upload, update, delete, and public select.

## Files changed
- `supabase/migrations/20261007_initial_schema.sql` (created)

## Self-review findings
- Schema and policies match task requirements exactly.
- Constraints for non-negative numerical values (`supplier_price`, `market_price`, `margin_percent`, `promotion_cost`) properly set.
- Atomic trigger locks the parent category row before generating sequential code.
- Committed changes to git on branch master.

## Issues or concerns
- None. Note that applying the migration to Supabase will be executed during environment setup / deployment.

## Review Fixes Applied
- **Brittle Sequence Counter**: Replaced simple count logic with a safer method using `MAX` on the product suffix to avoid unique constraint violations upon item deletion.
- **Storage Bucket Idempotency**: Added `ON CONFLICT (id) DO NOTHING` to the `storage.buckets` insert command to handle multiple execution safely.
- **Redundant Queries**: Combined the category code fetch and row lock (`FOR UPDATE`) into a single `SELECT INTO` statement.
- **Potential lpad Truncation**: Improved `lpad` with `GREATEST(3, length(next_num::text))` ensuring suffixes longer than 3 digits don't get truncated.
- **Missing Elements**: Added missing `idx_products_category_id` foreign key index and `set_updated_at()` trigger for both tables.

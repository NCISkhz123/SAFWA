# Fashion Inventory App Design

## Overview
A simple web application for managing fashion products. It uses React, Tailwind CSS, shadcn/ui on the frontend, and Supabase (Auth, PostgreSQL, Storage) for the backend. 

## Architecture

**Frontend Stack:**
- React (Vite)
- Tailwind CSS
- shadcn/ui components (Radix UI under the hood)
- React Router for navigation
- React Hook Form + Zod for form validation
- Supabase-js client for communicating with the backend

**Backend Stack (Supabase):**
- **Auth:** Email & Password authentication via Supabase Auth.
- **Database:** PostgreSQL database.
- **Storage:** Supabase Storage for product images.
- **Security:** Row Level Security (RLS) enabled on all tables and storage buckets, allowing authenticated users to manage data.

**Project Structure:**
- `/src/components` - UI components (shadcn/ui and custom)
- `/src/pages` - Page components (Login, Product List, New Product, Settings)
- `/src/lib` - Utility functions (Supabase client, utils)
- `/src/hooks` - Custom hooks for data fetching and mutations
- `/src/types` - TypeScript interfaces/types

## Database Schema

### `categories`
Stores product categories and their corresponding prefix codes for automatic product code generation.
- `id` (uuid, primary key)
- `name` (text, not null)
- `code` (text, not null, unique) - e.g., 'KM', 'KS'
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `products`
Stores product information. 
- `id` (uuid, primary key)
- `name` (text, not null)
- `product_code` (text, not null, unique)
- `category_id` (uuid, foreign key to categories.id)
- `supplier_price` (numeric, not null, default 0)
- `market_price` (numeric, not null, default 0)
- `margin_percent` (numeric, not null, default 0)
- `promotion_cost` (numeric, not null, default 0)
- `image_path` (text, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### Automatic Product Code Generation
To prevent race conditions, the product code will be generated inside the database using a sequence per category, or an atomic sequence mechanism. 
**Approach:** We will create a PostgreSQL function and trigger to automatically generate `product_code` on INSERT. It will fetch the category code and find the next number securely within a transaction.

## Row Level Security (RLS)
- Only authenticated users can SELECT, INSERT, UPDATE, and DELETE in `products` and `categories` tables.
- Same rules apply to the `product_images` storage bucket.

## Error Handling & UX
- Toast notifications for success/error feedback.
- Loading spinners during async operations.
- Confirmation dialogs before destructive actions (delete).
- Fallback UI for empty states.

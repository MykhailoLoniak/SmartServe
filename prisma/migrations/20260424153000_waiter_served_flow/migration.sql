-- Add SERVED status to order workflow enum (used by order items)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SERVED';

-- Add kitchen requirement flag for menu items (e.g. drinks)
ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "requiresKitchen" BOOLEAN NOT NULL DEFAULT true;

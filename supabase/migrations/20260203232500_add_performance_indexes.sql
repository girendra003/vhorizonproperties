-- Migration: Add performance indexes for properties table
-- Description: Adds B-tree indexes for commonly filtered/sorted columns (status, location, price, created_at)

-- 1. Status Index (Used in almost all filters)
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- 2. Location Index (Used for search/filtering)
-- Note: For simple equality or prefix matching. 
-- If full-text search is needed later, consider GIN index with pg_trgm.
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);

-- 3. Price Index (Used for range filtering min/max budget)
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);

-- 4. Sorting Index (Used for default ordering)
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

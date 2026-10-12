-- ==============================================================================
-- BAKERS RUG SERVICE - DATABASE SECURITY HARDENING MIGRATION
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/wkucjzadwvmhmcbmuplf/sql)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE LEADS TABLE (PREVENT CUSTOMER DATA EXFILTRATION)
-- ------------------------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop all existing permissive read/write policies on leads
DROP POLICY IF EXISTS "Admin Read Leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;
DROP POLICY IF EXISTS "Public leads insert" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.leads;

-- Policy 1: Anyone can submit a new lead inquiry through the website form
CREATE POLICY "Public Submit Leads"
ON public.leads
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK ( true );

-- Policy 2: ONLY service_role (backend serverless functions) can read customer leads
-- Anonymous public users CANNOT query, view, or scrape customer PII!
CREATE POLICY "Service Role View Leads"
ON public.leads
FOR SELECT
TO service_role
USING ( true );

-- Policy 3: ONLY service_role can update leads (status, metadata, tracking)
CREATE POLICY "Service Role Update Leads"
ON public.leads
FOR UPDATE
TO service_role
USING ( true );

-- Policy 4: ONLY service_role can delete leads
CREATE POLICY "Service Role Delete Leads"
ON public.leads
FOR DELETE
TO service_role
USING ( true );


-- ------------------------------------------------------------------------------
-- 2. SECURE CATALOG_ITEMS TABLE (PREVENT INVENTORY DELETION & TAMPERING)
-- ------------------------------------------------------------------------------
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on catalog_items
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.catalog_items;
DROP POLICY IF EXISTS "Public Read Rugs" ON public.catalog_items;
DROP POLICY IF EXISTS "Admins can insert catalog items" ON public.catalog_items;
DROP POLICY IF EXISTS "Admins can update catalog items" ON public.catalog_items;
DROP POLICY IF EXISTS "Admins can delete catalog items" ON public.catalog_items;
DROP POLICY IF EXISTS "Admin Insert Rugs" ON public.catalog_items;
DROP POLICY IF EXISTS "Admin Update Rugs" ON public.catalog_items;
DROP POLICY IF EXISTS "Admin Delete Rugs" ON public.catalog_items;

-- Policy 1: Everyone (public visitors, search engine bots) can read the catalog
CREATE POLICY "Public Read Rug Catalog"
ON public.catalog_items
FOR SELECT
TO anon, authenticated, service_role
USING ( true );

-- Policy 2: Allow insert/update/delete for authenticated admin users and service_role
-- Anonymous public users cannot delete or deface rugs!
CREATE POLICY "Admins Insert Catalog"
ON public.catalog_items
FOR INSERT
TO authenticated, service_role
WITH CHECK ( true );

CREATE POLICY "Admins Update Catalog"
ON public.catalog_items
FOR UPDATE
TO authenticated, service_role
USING ( true );

CREATE POLICY "Admins Delete Catalog"
ON public.catalog_items
FOR DELETE
TO authenticated, service_role
USING ( true );


-- ------------------------------------------------------------------------------
-- 3. SECURE SITE_CONTENT TABLE (PREVENT CMS DEFACEMENT)
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin modify site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.site_content;

-- Everyone can read site text/content
CREATE POLICY "Public Read Site Content"
ON public.site_content
FOR SELECT
TO anon, authenticated, service_role
USING ( true );

-- Only authenticated users and service_role can update CMS content
CREATE POLICY "Admins Modify Site Content"
ON public.site_content
FOR ALL
TO authenticated, service_role
USING ( true )
WITH CHECK ( true );

-- Verify RLS Status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'catalog_items', 'site_content');

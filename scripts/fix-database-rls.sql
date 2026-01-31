-- FIX RLS FOR CATALOG_ITEMS
-- We need to allow the 'anon' role (Frontend Admin) to Insert/Update/Delete rugs.
-- (Currently it is restricted to 'service_role' only)

DROP POLICY IF EXISTS "Admins can insert catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Admins can update catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Admins can delete catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON catalog_items;

-- 1. Everyone can READ rugs (Catalog)
CREATE POLICY "Public Read Rugs"
ON catalog_items FOR SELECT
USING ( true );

-- 2. Admin (via Client) can INSERT rugs
CREATE POLICY "Admin Insert Rugs"
ON catalog_items FOR INSERT
WITH CHECK ( true );

-- 3. Admin (via Client) can UPDATE rugs
CREATE POLICY "Admin Update Rugs"
ON catalog_items FOR UPDATE
USING ( true );

-- 4. Admin (via Client) can DELETE rugs
CREATE POLICY "Admin Delete Rugs"
ON catalog_items FOR DELETE
USING ( true );


-- FIX RLS FOR LEADS
-- We need to allow the Admin panel to READ leads (currently only service_role can read)
DROP POLICY IF EXISTS "Admins can view leads" ON leads;

-- 1. Admin (via Client) can READ leads
CREATE POLICY "Admin Read Leads"
ON leads FOR SELECT
USING ( true );

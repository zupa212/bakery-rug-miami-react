# Vercel Deployment Guide

## 1. Environment Variables
Add these to your Project Settings [link](https://vercel.com/dashboard) -> **Settings** -> **Environment Variables**.

| Variable | Value (Copy from your .env) | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://wkucjzadwvmhmcbmuplf.supabase.co` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | Public API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | **Secret** Admin Key (Backend only) |
| `VITE_ADMIN_PIN` | `1234` | (Optional) PIN for Admin Access |
| `BUSINESS_EMAIL` | `Bakersrug@comcast.net` | Email to receive leads |
| `RESEND_API_KEY` | `re_...` | (Optional) For sending emails |

## 2. Manual Database Upgrade
Run this SQL in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) to enable the Serial Number feature:

```sql
-- Add Unique Serial Number Column
ALTER TABLE catalog_items 
ADD COLUMN IF NOT EXISTS serial_number text UNIQUE;

-- Create Index for fast search
CREATE INDEX IF NOT EXISTS idx_catalog_serial ON catalog_items(serial_number);

-- Add Analysis Columns to Leads Table (New!)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS ip_country text,
ADD COLUMN IF NOT EXISTS ip_city text;

-- 3. Fix Image Upload Permissions (Storage RLS)
INSERT INTO storage.buckets (id, name, public) VALUES ('rugs', 'rugs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING ( bucket_id = 'rugs' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'rugs' );
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'rugs' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'rugs' );

-- 4. Fix Table Permissions (Database RLS)
-- Run this to allow the Admin Panel to save rugs and view leads
DROP POLICY IF EXISTS "Admins can insert catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Admins can update catalog items" ON catalog_items;

CREATE POLICY "Admin Insert Rugs" ON catalog_items FOR INSERT WITH CHECK ( true );
CREATE POLICY "Admin Update Rugs" ON catalog_items FOR UPDATE USING ( true );
CREATE POLICY "Admin Delete Rugs" ON catalog_items FOR DELETE USING ( true );

-- Allow reading leads in Admin Panel
DROP POLICY IF EXISTS "Admins can view leads" ON leads;
CREATE POLICY "Admin Read Leads" ON leads FOR SELECT USING ( true );
```

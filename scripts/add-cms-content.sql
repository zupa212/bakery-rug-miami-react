-- =============================================
-- CMS: Site Content Table
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create site_content table for CMS
CREATE TABLE IF NOT EXISTS site_content (
    id text PRIMARY KEY,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Seed default content for all homepage sections
INSERT INTO site_content (id, content) VALUES 
('hero', '{
    "tagline": "Miami''s Premier Rug Atelier",
    "tagline_mobile": "#1 Rug Cleaning Miami",
    "headline_prefix": "The Standard in",
    "headline": "Oriental Rug Cleaning",
    "description": "We provide museum-quality cleaning, repair, and restoration for Persian, Turkish, and Wool rugs in Miami, Coral Gables, and Pinecrest. Family-owned for more than a century.",
    "phone": "305-801-9000",
    "years": "100+",
    "years_label": "Years of Excellence",
    "rating_text": "Top Rated in Florida"
}'::jsonb),
('services', '{
    "tagline": "Our Expertise",
    "headline": "Professional Rug Cleaning & Repair Services",
    "description": "Each rug is a unique work of art requiring a specialized approach. As Miami''s leading rug atelier, our master craftsmen examine every knot and dye lot before cleaning."
}'::jsonb),
('process', '{
    "tagline": "Our Process",
    "headline": "How We Clean Your Rugs",
    "description": "Every rug receives personalized attention from pickup to delivery."
}'::jsonb),
('contact', '{
    "tagline": "Get in Touch",
    "headline": "Request Free Pickup",
    "description": "Fill out the form and we''ll contact you within 24 hours to schedule your free pickup."
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public can read content
CREATE POLICY "Public can read content" ON site_content FOR SELECT USING (true);

-- Anyone can update (in production, add proper auth)
CREATE POLICY "Anyone can update content" ON site_content FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert content" ON site_content FOR INSERT WITH CHECK (true);

-- =============================================
-- CMS: Site Images Table
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create site_images table for CMS images
CREATE TABLE IF NOT EXISTS site_images (
    id text PRIMARY KEY,
    image_url text NOT NULL,
    alt_text text DEFAULT '',
    updated_at timestamptz DEFAULT now()
);

-- Seed default images
INSERT INTO site_images (id, image_url, alt_text) VALUES 
('logo', '/photos/logofront.png', 'Bakers Rug Service Logo'),
('hero_bg', '/photos/DSC06460.webp', 'Rug cleaning workshop'),
('service_1', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', 'Rug Washing'),
('service_2', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', 'Pad Sales'),
('service_3', 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?auto=format&fit=crop&q=80&w=800', 'Rug Repair')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Public can read images
CREATE POLICY "Public can read images" ON site_images FOR SELECT USING (true);

-- Anyone can update (in production, add proper auth)
CREATE POLICY "Anyone can update images" ON site_images FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert images" ON site_images FOR INSERT WITH CHECK (true);

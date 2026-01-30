-- Add Analysis Columns to Leads Table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new'; -- new, contacted, qualified, closed

-- specific columns for ease of access (optional, but good for admin)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS ip_country text,
ADD COLUMN IF NOT EXISTS ip_city text;

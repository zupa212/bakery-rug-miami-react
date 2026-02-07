
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env');
let env = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env file:', e.message);
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCMS() {
    console.log('Verifying CMS connection...');
    console.log('URL:', supabaseUrl);

    // 1. Try to fetch hero content
    const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'hero');

    if (error) {
        console.error('Error fetching site_content:', error.message);
        if (error.code === '42P01') {
            console.error('Table "site_content" DOES NOT EXIST.');
            console.error('ACTION REQUIRED: Run "scripts/add-cms-content.sql" in Supabase SQL Editor.');
        } else {
            console.error('Check your internet connection and Supabase project status.');
        }
    } else {
        console.log('Successfully connected to "site_content" table.');
        if (data.length === 0) {
            console.log('Table exists but is EMPTY. "hero" content is missing.');
            console.log('ACTION REQUIRED: Run the INSERT statements from "scripts/add-cms-content.sql".');
        } else {
            console.log('CMS Content found!');
            console.log('Hero Data:', JSON.stringify(data[0].content, null, 2));
        }
    }
}

verifyCMS();

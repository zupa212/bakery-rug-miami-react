
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually to avoid 'dotenv' dependency
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function upgradeStorage() {
    console.log('📦 Checking Storage Buckets...');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const rugsBucket = buckets.find(b => b.name === 'rugs');

    if (!rugsBucket) {
        console.log('Creating "rugs" bucket...');
        const { data, error } = await supabase.storage.createBucket('rugs', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log('✅ "rugs" bucket created successfully!');
        }
    } else {
        console.log('✅ "rugs" bucket already exists.');
        if (!rugsBucket.public) {
            console.log('⚠️ Bucket exists but is NOT public. Please make it public in Supabase Dashboard.');
        }
    }
}

upgradeStorage();

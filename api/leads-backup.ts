import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method === 'GET') {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return response.status(200).json({
                hasToken: false,
                blobs: [],
                message: 'Vercel Blob token not configured. Add BLOB_READ_WRITE_TOKEN in Vercel Storage settings.'
            });
        }

        try {
            const { blobs } = await list({
                prefix: 'leads-backup/',
                limit: 50
            });

            return response.status(200).json({
                hasToken: true,
                count: blobs.length,
                blobs
            });
        } catch (error: any) {
            console.error('Error fetching Vercel blobs:', error);
            return response.status(500).json({ error: error.message || 'Failed to list backup blobs' });
        }
    }

    if (request.method === 'POST') {
        // Re-sync a lead into Supabase
        const { leadData } = request.body;
        if (!leadData) {
            return response.status(400).json({ error: 'Missing leadData payload' });
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return response.status(500).json({ error: 'Supabase credentials missing' });
        }

        try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data, error } = await supabase
                .from('leads')
                .insert([
                    {
                        full_name: leadData.fullName || leadData.full_name,
                        email: leadData.email,
                        phone: leadData.phone,
                        city_or_area: leadData.cityOrArea || leadData.city_or_area,
                        message: leadData.message,
                        item_name: leadData.itemName || leadData.item_name,
                        item_slug: leadData.itemSlug || leadData.item_slug,
                        source_page: leadData.sourcePage || leadData.source_page,
                        score: leadData.score,
                        metadata: leadData.metadata,
                        ip_country: leadData.ipCountry || leadData.ip_country,
                        ip_city: leadData.ipCity || leadData.ip_city
                    }
                ])
                .select();

            if (error) {
                return response.status(500).json({ error: error.message });
            }

            return response.status(200).json({ success: true, lead: data[0] });
        } catch (err: any) {
            return response.status(500).json({ error: err.message });
        }
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const startTime = Date.now();
    let supabaseStatus: 'operational' | 'degraded' | 'down' = 'down';
    let supabaseLatency = 0;
    let leadsCount: number | null = null;
    let itemsCount: number | null = null;
    let supabaseError: string | null = null;

    // 1. Check Supabase Connectivity
    if (supabaseUrl && supabaseServiceKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            
            const [leadsRes, itemsRes] = await Promise.all([
                supabase.from('leads').select('*', { count: 'exact', head: true }),
                supabase.from('catalog_items').select('*', { count: 'exact', head: true })
            ]);

            supabaseLatency = Date.now() - startTime;

            if (leadsRes.error) {
                supabaseError = leadsRes.error.message;
                supabaseStatus = 'degraded';
            } else {
                supabaseStatus = 'operational';
                leadsCount = leadsRes.count;
                itemsCount = itemsRes.count;
            }
        } catch (err: any) {
            supabaseError = err?.message || 'Connection failed';
            supabaseStatus = 'down';
            supabaseLatency = Date.now() - startTime;
        }
    } else {
        supabaseError = 'Missing Supabase URL or Service Key credentials';
    }

    // 2. Check Vercel Blob Status
    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const blobStatus = hasBlobToken ? 'active' : 'token_missing';

    // 3. Check Resend Status
    const hasResend = Boolean(process.env.RESEND_API_KEY);

    // Set Cache-Control headers for short caching
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

    return response.status(200).json({
        timestamp: new Date().toISOString(),
        supabase: {
            status: supabaseStatus,
            latencyMs: supabaseLatency,
            message: supabaseStatus === 'operational' ? 'Όλα εντάξει - Operational' : (supabaseError || 'Issue detected'),
            leadsCount,
            itemsCount,
            error: supabaseError
        },
        blobStorage: {
            status: blobStatus,
            message: hasBlobToken 
                ? 'Vercel Blob Active (Fail-Safe Storage Enabled)' 
                : 'Vercel Blob Token Pending (Add BLOB_READ_WRITE_TOKEN in Vercel Storage)',
            hasToken: hasBlobToken
        },
        resend: {
            status: hasResend ? 'operational' : 'missing_key',
            recipient: process.env.BUSINESS_EMAIL || 'bakersrug@comcast.net'
        }
    });
}

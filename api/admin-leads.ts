import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin verification helper
function verifyAdminAuthorization(request: VercelRequest): boolean {
    const authHeader = request.headers['authorization'];
    const customPinHeader = request.headers['x-admin-pin'];
    const expectedPin = (process.env.ADMIN_PIN || process.env.VITE_ADMIN_PIN || '1234').trim();

    let providedToken: string | undefined;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        providedToken = authHeader.substring(7).trim();
    } else if (customPinHeader && typeof customPinHeader === 'string') {
        providedToken = customPinHeader.trim();
    }

    if (!providedToken) {
        return false;
    }

    return providedToken === expectedPin;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // 1. Prevent caching of customer leads
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Authenticate Request
    if (!verifyAdminAuthorization(request)) {
        return response.status(401).json({
            error: 'Unauthorized: Invalid or missing administrative credentials'
        });
    }

    // 3. Ensure Database Credentials exist
    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({
            error: 'Server database configuration error (Service Key missing)'
        });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to query leads as service_role:', error);
            return response.status(500).json({ error: error.message });
        }

        return response.status(200).json({
            success: true,
            count: data?.length || 0,
            leads: data || []
        });
    } catch (err: any) {
        console.error('Unexpected error in /api/admin-leads:', err);
        return response.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
}

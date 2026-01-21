
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase (Service Role for admin access to 'leads')
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'your-email@example.com';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { fullName, email, phone, cityOrArea, message, itemName, itemSlug, sourcePage } = request.body;

    if (!fullName || !email) {
        return response.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Store in Supabase
        const { error: dbError } = await supabase
            .from('leads')
            .insert([
                {
                    full_name: fullName,
                    email,
                    phone,
                    city_or_area: cityOrArea,
                    message,
                    item_name: itemName,
                    item_slug: itemSlug,
                    source_page: sourcePage,
                },
            ]);

        if (dbError) {
            console.error('Database Error:', dbError);
            // We continue even if DB fails, to try creating email
        }

        // 2. Send Email via Resend
        let emailResult;
        if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
                from: 'BakersRug Leads <onboarding@resend.dev>', // Use verified domain in prod
                to: [BUSINESS_EMAIL],
                subject: `New Lead: ${fullName} ${itemName ? `for ${itemName}` : ''}`,
                html: `
            <h1>New Lead Received</h1>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>City/Area:</strong> ${cityOrArea || 'N/A'}</p>
            <p><strong>Message:</strong> ${message || 'N/A'}</p>
            <hr />
            <h3>Context</h3>
            <p><strong>Source:</strong> ${sourcePage}</p>
            <p><strong>Item:</strong> ${itemName || 'General Inquiry'}</p>
            `,
            });
            emailResult = { data, error };
        } else {
            console.log('Skipping Email: RESEND_API_KEY not set');
        }

        // 3. CRM Integration (Placeholder for HubSpot/Pipedrive)
        // In a real app, you'd fetch HUBSPOT_TOKEN and POST to their API here.

        return response.status(200).json({ success: true, db: !dbError, email: emailResult });
    } catch (error) {
        console.error('Server Error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}

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

// --- ANALYSIS UTILS ---
const calculateLeadScore = (data: any) => {
    let score = 10; // Base score for interest
    if (data.phone) score += 30; // High intent
    if (data.message && data.message.length > 50) score += 20; // Detailed inquiry
    if (data.cityOrArea) score += 10;
    if (data.itemName) score += 15; // Specific item interest
    if (data.email.endsWith('.edu') || data.email.endsWith('.gov')) score += 10; // Trustworthy domain
    return score;
};

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { fullName, email, phone, cityOrArea, message, itemName, itemSlug, sourcePage } = request.body;
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipCountry = request.headers['x-vercel-ip-country'] as string || 'Unknown';
    const ipCity = request.headers['x-vercel-ip-city'] as string || 'Unknown';
    const ip = request.headers['x-forwarded-for'] as string || 'Unknown';

    if (!fullName || !email) {
        return response.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Perform Analysis
        const score = calculateLeadScore(request.body);
        const metadata = {
            userAgent,
            ip,
            timestamp: new Date().toISOString(),
            platform: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
        };

        // 2. Store in Supabase with Analysis
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
                    // New Analysis Fields
                    score: score,
                    metadata: metadata,
                    ip_country: ipCountry,
                    ip_city: ipCity
                },
            ]);

        if (dbError) {
            console.error('Database Error:', dbError);
        }

        // 3. Send Smart Email via Resend
        let emailResult;
        if (process.env.RESEND_API_KEY) {
            const urgencyIcon = score > 50 ? '🔥' : '✨';
            const { data, error } = await resend.emails.send({
                from: 'BakersRug Leads <onboarding@resend.dev>',
                to: [BUSINESS_EMAIL],
                subject: `${urgencyIcon} New Lead [Score: ${score}]: ${fullName}`,
                html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e3a8a;">New Lead Received</h1>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 18px;"><strong>Score:</strong> <span style="color: ${score > 50 ? 'red' : 'green'}; font-weight: bold;">${score}/100</span></p>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone || 'N/A'}</a></p>
                    <p><strong>Location:</strong> ${cityOrArea || 'N/A'} (${ipCity}, ${ipCountry})</p>
                    <p><strong>Message:</strong> ${message || 'N/A'}</p>
                </div>
                
                <h3>Analysis Context</h3>
                <ul>
                    <li><strong>Source:</strong> ${sourcePage}</li>
                    <li><strong>Item:</strong> ${itemName || 'General Inquiry'}</li>
                    <li><strong>Device:</strong> ${metadata.platform}</li>
                </ul>
            </div>
            `,
            });
            emailResult = { data, error };
        }

        return response.status(200).json({ success: true, db: !dbError, email: emailResult, score });
    } catch (error) {
        console.error('Server Error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}

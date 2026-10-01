import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { put } from '@vercel/blob';
import { generateAdminLeadEmail, generateClientConfirmationEmail } from './email-template';

// Initialize Supabase (Service Role for admin access to 'leads')
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'bakersrug@comcast.net';

// --- ANALYSIS UTILS ---
const calculateLeadScore = (data: any) => {
    let score = 10; // Base score for interest
    if (data.phone) score += 40; // High intent (phone is gold)
    if (data.message && data.message.length > 50) score += 20; // Detailed inquiry
    if (data.cityOrArea) score += 10;
    if (data.itemName) score += 20; // Specific item interest is high intent
    if (data.serviceType) score += 15; // Specific service request
    if (data.email.endsWith('.edu') || data.email.endsWith('.gov')) score += 10; // Trustworthy domain

    // Cap at 100
    return Math.min(score, 100);
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

        const leadData = {
            fullName,
            email,
            phone,
            cityOrArea,
            message,
            itemName,
            itemSlug,
            sourcePage,
            score,
            metadata,
            ipCity,
            ipCountry,
            ip
        };

        // 2. Store in Supabase with Analysis (try with analysis fields first)
        let dbSuccess = false;
        let dbError: any = null;

        // First try with all columns
        const fullInsert = await supabase
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
                    // Analysis Fields
                    score: score,
                    metadata: metadata,
                    ip_country: ipCountry,
                    ip_city: ipCity
                },
            ]);

        if (fullInsert.error) {
            console.error('Full insert failed, trying basic insert:', fullInsert.error);
            // Fallback: Try without analysis columns
            const basicInsert = await supabase
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
                        source_page: sourcePage
                    },
                ]);

            if (basicInsert.error) {
                console.error('Basic insert also failed:', basicInsert.error);
                dbError = basicInsert.error;
            } else {
                dbSuccess = true;
            }
        } else {
            dbSuccess = true;
        }

        // 3. FAIL-SAFE: Vercel Blob Storage Backup
        // Guaranteed storage even if Supabase has outage or schema issues
        let blobBackupUrl: string | null = null;
        let blobError: string | null = null;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                const safeName = (fullName || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
                const blobFileName = `leads-backup/${Date.now()}-${safeName}.json`;
                const blobPayload = JSON.stringify({
                    lead: leadData,
                    supabaseStatus: dbSuccess ? 'inserted' : 'failed',
                    supabaseError: dbError ? (dbError.message || String(dbError)) : null,
                    createdAt: new Date().toISOString()
                }, null, 2);

                const blob = await put(blobFileName, blobPayload, {
                    access: 'public',
                    contentType: 'application/json',
                    addRandomSuffix: true
                });

                blobBackupUrl = blob.url;
                console.log('✅ Lead saved to Vercel Blob fail-safe:', blob.url);
            } catch (bErr: any) {
                console.error('Vercel Blob backup upload failed:', bErr);
                blobError = bErr?.message || String(bErr);
            }
        } else {
            console.warn('BLOB_READ_WRITE_TOKEN not set on Vercel. Blob fail-safe is pending token.');
        }

        // 4. Send Smart Emails via Resend (non-blocking - won't crash if fails)
        let emailResult: any = { skipped: true };
        if (process.env.RESEND_API_KEY) {
            try {
                // A. Send Luxury Notification to Business
                const urgencyIcon = score > 50 ? '🔥' : '✨';
                const adminEmailPromise = resend.emails.send({
                    from: 'BakersRug Admin <onboarding@resend.dev>',
                    to: [BUSINESS_EMAIL],
                    subject: `${urgencyIcon} New Lead [Score: ${score}]: ${fullName}`,
                    html: generateAdminLeadEmail(leadData),
                });

                // B. Send Confirmation to Client (if permitted by domain verification)
                let clientEmailPromise: Promise<any>;
                if (email.toLowerCase() === BUSINESS_EMAIL.toLowerCase()) {
                    clientEmailPromise = Promise.resolve({ skipped: 'Same as business email' });
                } else {
                    clientEmailPromise = resend.emails.send({
                        from: 'BakersRug <onboarding@resend.dev>',
                        to: [email],
                        subject: `Thank you for contacting BakersRug Miami`,
                        html: generateClientConfirmationEmail(leadData),
                    }).catch(err => {
                        console.warn('Client confirmation email skipped/failed (likely Resend sandbox mode):', err?.message || err);
                        return { error: err?.message || 'Client email skipped' };
                    });
                }

                const results = await Promise.all([adminEmailPromise, clientEmailPromise]);
                emailResult = { admin: results[0], client: results[1] };
            } catch (emailError) {
                console.error('Email sending failed (non-blocking):', emailError);
                emailResult = { error: 'Email failed but lead was saved' };
            }
        }

        return response.status(200).json({
            success: dbSuccess || Boolean(blobBackupUrl),
            db: dbSuccess,
            dbError: dbError?.message || null,
            blobBackup: blobBackupUrl ? { url: blobBackupUrl, status: 'saved' } : { status: blobError || 'token_pending' },
            email: emailResult,
            score
        });
    } catch (error) {
        console.error('Server Error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}


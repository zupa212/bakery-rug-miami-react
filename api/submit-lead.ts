import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { put } from '@vercel/blob';

// --- DATA TYPES ---
interface LeadEmailData {
    fullName: string;
    email: string;
    phone?: string;
    cityOrArea?: string;
    message?: string;
    itemName?: string;
    itemSlug?: string;
    sourcePage?: string;
    score?: number;
    metadata?: {
        platform?: string;
        timestamp?: string;
        ip?: string;
        userAgent?: string;
        clientEmail?: any;
    };
    ipCity?: string;
    ipCountry?: string;
}

// Security: HTML entity escaping to prevent stored email HTML injection
function escapeHtml(str?: string): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- EMAIL TEMPLATE GENERATORS ---
function generateAdminLeadEmail(data: LeadEmailData): string {
    const score = data.score ?? 50;
    const isHighPriority = score >= 50;
    const badgeColor = isHighPriority ? '#b45309' : '#1e3a8a';
    const badgeBg = isHighPriority ? '#fef3c7' : '#e0e7ff';
    const badgeText = isHighPriority ? `🔥 High Priority (Score: ${score}/100)` : `✨ New Inquiry (Score: ${score}/100)`;

    const safeFullName = escapeHtml(data.fullName);
    const safePhone = escapeHtml(data.phone);
    const safeEmail = escapeHtml(data.email);
    const safeItemName = escapeHtml(data.itemName || 'Rug Care');
    const safeCityOrArea = escapeHtml(data.cityOrArea || 'Miami, FL');
    const safeIpCity = escapeHtml(data.ipCity);
    const safeIpCountry = escapeHtml(data.ipCountry);
    const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br/>') : '';
    const safeSourcePage = escapeHtml(data.sourcePage || '/');
    const safePlatform = escapeHtml(data.metadata?.platform || 'Desktop');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Lead Inquiry - Bakers Rug Service</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <!-- Preview Text visible in email notifications and inbox previews -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #ffffff; opacity: 0;">
    New Lead from ${safeFullName} | Phone: ${safePhone || 'Not provided'} | Email: ${safeEmail} | Service: ${safeItemName}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #091124 0%, #101c38 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                BAKERS RUG SERVICE
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 600;">
                Master Rug Care &amp; Restoration &bull; Miami, FL
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: ${badgeBg}; border-radius: 8px; padding: 10px 16px; text-align: center;">
                    <span style="font-size: 13px; font-weight: 700; color: ${badgeColor}; letter-spacing: 0.5px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 30px 20px 30px; text-align: center;">
              <h2 style="margin: 0; font-family: 'Georgia', serif; font-size: 22px; color: #091124;">
                New Consultation Inquiry
              </h2>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #64748b;">
                A new customer request has been submitted through the Bakers Rug Service website.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Client Name
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #0f172a;">
                    ${safeFullName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Phone
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    ${safePhone ? `<a href="tel:${safePhone}" style="color: #0f172a; text-decoration: none; font-weight: 700; font-size: 16px;">${safePhone}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Email
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    <a href="mailto:${safeEmail}" style="color: #091124; font-weight: 600; text-decoration: underline;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Interest / Service
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #b45309;">
                    ${safeItemName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Location
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;">
                    ${safeCityOrArea} ${safeIpCity ? `(${safeIpCity}, ${safeIpCountry})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; vertical-align: top;">
                    Client Message
                  </td>
                  <td style="padding: 16px 20px; font-size: 14px; color: #334155; line-height: 1.6;">
                    ${safeMessage || '<em style="color: #94a3b8;">No additional message written.</em>'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  ${safePhone ? `
                  <td style="padding: 0 6px;">
                    <a href="tel:${safePhone}" style="display: inline-block; background-color: #d4af37; color: #091124; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px;">
                      📞 Call Client Now
                    </a>
                  </td>` : ''}
                  <td style="padding: 0 6px;">
                    <a href="mailto:${safeEmail}?subject=Regarding%20Your%20Bakers%20Rug%20Service%20Inquiry" style="display: inline-block; background-color: #091124; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px;">
                      ✉️ Reply via Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <strong>Source Page:</strong> ${safeSourcePage}
                  </td>
                  <td align="right">
                    <strong>Device:</strong> ${safePlatform}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #091124; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                Bakers Rug Service &bull; 100+ Years of Heritage
              </p>
              <p style="margin: 0;">
                8723 SW 132 ST, Miami, FL 33176 &bull; <a href="tel:305-801-9000" style="color: #ffffff; text-decoration: none;">(305) 801-9000</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateClientConfirmationEmail(data: LeadEmailData): string {
    const safeFullName = escapeHtml(data.fullName);
    const safeItemName = escapeHtml(data.itemName || 'our fine rug services');
    const safePhone = escapeHtml(data.phone);
    const safeEmail = escapeHtml(data.email);
    const safeCityOrArea = escapeHtml(data.cityOrArea || 'Miami, FL');
    const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br/>') : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You - Bakers Rug Service</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #ffffff; opacity: 0;">
    Thank you for contacting Bakers Rug Service regarding ${safeItemName}. We have received your details.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="580" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #091124 0%, #101c38 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 3px; color: #ffffff; text-transform: uppercase;">
                BAKERS RUG SERVICE
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 600;">
                Master Rug Care &amp; Restoration &bull; Miami, FL
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 16px 0; font-family: 'Georgia', serif; font-size: 22px; color: #091124;">
                Thank You, ${safeFullName}
              </h2>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
                We have received your inquiry regarding <strong>${safeItemName}</strong>. Our team of master rug specialists is reviewing your details.
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 20px 0;">
                To maintain the highest level of craftsmanship, our specialists handle each piece with utmost care and personalized attention. We will be in touch with you shortly.
              </p>

              <!-- Customer Contact Information Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 0 24px 0; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 1px;">
                    Your Inquiry &amp; Contact Details
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; width: 35%; font-size: 13px; font-weight: 600; color: #64748b;">
                    Full Name
                  </td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">
                    ${safeFullName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">
                    Phone
                  </td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a;">
                    ${safePhone ? `<a href="tel:${safePhone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${safePhone}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">
                    Email
                  </td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a;">
                    ${safeEmail}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">
                    Service / Rug
                  </td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #b45309;">
                    ${safeItemName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; ${data.message ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 13px; font-weight: 600; color: #64748b;">
                    Location
                  </td>
                  <td style="padding: 10px 16px; ${data.message ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 14px; color: #0f172a;">
                    ${safeCityOrArea}
                  </td>
                </tr>
                ${data.message ? `
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #64748b; vertical-align: top;">
                    Message
                  </td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #334155; line-height: 1.5;">
                    ${safeMessage}
                  </td>
                </tr>` : ''}
              </table>

              <div style="text-align: center; padding-top: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b;">
                  Need immediate assistance? Feel free to reach out directly:
                </p>
                <a href="tel:305-801-9000" style="display: inline-block; background-color: #091124; color: #d4af37; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; letter-spacing: 0.5px;">
                  📞 (305) 801-9000
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #091124; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                Bakers Rug Service &bull; 8723 SW 132 ST, Miami, FL 33176
              </p>
              <p style="margin: 0 0 4px 0;">
                Master Hand-Wash Only &bull; Persian &amp; Oriental Specialists &bull; Insured
              </p>
              <p style="margin: 0; color: #64748b;">
                Over 100 Years of Heritage Serving South Florida
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Plain text alternative generators for email clients without HTML support
function generateAdminLeadText(data: LeadEmailData): string {
    const score = data.score ?? 50;
    return `NEW CONSULTATION INQUIRY - BAKERS RUG SERVICE
======================================================
CLIENT CONTACT INFORMATION:
- Full Name:        ${data.fullName}
- Phone Number:     ${data.phone || 'Not provided'}
- Email Address:    ${data.email}
- Service / Rug:    ${data.itemName || 'General Consultation'}
- Location:         ${data.cityOrArea || 'Miami, FL'}${data.ipCity ? ` (${data.ipCity}, ${data.ipCountry})` : ''}

CLIENT MESSAGE:
${data.message || 'No additional message provided.'}

SUBMISSION DETAILS:
- Source Page:      ${data.sourcePage || '/'}
- Platform/Device:  ${data.metadata?.platform || 'Desktop'}
- Lead Score:       ${score}/100
- Submitted At:     ${new Date().toLocaleString()}
======================================================
Bakers Rug Service • 8723 SW 132 ST, Miami, FL 33176
Call: (305) 801-9000 • https://bakersrug.com
`;
}

function generateClientConfirmationText(data: LeadEmailData): string {
    return `BAKERS RUG SERVICE
Thank you, ${data.fullName}!

We have received your inquiry regarding "${data.itemName || 'our fine rug services'}". Our team of master rug specialists is reviewing your details.

To maintain the highest level of craftsmanship, our specialists handle each piece with utmost care and personalized attention. We will be in touch with you shortly.

YOUR SUBMITTED INQUIRY & CONTACT DETAILS:
- Full Name:        ${data.fullName}
- Phone:            ${data.phone || 'Not provided'}
- Email:            ${data.email}
- Service / Rug:    ${data.itemName || 'General Consultation'}
- Location:         ${data.cityOrArea || 'Miami, FL'}
${data.message ? `- Message:         ${data.message}\n` : ''}

Need immediate assistance? Feel free to call us directly: (305) 801-9000

Bakers Rug Service
8723 SW 132 ST, Miami, FL 33176
Master Hand-Wash Only • Persian & Oriental Specialists • Insured
https://bakersrug.com
`;
}

// --- ANALYSIS UTILS ---
const calculateLeadScore = (data: any) => {
    let score = 10;
    if (data.phone) score += 40;
    if (data.message && data.message.length > 50) score += 20;
    if (data.cityOrArea) score += 10;
    if (data.itemName) score += 20;
    if (data.serviceType) score += 15;
    if (data.email && (data.email.endsWith('.edu') || data.email.endsWith('.gov'))) score += 10;
    return Math.min(score, 100);
};

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Anti-spam honeypot check (catches automated spam bots)
    const { website, fax, b_url } = request.body || {};
    if (website || fax || b_url) {
        return response.status(200).json({ success: true, message: 'Inquiry received' });
    }

    const { fullName, email, phone, cityOrArea, message, itemName, itemSlug, sourcePage, serviceType } = request.body || {};
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipCountry = (request.headers['x-vercel-ip-country'] as string) || 'US';
    const ipCity = (request.headers['x-vercel-ip-city'] as string) || 'Miami';
    const ip = (request.headers['x-forwarded-for'] as string) || 'Unknown';

    // 2. Strict Input Validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        return response.status(400).json({ error: 'Full name is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return response.status(400).json({ error: 'A valid email address is required' });
    }

    // 3. Payload length limits & trimming
    const cleanFullName = fullName.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 120);
    const cleanPhone = phone ? String(phone).trim().slice(0, 30) : undefined;
    const cleanCity = cityOrArea ? String(cityOrArea).trim().slice(0, 100) : 'Miami, FL';
    const cleanMessage = message ? String(message).trim().slice(0, 3000) : undefined;
    const cleanItemName = itemName ? String(itemName).trim().slice(0, 120) : (serviceType ? `Service Request: ${String(serviceType).trim().slice(0, 50)}` : 'General Consultation');
    const cleanItemSlug = itemSlug ? String(itemSlug).trim().slice(0, 100) : undefined;
    const cleanSourcePage = sourcePage ? String(sourcePage).trim().slice(0, 200) : '/';

    const BUSINESS_EMAIL = (process.env.BUSINESS_EMAIL || 'bakersrug@comcast.net').toLowerCase().trim();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const resendApiKey = process.env.RESEND_API_KEY || '';

    try {
        const score = calculateLeadScore(request.body);
        const baseMetadata: any = {
            userAgent,
            ip,
            timestamp: new Date().toISOString(),
            platform: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
        };

        const leadData: LeadEmailData = {
            fullName: cleanFullName,
            email: cleanEmail,
            phone: cleanPhone,
            cityOrArea: cleanCity,
            message: cleanMessage,
            itemName: cleanItemName,
            itemSlug: cleanItemSlug,
            sourcePage: cleanSourcePage,
            score,
            metadata: baseMetadata,
            ipCity,
            ipCountry
        };

        // 1. Send Emails via Resend (Client Confirmation & Admin Alert)
        let emailResult: any = { skipped: true };
        let clientEmailInfo: {
            resendId: string | null;
            status: 'delivered' | 'sent' | 'failed' | 'skipped';
            sentAt: string;
            recipient: string;
            error?: string | null;
            lastEvent: string;
        } = {
            resendId: null,
            status: 'skipped',
            sentAt: new Date().toISOString(),
            recipient: email,
            lastEvent: 'none'
        };

        if (resendApiKey) {
            try {
                const resend = new Resend(resendApiKey);
                const urgencyIcon = score > 50 ? '🔥' : '✨';
                const phoneSnippet = phone ? ` | 📞 ${phone}` : '';
                const adminSubject = `${urgencyIcon} New Lead: ${fullName}${phoneSnippet} | ✉️ ${email}`;

                const adminEmailPromise = resend.emails.send({
                    from: 'Bakers Rug Service Admin <onboarding@resend.dev>',
                    to: [BUSINESS_EMAIL],
                    subject: adminSubject,
                    html: generateAdminLeadEmail(leadData),
                    text: generateAdminLeadText(leadData),
                }).catch(err => ({ error: err?.message || 'Admin email failed' }));

                const clientEmailPromise = resend.emails.send({
                    from: 'Bakers Rug Service <onboarding@resend.dev>',
                    to: [email],
                    subject: `Thank you for contacting Bakers Rug Service`,
                    html: generateClientConfirmationEmail(leadData),
                    text: generateClientConfirmationText(leadData),
                }).catch(err => ({ error: err?.message || 'Client email failed' }));

                const [adminRes, clientRes] = await Promise.all([adminEmailPromise, clientEmailPromise]);
                emailResult = { admin: adminRes, client: clientRes };

                if (clientRes && (clientRes as any).data?.id) {
                    clientEmailInfo = {
                        resendId: (clientRes as any).data.id,
                        status: 'sent',
                        sentAt: new Date().toISOString(),
                        recipient: email,
                        lastEvent: 'sent'
                    };
                } else if ((clientRes as any)?.skipped) {
                    clientEmailInfo = {
                        resendId: null,
                        status: 'skipped',
                        sentAt: new Date().toISOString(),
                        recipient: email,
                        lastEvent: 'skipped'
                    };
                } else {
                    const errMsg = (clientRes as any)?.error?.message || (clientRes as any)?.error || 'Send error';
                    clientEmailInfo = {
                        resendId: null,
                        status: 'failed',
                        sentAt: new Date().toISOString(),
                        recipient: email,
                        error: errMsg,
                        lastEvent: 'failed'
                    };
                }
            } catch (emailError: any) {
                emailResult = { error: emailError?.message || 'Email dispatch failed' };
                clientEmailInfo = {
                    resendId: null,
                    status: 'failed',
                    sentAt: new Date().toISOString(),
                    recipient: email,
                    error: emailError?.message,
                    lastEvent: 'failed'
                };
            }
        }

        // Merge client email tracking into metadata
        const fullMetadata = {
            ...baseMetadata,
            clientEmail: clientEmailInfo
        };
        leadData.metadata = fullMetadata;

        // 2. Store in Supabase
        let dbSuccess = false;
        let dbError: any = null;

        if (supabaseUrl && supabaseServiceKey) {
            try {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);

                // Attempt full insert with analytics & clientEmail metadata
                const fullInsert = await supabase
                    .from('leads')
                    .insert([
                        {
                            full_name: cleanFullName,
                            email: cleanEmail,
                            phone: cleanPhone,
                            city_or_area: leadData.cityOrArea,
                            message: cleanMessage,
                            item_name: leadData.itemName,
                            item_slug: cleanItemSlug,
                            source_page: leadData.sourcePage,
                            score,
                            metadata: fullMetadata,
                            ip_country: ipCountry,
                            ip_city: ipCity
                        },
                    ]);

                if (fullInsert.error) {
                    // Fallback to basic columns if needed
                    const basicInsert = await supabase
                        .from('leads')
                        .insert([
                            {
                                full_name: cleanFullName,
                                email: cleanEmail,
                                phone: cleanPhone,
                                city_or_area: leadData.cityOrArea,
                                message: cleanMessage,
                                item_name: leadData.itemName,
                                item_slug: cleanItemSlug,
                                source_page: leadData.sourcePage,
                                metadata: fullMetadata
                            },
                        ]);

                    if (basicInsert.error) {
                        dbError = basicInsert.error;
                    } else {
                        dbSuccess = true;
                    }
                } else {
                    dbSuccess = true;
                }
            } catch (err: any) {
                dbError = err?.message || String(err);
            }
        } else {
            dbError = 'Supabase credentials missing';
        }

        // 3. FAIL-SAFE: Store in Vercel Blob
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
                    clientEmail: clientEmailInfo,
                    createdAt: new Date().toISOString()
                }, null, 2);

                const blob = await put(blobFileName, blobPayload, {
                    access: 'public',
                    contentType: 'application/json',
                    addRandomSuffix: true
                });

                blobBackupUrl = blob.url;
            } catch (bErr: any) {
                blobError = bErr?.message || String(bErr);
            }
        }

        return response.status(200).json({
            success: dbSuccess || Boolean(blobBackupUrl),
            db: dbSuccess,
            dbError: dbError ? (dbError.message || String(dbError)) : null,
            blobBackup: blobBackupUrl ? { url: blobBackupUrl, status: 'saved' } : { status: blobError || 'token_pending' },
            email: emailResult,
            clientEmail: clientEmailInfo,
            score
        });
    } catch (error: any) {
        console.error('Submit lead error:', error);
        return response.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
}

import fs from 'fs';
import path from 'path';

let apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    try {
        const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
        const match = envContent.match(/RESEND_API_KEY=([^\r\n]+)/);
        if (match) apiKey = match[1].trim();
    } catch {}
}
const businessEmail = process.env.BUSINESS_EMAIL || 'bakersrug@comcast.net';

const sampleLead = {
    fullName: 'Alexander Wright',
    email: 'alexander.wright@luxuryestates.com',
    phone: '(305) 555-0199',
    cityOrArea: 'Coral Gables, FL',
    message: 'We have an antique 1920s Silk Tabriz carpet (10x14) requiring specialized organic hand-washing and minor fringe restoration. Please let us know availability for an in-home evaluation.',
    itemName: 'Antique Silk Tabriz (10x14) Restoration',
    sourcePage: '/services/rug-cleaning',
    score: 95,
    metadata: {
        platform: 'Desktop (macOS / Safari)',
        timestamp: new Date().toISOString(),
    },
    ipCity: 'Miami',
    ipCountry: 'US'
};

const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Lead Inquiry - BakersRug Miami</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091124 0%, #101c38 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                BAKERS RUG
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 600;">
                Fine Rug Gallery &amp; Master Restoration &bull; Miami, FL
              </p>
            </td>
          </tr>

          <!-- Priority Alert Banner -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #fef3c7; border-radius: 8px; padding: 12px 16px; text-align: center; border: 1px solid #fde68a;">
                    <span style="font-size: 14px; font-weight: 700; color: #b45309; letter-spacing: 0.5px;">
                      🔥 High Priority Lead (Score: 95/100)
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inquiry Title -->
          <tr>
            <td style="padding: 10px 30px 20px 30px; text-align: center;">
              <h2 style="margin: 0; font-family: 'Georgia', serif; font-size: 22px; color: #091124;">
                New Consultation Inquiry
              </h2>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #64748b;">
                A new client request was submitted via BakersRug.com
              </p>
            </td>
          </tr>

          <!-- Lead Details Table -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Client Name
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #0f172a;">
                    ${sampleLead.fullName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Phone
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    <a href="tel:${sampleLead.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${sampleLead.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Email
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    <a href="mailto:${sampleLead.email}" style="color: #091124; font-weight: 600; text-decoration: underline;">${sampleLead.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Interest / Service
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #b45309;">
                    ${sampleLead.itemName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Location
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;">
                    ${sampleLead.cityOrArea} (${sampleLead.ipCity}, ${sampleLead.ipCountry})
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; vertical-align: top;">
                    Client Message
                  </td>
                  <td style="padding: 16px 20px; font-size: 14px; color: #334155; line-height: 1.6;">
                    ${sampleLead.message}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Action Buttons -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="tel:${sampleLead.phone}" style="display: inline-block; background-color: #d4af37; color: #091124; font-weight: 700; font-size: 13px; text-decoration: none; padding: 14px 26px; border-radius: 6px; letter-spacing: 0.5px;">
                      📞 Call Client Now
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:${sampleLead.email}?subject=Regarding%20Your%20BakersRug%20Inquiry" style="display: inline-block; background-color: #091124; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 14px 26px; border-radius: 6px; letter-spacing: 0.5px;">
                      ✉️ Reply via Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata Context -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <strong>Source Page:</strong> ${sampleLead.sourcePage}
                  </td>
                  <td align="right">
                    <strong>Device:</strong> ${sampleLead.metadata.platform}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heritage Footer -->
          <tr>
            <td style="background-color: #091124; padding: 26px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                Bakers Rug &bull; 100+ Years of Heritage
              </p>
              <p style="margin: 0 0 4px 0;">
                8723 SW 132 ST, Miami, FL 33176 &bull; <a href="tel:305-801-9000" style="color: #ffffff; text-decoration: none;">(305) 801-9000</a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                Master Hand-Wash Only &bull; Persian &amp; Oriental Specialists &bull; Insured &amp; Bonded
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function main() {
    console.log(`Sending luxury BakersRug test email to: ${businessEmail}...`);
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'BakersRug Admin <onboarding@resend.dev>',
                to: [businessEmail],
                subject: `🔥 [Live Test] New Lead [Score: 95]: ${sampleLead.fullName} - BakersRug Miami`,
                html: adminHtml,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to send email:', data);
            process.exit(1);
        }

        console.log('✅ Email successfully sent via Resend API!');
        console.log('Message ID:', data.id);
        console.log(`Recipient: ${businessEmail}`);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

main();

export interface LeadEmailData {
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
    };
    ipCity?: string;
    ipCountry?: string;
}

export function generateAdminLeadEmail(data: LeadEmailData): string {
    const score = data.score ?? 50;
    const isHighPriority = score >= 50;
    const badgeColor = isHighPriority ? '#b45309' : '#1e3a8a';
    const badgeBg = isHighPriority ? '#fef3c7' : '#e0e7ff';
    const badgeText = isHighPriority ? `🔥 High Priority (Score: ${score}/100)` : `✨ New Inquiry (Score: ${score}/100)`;

    return `
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
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091124 0%, #101c38 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                BAKERS RUG
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 600;">
                Fine Rug Gallery &amp; Master Restoration &bull; Miami, FL
              </p>
            </td>
          </tr>

          <!-- Priority Alert Banner -->
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

          <!-- Inquiry Title -->
          <tr>
            <td style="padding: 10px 30px 20px 30px; text-align: center;">
              <h2 style="margin: 0; font-family: 'Georgia', serif; font-size: 22px; color: #091124;">
                New Consultation Inquiry
              </h2>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #64748b;">
                A new customer request has been submitted through the BakersRug website.
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
                    ${data.fullName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Phone
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    ${data.phone ? `<a href="tel:${data.phone}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${data.phone}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Email
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #0f172a;">
                    <a href="mailto:${data.email}" style="color: #091124; font-weight: 600; text-decoration: underline;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Interest / Service
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #b45309;">
                    ${data.itemName || 'General Restoration / Cleaning Inquiry'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
                    Location
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;">
                    ${data.cityOrArea || 'Miami, FL'} ${data.ipCity ? `(${data.ipCity}, ${data.ipCountry})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; vertical-align: top;">
                    Client Message
                  </td>
                  <td style="padding: 16px 20px; font-size: 14px; color: #334155; line-height: 1.6;">
                    ${data.message ? data.message.replace(/\n/g, '<br/>') : '<em style="color: #94a3b8;">No additional message written.</em>'}
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
                  ${data.phone ? `
                  <td style="padding: 0 6px;">
                    <a href="tel:${data.phone}" style="display: inline-block; background-color: #d4af37; color: #091124; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px;">
                      📞 Call Client
                    </a>
                  </td>` : ''}
                  <td style="padding: 0 6px;">
                    <a href="mailto:${data.email}?subject=Regarding%20Your%20BakersRug%20Inquiry" style="display: inline-block; background-color: #091124; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px;">
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
                    <strong>Source Page:</strong> ${data.sourcePage || '/'}
                  </td>
                  <td align="right">
                    <strong>Device:</strong> ${data.metadata?.platform || 'Desktop'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heritage Footer -->
          <tr>
            <td style="background-color: #091124; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                Bakers Rug &bull; 100+ Years of Heritage
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
</html>
`;
}

export function generateClientConfirmationEmail(data: LeadEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You - BakersRug Miami</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #091124 0%, #101c38 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                BAKERS RUG
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; font-weight: 600;">
                Fine Rug Gallery &amp; Master Restoration &bull; Miami, FL
              </p>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 36px 36px 20px 36px;">
              <h2 style="margin: 0 0 14px 0; font-family: 'Georgia', serif; font-size: 22px; color: #091124;">
                Thank You, ${data.fullName}
              </h2>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 18px 0;">
                We have received your inquiry regarding <strong>${data.itemName || 'our fine rug services'}</strong>. Our team of master restoration artisans and rug specialists is reviewing your details.
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 24px 0;">
                To maintain the highest level of craftsmanship, our specialists handle each piece with museum-grade care and personalized attention. We will be in touch with you shortly.
              </p>
            </td>
          </tr>

          <!-- Process Highlights -->
          <tr>
            <td style="padding: 0 36px 30px 36px;">
              <div style="background-color: #fbf9f5; border: 1px solid #ede8df; border-radius: 10px; padding: 20px 24px;">
                <p style="margin: 0 0 12px 0; font-family: 'Georgia', serif; font-size: 15px; font-weight: 700; color: #091124;">
                  What to Expect Next:
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #475569;">
                      <strong style="color: #d4af37;">1.</strong> <strong>Expert Review:</strong> Assessment of your rug’s fiber, weave, origin, and specific needs.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #475569;">
                      <strong style="color: #d4af37;">2.</strong> <strong>Custom Proposal:</strong> Clear, transparent estimate and care plan tailored to your piece.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #475569;">
                      <strong style="color: #d4af37;">3.</strong> <strong>White-Glove Service:</strong> Insured pickup, specialized hand-cleaning/repair, and delivery throughout South Florida.
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Direct Contact -->
          <tr>
            <td style="padding: 0 36px 36px 36px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">
                Need immediate assistance? Feel free to reach out directly:
              </p>
              <a href="tel:305-801-9000" style="display: inline-block; background-color: #091124; color: #d4af37; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; letter-spacing: 0.5px;">
                📞 (305) 801-9000
              </a>
            </td>
          </tr>

          <!-- Heritage Footer -->
          <tr>
            <td style="background-color: #091124; padding: 28px 36px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                Bakers Rug Gallery &bull; 8723 SW 132 ST, Miami, FL 33176
              </p>
              <p style="margin: 0 0 4px 0;">
                Master Hand-Wash Only &bull; Persian &amp; Oriental Specialists &bull; Insured &amp; Bonded
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
</html>
`;
}

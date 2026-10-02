import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface LeadEmailData {
    fullName: string;
    email: string;
    phone?: string;
    cityOrArea?: string;
    message?: string;
    itemName?: string;
    itemSlug?: string;
    sourcePage?: string;
}

function generateClientConfirmationEmail(data: LeadEmailData): string {
    return `<!DOCTYPE html>
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
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
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
</html>`;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const resendApiKey = process.env.RESEND_API_KEY || '';

    if (!resendApiKey) {
        return response.status(500).json({ error: 'RESEND_API_KEY is not configured on the server.' });
    }

    const { action, resendId, leadId, overrideEmail } = request.body || {};
    const resend = new Resend(resendApiKey);

    try {
        // --- 1. ACTION: CHECK LIVE DELIVERY STATUS ---
        if (action === 'check_status') {
            if (!resendId) {
                return response.status(400).json({ error: 'Missing required parameter: resendId' });
            }

            const { data: emailData, error: resendError } = await resend.emails.get(resendId);
            if (resendError || !emailData) {
                return response.status(400).json({
                    error: resendError?.message || 'Could not retrieve email status from Resend.',
                    resendError
                });
            }

            const lastEvent = (emailData as any).last_event || 'sent';
            let calculatedStatus: 'delivered' | 'sent' | 'failed' = 'sent';
            if (lastEvent === 'bounced' || lastEvent === 'complained') {
                calculatedStatus = 'failed';
            } else if (lastEvent === 'delivered' || lastEvent === 'opened' || lastEvent === 'clicked') {
                calculatedStatus = 'delivered';
            }

            // Sync with Supabase if leadId provided
            let dbUpdated = false;
            let updatedClientEmail: any = null;

            if (leadId && supabaseUrl && supabaseServiceKey) {
                try {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey);
                    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
                    if (lead) {
                        const existingMeta = lead.metadata || {};
                        const existingClientEmail = existingMeta.clientEmail || {};
                        updatedClientEmail = {
                            ...existingClientEmail,
                            resendId,
                            status: calculatedStatus,
                            lastEvent,
                            checkedAt: new Date().toISOString()
                        };

                        await supabase
                            .from('leads')
                            .update({
                                metadata: {
                                    ...existingMeta,
                                    clientEmail: updatedClientEmail
                                }
                            })
                            .eq('id', leadId);
                        dbUpdated = true;
                    }
                } catch (dbErr) {
                    console.error('Failed to update Supabase lead status:', dbErr);
                }
            }

            return response.status(200).json({
                success: true,
                lastEvent,
                status: calculatedStatus,
                email: emailData,
                dbUpdated,
                updatedClientEmail
            });
        }

        // --- 2. ACTION: RESEND CLIENT CONFIRMATION EMAIL ---
        if (action === 'resend_client_email') {
            if (!leadId) {
                return response.status(400).json({ error: 'Missing required parameter: leadId' });
            }

            if (!supabaseUrl || !supabaseServiceKey) {
                return response.status(500).json({ error: 'Supabase credentials missing' });
            }

            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data: lead, error: fetchErr } = await supabase
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .single();

            if (fetchErr || !lead) {
                return response.status(404).json({ error: 'Lead not found in database: ' + (fetchErr?.message || '') });
            }

            const recipient = overrideEmail || lead.email;
            if (!recipient) {
                return response.status(400).json({ error: 'Lead does not have a valid email address.' });
            }

            const leadData: LeadEmailData = {
                fullName: lead.full_name || 'Valued Customer',
                email: recipient,
                phone: lead.phone,
                cityOrArea: lead.city_or_area,
                message: lead.message,
                itemName: lead.item_name || 'Fine Rug Inquiry',
                itemSlug: lead.item_slug,
                sourcePage: lead.source_page || '/admin'
            };

            const sendResult = await resend.emails.send({
                from: 'BakersRug <onboarding@resend.dev>',
                to: [recipient],
                subject: 'Thank you for contacting BakersRug Miami',
                html: generateClientConfirmationEmail(leadData)
            });

            if (sendResult.error || !sendResult.data) {
                return response.status(400).json({
                    error: sendResult.error?.message || 'Failed to dispatch confirmation email',
                    sendResult
                });
            }

            const newResendId = sendResult.data.id;
            const newClientEmail = {
                resendId: newResendId,
                status: 'sent',
                sentAt: new Date().toISOString(),
                recipient,
                lastEvent: 'sent'
            };

            const existingMeta = lead.metadata || {};
            await supabase
                .from('leads')
                .update({
                    metadata: {
                        ...existingMeta,
                        clientEmail: newClientEmail
                    }
                })
                .eq('id', leadId);

            return response.status(200).json({
                success: true,
                message: `Confirmation email dispatched to ${recipient}`,
                clientEmail: newClientEmail,
                resendId: newResendId
            });
        }

        // --- 3. ACTION: BATCH CHECK STATUS ---
        if (action === 'batch_check_status') {
            const { items } = request.body;
            if (!Array.isArray(items) || items.length === 0) {
                return response.status(400).json({ error: 'Missing items array' });
            }

            const limitedItems = items.slice(0, 10);
            const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

            const results = await Promise.all(limitedItems.map(async (item: { leadId?: string, resendId: string }) => {
                if (!item.resendId) return { leadId: item.leadId, error: 'No resendId' };
                try {
                    const { data: emailData, error } = await resend.emails.get(item.resendId);
                    if (error || !emailData) {
                        return { leadId: item.leadId, resendId: item.resendId, error: error?.message || 'Not found' };
                    }
                    const lastEvent = (emailData as any).last_event || 'sent';
                    let calculatedStatus = 'sent';
                    if (lastEvent === 'bounced' || lastEvent === 'complained') calculatedStatus = 'failed';
                    else if (lastEvent === 'delivered' || lastEvent === 'opened' || lastEvent === 'clicked') calculatedStatus = 'delivered';

                    if (item.leadId && supabase) {
                        const { data: lead } = await supabase.from('leads').select('*').eq('id', item.leadId).single();
                        if (lead) {
                            const existingMeta = lead.metadata || {};
                            const existingClientEmail = existingMeta.clientEmail || {};
                            await supabase.from('leads').update({
                                metadata: {
                                    ...existingMeta,
                                    clientEmail: {
                                        ...existingClientEmail,
                                        resendId: item.resendId,
                                        status: calculatedStatus,
                                        lastEvent,
                                        checkedAt: new Date().toISOString()
                                    }
                                }
                            }).eq('id', item.leadId);
                        }
                    }

                    return {
                        leadId: item.leadId,
                        resendId: item.resendId,
                        lastEvent,
                        status: calculatedStatus
                    };
                } catch (e: any) {
                    return { leadId: item.leadId, resendId: item.resendId, error: e?.message };
                }
            }));

            return response.status(200).json({ success: true, results });
        }

        return response.status(400).json({ error: 'Invalid action specified. Supported: check_status, resend_client_email, batch_check_status' });
    } catch (err: any) {
        console.error('Error in /api/email-action:', err);
        return response.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
}

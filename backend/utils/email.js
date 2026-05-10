import { Resend } from 'resend';

const COLORS = {
    bgDark:      '#08101C',
    bgCard:      '#0D1A2B',
    bgElevated:  '#111F30',
    border:      'rgba(100, 190, 255, 0.12)',
    borderBright:'rgba(100, 190, 255, 0.3)',
    glacier:     '#64BEFF',
    snow:        '#F0F8FF',
    muted:       'rgba(240, 248, 255, 0.55)',
    faint:       'rgba(240, 248, 255, 0.25)',
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'Mountaineer Mallu <noreply@mountaineermallu.com>';
const SITE_URL   = process.env.CLIENT_URL  || 'http://localhost:5173';

// ─── Ultra-Premium OTP Email Template ─────────────────────────────────────────
export const getOtpEmailTemplate = (otp, userName) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mountaineer Mallu — Password Reset</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bgDark};font-family:'Inter',Arial,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgDark};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgCard};border-radius:16px 16px 0 0;border:1px solid ${COLORS.border};border-bottom:none;">
                <tr><td style="height:3px;background:linear-gradient(90deg,transparent,${COLORS.glacier},rgba(226,149,90,0.8),transparent);border-radius:999px 999px 0 0;"></td></tr>
                <tr>
                  <td align="center" style="padding:24px 40px;">
                    <p style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:${COLORS.glacier};letter-spacing:3px;text-transform:uppercase;margin:0;">MOUNTAINEER MALLU</p>
                    <p style="font-size:10px;font-weight:600;color:${COLORS.faint};letter-spacing:4px;text-transform:uppercase;margin:6px 0 0;">Kerala Alps Alliance · Germany</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO AREA -->
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgCard};border-left:1px solid ${COLORS.border};border-right:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};">
                <tr>
                  <td style="background:linear-gradient(160deg,${COLORS.bgElevated} 0%,${COLORS.bgCard} 100%);padding:48px 40px 36px;text-align:center;border-bottom:1px solid ${COLORS.border};">
                    <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(100,190,255,0.12);border:1.5px solid rgba(100,190,255,0.35);font-size:32px;line-height:72px;text-align:center;margin-bottom:20px;">🔐</div>
                    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:${COLORS.snow};margin:0 0 12px;letter-spacing:-0.5px;line-height:1.2;">Password Reset</h1>
                    <p style="font-size:15px;color:${COLORS.muted};margin:0;line-height:1.6;max-width:400px;display:inline-block;">A request was made to reset your Mountaineer Mallu account password. Use the code below to verify your identity.</p>
                    <div style="margin-top:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(100,190,255,0.3),transparent);"></div>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 32px;">
                      Hello <strong style="color:${COLORS.snow};">${userName}</strong>,<br/>
                      Enter this code in the password reset form. It is valid for <strong>10 minutes</strong> and can only be used once.
                    </p>

                    <!-- OTP BOX — Individual digit cells for easy selection -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td style="background:rgba(100,190,255,0.08);border:1.5px solid ${COLORS.borderBright};border-radius:16px;padding:28px 32px;text-align:center;">
                          <p style="font-size:10px;font-weight:600;color:${COLORS.glacier};letter-spacing:3px;text-transform:uppercase;margin:0 0 18px;">Verification Code</p>
                          <!-- Individual digit cells -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="8" align="center" style="margin:0 auto;">
                            <tr>
                              ${otp.split('').map(d => `<td style="width:48px;height:58px;background:rgba(100,190,255,0.1);border:1.5px solid rgba(100,190,255,0.35);border-radius:12px;text-align:center;vertical-align:middle;font-family:'Courier New',monospace;font-size:32px;font-weight:700;color:${COLORS.glacier};line-height:58px;">${d}</td>`).join('')}
                            </tr>
                          </table>
                          <p style="margin:18px 0 0;font-size:12px;color:${COLORS.muted};">Expires in <strong>10 minutes</strong></p>
                        </td>
                      </tr>
                    </table>
                    <!-- Copy-friendly plain text fallback -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 32px;">
                      <tr>
                        <td style="background:rgba(100,190,255,0.06);border:1px dashed rgba(100,190,255,0.25);border-radius:10px;padding:12px 28px;text-align:center;">
                          <p style="font-size:11px;color:${COLORS.faint};margin:0 0 6px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Tap to select · Long press to copy</p>
                          <p style="font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:12px;color:${COLORS.glacier};margin:0;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;">${otp}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- SECURITY NOTICE -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#FF6B6B1A;border:1px solid rgba(255,107,107,0.25);border-radius:12px;margin-bottom:32px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="28" style="font-size:18px;vertical-align:top;padding-top:2px;">⚠️</td>
                              <td>
                                <p style="font-size:13px;font-weight:600;color:#FF9999;margin:0 0 4px;">Security Notice</p>
                                <p style="font-size:13px;color:${COLORS.muted};margin:0;line-height:1.6;">
                                  If you did not request a password reset, please ignore this email.
                                  Your account remains secure and no changes have been made.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- STEPS -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgElevated};border:1px solid ${COLORS.border};border-radius:12px;">
                      <tr><td style="padding:14px 20px;border-bottom:1px solid ${COLORS.border};">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
                          <td width="36" style="font-size:16px;">1️⃣</td>
                          <td><p style="font-size:13px;color:${COLORS.muted};margin:0;">Copy the 6-digit code above</p></td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding:14px 20px;border-bottom:1px solid ${COLORS.border};">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
                          <td width="36" style="font-size:16px;">2️⃣</td>
                          <td><p style="font-size:13px;color:${COLORS.muted};margin:0;">Return to the reset form on the Mountaineer Mallu site</p></td>
                        </tr></table>
                      </td></tr>
                      <tr><td style="padding:14px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
                          <td width="36" style="font-size:16px;">3️⃣</td>
                          <td><p style="font-size:13px;color:${COLORS.muted};margin:0;">Enter your new secure password and confirm</p></td>
                        </tr></table>
                      </td></tr>
                    </table>

                    <div style="height:1px;background:linear-gradient(90deg,transparent,${COLORS.border},transparent);margin:32px 0;"></div>

                    <div style="text-align:center;">
                      <a href="${SITE_URL}" target="_blank" style="display:inline-block;padding:14px 36px;background:${COLORS.glacier};font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:700;color:${COLORS.bgDark};text-decoration:none;border-radius:10px;letter-spacing:0.5px;">Go to Mountaineer Mallu →</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 0 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="height:1px;background:linear-gradient(90deg,transparent,${COLORS.border},transparent);"></td></tr>
                <tr>
                  <td align="center" style="padding:24px 20px 0;">
                    <p style="font-size:12px;color:${COLORS.faint};line-height:1.7;margin:0;">
                      &copy; ${new Date().getFullYear()} Mountaineer Mallu · Germany &amp; European Alps<br/>
                      <a href="${SITE_URL}" style="color:${COLORS.glacier};text-decoration:none;">Visit Website</a>
                      &nbsp;·&nbsp;
                      <a href="${SITE_URL}/profile" style="color:${COLORS.glacier};text-decoration:none;">My Profile</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── sendEmail — wrapper using Resend (replaces the old nodemailer transport) ──
export const sendEmail = async ({ to, subject, html }) => {
    const client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!client) {
        console.error('[Email] RESEND_API_KEY not set — cannot send email.');
        throw new Error('Email service not configured.');
    }
    try {
        const { data, error } = await client.emails.send({
            from: EMAIL_FROM,
            to,
            subject,
            html
        });
        if (error) throw error;
        console.log('[Email] Sent via Resend:', data?.id);
        return data;
    } catch (error) {
        console.error('[Email] Resend send error:', error);
        throw new Error('Failed to send email. Please check your email configuration.');
    }
};

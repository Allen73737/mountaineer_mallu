import { Resend } from 'resend';

let resend = null;
const getResend = () => {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'Mountaineer Mallu <noreply@mountaineermallu.com>';
const SITE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Shared Design Tokens ──────────────────────────────────────────────────────
const COLORS = {
    bgDark:     '#08101C',
    bgCard:     '#0D1A2B',
    bgElevated: '#111F30',
    border:     'rgba(100, 190, 255, 0.12)',
    borderBright:'rgba(100, 190, 255, 0.3)',
    glacier:    '#64BEFF',
    glacierGlow:'rgba(100, 190, 255, 0.15)',
    sunrise:    '#E2955A',
    sunriseGlow:'rgba(226, 149, 90, 0.15)',
    snow:       '#F0F8FF',
    muted:      'rgba(240, 248, 255, 0.55)',
    faint:      'rgba(240, 248, 255, 0.25)',
    danger:     '#FF6B6B',
    success:    '#4ECDC4',
};

// ─── Base Template Shell ───────────────────────────────────────────────────────
const shell = (content, preheader = '') => `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Mountaineer Mallu</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 0 !important; }
      .email-body { padding: 24px 20px !important; border-radius: 0 !important; }
      .hero-title { font-size: 28px !important; }
      .cta-btn { display: block !important; text-align: center !important; }
      .info-grid { display: block !important; }
      .info-cell { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLORS.bgDark};font-family:'Inter',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgDark};">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
          
          <!-- HEADER / LOGO BAR -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgCard};border-radius:16px 16px 0 0;border:1px solid ${COLORS.border};border-bottom:none;">
                <tr>
                  <td style="padding: 28px 40px; display:flex; align-items:center; justify-content:space-between;">
                    <!-- Decorative top bar -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="height:3px;background:linear-gradient(90deg, transparent, ${COLORS.glacier}, ${COLORS.sunrise}, transparent);border-radius:999px;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 24px 40px;" align="center">
                          <div style="display:inline-flex;align-items:center;gap:10px;">
                            <span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:${COLORS.glacier};letter-spacing:3px;text-transform:uppercase;">MOUNTAINEER MALLU</span>
                          </div>
                          <div style="margin-top:6px;font-size:10px;font-weight:600;color:${COLORS.faint};letter-spacing:4px;text-transform:uppercase;">Summit Control — Kerala Alps Alliance</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-body" style="background:${COLORS.bgCard};border-radius:0 0 16px 16px;border:1px solid ${COLORS.border};border-top:none;padding:0 0 40px 0;">
                <tr><td>${content}</td></tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,${COLORS.border},transparent);"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 20px;">
                    <p style="font-size:12px;color:${COLORS.faint};line-height:1.7;margin:0;">
                      &copy; ${new Date().getFullYear()} Mountaineer Mallu · Germany &amp; European Alps<br/>
                      Connecting Malayalee mountain lovers across Europe
                    </p>
                    <p style="margin-top:12px;font-size:11px;color:${COLORS.faint};">
                      <a href="${SITE_URL}" style="color:${COLORS.glacier};text-decoration:none;">Visit Website</a>
                      &nbsp;·&nbsp;
                      <a href="${SITE_URL}/profile" style="color:${COLORS.glacier};text-decoration:none;">My Profile</a>
                      &nbsp;·&nbsp;
                      <a href="${SITE_URL}/community" style="color:${COLORS.glacier};text-decoration:none;">Community</a>
                    </p>
                    <p style="margin-top:16px;font-size:10px;color:${COLORS.faint};">
                      You're receiving this because you are a member of Mountaineer Mallu.<br/>
                      To manage email preferences, visit your <a href="${SITE_URL}/profile" style="color:${COLORS.glacier};text-decoration:none;">profile settings</a>.
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

// ─── Hero Banner Section ───────────────────────────────────────────────────────
const heroBanner = (emoji, title, subtitle, accentColor = COLORS.glacier) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 0;">
      <!-- Gradient Hero Area -->
      <div style="background:linear-gradient(160deg,${COLORS.bgElevated} 0%,${COLORS.bgCard} 100%);padding:48px 40px 36px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid ${COLORS.border};">
        <!-- Decorative glows (rendered as colored divs in email clients) -->
        <div style="text-align:center;">
          <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:${accentColor}22;border:1.5px solid ${accentColor}55;font-size:32px;line-height:72px;margin-bottom:20px;">${emoji}</div>
        </div>
        <h1 class="hero-title" style="font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:700;color:${COLORS.snow};margin:0 0 12px;letter-spacing:-0.5px;line-height:1.2;">${title}</h1>
        <p style="font-size:15px;color:${COLORS.muted};margin:0;line-height:1.6;max-width:420px;display:inline-block;">${subtitle}</p>
        <!-- Bottom fade line -->
        <div style="margin-top:32px;height:1px;background:linear-gradient(90deg,transparent,${accentColor}44,transparent);"></div>
      </div>
    </td>
  </tr>
</table>`;

// ─── Info Card / Data Block ────────────────────────────────────────────────────
const infoCard = (rows) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.bgElevated};border:1px solid ${COLORS.border};border-radius:12px;margin:0;overflow:hidden;">
  ${rows.map(({ icon, label, value }) => `
  <tr>
    <td style="padding: 14px 20px;border-bottom:1px solid ${COLORS.border};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="36" style="vertical-align:middle;font-size:18px;line-height:1;">${icon}</td>
          <td style="vertical-align:middle;">
            <div style="font-size:10px;font-weight:600;color:${COLORS.faint};text-transform:uppercase;letter-spacing:2px;">${label}</div>
            <div style="font-size:14px;font-weight:600;color:${COLORS.snow};margin-top:3px;">${value}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`).join('')}
</table>`;

// ─── CTA Button ────────────────────────────────────────────────────────────────
const ctaButton = (text, href, color = COLORS.glacier) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td style="border-radius:12px;background:${color};" class="cta-btn">
      <a href="${href}" target="_blank" style="display:inline-block;padding:16px 40px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:${COLORS.bgDark};text-decoration:none;letter-spacing:0.5px;border-radius:12px;">${text}</a>
    </td>
  </tr>
</table>`;

// ─── Divider ──────────────────────────────────────────────────────────────────
const divider = () => `<div style="height:1px;background:linear-gradient(90deg,transparent,${COLORS.border},transparent);margin:32px 0;"></div>`;

// ─── OTP Box ──────────────────────────────────────────────────────────────────
const otpBox = (otp) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
  <tr>
    <td style="background:${COLORS.glacierGlow};border:1.5px solid ${COLORS.borderBright};border-radius:16px;padding:24px 40px;text-align:center;">
      <div style="font-size:10px;font-weight:600;color:${COLORS.glacier};letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;">Your Verification Code</div>
      <div style="font-family:'Inter',monospace;font-size:44px;font-weight:700;letter-spacing:14px;color:${COLORS.glacier};line-height:1;">${otp}</div>
      <div style="margin-top:12px;font-size:12px;color:${COLORS.muted};">Expires in <strong>10 minutes</strong></div>
    </td>
  </tr>
</table>`;


// ═══════════════════════════════════════════════════════════════════════════════
// ─── EMAIL SEND FUNCTIONS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Welcome Email
export const sendWelcomeEmail = async (email, name) => {
    const client = getResend();
    if (!client) return console.log('[Email] Resend not configured. Skipping welcome email.');
    try {
        const content = `
            ${heroBanner('🏔️', `Welcome, ${name}!`, 'Your journey into the Alps begins here. You\'re now part of a community of Malayalee mountain explorers across Europe.', COLORS.glacier)}
            <div style="padding: 36px 40px;">
              <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 24px;">
                Mountaineer Mallu is more than a club — it's a <strong style="color:${COLORS.snow};">fellowship of peak seekers</strong> rooted in the culture and warmth of Kerala, thriving in the heights of the European Alps.
              </p>
              <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 32px;">
                Discover upcoming expeditions, share your stories, connect with fellow climbers, and leave your mark on every summit.
              </p>
              ${divider()}
              <p style="font-size:13px;font-weight:600;color:${COLORS.faint};text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Getting Started</p>
              ${infoCard([
                  { icon: '👤', label: 'Step 1', value: 'Complete your mountain profile — add your experience level and favourite peaks.' },
                  { icon: '🗓️', label: 'Step 2', value: 'Browse upcoming expeditions and register your first climb.' },
                  { icon: '📸', label: 'Step 3', value: 'Share your alpine stories and gallery photos with the community.' },
              ])}
              ${divider()}
              <div style="text-align:center;">
                ${ctaButton('Explore Expeditions →', `${SITE_URL}/#events`)}
                <p style="margin-top:20px;font-size:13px;color:${COLORS.faint};">
                  Need help? Reply to this email — our team is always here.
                </p>
              </div>
              ${divider()}
              <div style="text-align:center;">
                <p style="font-size:12px;font-style:italic;color:${COLORS.faint};letter-spacing:1px;">
                  "Not all those who wander are lost. Some are searching for the perfect summit."
                </p>
              </div>
            </div>`;
        await client.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '🏔️ Welcome to Mountaineer Mallu — Your summit story begins',
            html: shell(content, `Welcome ${name}! Your Mountaineer Mallu adventure starts now.`)
        });
        console.log(`[Email] Welcome email sent to ${email}`);
    } catch (error) { console.error('[Email] Failed to send welcome email:', error); }
};

// 2. Event Registration Confirmed
export const sendEventRegistrationEmail = async (email, name, eventTitle, eventDate, eventLocation, eventImageUrl = null) => {
    const client = getResend();
    if (!client) return console.log('[Email] Resend not configured. Skipping registration email.');
    try {
        const content = `
            ${heroBanner('✅', 'Registration Confirmed!', `You're officially on the roster for <strong>${eventTitle}</strong>.`, COLORS.success)}
            <div style="padding: 36px 40px;">
              ${eventImageUrl ? `
              <div style="border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid ${COLORS.border};">
                <img src="${eventImageUrl}" alt="${eventTitle}" width="100%" style="display:block;max-height:220px;object-fit:cover;" />
              </div>` : ''}
              <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 28px;">
                Hello <strong style="color:${COLORS.snow};">${name}</strong> — your spot is secured. Below are your expedition details. Keep this email for your records.
              </p>
              ${infoCard([
                  { icon: '🏔️', label: 'Expedition', value: eventTitle },
                  { icon: '📅', label: 'Date', value: eventDate },
                  { icon: '📍', label: 'Location', value: eventLocation },
                  { icon: '👤', label: 'Registrant', value: name },
              ])}
              ${divider()}
              <p style="font-size:13px;font-weight:600;color:${COLORS.faint};text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Pre-Expedition Checklist</p>
              ${infoCard([
                  { icon: '🎒', label: 'Gear', value: 'Review the mandatory gear list in the event details.' },
                  { icon: '🏥', label: 'Health', value: 'Ensure you are physically fit and have valid travel insurance.' },
                  { icon: '📱', label: 'Updates', value: 'Watch for briefing emails — we\'ll send route and meetup details closer to the date.' },
              ])}
              ${divider()}
              <div style="text-align:center;">
                ${ctaButton('View Expedition Details →', `${SITE_URL}/#events`, COLORS.success)}
              </div>
            </div>`;
        await client.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `✅ You're Registered — ${eventTitle}`,
            html: shell(content, `Your spot is confirmed for ${eventTitle} on ${eventDate}.`)
        });
        console.log(`[Email] Registration confirmation sent to ${email}`);
    } catch (error) { console.error('[Email] Failed to send registration email:', error); }
};

// 3. New Expedition Announcement (Batch)
export const sendEventAnnouncementEmail = async (recipients, eventTitle, eventDate, eventLocation, eventImageUrl = null) => {
    const client = getResend();
    if (!client) return console.log('[Email] Resend not configured. Skipping announcement.');
    try {
        for (const recipient of recipients) {
            const content = `
                ${heroBanner('🚀', 'New Expedition Announced!', 'A new alpine adventure has been unlocked. Be among the first to secure your place.', COLORS.sunrise)}
                <div style="padding: 36px 40px;">
                  ${eventImageUrl ? `
                  <div style="border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid ${COLORS.border};">
                    <img src="${eventImageUrl}" alt="${eventTitle}" width="100%" style="display:block;max-height:220px;object-fit:cover;" />
                  </div>` : ''}
                  <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 28px;">
                    Hello <strong style="color:${COLORS.snow};">${recipient.name}</strong>, a new expedition has been announced exclusively for Mountaineer Mallu members.
                    Slots fill fast — register now to claim your spot on the mountain.
                  </p>
                  ${infoCard([
                      { icon: '🏔️', label: 'Expedition', value: eventTitle },
                      { icon: '📅', label: 'Date', value: eventDate },
                      { icon: '📍', label: 'Location', value: eventLocation },
                  ])}
                  ${divider()}
                  <div style="text-align:center;">
                    <p style="font-size:13px;color:${COLORS.muted};margin:0 0 20px;">Spots are limited. Early registration is recommended.</p>
                    ${ctaButton('Register Now →', `${SITE_URL}/#events`, COLORS.sunrise)}
                  </div>
                  ${divider()}
                  <div style="background:${COLORS.sunriseGlow};border:1px solid rgba(226,149,90,0.25);border-radius:12px;padding:16px 20px;text-align:center;">
                    <p style="font-size:13px;color:${COLORS.sunrise};margin:0;font-weight:600;">⛰️ Ascend. Together. Always.</p>
                  </div>
                </div>`;
            await client.emails.send({
                from: EMAIL_FROM,
                to: recipient.email,
                subject: `🏔️ New Expedition — ${eventTitle} | ${eventDate}`,
                html: shell(content, `New expedition just announced: ${eventTitle} on ${eventDate} at ${eventLocation}.`)
            });
        }
        console.log(`[Email] Event announcement sent to ${recipients.length} recipients`);
    } catch (error) { console.error('[Email] Failed to send announcement:', error); }
};

// 4. Event Reminder
export const sendEventReminderEmail = async (email, name, eventTitle, eventDate, eventLocation) => {
    const client = getResend();
    if (!client) return console.log('[Email] Resend not configured. Skipping reminder email.');
    try {
        const content = `
            ${heroBanner('⏰', 'Expedition Reminder', `Your climb is coming up. Don't forget — the mountain doesn't wait.`, COLORS.glacier)}
            <div style="padding: 36px 40px;">
              <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 28px;">
                Hello <strong style="color:${COLORS.snow};">${name}</strong>, this is your reminder that your registered expedition is approaching. Make sure you're fully prepared.
              </p>
              ${infoCard([
                  { icon: '🏔️', label: 'Expedition', value: eventTitle },
                  { icon: '📅', label: 'Date', value: eventDate },
                  { icon: '📍', label: 'Location', value: eventLocation },
              ])}
              ${divider()}
              <p style="font-size:13px;font-weight:600;color:${COLORS.faint};text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Final Preparations</p>
              ${infoCard([
                  { icon: '🎒', label: 'Pack Your Gear', value: 'Double-check all mandatory equipment before departure.' },
                  { icon: '🌦️', label: 'Check Weather', value: 'Review the mountain weather forecast the morning of the event.' },
                  { icon: '📱', label: 'Stay Connected', value: 'Confirm your emergency contact details are up to date in your profile.' },
              ])}
              ${divider()}
              <div style="text-align:center;">
                ${ctaButton('View Expedition Details →', `${SITE_URL}/#events`)}
              </div>
            </div>`;
        await client.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `⏰ Reminder: ${eventTitle} is coming up!`,
            html: shell(content, `Don't forget: ${eventTitle} is coming up on ${eventDate}!`)
        });
        console.log(`[Email] Reminder email sent to ${email}`);
    } catch (error) { console.error('[Email] Failed to send reminder email:', error); }
};

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
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;margin:0 0 32px;">
                      Hello <strong style="color:${COLORS.snow};">${userName}</strong>,<br/>
                      Enter this code in the password reset form. It is valid for <strong>10 minutes</strong> and can only be used once.
                    </p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td style="background:rgba(100,190,255,0.08);border:1.5px solid ${COLORS.borderBright};border-radius:16px;padding:28px 32px;text-align:center;">
                          <p style="font-size:10px;font-weight:600;color:${COLORS.glacier};letter-spacing:3px;text-transform:uppercase;margin:0 0 18px;">Verification Code</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="8" align="center" style="margin:0 auto;">
                            <tr>
                              ${otp.split('').map(d => `<td style="width:48px;height:58px;background:rgba(100,190,255,0.1);border:1.5px solid rgba(100,190,255,0.35);border-radius:12px;text-align:center;vertical-align:middle;font-family:'Courier New',monospace;font-size:32px;font-weight:700;color:${COLORS.glacier};line-height:58px;">${d}</td>`).join('')}
                            </tr>
                          </table>
                          <p style="margin:18px 0 0;font-size:12px;color:${COLORS.muted};">Expires in <strong>10 minutes</strong></p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 32px;">
                      <tr>
                        <td style="background:rgba(100,190,255,0.06);border:1px dashed rgba(100,190,255,0.25);border-radius:10px;padding:12px 28px;text-align:center;">
                          <p style="font-size:11px;color:${COLORS.faint};margin:0 0 6px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Tap to select · Long press to copy</p>
                          <p style="font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:12px;color:${COLORS.glacier};margin:0;user-select:all;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;">${otp}</p>
                        </td>
                      </tr>
                    </table>
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

// Generic send — supports both object options and positional arguments
export const sendEmail = async (toOrObj, subject, text, html) => {
    let to, sub, txt, htm;
    if (typeof toOrObj === 'object' && toOrObj !== null) {
        to = toOrObj.to;
        sub = toOrObj.subject;
        txt = toOrObj.text;
        htm = toOrObj.html;
    } else {
        to = toOrObj;
        sub = subject;
        txt = text;
        htm = html;
    }
    const client = getResend();
    if (!client) return console.log(`[Email] Resend not configured. Skipping email to ${to}.`);
    try {
        const fallbackContent = `
            ${heroBanner('📬', sub, 'A message from Mountaineer Mallu.')}
            <div style="padding:36px 40px;">
              <p style="font-size:15px;color:${COLORS.muted};line-height:1.8;">${txt || ''}</p>
            </div>`;
        await client.emails.send({
            from: EMAIL_FROM,
            to,
            subject: sub,
            html: htm || shell(fallbackContent, sub)
        });
        console.log(`[Email] Sent "${sub}" to ${to}`);
    } catch (error) { console.error(`[Email] Failed to send "${sub}" to ${to}:`, error); }
};


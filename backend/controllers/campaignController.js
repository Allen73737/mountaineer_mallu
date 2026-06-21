import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { generateCampaignContent } from '../services/aiInsightsService.js';
import { sendEmail } from '../services/email.js';

// POST /api/admin/campaigns/generate — AI-generate a campaign from a prompt
export const generateCampaign = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt || prompt.trim().length < 5) {
            return res.status(400).json({ error: 'Please provide a meaningful campaign prompt.' });
        }

        // Gather platform context for the AI
        const [totalUsers, events] = await Promise.all([
            User.countDocuments(),
            Event.find().sort({ createdAt: -1 }).limit(5).lean()
        ]);

        const platformContext = {
            totalUsers,
            recentEventNames: events.map(e => e.title)
        };

        const generated = await generateCampaignContent(prompt, platformContext);
        if (!generated) {
            return res.status(500).json({ error: 'AI failed to generate campaign content. Please try again.' });
        }

        // Save as draft
        const campaign = await Campaign.create({
            prompt,
            subject: generated.subject,
            preheader: generated.preheader || '',
            headline: generated.headline,
            bodyHtml: generated.bodyHtml,
            ctaText: generated.ctaText,
            ctaUrl: generated.ctaUrl,
            audienceCriteria: generated.audienceCriteria || {},
            estimatedImpact: generated.estimatedImpact || '',
            status: 'draft',
            createdBy: req.user._id
        });

        // Estimate recipient count based on audience filters
        let recipientQuery = {};
        const filters = generated.audienceCriteria?.filters;
        if (filters?.hasExpeditions) {
            recipientQuery['expeditionReminders.0'] = { $exists: true };
        }
        const estimatedRecipients = await User.countDocuments(recipientQuery);

        res.status(201).json({
            message: 'Campaign generated.',
            campaign: { ...campaign.toObject(), estimatedRecipients }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/campaigns — List all campaigns
export const listCampaigns = async (req, res, next) => {
    try {
        const campaigns = await Campaign.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email')
            .lean();
        res.json({ campaigns });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/campaigns/:id/approve — Approve and send campaign
export const approveCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
        if (campaign.status !== 'draft') {
            return res.status(400).json({ error: `Cannot approve a campaign with status "${campaign.status}".` });
        }

        campaign.status = 'sending';
        await campaign.save();

        // Build recipient list based on audience filters
        let recipientQuery = {};
        const filters = campaign.audienceCriteria?.filters;
        if (filters?.hasExpeditions) {
            recipientQuery['expeditionReminders.0'] = { $exists: true };
        }

        const recipients = await User.find(recipientQuery).select('email name').lean();

        // Build the full email HTML using the campaign data
        const SITE_URL = process.env.CLIENT_URL || 'http://localhost:5173';
        const ctaFullUrl = `${SITE_URL}${campaign.ctaUrl || '/'}`;

        let sentCount = 0;
        for (const recipient of recipients) {
            try {
                const personalizedHtml = `
                    <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1A2B;border-radius:16px;overflow:hidden;border:1px solid rgba(100,190,255,0.12);">
                        <div style="height:3px;background:linear-gradient(90deg,transparent,#64BEFF,#E2955A,transparent);"></div>
                        <div style="padding:40px;text-align:center;">
                            <p style="font-size:10px;font-weight:600;color:rgba(240,248,255,0.25);letter-spacing:4px;text-transform:uppercase;margin-bottom:24px;">MOUNTAINEER MALLU</p>
                            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:700;color:#F0F8FF;margin:0 0 16px;line-height:1.2;">${campaign.headline}</h1>
                            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(100,190,255,0.3),transparent);margin:24px 0;"></div>
                            <div style="font-size:15px;color:rgba(240,248,255,0.7);line-height:1.8;text-align:left;padding:0 20px;">${campaign.bodyHtml}</div>
                            <div style="margin-top:32px;">
                                <a href="${ctaFullUrl}" style="display:inline-block;padding:16px 40px;background:#64BEFF;color:#08101C;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">${campaign.ctaText}</a>
                            </div>
                        </div>
                        <div style="padding:20px 40px;text-align:center;border-top:1px solid rgba(100,190,255,0.12);">
                            <p style="font-size:11px;color:rgba(240,248,255,0.25);">© ${new Date().getFullYear()} Mountaineer Mallu · European Alps</p>
                        </div>
                    </div>`;
                await sendEmail(recipient.email, campaign.subject, '', personalizedHtml);
                sentCount++;
            } catch (emailErr) {
                console.error(`[Campaign] Failed to send to ${recipient.email}:`, emailErr.message);
            }
        }

        campaign.status = 'sent';
        campaign.recipientCount = sentCount;
        campaign.sentAt = new Date();
        await campaign.save();

        res.json({ message: `Campaign sent to ${sentCount} recipients.`, campaign });
    } catch (error) {
        // Revert status on failure
        try {
            await Campaign.findByIdAndUpdate(req.params.id, { status: 'failed' });
        } catch (_) {}
        next(error);
    }
};

// DELETE /api/admin/campaigns/:id — Delete a draft campaign
export const deleteCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
        if (campaign.status === 'sent') {
            return res.status(400).json({ error: 'Cannot delete a sent campaign.' });
        }
        await campaign.deleteOne();
        res.json({ message: 'Campaign deleted.' });
    } catch (error) {
        next(error);
    }
};

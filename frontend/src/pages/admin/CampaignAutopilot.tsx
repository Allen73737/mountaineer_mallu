import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Eye, Trash2, CheckCircle2, XCircle, Clock, Users, Wand2, Mail, Rocket, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { campaignApi } from '../../lib/api';

type CampaignStatus = 'draft' | 'approved' | 'sending' | 'sent' | 'failed';

interface Campaign {
    _id: string;
    prompt: string;
    subject: string;
    preheader: string;
    headline: string;
    bodyHtml: string;
    ctaText: string;
    ctaUrl: string;
    audienceCriteria: {
        description: string;
        filters: any;
    };
    estimatedImpact: string;
    estimatedRecipients?: number;
    status: CampaignStatus;
    recipientCount: number;
    sentAt: string | null;
    createdAt: string;
    createdBy?: { name: string; email: string };
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; icon: any }> = {
    draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
    sending: { label: 'Sending...', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Loader2 },
    sent: { label: 'Sent', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export const CampaignAutopilot = () => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
    const [approving, setApproving] = useState<string | null>(null);
    const [confirmSend, setConfirmSend] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const data = await campaignApi.list();
            setCampaigns(data.campaigns);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || generating) return;
        setGenerating(true);
        try {
            const data = await campaignApi.generate(prompt.trim());
            setCampaigns(prev => [data.campaign, ...prev]);
            setPreviewCampaign(data.campaign);
            setPrompt('');
        } catch (err: any) {
            console.error('Campaign generation failed:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleApprove = async (id: string) => {
        setApproving(id);
        try {
            const data = await campaignApi.approve(id);
            setCampaigns(prev => prev.map(c => c._id === id ? { ...c, ...data.campaign } : c));
            setPreviewCampaign(null);
            setConfirmSend(null);
        } catch (err: any) {
            console.error('Campaign approval failed:', err);
        } finally {
            setApproving(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await campaignApi.delete(id);
            setCampaigns(prev => prev.filter(c => c._id !== id));
            if (previewCampaign?._id === id) setPreviewCampaign(null);
        } catch (err) {
            console.error('Failed to delete campaign:', err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-2 flex items-center gap-3">
                    <Sparkles className="text-alpine-glacier" size={28} />
                    Campaign Autopilot
                </h1>
                <p className="text-white/50 text-sm">AI-powered marketing campaign generator — describe what you want, and the AI builds it for you.</p>
            </div>

            {/* Prompt Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-alpine-glacier/20 bg-gradient-to-br from-alpine-glacier/5 via-transparent to-purple-500/5"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-alpine-glacier/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Wand2 size={18} className="text-alpine-glacier" />
                        <span className="text-sm font-semibold text-white/70">Describe your campaign</span>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder='e.g., "Send a special invitation to all experienced trekkers about our new winter expedition to the Swiss Alps. Make it feel exclusive and urgent."'
                        rows={3}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/25 focus:outline-none focus:border-alpine-glacier/40 transition-colors resize-none text-sm"
                    />

                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-white/30">The AI will generate subject, body, audience targeting, and CTA — all ready for your review.</p>
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || generating}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-alpine-glacier text-[#08101C] font-bold text-sm hover:bg-alpine-glacier/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate Campaign
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewCampaign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => { setPreviewCampaign(null); setConfirmSend(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0D1A2B] border border-white/10 rounded-2xl shadow-2xl"
                        >
                            {/* Preview Header */}
                            <div className="sticky top-0 z-10 bg-[#0D1A2B]/95 backdrop-blur-md border-b border-white/5 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye size={20} className="text-alpine-glacier" />
                                    <h3 className="font-bold text-white text-lg">Campaign Preview</h3>
                                </div>
                                <button onClick={() => { setPreviewCampaign(null); setConfirmSend(null); }} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Email Preview */}
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <div className="bg-black/30 p-4 border-b border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail size={14} className="text-white/40" />
                                            <span className="text-xs text-white/40">Subject:</span>
                                            <span className="text-sm font-semibold text-white">{previewCampaign.subject}</span>
                                        </div>
                                        <p className="text-xs text-white/30 italic">{previewCampaign.preheader}</p>
                                    </div>

                                    <div className="p-6 bg-[#08101C]">
                                        {/* Email body preview */}
                                        <div className="text-center mb-6">
                                            <p className="text-[10px] font-semibold text-white/20 tracking-[4px] uppercase mb-6">MOUNTAINEER MALLU</p>
                                            <h2 className="text-2xl font-serif font-bold text-white mb-4">{previewCampaign.headline}</h2>
                                            <div className="h-px bg-gradient-to-r from-transparent via-alpine-glacier/30 to-transparent mb-6" />
                                        </div>
                                        <div
                                            className="text-sm text-white/70 leading-relaxed space-y-3 [&_strong]:text-white [&_strong]:font-semibold"
                                            dangerouslySetInnerHTML={{ __html: previewCampaign.bodyHtml }}
                                        />
                                        <div className="text-center mt-8">
                                            <span className="inline-block px-8 py-3 rounded-xl bg-alpine-glacier text-[#08101C] font-bold text-sm">
                                                {previewCampaign.ctaText}
                                            </span>
                                            <p className="text-xs text-white/20 mt-2">→ {previewCampaign.ctaUrl}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Audience Targeting */}
                                <div className="rounded-xl border border-white/10 p-5 bg-black/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users size={16} className="text-alpine-glacier" />
                                        <h4 className="font-bold text-white text-sm">AI-Suggested Audience</h4>
                                    </div>
                                    <p className="text-sm text-white/60">{previewCampaign.audienceCriteria?.description || 'All registered users'}</p>
                                    {previewCampaign.estimatedRecipients !== undefined && (
                                        <p className="text-xs text-white/30 mt-2">Estimated recipients: <span className="text-alpine-glacier font-bold">{previewCampaign.estimatedRecipients}</span></p>
                                    )}
                                </div>

                                {/* Estimated Impact */}
                                {previewCampaign.estimatedImpact && (
                                    <div className="flex items-start gap-2 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                        <Rocket size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-purple-300">{previewCampaign.estimatedImpact}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                {previewCampaign.status === 'draft' && (
                                    <div className="flex items-center gap-3 pt-2">
                                        {confirmSend === previewCampaign._id ? (
                                            <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-amber-400">Confirm Send</p>
                                                    <p className="text-xs text-white/40">This will send the campaign email to all matched recipients. This action cannot be undone.</p>
                                                </div>
                                                <button
                                                    onClick={() => handleApprove(previewCampaign._id)}
                                                    disabled={approving === previewCampaign._id}
                                                    className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2"
                                                >
                                                    {approving === previewCampaign._id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                    Send Now
                                                </button>
                                                <button onClick={() => setConfirmSend(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all">
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setConfirmSend(previewCampaign._id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm hover:bg-emerald-500/30 transition-all"
                                                >
                                                    <Send size={16} />
                                                    Approve & Send
                                                </button>
                                                <button
                                                    onClick={() => { handleDelete(previewCampaign._id); }}
                                                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                    Discard
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Campaign History */}
            <div>
                <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-white/50" />
                    Campaign History
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
                        <Mail size={48} className="text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 text-sm">No campaigns yet. Generate your first one above!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {campaigns.map((campaign, idx) => {
                            const config = statusConfig[campaign.status];
                            const StatusIcon = config.icon;
                            return (
                                <motion.div
                                    key={campaign._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-[color,background-color,border-color,box-shadow] group cursor-pointer"
                                    onClick={() => setPreviewCampaign(campaign)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{campaign.subject || 'Untitled Campaign'}</p>
                                        <p className="text-xs text-white/30 mt-1 truncate">{campaign.prompt}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {campaign.status === 'sent' && (
                                            <span className="text-xs text-white/30">
                                                <span className="text-white/50 font-semibold">{campaign.recipientCount}</span> recipients
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${config.color}`}>
                                            <StatusIcon size={12} className={campaign.status === 'sending' ? 'animate-spin' : ''} />
                                            {config.label}
                                        </span>
                                        <span className="text-xs text-white/20">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                                        {campaign.status === 'draft' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(campaign._id); }}
                                                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

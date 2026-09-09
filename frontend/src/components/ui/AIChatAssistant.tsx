import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MountainSnow, X, Send, Sparkles, GripVertical, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { API_URL } from '../../lib/constants';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

// ─── Premium Modern AI Bot Icon ────────────────────────────────────────────────
const SummitBotIcon = ({ size = 24, glowing = false }: { size?: number; glowing?: boolean }) => (
    <div className="relative flex items-center justify-center w-full h-full">
        {glowing && (
            <div
                className="absolute inset-0 rounded-full bg-[#64BEFF]/30 blur-md animate-pulse pointer-events-none"
                style={{ animationDuration: '3s' }}
            />
        )}
        <MountainSnow size={size} className="text-white drop-shadow-[0_0_10px_rgba(100,190,255,0.8)] z-10" strokeWidth={1.5} />
        
        {/* Animated AI Core / Sparkle */}
        <div className="absolute top-[25%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#64BEFF] shadow-[0_0_8px_#64BEFF] z-20 animate-ping" style={{ animationDuration: '2s' }} />
    </div>
);

// ─── Typewriter Hook (Premium Chunk-Based) ─────────────────────────────────────
const useTypewriter = (text: string, speed = 6, chunkSize = 3) => {
    const [displayed, setDisplayed] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        if (!text) { setDisplayed(''); setIsTyping(false); return; }
        indexRef.current = 0;
        setDisplayed('');
        setIsTyping(true);

        const interval = setInterval(() => {
            indexRef.current = Math.min(indexRef.current + chunkSize, text.length);
            setDisplayed(text.slice(0, indexRef.current));
            if (indexRef.current >= text.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, chunkSize]);

    return { displayed, isTyping };
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

const MessageBubble = ({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) => {
    const isUser = msg.role === 'user';
    const { displayed, isTyping } = useTypewriter(
        (!isUser && isLatest && !msg.isStreaming) ? msg.content : '',
        5, 4
    );

    const content = isUser ? msg.content : (
        msg.isStreaming ? msg.content : (isLatest ? displayed : msg.content)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
        >
            {!isUser && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0 bg-gradient-to-br from-[#64BEFF]/20 to-[#0D1A2B] border border-[#64BEFF]/20">
                    <Sparkles size={12} className="text-[#64BEFF]" />
                </div>
            )}
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                        ? 'bg-[#64BEFF]/20 text-white border border-[#64BEFF]/20 rounded-br-md'
                        : 'bg-white/[0.04] text-white/90 border border-white/[0.06] rounded-bl-md'
                }`}
            >
                <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
                    __html: formatMarkdown(content)
                }} />
                {(msg.isStreaming || (!isUser && isLatest && isTyping)) && (
                    <span className="inline-block w-1.5 h-4 bg-[#64BEFF] ml-0.5 animate-pulse rounded-sm" />
                )}
            </div>
        </motion.div>
    );
};

// ─── Simple Safe Markdown Formatter ─────────────────────────────────────────────
const formatMarkdown = (text: string): string => {
    if (!text) return '';
    const safeText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return safeText
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#64BEFF] font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
        .replace(/\n/g, '<br/>');
};

// ─── Quick Suggestion Chips ────────────────────────────────────────────────────
const SUGGESTIONS = [
    { label: '🏔️ Upcoming Events', prompt: 'What expeditions are coming up?' },
    { label: '📸 How to Upload', prompt: 'How do I upload photos to the gallery?' },
    { label: '👋 About Mountaineer Mallu', prompt: 'Tell me about Mountaineer Mallu' },
    { label: '🧗 Gear Tips', prompt: 'What essential gear do I need for alpine hiking?' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const location = useLocation();
    const { isSidebarOpen } = useStore();

    // Hide on admin routes
    const isAdminRoute = location.pathname.startsWith('/summit-control-panel');
    const isAuthRoute = ['/login', '/signup', '/profile-complete'].includes(location.pathname);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    // ─── Streaming Chat ────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (overrideText?: string) => {
        const text = overrideText || input.trim();
        if (!text || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: text };
        const assistantMsg: ChatMessage = { role: 'assistant', content: '', isStreaming: true };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: chatHistory,
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    
                    // Keep the last incomplete line in the buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const data = line.replace('data: ', '');
                        if (data === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                            if (parsed.content) {
                                fullContent += parsed.content;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { role: 'assistant', content: fullContent, isStreaming: true };
                                    return updated;
                                });
                            }
                        } catch { /* skip malformed chunks */ }
                    }
                }
            }

            // Finalize — stop streaming indicator, trigger typewriter for final state
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullContent, isStreaming: false };
                return updated;
            });
        } catch {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: '⛰️ The summit guide is momentarily unreachable. Please try again.', isStreaming: false };
                return updated;
            });
        }
        setIsLoading(false);
    }, [input, isLoading, messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    if (isAdminRoute || isAuthRoute) return null;

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* ─── Floating Bot Button ──────────────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => requestAnimationFrame(() => setIsOpen(true))}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] group cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                        aria-label="Open Summit Guide AI Assistant"
                    >
                        {/* Pulse ring */}
                        <div className="absolute inset-0 rounded-full bg-[#64BEFF]/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                        {/* Glow backdrop */}
                        <div className="absolute -inset-2 rounded-full bg-[#64BEFF]/10 blur-xl group-hover:bg-[#64BEFF]/20 transition-colors duration-500 pointer-events-none" />
                        {/* Icon container */}
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#111F30] to-[#050A14] border border-[#64BEFF]/40 shadow-[0_0_30px_rgba(100,190,255,0.25)] flex items-center justify-center overflow-hidden group-hover:border-[#64BEFF]/80 group-hover:shadow-[0_0_50px_rgba(100,190,255,0.4)] transition-all duration-300">
                            <SummitBotIcon size={24} glowing />
                        </div>
                        {/* Label */}
                        <div className="absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-[#0D1A2B]/80 backdrop-blur-3xl border border-[#64BEFF]/30 rounded-xl px-3 py-1.5 text-xs text-white/90 font-medium shadow-2xl">
                                Summit Guide AI ✨
                            </div>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ─── Chat Window ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`fixed z-[9999] flex flex-col ${
                            isExpanded
                                ? 'inset-4 md:right-4 md:left-auto md:top-4 md:bottom-4 md:w-[500px]'
                                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] h-[75vh] max-h-[600px] sm:h-auto'
                        }`}
                    >
                        {/* Glass container */}
                        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-[#050A14]/40 backdrop-blur-[40px] border border-white/[0.15] shadow-[0_10px_80px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(255,255,255,0.03)] ring-1 ring-white/10">

                            {/* ── Header ──────────────────────────────────── */}
                            <div className="relative px-4 py-3.5 border-b border-white/[0.1] bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-white/[0.05] shrink-0">
                                {/* Shimmer line */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#64BEFF]/40 to-transparent" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#64BEFF]/15 to-[#64BEFF]/5 border border-[#64BEFF]/20 flex items-center justify-center">
                                            <SummitBotIcon size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white/90 tracking-wide">Summit Guide</h3>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[10px] text-white/40 tracking-wider uppercase font-medium">Powered by AI</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {messages.length > 0 && (
                                            <button
                                                onClick={clearChat}
                                                className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                                title="Clear chat"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="p-2 text-white/30 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                            title={isExpanded ? 'Minimize' : 'Expand'}
                                        >
                                            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                        </button>
                                        <button
                                            onClick={() => requestAnimationFrame(() => { setIsOpen(false); setIsExpanded(false); })}
                                            className="p-2 text-white/30 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                            title="Close"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Messages Area ──────────────────────────── */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar" style={{ minHeight: isExpanded ? 0 : 280 }}>
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                        <div className="mb-4 w-16 h-16 mx-auto">
                                            <SummitBotIcon size={32} glowing />
                                        </div>
                                        <h4 className="text-lg font-serif font-bold text-white/80 mb-2">Summit Guide</h4>
                                        <p className="text-xs text-white/35 max-w-[260px] leading-relaxed mb-6">
                                            Your AI mountain companion. Ask about peaks, events, gear, or anything about Mountaineer Mallu.
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                                            {SUGGESTIONS.map((s, i) => (
                                                <motion.button
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.1 }}
                                                    onClick={() => sendMessage(s.prompt)}
                                                    className="text-left text-xs text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#64BEFF]/20 rounded-xl px-3 py-2.5 transition-all duration-200"
                                                >
                                                    {s.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1 && msg.role === 'assistant'} />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* ── Input Area ─────────────────────────────── */}
                            <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] bg-[#0A0F1C]/50 shrink-0">
                                <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[#64BEFF]/30 transition-colors duration-200">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask the Summit Guide..."
                                        rows={1}
                                        className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 outline-none resize-none max-h-20 leading-relaxed"
                                        style={{ scrollbarWidth: 'none' }}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            input.trim() && !isLoading
                                                ? 'bg-[#64BEFF]/20 text-[#64BEFF] hover:bg-[#64BEFF]/30'
                                                : 'text-white/15 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-white/15 text-center mt-2 tracking-wider">
                                    Summit Guide · Groq LPU · Mountaineer Mallu AI
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

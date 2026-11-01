import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { API_URL } from '../../lib/constants';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

// ─── Summit Guide mark ─────────────────────────────────────────────────────────
// The brand's copper ridge (the logo's mountain stroke) inside a fine compass ring, with a summit star
// that breathes. Same mark on the launcher, the window header and the empty state.
const SummitBotIcon = ({ size = 24, glowing = false }: { size?: number; glowing?: boolean }) => {
    const id = React.useId().replace(/:/g, '');
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={glowing ? 'guide-mark guide-mark--live' : 'guide-mark'}>
            <defs>
                <linearGradient id={`${id}-cu`} x1="6" y1="14" x2="42" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#F3D2B8" />
                    <stop offset="0.5" stopColor="#E2A071" />
                    <stop offset="1" stopColor="#B96F48" />
                </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="21.5" stroke="rgba(163,201,226,0.35)" strokeWidth="0.75" />
            <g className="guide-mark__ticks" stroke="rgba(163,201,226,0.55)" strokeWidth="0.9" strokeLinecap="round">
                <path d="M24 1.8v3M24 43.2v3M1.8 24h3M43.2 24h3" />
            </g>
            <path d="M8 32 L17.5 18 C18.6 16.4 20 16.5 21 18 C23 21 25 23.5 27.5 23.8 C29 24 29.6 22 31 21 C33 19.6 35.5 20.5 36.8 23 L40 29" stroke={`url(#${id}-cu)`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="guide-mark__ridge" />
            <path d="M26 34 C31 32.4 35 31.8 39.5 31.4" stroke={`url(#${id}-cu)`} strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            <path d="M19.1 9.2 L19.8 11.3 L21.9 12 L19.8 12.7 L19.1 14.8 L18.4 12.7 L16.3 12 L18.4 11.3 Z" fill="#FFF1E2" className="guide-mark__star" />
        </svg>
    );
};
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
                <div className="w-7 h-7 rounded-full grid place-items-center mr-2 mt-1 shrink-0 bg-[#08284C] ring-1 ring-alpine-sunrise/25">
                    <SummitBotIcon size={20} />
                </div>
            )}
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                        ? 'bg-gradient-to-br from-alpine-sunrise to-[#C9805A] text-[#1B0F08] font-medium shadow-[0_8px_24px_-10px_rgba(226,160,113,0.7)] rounded-br-md'
                        : 'bg-white/[0.06] text-white/90 ring-1 ring-white/[0.08] rounded-bl-md'
                }`}
            >
                <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
                    __html: formatMarkdown(content)
                }} />
                {(msg.isStreaming || (!isUser && isLatest && isTyping)) && (
                    <span className="inline-block w-1.5 h-4 bg-alpine-sunrise ml-0.5 animate-pulse rounded-sm" />
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
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#A3C9E2] font-semibold">$1</strong>')
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
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] group cursor-pointer active:scale-95 transition-transform duration-200"
                        aria-label="Open Summit Guide AI Assistant"
                    >
                        {/* Soft halo + a slow copper arc that orbits the mark */}
                        <span className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(226,160,113,0.28),transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <span className="guide-orbit absolute -inset-[3px] rounded-full pointer-events-none" />
                        <div className="relative w-14 h-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,#123A66,#08284C_55%,#04182F)] ring-1 ring-white/15 shadow-[0_18px_40px_-12px_rgba(4,24,47,0.8)] grid place-items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
                            <SummitBotIcon size={34} glowing />
                        </div>
                        {/* Label */}
                        <div className="absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-[#061A31]/90 border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-white/90 font-semibold tracking-[0.12em] uppercase shadow-2xl">
                                Ask the Summit Guide
                            </div>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ─── Chat Window ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95, transition: { duration: 0.18 } }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        style={{ transformOrigin: 'bottom right' }}
                        className={`fixed z-[9999] flex flex-col ${
                            isExpanded
                                ? 'inset-4 md:right-4 md:left-auto md:top-4 md:bottom-4 md:w-[500px]'
                                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] h-[75vh] max-h-[600px] sm:h-auto'
                        }`}
                    >
                        {/* Glass container */}
                        <div className="relative flex-1 flex flex-col rounded-[28px] overflow-hidden bg-[linear-gradient(180deg,rgba(12,40,72,0.94),rgba(4,16,31,0.97))] backdrop-blur-xl ring-1 ring-white/10 shadow-[0_40px_90px_-20px_rgba(2,8,18,0.85)]">
                            {/* Alpenglow at the top of the window */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(226,160,113,0.18),transparent_70%)]" />

                            {/* ── Header ──────────────────────────────────── */}
                            <div className="relative px-4 py-3.5 border-b border-white/[0.08] shrink-0">
                                {/* Shimmer line */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-alpine-sunrise/60 to-transparent" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#08284C] ring-1 ring-alpine-sunrise/30 grid place-items-center">
                                            <SummitBotIcon size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg leading-none text-white">Summit Guide</h3>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-alpine-sunrise shadow-[0_0_8px_rgba(226,160,113,0.9)] animate-pulse" />
                                                <span className="mt-1 text-[9px] text-white/50 tracking-[0.25em] uppercase font-semibold">On the ridge · AI</span>
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
                                        <div className="mb-5 w-20 h-20 mx-auto rounded-full bg-[#08284C] ring-1 ring-white/10 grid place-items-center shadow-[0_0_60px_-10px_rgba(226,160,113,0.5)]">
                                            <SummitBotIcon size={56} glowing />
                                        </div>
                                        <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-alpine-sunrise mb-2">Base camp concierge</p>
                                        <h4 className="text-3xl font-serif text-white mb-2">Where to next?</h4>
                                        <p className="text-xs text-white/50 max-w-[260px] leading-relaxed mb-6">
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
                                                    className="text-left text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-alpine-sunrise/10 ring-1 ring-white/[0.08] hover:ring-alpine-sunrise/40 rounded-2xl px-3.5 py-3 transition-all duration-300"
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
                            <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
                                <div className="flex items-end gap-2 bg-white/[0.05] ring-1 ring-white/10 rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-alpine-sunrise/50 transition-shadow duration-300">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask the Summit Guide..."
                                        rows={1}
                                        className="ai-input flex-1 self-center bg-transparent text-sm text-white placeholder-white/35 outline-none resize-none max-h-20 leading-relaxed py-1"
                                        style={{ scrollbarWidth: 'none' }}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        aria-label="Send"
                                        className={`grid place-items-center w-9 h-9 shrink-0 rounded-full transition-all duration-300 ${
                                            input.trim() && !isLoading
                                                ? 'bg-alpine-sunrise text-[#1B0F08] hover:scale-105 shadow-[0_6px_18px_-6px_rgba(226,160,113,0.9)]'
                                                : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
                                        }`}
                                    >
                                        <ArrowUp size={16} strokeWidth={2.4} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-white/30 text-center mt-2.5 tracking-[0.2em] uppercase">
                                    Summit Guide · Mountaineer Mallu
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

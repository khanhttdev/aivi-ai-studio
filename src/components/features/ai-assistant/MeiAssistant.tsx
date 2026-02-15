'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { useMeiStore } from '@/stores/useMeiStore';
import { cn } from '@/lib/utils';
// import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function MeiAssistant() {
    const { isOpen, messages, isLoading, toggle, addMessage, setLoading } = useMeiStore();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // const t = useTranslations('Mei');

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                toggle();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, toggle]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        addMessage('user', userMsg);
        setLoading(true);

        try {
            const response = await fetch('/api/mei', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMsg }].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            const data = await response.json();
            if (response.ok) {
                addMessage('model', data.content);
            } else {
                addMessage('model', "Oops, Mei bị vấp cục đá rồi! Thử lại nha 😵");
            }
        } catch (error) {
            console.error(error);
            addMessage('model', "Mạng mẽo chán quá à! Mei không nghe rõ 🥺");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-[9999] flex flex-col items-end pointer-events-none" role="complementary" aria-label="AI Assistant">
            <div className="pointer-events-auto" ref={containerRef}>
                <AnimatePresence>
                    {isOpen && (
                        <m.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            role="dialog"
                            aria-label="Chat with Mei AI"
                            className="mb-4 w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] h-[500px] max-h-[70vh] bg-[#0f172a] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="p-4 bg-[#1e293b] border-b border-[var(--border)] flex items-center justify-between shrink-0 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center relative overflow-hidden shrink-0">
                                        {/* Avatar Mei - Placeholder until file is moved */}
                                        <Image
                                            src="/mei-avatar.png"
                                            alt="Mei Avatar"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement?.classList.add('fallback-avatar');
                                            }}
                                        />
                                        <Bot className="text-white w-6 h-6 absolute hidden fallback-icon" />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-[var(--bg-tertiary)] z-10" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Mei AI ✨</h3>
                                        <p className="text-xs text-slate-400">Luôn ở đây để giúp bạn!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggle}
                                    aria-label="Close chat"
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a]"
                                ref={scrollRef}
                            >
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden relative",
                                            msg.role === 'user' ? "bg-[var(--accent-primary)]" : "bg-gradient-to-tr from-pink-500 to-yellow-500"
                                        )}>
                                            {msg.role === 'user' ? (
                                                <Sparkles size={14} className="text-[#0a0f1a]" />
                                            ) : (
                                                <>
                                                    <Image
                                                        src="/mei-avatar.png"
                                                        alt="Mei"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <Bot size={14} className="text-white hidden" />
                                                </>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-[var(--accent-primary)] text-[#0a0f1a] rounded-tr-none font-medium"
                                                : "bg-[#1e293b] text-white rounded-tl-none border border-white/10"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-[#1e293b] text-white rounded-tl-none border border-white/10 flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-slate-400" />
                                            <span className="text-xs text-slate-400">Mei đang suy nghĩ...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/10 bg-[#1e293b] shrink-0 relative z-10">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="relative flex items-center"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Hỏi Mei gì đó đi..."
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-2 p-2 bg-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-[#0a0f1a] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Send size={16} fill="currentColor" />
                                    </button>
                                </form>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {!isOpen && (
                        <m.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggle}
                            aria-label="Open Mei AI chat"
                            aria-expanded={isOpen}
                            className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 shadow-[0_4px_20px_rgba(236,72,153,0.4)] flex items-center justify-center text-white relative group"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20">
                                <Image
                                    src="/mei-avatar.png"
                                    alt="Chat with Mei"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                            </span>
                        </m.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

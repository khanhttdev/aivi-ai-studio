"use client";
import React from 'react';
import { useToastStore } from "@/stores/toastStore";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";

export function Toaster() {
    const { toasts, removeToast } = useToastStore();

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-[var(--success)]" />,
        warning: <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />,
        error: <AlertCircle className="w-5 h-5 text-[var(--error)]" />,
        info: <Info className="w-5 h-5 text-[var(--accent-primary)]" />
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none items-center">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <m.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
                            "group pointer-events-auto relative min-w-[320px] max-w-[400px] flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all",
                            toast.type === 'error'
                                ? "bg-red-500/10 border-red-500/50 text-white"
                                : "bg-[var(--bg-secondary)] border-[var(--border)] text-white"
                        )}
                    >
                        <div className="shrink-0 pt-0.5">
                            {icons[toast.type]}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{toast.message}</p>
                        </div>
                        <div className="shrink-0 -mt-1 -mr-1">
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </m.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

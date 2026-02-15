import { m, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isDestructive = false,
    isLoading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!isLoading ? onCancel : undefined}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Dialog */}
                <m.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                    {title}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)]/50 p-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg shadow-black/20 disabled:opacity-50 flex items-center gap-2 ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90'
                                }`}
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />}
                            {confirmLabel}
                        </button>
                    </div>

                    {/* Close button */}
                    {!isLoading && (
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </m.div>
            </div>
        </AnimatePresence>
    );
}

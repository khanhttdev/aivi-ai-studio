import { m, AnimatePresence } from "framer-motion";
import { Key, X } from "lucide-react";
// import { useTranslations } from 'next-intl';

interface ApiKeyRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ApiKeyRequiredModal({
    isOpen,
    onClose,
    onConfirm,
}: ApiKeyRequiredModalProps) {
    if (!isOpen) return null;

    // Direct translations or fallback to hardcoded Vietnamese strings since we are focusing on VI user request
    // But let's use t() if available, assuming common namespace or fallback.
    // For now, hardcode VI strings for immediate impact as requested.

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
                            <div className="p-3 rounded-full bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]">
                                <Key size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Cần thiết lập API Key
                                </h3>
                                <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                                    Tính năng này yêu cầu sử dụng <b>Gemini API Key</b> cá nhân của bạn để hoạt động.
                                    <br /><br />
                                    Vui lòng đi đến trang Hồ sơ để cập nhật API Key.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)]/50 p-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-white transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 rounded-lg text-sm font-bold text-black bg-[var(--accent-amber)] hover:bg-[var(--accent-amber)]/90 shadow-lg shadow-[var(--accent-amber)]/20 transition-all transform hover:scale-105"
                        >
                            Đến trang Hồ sơ
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </m.div>
            </div>
        </AnimatePresence>
    );
}

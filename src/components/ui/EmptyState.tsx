import { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}>
            {/* Glow */}
            <div className="absolute w-[200px] h-[200px] bg-[#22d3ee]/5 blur-[60px] rounded-full" />

            <div className="relative space-y-5">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white/30" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white/80">{title}</h3>
                    {description && (
                        <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Optional action */}
                {action && <div className="pt-2">{action}</div>}
            </div>
        </div>
    );
}

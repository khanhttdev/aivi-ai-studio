import React from "react";
import { cn } from "@/lib/utils";

interface EliteCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "selected";
    hoverEffect?: boolean;
}

export const EliteCard = React.forwardRef<HTMLDivElement, EliteCardProps>(
    ({ className, variant = "default", hoverEffect = true, children, ...props }, ref) => {
        const variants = {
            default: "bg-zinc-900 border border-zinc-800",
            glass: "glass-card bg-zinc-900/60",
            selected: "bg-zinc-900 border-primary-orange shadow-lg shadow-primary-orange/20",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl p-6 transition-all duration-300",
                    variants[variant],
                    hoverEffect && "hover:border-primary-orange hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
EliteCard.displayName = "EliteCard";

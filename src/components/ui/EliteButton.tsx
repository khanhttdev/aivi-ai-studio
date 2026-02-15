import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EliteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    isLoading?: boolean;
    block?: boolean;
}

export const EliteButton = React.forwardRef<HTMLButtonElement, EliteButtonProps>(
    ({ className, variant = "primary", isLoading, block, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "btn-primary shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 text-black",
            secondary: "btn-secondary hover:border-orange-500 hover:text-orange-500",
            ghost: "btn-ghost hover:bg-zinc-800",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                    variants[variant],
                    block && "w-full",
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
EliteButton.displayName = "EliteButton";

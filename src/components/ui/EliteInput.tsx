import React from "react";
import { cn } from "@/lib/utils";

interface EliteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const EliteInput = React.forwardRef<HTMLInputElement, EliteInputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-primary-orange transition-all duration-300",
                        error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 ml-1 animate-pulse">{error}</p>}
            </div>
        );
    }
);
EliteInput.displayName = "EliteInput";

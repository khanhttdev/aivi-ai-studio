'use client';

import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import {
    UtensilsCrossed,
    Home,
    Smartphone,
    DollarSign,
    Plane,
    Shirt,
    Heart,
    GraduationCap,
    Gamepad2,
    Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface Category {
    id: string;
    icon: React.ElementType;
    gradient: string;
    bg: string;
    border: string;
    character: 'mini' | 'lulu' | 'both';
}

const CATEGORIES: Category[] = [
    { id: 'food', icon: UtensilsCrossed, gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', character: 'lulu' },
    { id: 'home', icon: Home, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', character: 'lulu' },
    { id: 'tech', icon: Smartphone, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', character: 'mini' },
    { id: 'finance', icon: DollarSign, gradient: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', character: 'mini' },
    { id: 'travel', icon: Plane, gradient: 'from-sky-500 to-indigo-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30', character: 'lulu' },
    { id: 'fashion', icon: Shirt, gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', character: 'lulu' },
    { id: 'health', icon: Heart, gradient: 'from-red-500 to-pink-500', bg: 'bg-red-500/10', border: 'border-red-500/30', character: 'lulu' },
    { id: 'education', icon: GraduationCap, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30', character: 'mini' },
    { id: 'entertainment', icon: Gamepad2, gradient: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', character: 'both' },
    { id: 'lifestyle', icon: Sparkles, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', character: 'both' },
];

interface CategorySelectorProps {
    selected?: string | null;
    onSelect: (categoryId: string) => void;
    className?: string;
}

const characterEmojis: Record<string, string> = {
    mini: '🐱',
    lulu: '🐶',
    both: '🐱🐶',
};

export default function CategorySelector({ selected, onSelect, className }: CategorySelectorProps) {
    const t = useTranslations('KolMiniLulu.Categories');

    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3", className)}>
            {CATEGORIES.map((cat, idx) => {
                const Icon = cat.icon;
                const isSelected = selected === cat.id;

                return (
                    <m.button
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSelect(cat.id)}
                        className={cn(
                            "relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 group cursor-pointer",
                            isSelected
                                ? `${cat.bg} ${cat.border} ring-1 ring-current shadow-lg`
                                : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            isSelected
                                ? `bg-gradient-to-br ${cat.gradient} text-white shadow-lg`
                                : "bg-white/5 text-white/40 group-hover:text-white/70"
                        )}>
                            <Icon size={20} />
                        </div>

                        {/* Name */}
                        <span className={cn(
                            "text-[11px] font-bold uppercase tracking-wider text-center leading-tight",
                            isSelected ? "text-white" : "text-white/50 group-hover:text-white/80"
                        )}>
                            {t(cat.id)}
                        </span>

                        {/* Character indicator */}
                        <span className="text-[10px] opacity-60">
                            {characterEmojis[cat.character]}
                        </span>

                        {/* Selection indicator */}
                        {isSelected && (
                            <m.div
                                layoutId="category-active-ring"
                                className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none"
                                transition={{ type: 'spring', bounce: 0.2 }}
                            />
                        )}
                    </m.button>
                );
            })}
        </div>
    );
}

export { CATEGORIES };

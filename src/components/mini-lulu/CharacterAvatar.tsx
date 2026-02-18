'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import { m } from "framer-motion";

interface CharacterAvatarProps {
  character: 'mini' | 'lulu';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

const CHARACTER_CONFIG = {
  mini: {
    name: 'Mini',
    emoji: '🐱',
    role: 'The Critic',
    image: '/characters/mini-the-critic.png',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
    ring: 'ring-violet-500/50',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
  },
  lulu: {
    name: 'Lulu',
    emoji: '🐶',
    role: 'Explorer',
    image: '/characters/lulu-explorer.jpg',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
    ring: 'ring-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
};

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-40 h-40',
};

export default function CharacterAvatar({
  character,
  size = 'md',
  showGlow = true,
  showLabel = false,
  className,
  onClick,
}: CharacterAvatarProps) {
  const config = CHARACTER_CONFIG[character];

  return (
    <m.div
      className={cn("relative inline-flex flex-col items-center gap-2", className)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Glow Effect */}
      {showGlow && (
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-40 -z-10 scale-125",
          `bg-gradient-to-br ${config.gradient}`
        )} />
      )}

      {/* Avatar Ring */}
      <div className={cn(
        SIZES[size],
        "relative rounded-full p-[3px] bg-gradient-to-br cursor-pointer",
        config.gradient,
        showGlow && `shadow-2xl ${config.glow}`,
      )}>
        <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={config.image}
            alt={`${config.name} - ${config.role}`}
            width={160}
            height={160}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Status Dot */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-primary)]",
          size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
          `bg-gradient-to-br ${config.gradient}`,
        )} />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className={cn("text-sm font-bold", config.text)}>
            {config.emoji} {config.name}
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
            {config.role}
          </p>
        </div>
      )}
    </m.div>
  );
}

export { CHARACTER_CONFIG };

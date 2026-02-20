'use client';

import Link from 'next/link';
import React from 'react';
import { Camera, Sparkles, ArrowRight, Zap, Shield, Clock, Film, Users, Wand2, Mic, Video, Bug } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { JsonLd } from '@/components/seo/JsonLd';

export default function HomePage() {
  const t = useTranslations('LandingPage');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AIVI AI Studio",
    "description": t('subtitle'),
    "url": "https://aivi.ai",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "featureList": [
      t('feature_1_title'),
      t('feature_2_title'),
      t('feature_3_title')
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <main className="w-full">
      <JsonLd data={structuredData} />
      {/* Hero Section */}
      <section aria-label="Hero" className="relative py-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Atmospheric Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />


        <div className="relative max-w-6xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl mb-4 group hover:border-[#22d3ee]/30 transition-colors">
            <Sparkles size={16} className="text-[#22d3ee] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-[#22d3ee] transition-colors">
              {t('badge')}
            </span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
              <span className="block opacity-90">{t('title_prefix')}</span>
              <span className="gradient-text drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">{t('title_suffix')}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-wider">
              {t('subtitle')}
            </p>
          </div>

          {/* CTA Buttons Grid */}
          <nav aria-label="Studio tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-4xl pt-8">
            {/* 1. Image Studio */}
            <Link
              href="/image-studio"
              className="btn-primary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full"
            >
              <Camera size={18} />
              {t('cta_image')}
              <ArrowRight size={16} />
            </Link>

            {/* 2. Story Studio */}
            <Link
              href="/story-studio"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full"
            >
              <Film size={18} />
              {t('cta_story')}
              <ArrowRight size={16} />
            </Link>

            {/* 3. KOL Studio */}
            <Link
              href="/kol-studio"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#22d3ee]/10 hover:bg-[#22d3ee]/20 border-[#22d3ee]/30 text-[#22d3ee]"
            >
              <Users size={18} />
              {t('cta_kol')}
              <ArrowRight size={16} />
            </Link>

            {/* 3.1. Mimi & Lulu */}
            <Link
              href="/kol-mini-lulu"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#fcd34d]/10 hover:bg-[#fcd34d]/20 border-[#fcd34d]/30 text-[#fcd34d]"
            >
              <Sparkles size={18} />
              {t('cta_mini_lulu')}
              <ArrowRight size={16} />
            </Link>

            {/* 4. Video Analyzer */}
            <Link
              href="/video-analyzer"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 border-[#a78bfa]/30 text-[#a78bfa]"
            >
              <Video size={18} />
              {t('cta_video')}
              <ArrowRight size={16} />
            </Link>

            {/* 5. Script Creator */}
            <Link
              href="/script-creator"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#34d399]/10 hover:bg-[#34d399]/20 border-[#34d399]/30 text-[#34d399]"
            >
              <Wand2 size={18} />
              {t('cta_script')}
              <ArrowRight size={16} />
            </Link>

            {/* 6. Voice Studio */}
            <Link
              href="/voice-studio"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#60a5fa]/10 hover:bg-[#60a5fa]/20 border-[#60a5fa]/30 text-[#60a5fa]"
            >
              <Mic size={18} />
              {t('cta_voice')}
              <ArrowRight size={16} />
            </Link>

            {/* 7. POV Studio */}
            <Link
              href="/pov-studio"
              className="btn-secondary text-sm px-8 py-5 flex items-center justify-center gap-3 active:scale-95 w-full bg-[#f97316]/10 hover:bg-[#f97316]/20 border-[#f97316]/30 text-[#f97316]"
            >
              <Bug size={18} />
              {t('pov_studio')}
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </section>

      {/* Features Section */}
      <section aria-labelledby="features-heading" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-4">
            <span className="gradient-text">{t('features_title')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
            {t('features_subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              index={0}
              icon={<Camera size={32} />}
              title={t('feature_1_title')}
              description={t('feature_1_desc')}
              className="md:col-span-2"
              variant="horizontal"
            />
            <FeatureCard
              index={1}
              icon={<Sparkles size={32} />}
              title={t('feature_2_title')}
              description={t('feature_2_desc')}
              className="md:col-span-1"
            />

            <FeatureCard
              index={2}
              icon={<Zap size={32} />}
              title={t('feature_3_title')}
              description={t('feature_3_desc')}
              className="md:col-span-1"
            />
            <FeatureCard
              index={3}
              icon={<Shield size={32} />}
              title={t('feature_4_title')}
              description={t('feature_4_desc')}
              className="md:col-span-2"
              variant="horizontal"
            />
            <FeatureCard
              index={4}
              icon={<Clock size={32} />}
              title={t('feature_5_title')}
              description={t('feature_5_desc')}
              className="md:col-span-3"
              variant="horizontal"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section aria-labelledby="workflow-heading" className="py-20 px-6 bg-transparent relative">
        <div className="absolute inset-0 bg-white/[0.02] border-y border-white/[0.05] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 id="workflow-heading" className="text-4xl font-black text-center mb-4 uppercase tracking-tighter">
            PRO_PROCESS <span className="gradient-text">{t('workflow_title_highlight')}</span>
          </h2>
          <p className="text-white/60 text-center mb-20 uppercase tracking-[0.2em] text-[10px] font-bold">
            {t('workflow_subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-16">
            <WorkflowStep
              step={1}
              title={t('step_1_title')}
              description={t('step_1_desc')}
            />
            <WorkflowStep
              step={2}
              title={t('step_2_title')}
              description={t('step_2_desc')}
            />
            <WorkflowStep
              step={3}
              title={t('step_3_title')}
              description={t('step_3_desc')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section aria-labelledby="cta-heading" className="py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/10 via-transparent to-[#f43f5e]/10 opacity-50" />
            <h2 id="cta-heading" className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase relative z-10">
              {t('ready_title')}
            </h2>
            <p className="text-white/40 mb-12 uppercase tracking-wider font-medium relative z-10">
              {t('ready_desc')}
            </p>
            <Link
              href="/image-studio"
              className="btn-primary text-sm px-16 py-6 inline-flex items-center gap-3 relative z-10"
            >
              {t('ready_btn')}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-transparent mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center">
            <Logo size="sm" subtext="© 2025 ALL_RIGHTS_RESERVED" />
          </div>
          <div className="flex gap-10 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
            <a href="#" className="hover:text-[#22d3ee] transition-colors">{t('footer_guide')}</a>
            <a href="#" className="hover:text-[#22d3ee] transition-colors">{t('footer_api')}</a>
            <a href="#" className="hover:text-[#22d3ee] transition-colors">{t('footer_contact')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const featureColors = [
  { bg: 'bg-[#22d3ee]/10', glow: 'bg-[#22d3ee]/5', border: 'hover:border-[#22d3ee]/30', icon: 'text-[#22d3ee]', iconBorder: 'group-hover:border-[#22d3ee]/40' },
  { bg: 'bg-[#f43f5e]/10', glow: 'bg-[#f43f5e]/5', border: 'hover:border-[#f43f5e]/30', icon: 'text-[#f43f5e]', iconBorder: 'group-hover:border-[#f43f5e]/40' },
  { bg: 'bg-[#f59e0b]/10', glow: 'bg-[#f59e0b]/5', border: 'hover:border-[#f59e0b]/30', icon: 'text-[#f59e0b]', iconBorder: 'group-hover:border-[#f59e0b]/40' },
  { bg: 'bg-[#10b981]/10', glow: 'bg-[#10b981]/5', border: 'hover:border-[#10b981]/30', icon: 'text-[#10b981]', iconBorder: 'group-hover:border-[#10b981]/40' },
  { bg: 'bg-[#8b5cf6]/10', glow: 'bg-[#8b5cf6]/5', border: 'hover:border-[#8b5cf6]/30', icon: 'text-[#8b5cf6]', iconBorder: 'group-hover:border-[#8b5cf6]/40' },
];

const FeatureCard = React.memo(function FeatureCard({
  icon,
  title,
  description,
  index,
  className = "",
  variant = 'vertical'
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  className?: string;
  variant?: 'vertical' | 'horizontal';
}) {
  const color = featureColors[index % featureColors.length];

  return (
    <div className={`glass-card p-10 group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${color.border} ${className}`}>
      {/* Subtle Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 ${color.glow} blur-[64px] rounded-full group-hover:scale-150 transition-all duration-700`} />

      <div className={`relative z-10 ${variant === 'horizontal' ? 'flex items-center gap-8' : ''}`}>
        <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 ${color.iconBorder} transition-all duration-500 shadow-xl ${variant === 'vertical' ? 'mb-10' : 'mb-0 shrink-0'}`}>
          <div className={`${color.icon}`}>{icon}</div>
        </div>
        <div>
          <h3 className={`font-black text-2xl text-white uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform ${variant === 'vertical' ? 'mb-4' : 'mb-2'}`}>
            {title}
          </h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed tracking-wide uppercase">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});



const WorkflowStep = React.memo(function WorkflowStep({
  step,
  title,
  description
}: {
  step: number;
  title: string;
  description: string;
}) {
  const colors = [
    'text-[#22d3ee] shadow-[#22d3ee]/20',
    'text-[#f43f5e] shadow-[#f43f5e]/20',
    'text-[#f59e0b] shadow-[#f59e0b]/20'
  ];
  const activeColor = colors[(step - 1) % colors.length];

  return (
    <div className="text-center group">
      <div className="relative inline-block mb-10">
        <div className={`absolute inset-0 bg-current blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-20 transition-opacity ${activeColor.split(' ')[0].replace('text-', 'bg-')}`} />
        <div className={`w-20 h-20 rounded-full bg-white/5 border border-white/10 mx-auto relative z-10 flex items-center justify-center text-3xl font-black shadow-2xl group-hover:scale-110 transition-all duration-500 ${activeColor}`}>
          0{step}
        </div>
      </div>
      <h3 className="font-black text-2xl mb-4 text-white uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.1em] leading-relaxed max-w-[250px] mx-auto">
        {description}
      </p>
    </div>
  );
});

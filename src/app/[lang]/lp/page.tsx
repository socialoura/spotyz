'use client';

import { Language } from '@/i18n/config';
import { useRouter } from 'next/navigation';
import { Music, ArrowRight } from 'lucide-react';

interface PageProps {
  params: { lang: string };
}

export default function LandingPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const router = useRouter();

  const content = {
    en: {
      headline: 'Boost Your Spotify Visibility',
      subheadline: 'Run targeted campaigns to promote your tracks and reach new listeners.',
      cta: 'Get Started',
    },
    fr: {
      headline: 'Boostez votre visibilité Spotify',
      subheadline: 'Lancez des campagnes ciblées pour promouvoir vos titres et atteindre de nouveaux auditeurs.',
      cta: 'Commencer',
    },
  };

  const t = content[lang];

  const handleCTA = () => {
    router.push(`/${lang}`);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_30%,rgba(29,185,84,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40 dark:opacity-20" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1DB954] shadow-xl shadow-[#1DB954]/25">
            <Music className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-4 sm:mb-6">
          {t.headline}
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          {t.subheadline}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleCTA}
          className="group inline-flex items-center gap-3 sm:gap-4 bg-[#1DB954] hover:bg-emerald-600 text-white font-black text-base sm:text-xl px-6 sm:px-10 py-4 sm:py-5 rounded-2xl transition-all duration-200 shadow-xl shadow-[#1DB954]/25 hover:shadow-2xl hover:shadow-[#1DB954]/30 hover:-translate-y-1"
        >
          {t.cta}
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

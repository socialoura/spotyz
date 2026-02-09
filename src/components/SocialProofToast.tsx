'use client';

import { ReactNode } from 'react';

interface SocialProofToastProps {
  title: string;
  subtitle: ReactNode;
  icon: ReactNode;
  tone?: 'spotify' | 'neutral';
  className?: string;
}

export default function SocialProofToast({
  title,
  subtitle,
  icon,
  tone = 'spotify',
  className = '',
}: SocialProofToastProps) {
  const ring = tone === 'spotify' ? 'from-[#1DB954]/40 via-emerald-400/10 to-fuchsia-500/20' : 'from-white/10 via-white/5 to-white/10';
  const glow = tone === 'spotify' ? 'bg-[radial-gradient(500px_circle_at_20%_20%,rgba(29,185,84,0.20),transparent_55%)]' : 'bg-[radial-gradient(500px_circle_at_20%_20%,rgba(255,255,255,0.10),transparent_55%)]';

  return (
    <div className={`relative rounded-3xl p-[1px] bg-gradient-to-r ${ring} ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gray-950/80 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className={`pointer-events-none absolute inset-0 opacity-90 ${glow}`} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-15" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-black text-white">
              {title}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-white/70">
              {subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, Cloud, ExternalLink } from 'lucide-react';
import { PrivacyTier } from '@/registry/types';

interface PrivacyBadgeProps {
  tier: PrivacyTier;
  className?: string;
}

export function PrivacyBadge({ tier, className = '' }: PrivacyBadgeProps) {
  if (tier === 'local-only') {
    return (
      <span
        title="Files and calculations never leave your device"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% Client-Side Private</span>
      </span>
    );
  }

  if (tier === 'ephemeral-edge') {
    return (
      <span
        title="Processed on Cloudflare Edge with zero logs or databases"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
      >
        <Cloud className="w-3.5 h-3.5 text-amber-400" />
        <span>Ephemeral Edge Network</span>
      </span>
    );
  }

  return (
    <span
      title="Requires connection to verified external service"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 ${className}`}
    >
      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
      <span>Disclosed External API</span>
    </span>
  );
}

'use client';

import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';

export default function UtmBuilderComponent() {
  const [baseUrl, setBaseUrl] = useState<string>('https://helpgate.in');
  const [source, setSource] = useState<string>('google');
  const [medium, setMedium] = useState<string>('cpc');
  const [campaign, setCampaign] = useState<string>('launch_promo');
  const [term, setTerm] = useState<string>('free_tools');
  const [content, setContent] = useState<string>('banner_v1');
  const [copied, setCopied] = useState<boolean>(false);

  // Construct URL
  const constructUrl = () => {
    if (!baseUrl.trim()) return '';

    try {
      let urlStr = baseUrl.trim();
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }

      const url = new URL(urlStr);
      if (source.trim()) url.searchParams.set('utm_source', source.trim().toLowerCase());
      if (medium.trim()) url.searchParams.set('utm_medium', medium.trim().toLowerCase());
      if (campaign.trim()) url.searchParams.set('utm_campaign', campaign.trim().toLowerCase());
      if (term.trim()) url.searchParams.set('utm_term', term.trim().toLowerCase());
      if (content.trim()) url.searchParams.set('utm_content', content.trim().toLowerCase());

      return url.toString();
    } catch (e) {
      return '';
    }
  };

  const finalUrl = constructUrl();

  const applyPreset = (preset: { source: string; medium: string; campaign: string }) => {
    setSource(preset.source);
    setMedium(preset.medium);
    setCampaign(preset.campaign);
  };

  const handleCopy = () => {
    if (!finalUrl) return;
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Presets Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase mr-1">Presets:</span>
        <button
          onClick={() => applyPreset({ source: 'google', medium: 'cpc', campaign: 'search_ads' })}
          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
        >
          Google Ads
        </button>
        <button
          onClick={() => applyPreset({ source: 'facebook', medium: 'social_paid', campaign: 'retargeting' })}
          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
        >
          Meta / Facebook
        </button>
        <button
          onClick={() => applyPreset({ source: 'linkedin', medium: 'sponsored', campaign: 'b2b_outreach' })}
          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
        >
          LinkedIn
        </button>
        <button
          onClick={() => applyPreset({ source: 'newsletter', medium: 'email', campaign: 'monthly_digest' })}
          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
        >
          Email Newsletter
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl border border-border bg-secondary/20">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Target Website URL <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Campaign Source (`utm_source`) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. google, newsletter, twitter"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Campaign Medium (`utm_medium`) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            placeholder="e.g. cpc, email, social, banner"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Campaign Name (`utm_campaign`) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="e.g. spring_sale, black_friday"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Campaign Term (`utm_term`) <span className="text-muted-foreground/60">(Optional)</span>
          </label>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. running_shoes, tech_tools"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Campaign Content (`utm_content`) <span className="text-muted-foreground/60">(Optional)</span>
          </label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. hero_banner, sidebar_cta, logolink"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Generated Campaign Link Box */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-primary" />
            <span>Generated Tracking URL</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {finalUrl.length} characters
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 font-mono text-xs sm:text-sm text-foreground break-all select-all leading-relaxed">
          {finalUrl || 'Please specify a valid base URL'}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href={finalUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs text-primary hover:underline ${!finalUrl ? 'pointer-events-none opacity-40' : ''}`}
          >
            <span>Test URL in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopy}
            disabled={!finalUrl}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-primary/20"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Campaign Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

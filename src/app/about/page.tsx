import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Shield, Zap, Lock, Heart, ExternalLink, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About HelpGate — Free Technology for Everyone | One Gateway Online',
  description: 'Learn about HelpGate, a public service digital utility platform by One Gateway Online Pvt Ltd, committed to 100% free, private technology.',
  alternates: {
    canonical: 'https://helpgate.in/about/',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Product of One Gateway Online Pvt Ltd</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Free Technology. For Everyone.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          HelpGate was established with an unambiguous conviction: essential digital utilities—document processors, 
          code formatters, financial calculators, and productivity tools—should be freely available to every human 
          with a web browser, with zero cost, zero subscriptions, zero logins, and zero privacy trade-offs.
        </p>
      </div>

      {/* The 10 Principles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The 10 Founding Principles of HelpGate
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: '1. Genuinely Free for Everyone', desc: 'No hidden tiers, no artificial restrictions, and no feature paywalls.' },
            { title: '2. Client-First Execution', desc: '85–95% of all utility operations run directly inside the user browser memory.' },
            { title: '3. Zero Server Dependency', desc: 'No central application server is needed for ordinary daily tool usage.' },
            { title: '4. Minimal Infrastructure Spend', desc: 'Engineered for extreme efficiency to sustainably operate on near-zero hosting costs.' },
            { title: '5. Sub-Second Performance', desc: 'Static edge delivery via Cloudflare Pages ensures sub-50ms TTFB worldwide.' },
            { title: '6. Search-First Discoverability', desc: 'Original, comprehensive guides and schemas built for organic Google search discovery.' },
            { title: '7. Radical Privacy by Default', desc: 'Your files, documents, and tokens never touch an external cloud server.' },
            { title: '8. Modular Tool Registry', desc: 'An extensible plugin architecture capable of scaling to 1,000+ independent tools.' },
            { title: '9. Globally Accessible', desc: 'Optimized for low-bandwidth connections and mobile devices across all continents.' },
            { title: '10. Sustainable & Ethical Monetization', desc: 'Limited non-intrusive display ads strictly separated from active tool canvases.' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Relationship with One Gateway Online */}
      <div className="p-8 rounded-3xl border border-border bg-secondary/30 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Corporate Lineage</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-border text-muted-foreground">Parent Company</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          One Gateway Online Pvt Ltd & HelpGate
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          HelpGate is the dedicated public-service digital technology platform of <strong>One Gateway Online Pvt Ltd</strong>. 
          While HelpGate provides free public utilities, One Gateway Online develops enterprise SaaS software, CRM platforms, 
          and fintech infrastructure.
        </p>

        {/* Commercial Separation Policy */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
          <h4 className="font-bold text-foreground">Commercial Separation Charter:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>HelpGate utilities will remain 100% free forever.</li>
            <li>Commercial OneGate products will never be presented as mandatory upgrades to free tools.</li>
            <li>No aggressive upselling or deceptive dark patterns.</li>
            <li>Clear and transparent demarcation between free and enterprise offerings.</li>
          </ul>
        </div>

        {/* Ecosystem Products */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-bold text-sm text-foreground mb-1">OneGate Core</h4>
            <p className="text-xs text-muted-foreground">
              Intelligent enterprise resource management, multi-channel CRM, and automated operations.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-bold text-sm text-foreground mb-1">CrediGate</h4>
            <p className="text-xs text-muted-foreground">
              Next-generation fintech platforms and digital credit scoring infrastructure.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-bold text-sm text-foreground mb-1">TourGate</h4>
            <p className="text-xs text-muted-foreground">
              Modern travel operations software, booking engines, and automated itinerary systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, ArrowUpRight, ExternalLink, Heart } from 'lucide-react';
import { CATEGORY_LIST } from '@/registry/categories';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Section: Corporate Brand & OneGate Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-border">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-600/20 via-sky-500/10 to-indigo-500/20 border border-blue-500/30 p-1 shadow-md shadow-blue-500/10 transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="HelpGate Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.4)]"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                HelpGate
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              A globally accessible public technology initiative by <strong>One Gateway Online Pvt Ltd</strong>. 
              Providing free, privacy-first digital utilities, document tools, and productivity software without 
              subscriptions, paywalls, or mandatory logins.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Permanent Free-Service Commitment</span>
            </div>
          </div>

          {/* More from One Gateway Ecosystem Showcase */}
          <div className="lg:col-span-8 bg-secondary/40 border border-border/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  One Gateway Online Ecosystem
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-border text-muted-foreground">
                  Verified Offerings
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Corporate Suite</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center justify-between">
                  <span>OneGate Core</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </h4>
                <p className="text-xs text-muted-foreground">
                  Unified enterprise management, intelligent CRM, and omnichannel business operations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center justify-between">
                  <span>CrediGate</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </h4>
                <p className="text-xs text-muted-foreground">
                  Next-generation financial technology and modern digital credit infrastructure.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center justify-between">
                  <span>TourGate</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </h4>
                <p className="text-xs text-muted-foreground">
                  Intelligent travel management systems, booking engines, and itinerary technology.
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground text-right">
              Commercial enterprise solutions by One Gateway Online Pvt Ltd. HelpGate utilities remain 100% free forever.
            </p>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-border">
          {/* Column 1: Primary Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Tool Categories
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {CATEGORY_LIST.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}/`} className="hover:text-foreground transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: More Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              More Categories
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {CATEGORY_LIST.slice(5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}/`} className="hover:text-foreground transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/software/" className="hover:text-foreground transition-colors font-medium text-primary">
                  Software Directory →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Mission */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Platform & Mission
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/about/" className="hover:text-foreground transition-colors">
                  About HelpGate
                </Link>
              </li>
              <li>
                <Link href="/privacy/" className="hover:text-foreground transition-colors">
                  Privacy Charter (100% Local)
                </Link>
              </li>
              <li>
                <Link href="/terms/" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-not-allowed">
                  System Architecture (docs/)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Popular Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Popular Utilities
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/tools/pdf-merger/" className="hover:text-foreground transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link href="/tools/json-formatter/" className="hover:text-foreground transition-colors">
                  JSON Formatter & Validator
                </Link>
              </li>
              <li>
                <Link href="/tools/gst-calculator/" className="hover:text-foreground transition-colors">
                  Indian GST Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/invoice-generator/" className="hover:text-foreground transition-colors">
                  Free Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/password-generator/" className="hover:text-foreground transition-colors">
                  Cryptographic Password Gen
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} HelpGate.in. A Product of <strong>One Gateway Online Pvt Ltd</strong>. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for free global digital access.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

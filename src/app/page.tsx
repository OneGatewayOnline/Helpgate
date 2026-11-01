'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Code2, 
  FileText, 
  Briefcase, 
  Wrench, 
  ExternalLink,
  Layers,
  FileStack,
  CheckCircle2
} from 'lucide-react';
import { ALL_TOOLS, getPopularTools } from '@/registry';
import { CATEGORY_LIST } from '@/registry/categories';
import { PrivacyBadge } from '@/components/tools/PrivacyBadge';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const popularTools = getPopularTools();

  const filteredTools = searchQuery.trim()
    ? ALL_TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden text-center px-4">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Product of One Gateway Online Pvt Ltd</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Free Technology. <br />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              For Everyone.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            High-performance digital tools, PDF processors, developer formatters, and financial calculators. 
            Runs <strong>100% locally in your browser</strong> with zero file uploads, zero paywalls, and zero logins.
          </p>

          {/* Quick Search Input */}
          <div className="max-w-xl mx-auto pt-4">
            <div 
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-border bg-card/80 hover:border-primary/50 shadow-lg cursor-pointer transition-all group"
            >
              <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                readOnly
                placeholder="Search over 50+ free private PDF & developer utilities... (Cmd+K)"
                className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none cursor-pointer"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary border border-border text-xs font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Privacy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero Server Delays</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>No Accounts or Tracking</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Popular & Flagship Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Flagship Utilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Most utilized tools by developers, businesses, and creators
            </p>
          </div>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All ({ALL_TOOLS.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}/`}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileStack className="w-5 h-5" />
                  </div>
                  <PrivacyBadge tier={tool.privacyTier} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Browse Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Explore Categories
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Modular tool ecosystems categorized for fast discovery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_LIST.map((cat) => {
            const count = ALL_TOOLS.filter((t) => t.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.id}/`}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-secondary/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {count} {count === 1 ? 'Tool' : 'Tools'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Why HelpGate? Architectural Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-gradient-to-b from-secondary/40 to-card">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built Different. Client-First Architecture.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Traditional tools upload your private tax documents, passwords, and source code to remote servers. 
              HelpGate redefines utility software by doing all the heavy lifting directly on your computer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-2">
                100% Confidential
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your PDFs, images, code, and financial numbers never touch an external cloud server. 
                Everything is processed inside your browser memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-2">
                Near-Instant Execution
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Zero network upload latency, zero cloud job queues. 
                Merging 50 pages of PDF happens in milliseconds on your own device CPU.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-2">
                Permanent Free Charter
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No &quot;pro&quot; tiers, no pay-per-use tokens, no watermarks, and no mandatory registrations. 
                Free technology for the global public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. One Gateway Online Ecosystem Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-border/80 rounded-3xl p-8 sm:p-10 bg-secondary/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              One Gateway Online Pvt Ltd
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Powering Free Technology and Enterprise Solutions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              HelpGate is developed and maintained as a public utility initiative by <strong>One Gateway Online Pvt Ltd</strong>, 
              creators of <strong>OneGate Core</strong> CRM, <strong>CrediGate</strong> financial infrastructure, and <strong>TourGate</strong> travel operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/about/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all text-center shadow-md shadow-primary/20"
            >
              About Our Ecosystem
            </Link>
            <Link
              href="/software/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-secondary transition-all text-center"
            >
              Browse Software Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Global Command Palette Search Modal */}
      <CommandPalette isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}

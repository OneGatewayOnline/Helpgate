'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ToolDefinition } from '@/registry/types';
import { CATEGORIES } from '@/registry/categories';
import { PrivacyBadge } from './PrivacyBadge';
import { ShareButton } from './ShareButton';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  onReset?: () => void;
  relatedTools?: ToolDefinition[];
}

export function ToolWorkspace({
  tool,
  children,
  onReset,
  relatedTools = [],
}: ToolWorkspaceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const category = CATEGORIES[tool.category];

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 py-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-background overflow-y-auto p-6 max-w-none' : ''}`}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/category/${tool.category}/`} className="hover:text-foreground transition-colors">
          {category?.name || tool.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate">{tool.name}</span>
      </nav>

      {/* Header Info */}
      <div className="mb-6 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {tool.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PrivacyBadge tier={tool.privacyTier} />
              {tool.isNew && (
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Action Controls in Top Right */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            {onReset && (
              <button
                onClick={onReset}
                title="Reset tool"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all hidden sm:flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <ShareButton tool={tool} />
          </div>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Disclaimer Alert if applicable */}
      {tool.disclaimer && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{tool.disclaimer}</span>
        </div>
      )}

      {/* Primary Tool Canvas / Workspace */}
      <main role="main" className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm mb-12">
        {children}
      </main>

      {/* Below the fold: Instructions, FAQs, Related Tools */}
      {!isFullscreen && (
        <div className="space-y-12">
          {/* How to use */}
          {tool.instructions && tool.instructions.steps && (
            <section className="bg-secondary/40 border border-border/60 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 text-foreground font-semibold text-lg">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2>How to Use {tool.name}</h2>
              </div>
              <ol className="space-y-3">
                {tool.instructions.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              {tool.instructions.tips && tool.instructions.tips.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/60">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Pro Tips
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    {tool.instructions.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Privacy & Security Guarantee */}
          <section className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3>HelpGate Privacy & Security Commitment</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              This tool operates strictly inside your browser session using standard Web APIs. Your input,
              confidential files, calculations, or tokens are <strong>never transmitted</strong> to or stored on
              HelpGate servers or third-party cloud infrastructure. You can safely disconnect your internet and
              continue using this tool once the page has loaded.
            </p>
          </section>

          {/* FAQs Section */}
          {tool.faqs && tool.faqs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 text-foreground font-semibold text-xl">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2>Frequently Asked Questions</h2>
              </div>
              <div className="grid gap-4">
                {tool.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-5 bg-card">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <section className="pt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Related Utilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTools.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/tools/${rel.id}/`}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 flex items-center justify-between">
                        <span>{rel.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {rel.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

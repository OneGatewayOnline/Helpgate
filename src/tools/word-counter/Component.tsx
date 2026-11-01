'use client';

import React, { useState } from 'react';
import { Type, Clock, Copy, Check, Trash2, ArrowRightLeft } from 'lucide-react';

export default function WordCounterComponent() {
  const [text, setText] = useState<string>(
    'HelpGate provides 100% free digital utilities for developers, creators, businesses, and everyday users worldwide. Everything runs client-side with complete privacy.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Metrics
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+/g) || ['']).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter((p) => p.trim()).length : 0;

  // Reading & Speaking times
  const readingTimeMinutes = Math.ceil(words / 200);
  const speakingTimeMinutes = Math.ceil(words / 130);

  // Top Keywords
  const getTopKeywords = () => {
    if (!text.trim()) return [];
    const stopWords = new Set(['the','and','a','to','of','in','is','it','for','with','on','that','this','by','at','as','an','be','are','from','or','your','we','our']);
    const tokens = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq: Record<string, number> = {};
    tokens.forEach((t) => {
      if (!stopWords.has(t)) {
        freq[t] = (freq[t] || 0) + 1;
      }
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const topKeywords = getTopKeywords();

  const handleCaseChange = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (type === 'upper') setText(text.toUpperCase());
    if (type === 'lower') setText(text.toLowerCase());
    if (type === 'title') {
      setText(
        text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      );
    }
    if (type === 'sentence') {
      setText(
        text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block mb-1">Total Words</span>
          <span className="text-2xl font-bold font-mono text-primary">{words}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block mb-1">Characters (All)</span>
          <span className="text-2xl font-bold font-mono text-foreground">{characters}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block mb-1">Chars (No Spaces)</span>
          <span className="text-2xl font-bold font-mono text-foreground">{charactersNoSpaces}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block mb-1">Sentences</span>
          <span className="text-2xl font-bold font-mono text-foreground">{sentences}</span>
        </div>
      </div>

      {/* Reading Time Estimates */}
      <div className="p-4 rounded-xl border border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>Reading Time: <strong className="text-foreground">{readingTimeMinutes} min</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Speaking Time: <strong className="text-foreground">{speakingTimeMinutes} min</strong></span>
          </div>
          <div className="hidden sm:inline-block text-muted-foreground">
            Paragraphs: <strong className="text-foreground">{paragraphs}</strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleCaseChange('upper')}
            className="px-2 py-1 rounded bg-card border border-border hover:bg-secondary text-[11px] font-semibold"
          >
            UPPER
          </button>
          <button
            onClick={() => handleCaseChange('lower')}
            className="px-2 py-1 rounded bg-card border border-border hover:bg-secondary text-[11px] font-semibold"
          >
            lower
          </button>
          <button
            onClick={() => handleCaseChange('title')}
            className="px-2 py-1 rounded bg-card border border-border hover:bg-secondary text-[11px] font-semibold"
          >
            Title Case
          </button>
        </div>
      </div>

      {/* Main Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here to analyze words, characters, and reading time..."
        className="w-full h-64 p-4 rounded-xl border border-border bg-background text-foreground text-sm sm:text-base leading-relaxed outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Action Footer & Keyword Insights */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Top Keywords:</span>
          {topKeywords.length > 0 ? (
            topKeywords.map(([word, count]) => (
              <span
                key={word}
                className="text-[11px] px-2 py-0.5 rounded-full bg-secondary border border-border text-foreground font-mono"
              >
                {word} ({count})
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/60">None yet</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setText('')}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Hash, ShieldCheck } from 'lucide-react';

export default function HashGeneratorComponent() {
  const [input, setInput] = useState<string>('HelpGate.in');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const computeHashes = async (text: string) => {
    if (!text) {
      setHashes({});
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Compute Web Crypto native digests
    const algorithms = [
      { name: 'SHA-256', key: 'sha256' },
      { name: 'SHA-512', key: 'sha512' },
      { name: 'SHA-384', key: 'sha384' },
      { name: 'SHA-1', key: 'sha1' },
    ];

    const results: Record<string, string> = {};

    for (const algo of algorithms) {
      try {
        const hashBuffer = await crypto.subtle.digest(algo.name, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        results[algo.name] = isUppercase ? hex.toUpperCase() : hex;
      } catch (e) {
        results[algo.name] = 'Unsupported in this browser environment';
      }
    }

    setHashes(results);
  };

  useEffect(() => {
    computeHashes(input);
  }, [input, isUppercase]);

  const copyHash = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Input Text to Hash (Calculated using Web Crypto API)
          </label>
          <button
            onClick={() => setIsUppercase(!isUppercase)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {isUppercase ? 'Switch to Lowercase' : 'Switch to Uppercase'}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text to compute cryptographic hashes in real-time..."
          className="w-full h-28 p-3.5 rounded-xl border border-border bg-background text-foreground font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Generated Hashes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-primary" />
          <span>Cryptographic Hash Digests</span>
        </h3>

        {Object.entries(hashes).map(([name, val]) => (
          <div
            key={name}
            className="p-3 rounded-xl border border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-20 text-xs font-bold text-foreground font-mono shrink-0">
                {name}
              </span>
              <span className="text-xs font-mono text-muted-foreground break-all select-all">
                {val}
              </span>
            </div>

            <button
              onClick={() => copyHash(name, val)}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 self-end sm:self-auto transition-colors"
              title={`Copy ${name}`}
            >
              {copiedKey === name ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

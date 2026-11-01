'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, Download, Layers } from 'lucide-react';

export default function UuidGeneratorComponent() {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (!hyphens) {
        id = id.replace(/-/g, '');
      }
      if (uppercase) {
        id = id.toUpperCase();
      }
      list.push(id);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateUuids();
  }, [count, uppercase, hyphens]);

  const copyIndividual = (uuid: string, idx: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'helpgate-uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="p-4 rounded-xl border border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Count:</span>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium outline-none"
            >
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'UUID' : 'UUIDs'}
                </option>
              ))}
            </select>
          </div>

          {/* Hyphen toggle */}
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <span>Include Hyphens</span>
          </label>

          {/* Uppercase toggle */}
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            <span>Uppercase</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateUuids}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={copyAll}
            className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'All Copied' : 'Copy All'}</span>
          </button>

          <button
            onClick={downloadTxt}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Download list as .txt"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* UUIDs Display List */}
      <div className="space-y-2">
        {uuids.map((id, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-mono text-muted-foreground/60 w-6">
                #{idx + 1}
              </span>
              <span className="font-mono text-xs sm:text-sm text-foreground truncate select-all">
                {id}
              </span>
            </div>

            <button
              onClick={() => copyIndividual(id, idx)}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
              title="Copy UUID"
            >
              {copiedIndex === idx ? (
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

'use client';

import React, { useState } from 'react';
import { GitCompare, Copy, Check, RefreshCw } from 'lucide-react';

export default function TextDiffComponent() {
  const [originalText, setOriginalText] = useState<string>(
    '{\n  "name": "HelpGate",\n  "version": "1.0.0",\n  "status": "beta",\n  "features": ["merge-pdf", "image-resizer"]\n}'
  );
  const [modifiedText, setModifiedText] = useState<string>(
    '{\n  "name": "HelpGate",\n  "version": "2.0.0",\n  "status": "production",\n  "features": ["merge-pdf", "image-resizer", "pdf-sign", "pdf-redact"],\n  "license": "MIT"\n}'
  );
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);

  // Simple line-by-line diff algorithm
  const computeDiff = () => {
    const origLines = originalText.split('\n');
    const modLines = modifiedText.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);

    const diffRows: {
      type: 'equal' | 'modified' | 'added' | 'removed';
      orig?: string;
      mod?: string;
      lineNumOrig?: number;
      lineNumMod?: number;
    }[] = [];

    let oIdx = 0;
    let mIdx = 0;

    while (oIdx < origLines.length || mIdx < modLines.length) {
      const o = origLines[oIdx];
      const m = modLines[mIdx];

      const cleanO = ignoreWhitespace && o !== undefined ? o.trim() : o;
      const cleanM = ignoreWhitespace && m !== undefined ? m.trim() : m;

      if (o !== undefined && m !== undefined && cleanO === cleanM) {
        diffRows.push({
          type: 'equal',
          orig: o,
          mod: m,
          lineNumOrig: oIdx + 1,
          lineNumMod: mIdx + 1,
        });
        oIdx++;
        mIdx++;
      } else if (o !== undefined && m !== undefined) {
        diffRows.push({
          type: 'modified',
          orig: o,
          mod: m,
          lineNumOrig: oIdx + 1,
          lineNumMod: mIdx + 1,
        });
        oIdx++;
        mIdx++;
      } else if (o !== undefined) {
        diffRows.push({
          type: 'removed',
          orig: o,
          lineNumOrig: oIdx + 1,
        });
        oIdx++;
      } else {
        diffRows.push({
          type: 'added',
          mod: m,
          lineNumMod: mIdx + 1,
        });
        mIdx++;
      }
    }

    return diffRows;
  };

  const diffResult = computeDiff();
  const additions = diffResult.filter((d) => d.type === 'added').length;
  const removals = diffResult.filter((d) => d.type === 'removed').length;
  const modifications = diffResult.filter((d) => d.type === 'modified').length;

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            Diff Inspector
          </span>
          <span className="text-emerald-600 font-medium">+{additions} added</span>
          <span className="text-rose-600 font-medium">-{removals} removed</span>
          <span className="text-amber-600 font-medium">~{modifications} changed</span>
        </div>

        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Ignore Whitespace Differences
        </label>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Original Text / Code
          </label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={10}
            className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Paste original version..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Modified Text / Code
          </label>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            rows={10}
            className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Paste modified version..."
          />
        </div>
      </div>

      {/* Side-by-Side Diff Output */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 font-mono text-xs text-slate-200">
        <div className="grid grid-cols-2 bg-slate-900 border-b border-slate-800 px-4 py-2 font-semibold text-slate-400">
          <div>Original File</div>
          <div>Modified File</div>
        </div>

        <div className="divide-y divide-slate-900 max-h-96 overflow-y-auto">
          {diffResult.map((row, idx) => {
            const isMod = row.type === 'modified';
            const isAdd = row.type === 'added';
            const isRem = row.type === 'removed';

            return (
              <div key={idx} className="grid grid-cols-2 divide-x divide-slate-800/80">
                {/* Left (Original) */}
                <div
                  className={`px-3 py-1 flex items-start gap-2 ${
                    isRem
                      ? 'bg-rose-950/40 text-rose-300'
                      : isMod
                      ? 'bg-amber-950/30 text-amber-300'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-8 shrink-0 text-slate-600 select-none text-right">
                    {row.lineNumOrig || ''}
                  </span>
                  <pre className="whitespace-pre-wrap break-all font-mono">
                    {row.orig ?? ''}
                  </pre>
                </div>

                {/* Right (Modified) */}
                <div
                  className={`px-3 py-1 flex items-start gap-2 ${
                    isAdd
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : isMod
                      ? 'bg-amber-950/30 text-amber-300'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-8 shrink-0 text-slate-600 select-none text-right">
                    {row.lineNumMod || ''}
                  </span>
                  <pre className="whitespace-pre-wrap break-all font-mono">
                    {row.mod ?? ''}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

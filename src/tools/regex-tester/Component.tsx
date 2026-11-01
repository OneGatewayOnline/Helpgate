'use client';

import React, { useState, useMemo } from 'react';
import { Code2, AlertCircle, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

export default function RegexTesterComponent() {
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState<string>('gm');
  const [testString, setTestString] = useState<string>(
    'Contact support at help@helpgate.in or team@onegateway.online for assistance.'
  );

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flags);
      const results: Array<{ match: string; index: number; groups: string[] }> = [];

      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        let lastIdx = 0;
        while ((m = regex.exec(testString)) !== null) {
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m.index === regex.lastIndex) regex.lastIndex++;
          if (results.length > 500) break; // safety guard
        }
      } else {
        const m = regex.exec(testString);
        if (m) {
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      return { matches: results, error: null };
    } catch (err: any) {
      return { matches: [], error: err.message };
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pattern Input Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
        <label className="text-xs font-semibold uppercase text-muted-foreground">
          Regular Expression Pattern & Flags
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xl font-mono text-muted-foreground font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Type regex pattern..."
            className="flex-1 py-2 px-3 rounded-xl border border-border bg-background text-foreground font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
          <span className="text-xl font-mono text-muted-foreground font-bold">/</span>
          <span className="font-mono text-sm text-primary font-bold w-12">{flags}</span>
        </div>

        {/* Flag Toggles */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60 flex-wrap">
          <span className="text-[11px] text-muted-foreground uppercase font-semibold mr-1">Flags:</span>
          {[
            { flag: 'g', label: 'Global (g)' },
            { flag: 'i', label: 'Case Insensitive (i)' },
            { flag: 'm', label: 'Multiline (m)' },
            { flag: 's', label: 'Dotall (s)' },
          ].map((f) => (
            <button
              key={f.flag}
              onClick={() => toggleFlag(f.flag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                flags.includes(f.flag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Regex Syntax Error: {error}</span>
        </div>
      )}

      {/* Test String */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase">Test Text Input</span>
          <span className="text-primary font-bold">{matches.length} Matches Found</span>
        </div>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Paste or write text to test against the regex..."
          className="w-full h-44 p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
          spellCheck={false}
        />
      </div>

      {/* Match Results Inspector */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Captured Matches & Groups ({matches.length})
        </h4>

        {matches.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">
                    Match #{idx + 1} at index {m.index}
                  </span>
                  <span className="text-foreground bg-primary/10 px-2 py-0.5 rounded font-bold">
                    &quot;{m.match}&quot;
                  </span>
                </div>

                {m.groups.length > 0 && (
                  <div className="pl-3 border-l-2 border-border/80 space-y-1 text-[11px] text-muted-foreground">
                    {m.groups.map((grp, gIdx) => (
                      <div key={gIdx} className="flex items-center gap-2">
                        <span className="text-muted-foreground/80">Group {gIdx + 1}:</span>
                        <span className="text-foreground font-bold">&quot;{grp}&quot;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            No matches found in the test string.
          </div>
        )}
      </div>
    </div>
  );
}

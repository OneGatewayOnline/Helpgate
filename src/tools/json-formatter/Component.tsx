'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Minimize2, 
  FileCheck, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';

const SAMPLE_JSON = `{
  "platform": "HelpGate",
  "domain": "https://helpgate.in",
  "parentCompany": "One Gateway Online Pvt Ltd",
  "mission": "Free Technology. For Everyone.",
  "features": [
    "100% Client-Side Processing",
    "Zero Subscriptions",
    "Zero File Uploads",
    "Privacy First"
  ],
  "stats": {
    "toolsAvailable": 25,
    "activeUsers": 50000,
    "uptime": "99.99%"
  }
}`;

export default function JsonFormatterComponent() {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [output, setOutput] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  const formatJson = (spaces: number = indent) => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      setIsValid(true);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutput(formatted);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  const minifyJson = () => {
    setError(null);
    if (!input.trim()) return;

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  const copyOutput = () => {
    const textToCopy = output || input;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJson = () => {
    const content = output || input;
    if (!content) return;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'helpgate-formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-secondary/40 border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => formatJson(2)}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format (2 Spaces)</span>
          </button>

          <button
            onClick={() => formatJson(4)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors"
          >
            4 Spaces
          </button>

          <button
            onClick={minifyJson}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          <button
            onClick={() => {
              setInput(SAMPLE_JSON);
              setError(null);
            }}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Load Sample
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyOutput}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={downloadJson}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => {
              setInput('');
              setOutput('');
              setError(null);
            }}
            title="Clear"
            className="p-1.5 rounded-lg border border-border bg-background hover:text-destructive transition-colors text-muted-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider">Input JSON</span>
            <span>{input.length} characters</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted or minified JSON here..."
            className="w-full h-[380px] p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold uppercase tracking-wider">Formatted Result</span>
            {isValid && (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                Valid JSON
              </span>
            )}
          </div>
          <textarea
            readOnly
            value={output || input}
            placeholder="Formatted output will appear here..."
            className="w-full h-[380px] p-4 rounded-xl border border-border bg-secondary/30 text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">JSON Syntax Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowRightLeft, FileCode, AlertCircle } from 'lucide-react';

export default function Base64ToolComponent() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('Hello HelpGate! 🚀 Free Technology for Everyone.');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Unicode-safe Base64 encode
  const utf8ToBase64 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Unicode-safe Base64 decode
  const base64ToUtf8 = (base64Str: string): string => {
    const binary = atob(base64Str.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  useEffect(() => {
    setError(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(utf8ToBase64(input));
      } else {
        setOutput(base64ToUtf8(input));
      }
    } catch (err: any) {
      setError(mode === 'decode' ? 'Invalid Base64 sequence.' : err.message);
      setOutput('');
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'encode'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            Encode to Base64
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'decode'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            Decode from Base64
          </button>
        </div>

        <button
          onClick={handleSwap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Swap Inputs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-muted-foreground">
            {mode === 'encode' ? 'Plain Text Input (Supports Unicode & Emojis)' : 'Base64 Encoded String'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste Base64 encoded string here...'}
            className="w-full h-64 p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              {mode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="w-full h-64 p-4 rounded-xl border border-border bg-secondary/30 text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

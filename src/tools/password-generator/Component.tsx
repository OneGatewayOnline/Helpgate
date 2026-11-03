'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck, KeyRound } from 'lucide-react';

export default function PasswordGeneratorComponent() {
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidAmbiguous) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
      symbols = symbols.replace(/[|;:,.]/g, '');
    }

    let charPool = '';
    if (includeUpper) charPool += upper;
    if (includeLower) charPool += lower;
    if (includeNumbers) charPool += numbers;
    if (includeSymbols) charPool += symbols;

    if (!charPool) {
      setPassword('');
      return;
    }

    // Cryptographically unbiased rejection sampling to eliminate modulo bias
    const poolLength = charPool.length;
    const maxValid = Math.floor(0x100000000 / poolLength) * poolLength;
    let result = '';

    while (result.length < length) {
      const needed = length - result.length;
      const buffer = new Uint32Array(Math.max(needed * 2, 32));
      crypto.getRandomValues(buffer);

      for (let i = 0; i < buffer.length && result.length < length; i++) {
        if (buffer[i] < maxValid) {
          result += charPool[buffer[i] % poolLength];
        }
      }
    }

    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, avoidAmbiguous]);

  const calculateEntropy = (): { bits: number; label: string; color: string } => {
    let poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += 28;

    if (poolSize === 0) return { bits: 0, label: 'None', color: 'bg-muted' };

    const entropy = Math.round(length * Math.log2(poolSize));
    if (entropy < 40) return { bits: entropy, label: 'Weak', color: 'bg-red-500' };
    if (entropy < 60) return { bits: entropy, label: 'Moderate', color: 'bg-amber-500' };
    if (entropy < 80) return { bits: entropy, label: 'Strong', color: 'bg-emerald-500' };
    return { bits: entropy, label: 'Very Strong', color: 'bg-emerald-400' };
  };

  const entropy = calculateEntropy();

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Hero Box */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <KeyRound className="w-6 h-6 text-primary shrink-0 hidden sm:block" />
          <div className="font-mono text-base sm:text-xl font-bold text-foreground break-all tracking-wider select-all">
            {password || 'Please select at least one character type'}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={generatePassword}
            title="Generate new password"
            className="p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md shadow-primary/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Password'}</span>
          </button>
        </div>
      </div>

      {/* Strength & Entropy Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            Entropy: <strong className="text-foreground">{entropy.bits} bits</strong> ({entropy.label})
          </span>
          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically Secure (OS Entropy)</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${entropy.color}`}
            style={{ width: `${Math.min(100, (entropy.bits / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Controls & Options */}
      <div className="p-6 rounded-2xl border border-border bg-secondary/20 space-y-6">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="font-semibold text-foreground">Password Length</label>
            <span className="font-mono font-bold text-primary text-base">{length} Characters</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Character Set Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Uppercase Letters (A-Z)</p>
              <p className="text-[11px] text-muted-foreground">ABCDEFGH...</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Lowercase Letters (a-z)</p>
              <p className="text-[11px] text-muted-foreground">abcdefgh...</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Numbers (0-9)</p>
              <p className="text-[11px] text-muted-foreground">0123456789</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Special Symbols (!@#$)</p>
              <p className="text-[11px] text-muted-foreground">!@#$%^&*()_+-=</p>
            </div>
          </label>
        </div>

        <label className="flex items-center gap-3 pt-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={avoidAmbiguous}
            onChange={(e) => setAvoidAmbiguous(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <span>Avoid ambiguous characters (e.g. 0, O, I, l, 1)</span>
        </label>
      </div>
    </div>
  );
}

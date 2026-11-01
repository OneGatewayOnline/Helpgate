'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Clock, Copy, Check, AlertCircle } from 'lucide-react';

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlN1cmFqIFNoYXJtYSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDQxNTIwMDAsImV4cCI6MTgwNzIwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function JwtDebuggerComponent() {
  const [token, setToken] = useState<string>(SAMPLE_JWT);
  const [header, setHeader] = useState<string>('');
  const [payload, setPayload] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [expiryInfo, setExpiryInfo] = useState<{ expired: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  useEffect(() => {
    setError(null);
    if (!token.trim()) {
      setHeader('');
      setPayload('');
      setSignature('');
      setExpiryInfo(null);
      return;
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError('A valid JWT must contain exactly 3 dot-separated parts: Header.Payload.Signature');
      return;
    }

    try {
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setSignature(parts[2]);

      // Check expiry
      if (decodedPayload.exp) {
        const expMs = decodedPayload.exp * 1000;
        const nowMs = Date.now();
        const dateStr = new Date(expMs).toLocaleString();

        if (nowMs > expMs) {
          const diffMinutes = Math.round((nowMs - expMs) / 60000);
          setExpiryInfo({
            expired: true,
            message: `Expired on ${dateStr} (approx. ${diffMinutes} minutes ago)`,
          });
        } else {
          const diffHours = Math.round((expMs - nowMs) / 3600000);
          setExpiryInfo({
            expired: false,
            message: `Valid token! Expires on ${dateStr} (in ~${diffHours} hours)`,
          });
        }
      } else {
        setExpiryInfo({ expired: false, message: 'No expiration ("exp") claim specified.' });
      }
    } catch (err: any) {
      setError(`Failed to decode JWT claims: ${err.message}`);
    }
  }, [token]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Client-Side Only:</strong> HelpGate parses JWT claims in browser memory. Tokens are never transmitted to any server. Note that client-side parsing decodes payload claims but does not verify secret key cryptographic signatures.
        </span>
      </div>

      {/* Token Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <label className="font-semibold uppercase">Encoded JWT Token</label>
          <button
            onClick={() => setToken(SAMPLE_JWT)}
            className="text-primary hover:underline"
          >
            Load Sample JWT
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste encoded JWT string here (e.g. eyJhbGciOi...)..."
          className="w-full h-32 p-3.5 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary break-all"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expiry Status */}
      {expiryInfo && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 font-medium ${
            expiryInfo.expired
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          {expiryInfo.expired ? (
            <Clock className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{expiryInfo.message}</span>
        </div>
      )}

      {/* Decoded Views Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase text-red-400">Header: Algorithm & Token Type</span>
            <button
              onClick={() => copyToClipboard(header, 'header')}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {copiedKey === 'header' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-foreground font-mono text-xs overflow-x-auto min-h-[140px]">
            {header || '// Decoded header will appear here'}
          </pre>
        </div>

        {/* Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase text-purple-400">Payload: Data Claims</span>
            <button
              onClick={() => copyToClipboard(payload, 'payload')}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {copiedKey === 'payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-foreground font-mono text-xs overflow-x-auto min-h-[140px]">
            {payload || '// Decoded payload claims will appear here'}
          </pre>
        </div>
      </div>
    </div>
  );
}

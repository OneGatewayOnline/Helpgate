'use client';

import React, { useState } from 'react';
import { Palette, Copy, Check, Eye } from 'lucide-react';

export default function ColorConverterComponent() {
  const [hex, setHex] = useState<string>('#6366f1');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Parse Hex to RGB
  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 99, g: 102, b: 241 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(hex);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Relative luminance for WCAG contrast
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = ((1.0 + 0.05) / (lum + 0.05)).toFixed(2);
  const contrastBlack = ((lum + 0.05) / (0.0 + 0.05)).toFixed(2);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Visual Header */}
      <div className="p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner transition-colors" style={{ backgroundColor: hex }}>
        <div className="space-y-1 text-center sm:text-left drop-shadow">
          <h3
            className="text-2xl font-bold font-mono tracking-tight"
            style={{ color: lum > 0.4 ? '#0f172a' : '#ffffff' }}
          >
            {hex.toUpperCase()}
          </h3>
          <p
            className="text-xs font-medium"
            style={{ color: lum > 0.4 ? '#334155' : '#e2e8f0' }}
          >
            rgb({rgb.r}, {rgb.g}, {rgb.b}) • hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/20">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-24 px-2 py-1 text-xs font-mono font-semibold bg-transparent text-slate-800 dark:text-slate-100 uppercase"
            maxLength={7}
          />
        </div>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'HEX', val: hex.toUpperCase() },
          { label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
          { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-slate-400 block font-medium mb-1">{item.label}</span>
              <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
                {item.val}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(item.val, item.label)}
              className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
              title="Copy"
            >
              {copiedFormat === item.label ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* WCAG Contrast Ratio Checker */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          WCAG 2.1 Accessibility Contrast Checker
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contrast on White */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: hex, color: '#ffffff' }}
              >
                Aa
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Against White (#ffffff)</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                  {contrastWhite}:1
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  Number(contrastWhite) >= 4.5
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                AA {Number(contrastWhite) >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`block px-2 py-0.5 rounded text-[10px] font-bold ${
                  Number(contrastWhite) >= 7.0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                AAA {Number(contrastWhite) >= 7.0 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Contrast on Black */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: hex, color: '#000000' }}
              >
                Aa
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Against Black (#000000)</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                  {contrastBlack}:1
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  Number(contrastBlack) >= 4.5
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                AA {Number(contrastBlack) >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`block px-2 py-0.5 rounded text-[10px] font-bold ${
                  Number(contrastBlack) >= 7.0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                AAA {Number(contrastBlack) >= 7.0 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Copy, Check, Sparkles } from 'lucide-react';

export default function QrCodeGeneratorComponent() {
  const [text, setText] = useState<string>('https://helpgate.in');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(300);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(
      text,
      {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [text, fgColor, bgColor, size, errorLevel]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'helpgate-qrcode.png';
    a.click();
  };

  const copyImage = async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback: copy data URL
      navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            QR Code Content (URL, Text, or Wi-Fi)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any URL, link, or message..."
            className="w-full h-28 p-3.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Customization Options */}
        <div className="p-5 rounded-xl border border-border bg-secondary/30 space-y-4">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground">Styling Options</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Foreground Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-border bg-background text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Background Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-border bg-background text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Output Resolution</span>
              <span className="font-mono font-bold text-foreground">{size} × {size} px</span>
            </div>
            <input
              type="range"
              min="150"
              max="800"
              step="50"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Error Correction Level</span>
            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setErrorLevel(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    errorLevel === lvl
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {lvl} ({lvl === 'L' ? '7%' : lvl === 'M' ? '15%' : lvl === 'Q' ? '25%' : '30%'})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview & Download Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-secondary/20 space-y-6">
        <div className="p-4 rounded-xl bg-white shadow-md border border-border/40 flex items-center justify-center">
          {dataUrl ? (
            <img src={dataUrl} alt="Generated QR Code" className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-muted-foreground">
              <QrCode className="w-12 h-12 mb-2 opacity-30" />
              <span className="text-xs">Enter text to generate</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={downloadPng}
            disabled={!dataUrl}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={copyImage}
            disabled={!dataUrl}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:bg-secondary disabled:opacity-40 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

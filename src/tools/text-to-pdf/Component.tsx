'use client';

import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Download, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const SAMPLE_TEXT = `HELPGATE.IN — MASTER PROJECT BLUEPRINT
Free Technology. For Everyone.
A Product of One Gateway Online Pvt Ltd

1. Core Mission
HelpGate is a globally accessible, privacy-first technology platform providing free access to digital tools, software utilities, and productivity services.

2. Client-First Execution
Over 90% of utility operations run purely in the user's web browser using modern Web APIs.
- No files uploaded to remote cloud servers
- Zero permanent database overhead
- Extreme infrastructure efficiency

3. Sustainable Commitment
HelpGate will never introduce subscriptions, paywalls, or artificial limitations.`;

export default function TextToPdfComponent() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [fontChoice, setFontChoice] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvertToPdf = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      let selectedFont = StandardFonts.Helvetica;
      if (fontChoice === 'TimesRoman') selectedFont = StandardFonts.TimesRoman;
      if (fontChoice === 'Courier') selectedFont = StandardFonts.Courier;

      const font = await pdfDoc.embedFont(selectedFont);

      const margin = 50;
      const pageWidth = 595.28; // A4
      const pageHeight = 841.89;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.45;

      const lines = text.split('\n');

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      for (const rawLine of lines) {
        // Simple word wrapping
        const words = rawLine.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > contentWidth && currentLine) {
            // Draw current line
            if (currentY - lineHeight < margin) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }
            currentPage.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
            currentY -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (currentY - lineHeight < margin) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentY -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to convert text to PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <div className="p-4 rounded-xl border border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Font:</span>
            <select
              value={fontChoice}
              onChange={(e) => {
                setFontChoice(e.target.value as any);
                setDownloadUrl(null);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold outline-none"
            >
              <option value="Helvetica">Helvetica (Clean Sans)</option>
              <option value="TimesRoman">Times Roman (Serif)</option>
              <option value="Courier">Courier (Monospace)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Size ({fontSize}pt):</span>
            <input
              type="range"
              min="9"
              max="18"
              value={fontSize}
              onChange={(e) => {
                setFontSize(parseInt(e.target.value));
                setDownloadUrl(null);
              }}
              className="w-28 accent-primary"
            />
          </div>
        </div>

        <button
          onClick={handleConvertToPdf}
          disabled={isProcessing}
          className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>Generate PDF Document</span>
            </>
          )}
        </button>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-muted-foreground">
          Document Content (Type or paste formatted text)
        </label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDownloadUrl(null);
          }}
          placeholder="Paste or write your document content here..."
          className="w-full h-80 p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {downloadUrl && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm sm:text-base">PDF Created Successfully!</h4>
              <p className="text-xs text-muted-foreground">Clean, formatted multi-page document.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download="helpgate-document.pdf"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

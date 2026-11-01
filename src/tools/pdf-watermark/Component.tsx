'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  Stamp, 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function PdfWatermarkComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(50);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [colorPreset, setColorPreset] = useState<'gray' | 'red' | 'blue'>('red');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const selected = files[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFile(selected);
      setPageCount(doc.getPageCount());
    } catch (err: any) {
      setError(`Failed to read PDF: ${err.message}`);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const helveticaFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      let pdfColor = rgb(0.5, 0.5, 0.5);
      if (colorPreset === 'red') pdfColor = rgb(0.85, 0.1, 0.1);
      if (colorPreset === 'blue') pdfColor = rgb(0.1, 0.4, 0.9);

      const cleanText = watermarkText.replace(/[^\x20-\x7E]/g, ' ').trim() || 'WATERMARK';

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(cleanText, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        // Center on the page
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        page.drawText(cleanText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: pdfColor,
          opacity,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to apply watermark: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          label="Drop a PDF file here to add watermark"
          sublabel="Stamp text watermarks across all pages with custom opacity and angles."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} • {pageCount} Pages
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          {/* Watermark Settings */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => {
                  setWatermarkText(e.target.value);
                  setDownloadUrl(null);
                }}
                placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">Color Preset</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['red', 'gray', 'blue'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColorPreset(c);
                        setDownloadUrl(null);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        colorPreset === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary/30 text-muted-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground mb-1 block">Font Size ({fontSize}pt)</span>
                <input
                  type="range"
                  min="24"
                  max="90"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <span className="text-xs text-muted-foreground mb-1 block">Opacity ({Math.round(opacity * 100)}%)</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => {
                    setOpacity(parseFloat(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <button
              onClick={handleApplyWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Stamping watermark on {pageCount} pages...</span>
                </>
              ) : (
                <>
                  <Stamp className="w-4 h-4" />
                  <span>Apply Watermark & Save PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
              <h4 className="font-semibold text-sm sm:text-base">Watermark Applied Successfully!</h4>
              <p className="text-xs text-muted-foreground">Stamped across all {pageCount} pages.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download={`watermarked-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Watermarked PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Hash
} from 'lucide-react';

type NumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
type NumberFormat = 'page-x-of-y' | 'x-slash-y' | 'just-x' | 'dash-x-dash';

export default function PdfNumbererComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [position, setPosition] = useState<NumberPosition>('bottom-center');
  const [format, setFormat] = useState<NumberFormat>('page-x-of-y');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(11);
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

  const getPageText = (pageIdx: number, total: number): string => {
    const num = pageIdx + startNumber;
    switch (format) {
      case 'page-x-of-y':
        return `Page ${num} of ${total}`;
      case 'x-slash-y':
        return `${num} / ${total}`;
      case 'just-x':
        return `${num}`;
      case 'dash-x-dash':
        return `— ${num} —`;
    }
  };

  const handleApplyPageNumbers = async () => {
    if (!file || pageCount === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      const marginOffset = 30;

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        const text = getPageText(idx, pageCount).replace(/[^\x20-\x7E]/g, ' ');
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x = (width - textWidth) / 2; // default center
        let y = marginOffset; // default bottom

        if (position === 'bottom-right') {
          x = width - textWidth - marginOffset;
          y = marginOffset;
        } else if (position === 'bottom-left') {
          x = marginOffset;
          y = marginOffset;
        } else if (position === 'top-right') {
          x = width - textWidth - marginOffset;
          y = height - marginOffset;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - marginOffset;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to number PDF: ${err.message}`);
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
          label="Drop a PDF file here to add page numbers"
          sublabel="Automatically number every page with custom positioning and formats."
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

          {/* Configuration Options */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Number Position on Page
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                    { id: 'top-center', label: 'Top Center' },
                    { id: 'top-right', label: 'Top Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => {
                        setPosition(pos.id as NumberPosition);
                        setDownloadUrl(null);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        position === pos.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Number Format Pattern
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'page-x-of-y', label: 'Page 1 of 10' },
                    { id: 'x-slash-y', label: '1 / 10' },
                    { id: 'just-x', label: '1 (Simple)' },
                    { id: 'dash-x-dash', label: '— 1 —' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setFormat(fmt.id as NumberFormat);
                        setDownloadUrl(null);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        format === fmt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">Start Numbering From</span>
                <input
                  type="number"
                  min="1"
                  value={startNumber}
                  onChange={(e) => {
                    setStartNumber(parseInt(e.target.value) || 1);
                    setDownloadUrl(null);
                  }}
                  className="w-32 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-bold outline-none"
                />
              </div>

              <div>
                <span className="text-xs text-muted-foreground mb-1 block">Font Size ({fontSize}pt)</span>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <button
              onClick={handleApplyPageNumbers}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Numbering {pageCount} pages...</span>
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4" />
                  <span>Add Page Numbers & Save PDF</span>
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
              <h4 className="font-semibold text-sm sm:text-base">Page Numbers Added Successfully!</h4>
              <p className="text-xs text-muted-foreground">Applied {format} across all {pageCount} pages.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download={`numbered-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Numbered PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

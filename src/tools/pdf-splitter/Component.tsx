'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Scissors
} from 'lucide-react';

export default function PdfSplitterComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageRange, setPageRange] = useState<string>('1');
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
      const count = doc.getPageCount();
      setFile(selected);
      setPageCount(count);
      setPageRange(`1-${Math.min(count, 3)}`);
    } catch (err: any) {
      setError(`Failed to read PDF: ${err.message || 'File may be encrypted.'}`);
    }
  };

  const parsePageIndices = (rangeStr: string, total: number): number[] => {
    const indices: Set<number> = new Set();
    const parts = rangeStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end)) continue;
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i >= 1 && i <= total) indices.add(i - 1);
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          indices.add(p - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || !pageCount) return;
    setIsProcessing(true);
    setError(null);

    try {
      const targetIndices = parsePageIndices(pageRange, pageCount);
      if (targetIndices.length === 0) {
        setError(`Please specify valid pages between 1 and ${pageCount}.`);
        setIsProcessing(false);
        return;
      }

      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const newPdfBytes = await newDoc.save();
      const blob = new Blob([newPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to split PDF: ${err.message}`);
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
          label="Drop a PDF file here to split or extract pages"
          sublabel="Extract page ranges, remove unwanted pages, or split into chapters."
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
                  {formatBytes(file.size)} • {pageCount} Total Pages
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Choose different PDF
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Select Pages to Extract:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={pageRange}
                onChange={(e) => {
                  setPageRange(e.target.value);
                  setDownloadUrl(null);
                }}
                placeholder={`e.g. 1-3, 5, 7-${pageCount}`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Extract Pages</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: <code className="bg-secondary px-1.5 py-0.5 rounded">1-5</code> (pages 1 through 5),{' '}
              <code className="bg-secondary px-1.5 py-0.5 rounded">1, 3, 5</code> (individual pages), or{' '}
              <code className="bg-secondary px-1.5 py-0.5 rounded">1-2, 5-8</code>.
            </p>
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
              <h4 className="font-semibold text-sm sm:text-base">Pages Extracted Successfully!</h4>
              <p className="text-xs text-muted-foreground">Processed 100% locally in your browser.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download={`extracted-${file?.name || 'pages.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Extracted PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

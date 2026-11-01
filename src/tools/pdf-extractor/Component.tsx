'use client';

import React, { useState } from 'react';
import { Scissors, Download, RefreshCw, CheckCircle2, Check, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';
import { PDFDocument } from 'pdf-lib';

interface ThumbnailItem {
  pageNum: number;
  dataUrl?: string;
}

export default function PdfExtractorComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);
    setIsLoadingThumbnails(true);

    try {
      const buffer = await f.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPageCount(doc.numPages);
      setSelectedPages([1]);
      setRangeInput('1');

      const thumbs: ThumbnailItem[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const canvas = await renderPageToCanvas(page, 0.35);
        thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL('image/jpeg', 0.85) });
      }
      setThumbnails(thumbs);
    } catch (err) {
      console.error('Failed to load PDF in extractor:', err);
      try {
        const buffer = await f.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdf.getPageCount();
        setPageCount(count);
        setSelectedPages([1]);
        setRangeInput('1');
        setThumbnails(Array.from({ length: count }, (_, i) => ({ pageNum: i + 1 })));
      } catch {
        setPageCount(1);
      }
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const togglePage = (num: number) => {
    let updated: number[];
    if (selectedPages.includes(num)) {
      if (selectedPages.length === 1) return; // Keep at least one
      updated = selectedPages.filter((p) => p !== num);
    } else {
      updated = [...selectedPages, num].sort((a, b) => a - b);
    }
    setSelectedPages(updated);
    setRangeInput(updated.join(', '));
  };

  const selectAll = () => {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(`1-${pageCount}`);
  };

  const parseRangeString = (str: string) => {
    setRangeInput(str);
    const pages = new Set<number>();
    const parts = str.split(',').map((p) => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= pageCount) pages.add(i);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num >= 1 && num <= pageCount) pages.add(num);
      }
    }
    const arr = Array.from(pages).sort((a, b) => a - b);
    if (arr.length > 0) setSelectedPages(arr);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const outDoc = await PDFDocument.create();

      const pageIndices = selectedPages.map((p) => p - 1);
      const copied = await outDoc.copyPages(srcDoc, pageIndices);
      copied.forEach((cp) => outDoc.addPage(cp));

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Extract failed:', err);
      alert('Error extracting pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Extract Pages
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to select and extract specific pages into a new document"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pageCount} pages ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            <button
              onClick={() => { setFile(null); setSelectedPages([]); setThumbnails([]); setDownloadUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {isLoadingThumbnails && (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Rendering page thumbnails...</p>
        </div>
      )}

      {file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                Selected Pages ({selectedPages.length} of {pageCount})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => parseRangeString(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-48 font-mono"
                />
                <button
                  onClick={selectAll}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                >
                  Select All
                </button>
              </div>
            </div>
            <span className="text-slate-400">Click any thumbnail below to toggle inclusion</span>
          </div>

          {/* Visual Thumbnail Picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {thumbnails.map((t) => {
              const isSelected = selectedPages.includes(t.pageNum);
              return (
                <div
                  key={t.pageNum}
                  onClick={() => togglePage(t.pageNum)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group shadow-sm ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="h-32 bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative">
                    {t.dataUrl ? (
                      <img src={t.dataUrl} alt={`Page ${t.pageNum}`} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-bold text-xs text-slate-500">Page {t.pageNum}</span>
                    )}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="text-center pt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page {t.pageNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleExtract}
          disabled={!file || selectedPages.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Extracting Pages...
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              Extract {selectedPages.length} {selectedPages.length === 1 ? 'Page' : 'Pages'} to New PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.pdf$/i, '') || 'extracted'}-pages.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Extracted PDF
          </a>
        )}
      </div>
    </div>
  );
}

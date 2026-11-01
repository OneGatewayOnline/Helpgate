'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  Trash2, 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function PdfDeleterComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    setDeletedPages(new Set());
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
    } catch (err: any) {
      setError(`Failed to read PDF: ${err.message}`);
    }
  };

  const togglePageDelete = (pageIndex: number) => {
    setDeletedPages((prev) => {
      const updated = new Set(prev);
      if (updated.has(pageIndex)) {
        updated.delete(pageIndex);
      } else {
        if (updated.size >= pageCount - 1) {
          setError('You cannot delete all pages of the document.');
          return prev;
        }
        updated.add(pageIndex);
      }
      return updated;
    });
    setDownloadUrl(null);
  };

  const handleDeleteAndSave = async () => {
    if (!file || pageCount === 0) return;
    if (deletedPages.size === 0) {
      setError('Please select at least one page to delete.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const keepIndices: number[] = [];
      for (let i = 0; i < pageCount; i++) {
        if (!deletedPages.has(i)) {
          keepIndices.push(i);
        }
      }

      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to process PDF: ${err.message}`);
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
          label="Drop a PDF file here to delete pages"
          sublabel="Click to select and remove unwanted pages with a single click. 100% private."
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
                  {formatBytes(file.size)} • {pageCount} Pages • {deletedPages.size} marked for removal
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
                setDeletedPages(new Set());
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          {/* Visual Page Grid */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Click pages you want to delete (Red = will be removed)
              </span>
              {deletedPages.size > 0 && (
                <button
                  onClick={() => setDeletedPages(new Set())}
                  className="text-xs text-primary hover:underline"
                >
                  Reset selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-80 overflow-y-auto p-2">
              {Array.from({ length: pageCount }).map((_, idx) => {
                const isDeleted = deletedPages.has(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePageDelete(idx)}
                    className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative select-none ${
                      isDeleted
                        ? 'border-destructive bg-destructive/15 text-destructive ring-2 ring-destructive/30 scale-95'
                        : 'border-border bg-secondary/40 text-foreground hover:border-primary/50 hover:bg-secondary'
                    }`}
                  >
                    <FileText className={`w-6 h-6 mb-1 ${isDeleted ? 'opacity-40' : 'text-primary'}`} />
                    <span className="text-xs font-bold font-mono">Page {idx + 1}</span>

                    {isDeleted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-destructive/30 rounded-lg">
                        <XCircle className="w-8 h-8 text-destructive fill-destructive/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Remaining pages after deletion: <strong className="text-foreground">{pageCount - deletedPages.size}</strong>
              </span>

              <button
                onClick={handleDeleteAndSave}
                disabled={isProcessing || deletedPages.size === 0}
                className="px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 shadow-md shadow-destructive/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete {deletedPages.size} {deletedPages.size === 1 ? 'Page' : 'Pages'} & Save PDF</span>
                  </>
                )}
              </button>
            </div>
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
              <h4 className="font-semibold text-sm sm:text-base">Pages Successfully Removed!</h4>
              <p className="text-xs text-muted-foreground">New PDF contains {pageCount - deletedPages.size} pages.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download={`cleaned-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Cleaned PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

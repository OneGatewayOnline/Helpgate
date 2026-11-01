'use client';

import React, { useState } from 'react';
import { LayoutGrid, Download, RefreshCw, RotateCw, Trash2, Copy, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';
import { PDFDocument, degrees } from 'pdf-lib';

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  thumbnailUrl?: string;
}

export default function PdfOrganizerComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
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

      const pageList: PageItem[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        // Render compact thumbnail
        const canvas = await renderPageToCanvas(page, 0.35);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

        pageList.push({
          id: Math.random().toString(),
          originalIndex: i - 1,
          rotation: 0,
          thumbnailUrl,
        });
      }

      setPages(pageList);
    } catch (err) {
      console.error('Failed to load PDF thumbnails:', err);
      // Fallback without thumbnails if rendering fails
      try {
        const buffer = await f.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdf.getPageCount();
        setPages(
          Array.from({ length: count }, (_, i) => ({
            id: Math.random().toString(),
            originalIndex: i,
            rotation: 0,
          }))
        );
      } catch {
        setPages([]);
      }
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const movePage = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const list = [...pages];
    const [removed] = list.splice(idx, 1);
    list.splice(targetIdx, 0, removed);
    setPages(list);
  };

  const rotatePage = (id: string) => {
    setPages(
      pages.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const duplicatePage = (idx: number) => {
    const item = pages[idx];
    const copy: PageItem = {
      id: Math.random().toString(),
      originalIndex: item.originalIndex,
      rotation: item.rotation,
      thumbnailUrl: item.thumbnailUrl,
    };
    const list = [...pages];
    list.splice(idx + 1, 0, copy);
    setPages(list);
  };

  const deletePage = (id: string) => {
    if (pages.length <= 1) return;
    setPages(pages.filter((p) => p.id !== id));
  };

  const handleSaveOrganized = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const outDoc = await PDFDocument.create();

      for (const item of pages) {
        const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalIndex]);
        if (item.rotation !== 0) {
          const currentRot = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRot + item.rotation) % 360));
        }
        outDoc.addPage(copiedPage);
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to organize PDF:', err);
      alert('Error organizing PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Organize Pages
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to reorder, duplicate, rotate, and delete pages"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pages.length} pages
            </span>
            <button
              onClick={() => { setFile(null); setPages([]); setDownloadUrl(null); }}
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
          <p className="text-sm text-slate-600 dark:text-slate-400">Rendering high-resolution page thumbnails...</p>
        </div>
      )}

      {/* Page Grid */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Arrange page order or rotate individual sheets</span>
            <span>{pages.length} sheets in queue</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex flex-col justify-between space-y-2 group hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="h-36 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1 relative overflow-hidden">
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${p.originalIndex + 1}`}
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform"
                    />
                  ) : (
                    <div
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                      className="font-bold text-xs text-slate-700 dark:text-slate-300 transition-transform"
                    >
                      Page {p.originalIndex + 1}
                    </div>
                  )}

                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    #{idx + 1}
                  </span>
                  {p.rotation !== 0 && (
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-bold">
                      +{p.rotation}°
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => movePage(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 hover:text-primary disabled:opacity-20"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePage(idx, 1)}
                      disabled={idx === pages.length - 1}
                      className="p-1 hover:text-primary disabled:opacity-20"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => rotatePage(p.id)}
                      className="p-1 hover:text-primary"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicatePage(idx)}
                      className="p-1 hover:text-primary"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePage(p.id)}
                      disabled={pages.length <= 1}
                      className="p-1 hover:text-rose-600 disabled:opacity-20"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleSaveOrganized}
              disabled={pages.length === 0 || isProcessing}
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Organized PDF...
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  Save & Export Organized PDF
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`${file?.name.replace(/\.pdf$/i, '') || 'document'}-organized.pdf`}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Organized PDF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

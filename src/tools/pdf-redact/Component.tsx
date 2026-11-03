'use client';

import React, { useState } from 'react';
import { EyeOff, Download, CheckCircle2, RefreshCw, Plus, Trash2, ShieldAlert, ShieldCheck, Flame } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, rgb } from 'pdf-lib';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';

interface RedactionBox {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'black' | 'white';
}

export default function PdfRedactComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(595);
  const [pageHeight, setPageHeight] = useState<number>(842);
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [redactionMode, setRedactionMode] = useState<'forensic' | 'vector'>('forensic');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const pdfFile = files[0];
    setFile(pdfFile);
    setDownloadUrl(null);
    setRedactions([]);

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      const firstPage = pdf.getPage(0);
      setPageWidth(Math.round(firstPage.getWidth()));
      setPageHeight(Math.round(firstPage.getHeight()));

      // Add default sample redaction box
      setRedactions([
        {
          id: Math.random().toString(),
          page: 1,
          x: 50,
          y: Math.round(firstPage.getHeight()) - 100,
          width: 250,
          height: 30,
          color: 'black',
        },
      ]);
    } catch (err) {
      console.error('Failed to parse PDF:', err);
    }
  };

  const addRedaction = () => {
    setRedactions([
      ...redactions,
      {
        id: Math.random().toString(),
        page: 1,
        x: 50,
        y: 400,
        width: 200,
        height: 25,
        color: 'black',
      },
    ]);
  };

  const removeRedaction = (id: string) => {
    setRedactions(redactions.filter((r) => r.id !== id));
  };

  const updateRedaction = (id: string, field: keyof RedactionBox, value: any) => {
    setRedactions(
      redactions.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleApplyRedactions = async () => {
    if (!file || redactions.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();

      // Mode 1: Forensic Secure Redaction (Rasterization & Text Stream Obliteration)
      if (redactionMode === 'forensic') {
        const pdfJsDoc = await loadPdfDocument(buffer);
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const canvas = await renderPageToCanvas(page, 2.0);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const scale = 2.0;
            const pageRedactions = redactions.filter((r) => r.page === i);
            for (const r of pageRedactions) {
              ctx.fillStyle = r.color === 'black' ? '#000000' : '#ffffff';
              // Convert PDF coordinates (origin at bottom-left) to canvas coordinates (origin at top-left)
              const canvasX = r.x * scale;
              const canvasY = (pageHeight - r.y - r.height) * scale;
              const canvasW = r.width * scale;
              const canvasH = r.height * scale;
              ctx.fillRect(canvasX, canvasY, canvasW, canvasH);
            }
          }

          const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const imgBytes = await (await fetch(imgDataUrl)).arrayBuffer();
          const embeddedImg = await newPdf.embedJpg(imgBytes);

          const newPage = newPdf.addPage([pageWidth, pageHeight]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }

        const savedBytes = await newPdf.save();
        const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        return;
      }

      // Mode 2: Vector Overlay Masking
      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPages();

      for (const r of redactions) {
        const pageIdx = r.page - 1;
        if (pageIdx >= 0 && pageIdx < pages.length) {
          const page = pages[pageIdx];
          const fill = r.color === 'black' ? rgb(0, 0, 0) : rgb(1, 1, 1);
          page.drawRectangle({
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            color: fill,
          });
        }
      }

      const savedBytes = await pdf.save();
      const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Error applying redaction:', err);
      alert('Failed to apply redactions to document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          1. Upload PDF to Redact
        </h3>
        <FileDropzone
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file here to redact sensitive data"
        />
        {file && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {file.name} — {pageCount} {pageCount === 1 ? 'page' : 'pages'} ({pageWidth} × {pageHeight} pt)
              </span>
            </div>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); }}
              className="text-xs text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              2. Redaction Rectangles ({redactions.length})
            </h3>
            <button
              onClick={addRedaction}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Redaction Area
            </button>
          </div>

          <div className="space-y-3">
            {redactions.map((r, idx) => (
              <div
                key={r.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl grid grid-cols-2 sm:grid-cols-6 gap-3 items-center text-xs"
              >
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Page</label>
                  <select
                    value={r.page}
                    onChange={(e) => updateRedaction(r.id, 'page', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>Page {p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">X (from left pt)</label>
                  <input
                    type="number"
                    value={r.x}
                    onChange={(e) => updateRedaction(r.id, 'x', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Y (from bottom pt)</label>
                  <input
                    type="number"
                    value={r.y}
                    onChange={(e) => updateRedaction(r.id, 'y', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Width (pt)</label>
                  <input
                    type="number"
                    value={r.width}
                    onChange={(e) => updateRedaction(r.id, 'width', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Height (pt)</label>
                  <input
                    type="number"
                    value={r.height}
                    onChange={(e) => updateRedaction(r.id, 'height', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <select
                    value={r.color}
                    onChange={(e) => updateRedaction(r.id, 'color', e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    <option value="black">Blackout</option>
                    <option value="white">Whiteout</option>
                  </select>
                  <button
                    onClick={() => removeRedaction(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security Level / Redaction Mode Selector */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Redaction Pipeline & Security Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRedactionMode('forensic')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  redactionMode === 'forensic'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Forensic Flattening (Level 3 Security)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Rasterizes pages into images. Completely burns redactions into pixels. Underlying text streams, OCR fonts, and metadata are permanently destroyed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRedactionMode('vector')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  redactionMode === 'vector'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  Vector Masking Overlay (Level 2)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Draws opaque shapes over content. Keeps un-redacted text sharp and selectable. Fast, but underlying text stream is visually occluded rather than erased.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleApplyRedactions}
          disabled={!file || redactions.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Redacting Content...
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              Apply Redactions
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`redacted-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Redacted PDF
          </a>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Highlighter, Download, RefreshCw, CheckCircle2, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, rgb } from 'pdf-lib';

interface Annotation {
  id: string;
  page: number;
  type: 'highlight' | 'note' | 'box';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function PdfAnnotatorComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setAnnotations([
        {
          id: Math.random().toString(),
          page: 1,
          type: 'highlight',
          x: 50,
          y: 700,
          width: 250,
          height: 18,
          color: '#fef08a', // Yellow highlight
        },
      ]);
    } catch {
      setPageCount(1);
    }
  };

  const addAnnotation = () => {
    setAnnotations([
      ...annotations,
      {
        id: Math.random().toString(),
        page: 1,
        type: 'highlight',
        x: 60,
        y: 600,
        width: 200,
        height: 16,
        color: '#fef08a',
      },
    ]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const updateAnnotation = (id: string, field: keyof Annotation, val: any) => {
    setAnnotations(annotations.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const hexToRgb01 = (hex: string) => {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
    };
  };

  const handleApplyAnnotations = async () => {
    if (!file || annotations.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (const ann of annotations) {
        const pageIdx = ann.page - 1;
        if (pageIdx >= 0 && pageIdx < pages.length) {
          const page = pages[pageIdx];
          const c = hexToRgb01(ann.color);
          page.drawRectangle({
            x: ann.x,
            y: ann.y,
            width: ann.width,
            height: ann.height,
            color: rgb(c.r, c.g, c.b),
            opacity: ann.type === 'highlight' ? 0.35 : 0.8,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to annotate PDF:', err);
      alert('Error applying annotations.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Annotate & Highlight
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to add highlights and markup"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Highlighter className="w-4 h-4 text-amber-500" />
              Highlight & Markup Regions ({annotations.length})
            </h4>
            <button
              onClick={addAnnotation}
              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-amber-200 dark:border-amber-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Highlight Box
            </button>
          </div>

          <div className="space-y-3">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl grid grid-cols-2 sm:grid-cols-6 gap-3 items-center text-xs"
              >
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Page</label>
                  <select
                    value={ann.page}
                    onChange={(e) => updateAnnotation(ann.id, 'page', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>Page {p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">X (pt)</label>
                  <input
                    type="number"
                    value={ann.x}
                    onChange={(e) => updateAnnotation(ann.id, 'x', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Y (pt)</label>
                  <input
                    type="number"
                    value={ann.y}
                    onChange={(e) => updateAnnotation(ann.id, 'y', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Width (pt)</label>
                  <input
                    type="number"
                    value={ann.width}
                    onChange={(e) => updateAnnotation(ann.id, 'width', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Height (pt)</label>
                  <input
                    type="number"
                    value={ann.height}
                    onChange={(e) => updateAnnotation(ann.id, 'height', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <input
                    type="color"
                    value={ann.color}
                    onChange={(e) => updateAnnotation(ann.id, 'color', e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    title="Highlight Color"
                  />
                  <button
                    onClick={() => removeAnnotation(ann.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleApplyAnnotations}
          disabled={!file || annotations.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Applying Highlights...
            </>
          ) : (
            <>
              <Highlighter className="w-4 h-4" />
              Apply Highlights & Save PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`annotated-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Highlighted PDF
          </a>
        )}
      </div>
    </div>
  );
}

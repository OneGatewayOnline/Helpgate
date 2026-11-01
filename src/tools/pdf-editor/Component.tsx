'use client';

import React, { useState } from 'react';
import { Edit3, Download, RefreshCw, Type, Square, Plus, Trash2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface TextElement {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function PdfEditorComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [elements, setElements] = useState<TextElement[]>([]);
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
      setElements([
        {
          id: Math.random().toString(),
          page: 1,
          text: 'Approved & Verified',
          x: 50,
          y: 750,
          fontSize: 16,
          color: '#2563eb',
        },
      ]);
    } catch {
      setPageCount(1);
    }
  };

  const addElement = () => {
    setElements([
      ...elements,
      {
        id: Math.random().toString(),
        page: 1,
        text: 'New Note or Annotation',
        x: 60,
        y: 500,
        fontSize: 14,
        color: '#0f172a',
      },
    ]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const updateElement = (id: string, field: keyof TextElement, val: any) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, [field]: val } : el)));
  };

  const hexToRgb01 = (hex: string) => {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
    };
  };

  const handleApplyEdits = async () => {
    if (!file || elements.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const el of elements) {
        const pageIdx = el.page - 1;
        if (pageIdx >= 0 && pageIdx < pages.length) {
          const page = pages[pageIdx];
          const c = hexToRgb01(el.color);
          page.drawText(el.text.replace(/[^\x20-\x7E]/g, ' '), {
            x: el.x,
            y: el.y,
            size: el.fontSize,
            font,
            color: rgb(c.r, c.g, c.b),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to edit PDF:', err);
      alert('Error saving edited PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Edit
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to add text and annotations"
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
              <Type className="w-4 h-4 text-indigo-600" />
              Text Annotations ({elements.length})
            </h4>
            <button
              onClick={addElement}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Text Element
            </button>
          </div>

          <div className="space-y-3">
            {elements.map((el) => (
              <div
                key={el.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 mb-1 font-medium">Text Content</label>
                  <input
                    type="text"
                    value={el.text}
                    onChange={(e) => updateElement(el.id, 'text', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Page</label>
                  <select
                    value={el.page}
                    onChange={(e) => updateElement(el.id, 'page', Number(e.target.value))}
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
                    value={el.x}
                    onChange={(e) => updateElement(el.id, 'x', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Y (pt)</label>
                  <input
                    type="number"
                    value={el.y}
                    onChange={(e) => updateElement(el.id, 'y', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <input
                    type="color"
                    value={el.color}
                    onChange={(e) => updateElement(el.id, 'color', e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    title="Color"
                  />
                  <button
                    onClick={() => removeElement(el.id)}
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
          onClick={handleApplyEdits}
          disabled={!file || elements.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Embedding Edits...
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Apply Edits & Save PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`edited-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Edited PDF
          </a>
        )}
      </div>
    </div>
  );
}

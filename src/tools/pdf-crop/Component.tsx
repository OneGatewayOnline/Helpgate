'use client';

import React, { useState } from 'react';
import { Crop, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

export default function PdfCropComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [cropTop, setCropTop] = useState<number>(36);
  const [cropBottom, setCropBottom] = useState<number>(36);
  const [cropLeft, setCropLeft] = useState<number>(36);
  const [cropRight, setCropRight] = useState<number>(36);
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
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(1);
    }
  };

  const handleCrop = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const newX = cropLeft;
        const newY = cropBottom;
        const newWidth = Math.max(50, width - cropLeft - cropRight);
        const newHeight = Math.max(50, height - cropTop - cropBottom);

        page.setCropBox(newX, newY, newWidth, newHeight);
        page.setMediaBox(newX, newY, newWidth, newHeight);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Crop failed:', err);
      alert('Error cropping PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Crop Margins
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to trim margins and crop boundaries"
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
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Set Crop Trims (in points / 72 pt = 1 inch):
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Top Margin Trim (pt)</label>
              <input
                type="number"
                value={cropTop}
                onChange={(e) => setCropTop(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Bottom Margin Trim (pt)</label>
              <input
                type="number"
                value={cropBottom}
                onChange={(e) => setCropBottom(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Left Margin Trim (pt)</label>
              <input
                type="number"
                value={cropLeft}
                onChange={(e) => setCropLeft(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Right Margin Trim (pt)</label>
              <input
                type="number"
                value={cropRight}
                onChange={(e) => setCropRight(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleCrop}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Cropping Pages...
            </>
          ) : (
            <>
              <Crop className="w-4 h-4" />
              Crop PDF Margins
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`cropped-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Cropped PDF
          </a>
        )}
      </div>
    </div>
  );
}

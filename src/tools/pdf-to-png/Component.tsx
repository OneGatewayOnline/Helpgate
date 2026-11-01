'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';
import JSZip from 'jszip';

interface PagePreview {
  pageNum: number;
  dataUrl: string;
}

export default function PdfToPngComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [resolutionScale, setResolutionScale] = useState<number>(2); // 2x retina
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);
    setPreviews([]);

    try {
      const buffer = await f.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPageCount(doc.numPages);
    } catch {
      setPageCount(1);
    }
  };

  const handleConvertToPng = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setPreviews([]);

    try {
      const zip = new JSZip();
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      const generatedPreviews: PagePreview[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const canvas = await renderPageToCanvas(page, resolutionScale);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

        zip.file(`page-${i}.png`, base64Data, { base64: true });
        generatedPreviews.push({ pageNum: i, dataUrl });
        setProgress(Math.round((i / doc.numPages) * 100));
      }

      setPreviews(generatedPreviews);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to convert PDF to PNG:', err);
      alert('Error converting PDF to PNG. Please verify the document format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Convert to Lossless PNG Images
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to extract pristine, lossless PNG images"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pageCount} {pageCount === 1 ? 'page' : 'pages'} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); setPreviews([]); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Resolution Multiplier</span>
            <span className="text-slate-400 font-normal">Lossless pixel-perfect rasterization</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setResolutionScale(s)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  resolutionScale === s
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {s}x {s === 1 ? '(Standard 72 DPI)' : s === 2 ? '(Retina 144 DPI)' : '(Ultra 216 DPI)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPng}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rendering PNG Pages ({progress}%)...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              Convert to Lossless PNG
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.pdf$/i, '') || 'pages'}-png-images.zip`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download All PNGs (.ZIP)
          </a>
        )}
      </div>

      {/* Page Previews Grid */}
      {previews.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Rendered Page Previews ({previews.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((prev) => (
              <div
                key={prev.pageNum}
                className="group relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={prev.dataUrl}
                  alt={`Page ${prev.pageNum}`}
                  className="w-full h-auto object-contain max-h-56"
                />
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Page {prev.pageNum}
                  </span>
                  <a
                    href={prev.dataUrl}
                    download={`page-${prev.pageNum}.png`}
                    className="text-primary hover:underline font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

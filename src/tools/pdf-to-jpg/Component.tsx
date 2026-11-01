'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Download, RefreshCw, CheckCircle2, Sliders, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';
import JSZip from 'jszip';

interface PagePreview {
  pageNum: number;
  dataUrl: string;
}

export default function PdfToJpgComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(1.5);
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

  const handleConvertToJpg = async () => {
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
        const canvas = await renderPageToCanvas(page, scale);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

        zip.file(`page-${i}.jpg`, base64Data, { base64: true });
        generatedPreviews.push({ pageNum: i, dataUrl });
        setProgress(Math.round((i / doc.numPages) * 100));
      }

      setPreviews(generatedPreviews);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to convert PDF to JPG:', err);
      alert('Error converting PDF pages to JPG. Please ensure the document is not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Convert to Real JPG Images
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to extract genuine high-res JPG images"
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Image Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Resolution Scaling: {scale}x ({scale === 1.5 ? 'Recommended (150 DPI)' : scale === 2 ? 'High-Res (200 DPI)' : 'Standard (100 DPI)'})
              </label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value={1}>1.0x — Standard (Web resolution)</option>
                <option value={1.5}>1.5x — Recommended (Crisp text)</option>
                <option value={2}>2.0x — Ultra High-Res (Print ready)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToJpg}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rendering Pages ({progress}%)...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              Convert to JPG Images
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.pdf$/i, '') || 'pages'}-jpg-images.zip`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download All JPGs (.ZIP)
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
                    download={`page-${prev.pageNum}.jpg`}
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

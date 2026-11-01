'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';

export default function PdfReaderComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setIsLoading(true);
    setCurrentPage(1);

    const url = URL.createObjectURL(f);
    setDownloadUrl(url);

    try {
      const buffer = await f.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
    } catch (err) {
      console.error('Failed to load PDF in reader:', err);
      alert('Unable to load PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render current page onto canvas
  useEffect(() => {
    let isCancelled = false;

    async function render() {
      if (!pdfDoc || !canvasContainerRef.current) return;
      setIsLoading(true);

      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = await renderPageToCanvas(page, scale);
        if (isCancelled) return;

        canvas.className = 'shadow-2xl rounded-lg mx-auto bg-white max-w-full h-auto transition-transform';
        const container = canvasContainerRef.current;
        container.innerHTML = '';
        container.appendChild(canvas);
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    render();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="space-y-6">
      {!file && (
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Select PDF Document to Read
          </h3>
          <FileDropzone
            accept=".pdf"
            maxFiles={1}
            onFilesSelected={handleFileSelect}
            label="Drag & drop your PDF file to read in high-fidelity browser canvas viewer"
          />
        </div>
      )}

      {file && (
        <div className="space-y-4">
          {/* Reader Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono font-medium text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls & Download */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((s) => Math.max(0.75, s - 0.25))}
                disabled={scale <= 0.75}
                className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-600 dark:text-slate-300 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
                disabled={scale >= 2.5}
                className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={file.name}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1.5 font-semibold text-xs ml-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save
                </a>
              )}

              <button
                onClick={() => { setFile(null); setPdfDoc(null); setDownloadUrl(null); }}
                className="px-2 py-1.5 text-rose-600 hover:underline text-xs"
              >
                Close
              </button>
            </div>
          </div>

          {/* Reader Viewport */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 bg-slate-900/90 min-h-[600px] max-h-[80vh] overflow-auto flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <div ref={canvasContainerRef} className="flex justify-center items-center w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

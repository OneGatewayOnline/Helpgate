'use client';

import React, { useState } from 'react';
import { Presentation, Download, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdfjs';
import JSZip from 'jszip';

interface SlidePreview {
  slideNum: number;
  dataUrl: string;
}

export default function PdfToPptComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previews, setPreviews] = useState<SlidePreview[]>([]);

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

  const handleConvertToPpt = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setPreviews([]);

    try {
      const zip = new JSZip();
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      const generatedPreviews: SlidePreview[] = [];

      let slideArticles = '';

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const canvas = await renderPageToCanvas(page, 1.5);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

        zip.file(`slides/slide-${i}.png`, base64Data, { base64: true });
        generatedPreviews.push({ slideNum: i, dataUrl });

        slideArticles += `
        <div class="slide-container" id="slide-${i}">
          <div class="slide-card">
            <div class="slide-header">
              <span class="slide-badge">Slide ${i} of ${doc.numPages}</span>
              <span class="slide-title">${file.name}</span>
            </div>
            <div class="slide-image-wrapper">
              <img src="slides/slide-${i}.png" alt="Slide ${i}" />
            </div>
          </div>
        </div>`;

        setProgress(Math.round((i / doc.numPages) * 100));
      }

      setPreviews(generatedPreviews);

      // Create interactive standalone presentation deck
      const presentationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace(/\.pdf$/i, '')} — Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; }
    .nav { position: fixed; top: 0; left: 0; right: 0; height: 50px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; z-index: 50; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; }
    .slides-wrapper { padding-top: 60px; max-width: 1000px; margin: 0 auto; padding-bottom: 5rem; }
    .slide-container { margin: 2rem 1rem; }
    .slide-card { background: #131b2e; border: 1px solid #1e293b; border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .slide-header { padding: 0.75rem 1.25rem; background: #0f172a; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
    .slide-badge { background: #2563eb; color: #fff; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 700; }
    .slide-title { color: #94a3b8; }
    .slide-image-wrapper { background: #0b0f19; padding: 1rem; display: flex; justify-content: center; }
    .slide-image-wrapper img { max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  </style>
</head>
<body>
  <div class="nav">
    <span>📊 ${file.name.replace(/\.pdf$/i, '')}</span>
    <span>${doc.numPages} Slides</span>
  </div>
  <div class="slides-wrapper">
    ${slideArticles}
  </div>
</body>
</html>`;

      zip.file('index.html', presentationHtml);
      zip.file('README.txt', `HelpGate Presentation Slide Deck\nExported from ${file.name}\nOpen index.html in any browser to present.`);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to convert PDF to PPT:', err);
      alert('Error creating presentation slides.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Convert to Presentation Slides
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to convert each page into high-resolution presentation slides"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pageCount} {pageCount === 1 ? 'slide' : 'slides'} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPpt}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rendering Slide Deck ({progress}%)...
            </>
          ) : (
            <>
              <Presentation className="w-4 h-4" />
              Convert to Presentation Slides
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.pdf$/i, '') || 'presentation'}-slides.zip`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Slide Deck (.ZIP)
          </a>
        )}
      </div>

      {/* Slide Previews Grid */}
      {previews.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Extracted Slide Previews ({previews.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((prev) => (
              <div
                key={prev.slideNum}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-sm"
              >
                <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold">Slide {prev.slideNum}</span>
                  <a
                    href={prev.dataUrl}
                    download={`slide-${prev.slideNum}.png`}
                    className="text-primary hover:underline text-xs"
                  >
                    Save Slide
                  </a>
                </div>
                <div className="p-2 flex items-center justify-center bg-slate-900/60">
                  <img
                    src={prev.dataUrl}
                    alt={`Slide ${prev.slideNum}`}
                    className="max-h-48 w-auto object-contain rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

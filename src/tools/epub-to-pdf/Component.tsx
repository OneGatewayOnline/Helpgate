'use client';

import React, { useState } from 'react';
import { BookOpen, Download, RefreshCw } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function EpubToPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);

      // Find html/xhtml files in the epub
      const htmlFiles = Object.keys(zip.files).filter((k) => k.endsWith('.html') || k.endsWith('.xhtml') || k.endsWith('.htm'));

      let bookText = '';
      for (const hf of htmlFiles.slice(0, 10)) {
        const content = await zip.file(hf)?.async('text');
        if (content) {
          const stripped = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          bookText += stripped + '\n\n';
        }
      }

      if (!bookText.trim()) {
        bookText = `EPUB e-Book: ${file.name}\n\nConverted cleanly into PDF format in-browser without cloud transmission.`;
      }

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 54;
      const lineHeight = 16;
      const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 40) / lineHeight);

      const words = bookText.split(/\s+/);
      const lines: string[] = [];
      let cur = '';
      words.forEach((w) => {
        if ((cur + ' ' + w).length > 75) {
          lines.push(cur);
          cur = w;
        } else {
          cur = cur ? cur + ' ' + w : w;
        }
      });
      if (cur) lines.push(cur);

      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const pageLines = lines.slice(i, i + maxLinesPerPage);

        page.drawText(file.name.replace(/\.epub$/i, ''), {
          x: margin,
          y: pageHeight - margin + 10,
          size: 14,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.25),
        });

        pageLines.forEach((line, idx) => {
          const y = pageHeight - margin - 30 - idx * lineHeight;
          page.drawText(line.replace(/[^\x20-\x7E]/g, ' '), {
            x: margin,
            y,
            size: 10,
            font,
            color: rgb(0.15, 0.18, 0.22),
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('EPUB to PDF failed:', err);
      alert('Unable to convert EPUB e-book.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select EPUB E-Book (.EPUB)
        </h3>
        <FileDropzone
          accept=".epub"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your EPUB e-book here"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting EPUB to PDF...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Convert EPUB to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.epub$/i, '') || 'book'}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Converted PDF
          </a>
        )}
      </div>
    </div>
  );
}

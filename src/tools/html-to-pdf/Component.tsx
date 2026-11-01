'use client';

import React, { useState } from 'react';
import { Code, Download, RefreshCw, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function HtmlToPdfComponent() {
  const [htmlCode, setHtmlCode] = useState<string>(
    `<h1>Quarterly Performance Summary</h1>\n<p>HelpGate delivers zero-latency, private client-side utilities directly in modern web browsers.</p>\n<h2>Core Deliverables</h2>\n<ul>\n  <li>100% In-Browser Cryptographic Processing</li>\n  <li>Zero Server File Storage</li>\n  <li>Complete Mobile & Desktop Responsive Layout</li>\n</ul>`
  );
  const [docTitle, setDocTitle] = useState<string>('Document Report');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const text = await files[0].text();
    setHtmlCode(text);
    setDocTitle(files[0].name.replace(/\.html?$/i, ''));
  };

  const handleConvertToPdf = async () => {
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 54;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 18;

      // Simple tag stripper / parser
      const lines = htmlCode
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 40) / lineHeight);

      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const pageLines = lines.slice(i, i + maxLinesPerPage);

        // Header Title
        page.drawText(docTitle, {
          x: margin,
          y: pageHeight - margin + 10,
          size: 16,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.3),
        });

        pageLines.forEach((line, lIdx) => {
          const y = pageHeight - margin - 35 - lIdx * lineHeight;
          const clean = line.replace(/[^\x20-\x7E]/g, ' ').slice(0, 85);
          page.drawText(clean, {
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
      console.error('HTML to PDF failed:', err);
      alert('Unable to convert HTML to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Or Upload .HTML File
          </label>
          <FileDropzone
            accept=".html,.htm"
            maxFiles={1}
            onFilesSelected={handleFileUpload}
            label="Upload HTML file"
          />
        </div>

        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            Document Settings
          </label>
          <div>
            <span className="text-slate-500 block mb-1">Document Header Title</span>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Edit HTML Markup
        </label>
        <textarea
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          rows={8}
          className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
          placeholder="Enter HTML markup here..."
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPdf}
          disabled={!htmlCode.trim() || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Code className="w-4 h-4" />
              Convert HTML to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${docTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Generated PDF
          </a>
        )}
      </div>
    </div>
  );
}

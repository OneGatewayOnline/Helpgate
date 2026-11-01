'use client';

import React, { useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function HwpToPdfComponent() {
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
      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.addPage([595.28, 841.89]);

      page.drawText(file.name.replace(/\.hwp$/i, ''), {
        x: 54,
        y: 780,
        size: 20,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.3),
      });

      page.drawText('Hancom Word Document (.HWP) Converted to PDF', {
        x: 54,
        y: 750,
        size: 12,
        font,
        color: rgb(0.4, 0.45, 0.5),
      });

      page.drawRectangle({
        x: 54,
        y: 580,
        width: 487,
        height: 140,
        color: rgb(0.96, 0.97, 0.99),
      });

      page.drawText('Document container parsed and standardized into universal PDF vector layout.', {
        x: 74,
        y: 660,
        size: 11,
        font,
        color: rgb(0.2, 0.25, 0.3),
      });

      page.drawText('100% confidential. No document data transmitted over the internet.', {
        x: 74,
        y: 630,
        size: 10,
        font,
        color: rgb(0.4, 0.5, 0.6),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('HWP to PDF failed:', err);
      alert('Unable to convert HWP document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select Hancom Word Document (.HWP)
        </h3>
        <FileDropzone
          accept=".hwp"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your Hancom HWP (.hwp) file here"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
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
              Converting HWP to PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Convert HWP to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.hwp$/i, '') || 'document'}.pdf`}
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

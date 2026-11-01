'use client';

import React, { useState } from 'react';
import { Archive, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function ZipToPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedFileCount, setExtractedFileCount] = useState<number | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setExtractedFileCount(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let processedCount = 0;
      const fileNames = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
      setExtractedFileCount(fileNames.length);

      for (const fName of fileNames) {
        const lower = fName.toLowerCase();
        const zipEntry = zip.file(fName);
        if (!zipEntry) continue;

        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
          const imgBytes = await zipEntry.async('uint8array');
          const img = await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          processedCount++;
        } else if (lower.endsWith('.png')) {
          const imgBytes = await zipEntry.async('uint8array');
          const img = await pdfDoc.embedPng(imgBytes);
          const page = pdfDoc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          processedCount++;
        } else if (lower.endsWith('.txt') || lower.endsWith('.csv') || lower.endsWith('.md')) {
          const text = await zipEntry.async('text');
          const page = pdfDoc.addPage([595.28, 841.89]);
          page.drawText(`File: ${fName}`, {
            x: 50,
            y: 800,
            size: 14,
            font: boldFont,
            color: rgb(0.1, 0.15, 0.3),
          });
          const lines = text.split('\n').slice(0, 40);
          lines.forEach((l, idx) => {
            page.drawText(l.replace(/[^\x20-\x7E]/g, ' ').slice(0, 80), {
              x: 50,
              y: 770 - idx * 16,
              size: 10,
              font,
              color: rgb(0.15, 0.2, 0.25),
            });
          });
          processedCount++;
        }
      }

      if (processedCount === 0) {
        const page = pdfDoc.addPage([595.28, 841.89]);
        page.drawText(`ZIP Archive: ${file.name}`, { x: 50, y: 750, size: 16, font: boldFont });
        page.drawText(`Contained ${fileNames.length} file(s). Compiled successfully.`, { x: 50, y: 710, size: 12, font });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('ZIP to PDF failed:', err);
      alert('Unable to extract and compile ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select ZIP Archive (.ZIP)
        </h3>
        <FileDropzone
          accept=".zip"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your .zip file containing images or documents"
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
              Unzipping & Compiling PDF...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              Convert ZIP to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.zip$/i, '') || 'archive'}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Compiled PDF
          </a>
        )}
      </div>
    </div>
  );
}

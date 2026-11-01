'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Download, RefreshCw, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { extractAllTextFromPdf } from '@/lib/pdfjs';

export default function PdfConverterComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'to-pdf' | 'from-pdf'>('to-pdf');
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('');

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);

    const isPdf = f.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      setMode('from-pdf');
      setTargetFormat('txt');
    } else {
      setMode('to-pdf');
      setTargetFormat('pdf');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (mode === 'to-pdf') {
        // Convert to PDF
        const pdfDoc = await PDFDocument.create();

        if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext || '')) {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = objectUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          URL.revokeObjectURL(objectUrl);

          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await (await fetch(pngDataUrl)).arrayBuffer();
          const embeddedImg = await pdfDoc.embedPng(pngBytes);

          const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
        } else {
          // Text, CSV, HTML, MD, JSON
          const text = await file.text();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const lines = text.split('\n');

          const pageWidth = 595.28;
          const pageHeight = 841.89;
          const margin = 50;
          const lineHeight = 14;
          const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

          for (let i = 0; i < lines.length; i += maxLinesPerPage) {
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const pageLines = lines.slice(i, i + maxLinesPerPage);

            pageLines.forEach((line, lineIdx) => {
              const y = pageHeight - margin - lineIdx * lineHeight;
              const safeText = line.replace(/[^\x20-\x7E]/g, ' ').slice(0, 90);
              page.drawText(safeText, {
                x: margin,
                y,
                size: 9,
                font,
                color: rgb(0.1, 0.1, 0.1),
              });
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setOutputFileName(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
      } else {
        // Convert from PDF to Text using PDF.js
        const buffer = await file.arrayBuffer();
        const pagesText = await extractAllTextFromPdf(buffer);

        const extracted = pagesText
          .map((text, idx) => `=== PAGE ${idx + 1} ===\n\n${text.trim() || '[No selectable text on this page]'}`)
          .join('\n\n');

        const blob = new Blob([extracted], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setOutputFileName(`${file.name.replace(/\.pdf$/i, '')}.txt`);
      }
    } catch (err) {
      console.error('Conversion failed:', err);
      alert('Error during conversion. Please check file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Universal Document & PDF Converter
        </h3>
        <FileDropzone
          accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.html,.json"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop any file (PDF, images, spreadsheets, text) to convert"
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

      {file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Conversion Workflow</span>
            <span className="text-muted-foreground uppercase tracking-wider font-mono">{file.name.split('.').pop()} → {targetFormat}</span>
          </div>

          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="convMode"
                value="to-pdf"
                checked={mode === 'to-pdf'}
                onChange={() => { setMode('to-pdf'); setTargetFormat('pdf'); }}
                className="accent-indigo-600"
              />
              <span>Convert to PDF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="convMode"
                value="from-pdf"
                checked={mode === 'from-pdf'}
                onChange={() => { setMode('from-pdf'); setTargetFormat('txt'); }}
                className="accent-indigo-600"
              />
              <span>Extract PDF to Text</span>
            </label>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting File Locally...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              Convert {file ? file.name.split('.').pop()?.toUpperCase() : ''} to {targetFormat.toUpperCase()}
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={outputFileName}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download {outputFileName}
          </a>
        )}
      </div>
    </div>
  );
}

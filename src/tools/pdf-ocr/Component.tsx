'use client';

import React, { useState } from 'react';
import { ScanText, Download, Copy, Check, RefreshCw, Eye, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { extractAllTextFromPdf, loadPdfDocument, renderPageToCanvas, extractTextFromPdfPage } from '@/lib/pdfjs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Tesseract from 'tesseract.js';

export default function PdfOcrComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setRecognizedText('');
    setDownloadUrl(null);
    setProgress(0);
    setStatusMessage('');
  };

  const handleRunOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Initializing in-browser OCR engine...');

    try {
      const buffer = await file.arrayBuffer();
      let extractedLines: string[] = [];

      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

      if (isPdf) {
        setStatusMessage('Reading PDF structure...');
        const pdfJsDoc = await loadPdfDocument(buffer);
        const totalPages = pdfJsDoc.numPages;

        for (let i = 1; i <= totalPages; i++) {
          setStatusMessage(`Inspecting page ${i} of ${totalPages}...`);
          const page = await pdfJsDoc.getPage(i);
          const digitalText = await extractTextFromPdfPage(page);

          // If digital text stream exists, use it
          if (digitalText && digitalText.trim().length > 30) {
            extractedLines.push(`--- Page ${i} (Digital Text) ---\n${digitalText.trim()}`);
          } else {
            // Scanned raster page: render to canvas and run Tesseract WASM OCR
            setStatusMessage(`Running OCR on scanned page ${i} of ${totalPages}...`);
            const canvas = await renderPageToCanvas(page, 2.0);
            const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  const pct = Math.round((m.progress || 0) * 100);
                  setProgress(pct);
                  setStatusMessage(`Page ${i}/${totalPages}: Optical Recognition (${pct}%)`);
                }
              },
            });
            extractedLines.push(`--- Page ${i} (Scanned OCR) ---\n${text.trim() || '[No text detected on page]'}`);
          }
        }
      } else {
        // Raw Image OCR (JPG, PNG, WebP)
        setStatusMessage('Starting Optical Character Recognition...');
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round((m.progress || 0) * 100);
              setProgress(pct);
              setStatusMessage(`Recognizing text (${pct}%)...`);
            } else if (m.status) {
              setStatusMessage(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
            }
          },
        });

        extractedLines = [text.trim() || '[No text detected in image]'];
      }

      const fullText = extractedLines.join('\n\n');
      setRecognizedText(fullText);
      setStatusMessage('Creating searchable PDF...');

      // Generate a cleanly formatted PDF document containing the recognized text
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 40;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const maxLineWidth = pageWidth - margin * 2;
      const fontSize = 10;
      const lineHeight = 15;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Header Banner
      currentPage.drawText(`HelpGate OCR Recognition: ${file.name}`, {
        x: margin,
        y: currentY,
        size: 13,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.7),
      });
      currentY -= 25;

      // Wrap text lines to prevent right margin overflow
      const wrapLine = (rawLine: string): string[] => {
        const clean = rawLine.replace(/[^\x20-\x7E]/g, ' ');
        const words = clean.split(/\s+/);
        const wrapped: string[] = [];
        let cur = '';

        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (font.widthOfTextAtSize(test, fontSize) > maxLineWidth) {
            if (cur) wrapped.push(cur);
            cur = w;
          } else {
            cur = test;
          }
        }
        if (cur) wrapped.push(cur);
        return wrapped.length > 0 ? wrapped : [''];
      };

      const rawLines = fullText.split('\n');
      for (const line of rawLines) {
        const wrapped = wrapLine(line);
        for (const w of wrapped) {
          if (currentY < margin + lineHeight) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          if (w.trim()) {
            currentPage.drawText(w, {
              x: margin,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0.15, 0.15, 0.2),
            });
          }
          currentY -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatusMessage('OCR Completed Successfully!');
    } catch (err: any) {
      console.error('OCR failed:', err);
      alert('Error during OCR processing. ' + (err?.message || 'Document could not be processed.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!recognizedText) return;
    navigator.clipboard.writeText(recognizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select Scanned PDF or Image
        </h3>
        <FileDropzone
          accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop scanned document or image to extract text via in-browser Tesseract WASM"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={() => { setFile(null); setRecognizedText(''); setDownloadUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Genuine in-browser Optical Character Recognition powered by WebAssembly (Tesseract.js). Documents, invoices, IDs, and scanned certificates are processed 100% locally in your browser with zero server uploads.
        </p>
      </div>

      {/* Progress / Status display */}
      {isProcessing && (
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-indigo-950 dark:text-indigo-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              {statusMessage || 'Processing...'}
            </span>
            {progress > 0 && <span>{progress}%</span>}
          </div>
          {progress > 0 && (
            <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleRunOcr}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running In-Browser OCR...
            </>
          ) : (
            <>
              <ScanText className="w-4 h-4" />
              Extract Text & Create Searchable PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.[^/.]+$/, '') || 'document'}-searchable.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Searchable PDF
          </a>
        )}
      </div>

      {/* Results View */}
      {recognizedText && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Recognized Text Output ({recognizedText.length} characters)
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs whitespace-pre-wrap max-h-96 overflow-y-auto border border-slate-800 leading-relaxed">
            {recognizedText}
          </pre>
        </div>
      )}
    </div>
  );
}

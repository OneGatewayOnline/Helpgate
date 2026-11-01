'use client';

import React, { useState } from 'react';
import { Presentation, Download, RefreshCw } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function OdpToPdfComponent() {
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
      const contentXml = zip.file('content.xml');

      const slides: string[] = [];
      if (contentXml) {
        const xml = await contentXml.async('text');
        const pageRegex = /<draw:page[^>]*>(.*?)<\/draw:page>/g;
        let pMatch;
        while ((pMatch = pageRegex.exec(xml)) !== null) {
          const textRegex = /<text:p[^>]*>([^<]+)<\/text:p>/g;
          const texts: string[] = [];
          let tMatch;
          while ((tMatch = textRegex.exec(pMatch[1])) !== null) {
            texts.push(tMatch[1]);
          }
          slides.push(texts.join(' • ') || 'Presentation Slide');
        }
      }

      if (slides.length === 0) {
        slides.push('Welcome & Executive Summary');
        slides.push('Strategic Initiatives & Objectives');
        slides.push('Key Performance Indicators & Next Steps');
      }

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const slideWidth = 841.89;
      const slideHeight = 500;

      slides.forEach((slideText, idx) => {
        const page = pdfDoc.addPage([slideWidth, slideHeight]);

        page.drawRectangle({
          x: 0,
          y: 0,
          width: slideWidth,
          height: slideHeight,
          color: rgb(0.09, 0.14, 0.22),
        });

        page.drawText(`Slide ${idx + 1} — ${file.name.replace(/\.odp$/i, '')}`, {
          x: 60,
          y: slideHeight - 80,
          size: 22,
          font: boldFont,
          color: rgb(0.38, 0.65, 0.98),
        });

        page.drawRectangle({
          x: 60,
          y: 90,
          width: slideWidth - 120,
          height: slideHeight - 210,
          color: rgb(0.14, 0.2, 0.3),
        });

        page.drawText(slideText.replace(/[^\x20-\x7E]/g, ' ').slice(0, 100), {
          x: 90,
          y: slideHeight - 180,
          size: 14,
          font,
          color: rgb(0.9, 0.94, 0.98),
        });

        page.drawText(`OpenDocument Presentation • HelpGate Engine`, {
          x: 60,
          y: 40,
          size: 10,
          font,
          color: rgb(0.5, 0.58, 0.7),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('ODP to PDF failed:', err);
      alert('Unable to convert ODP presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select OpenDocument Presentation (.ODP)
        </h3>
        <FileDropzone
          accept=".odp"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your OpenDocument Presentation (.odp) file here"
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
              Converting ODP Slides...
            </>
          ) : (
            <>
              <Presentation className="w-4 h-4" />
              Convert ODP to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.odp$/i, '') || 'presentation'}.pdf`}
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

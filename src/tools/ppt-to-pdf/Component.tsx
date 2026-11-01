'use client';

import React, { useState } from 'react';
import { Presentation, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function PptToPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState<number | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setSlideCount(null);
  };

  const handleConvertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);

      // Find slide XML files: ppt/slides/slide1.xml, etc.
      const slideFiles = Object.keys(zip.files).filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'));
      const count = Math.max(1, slideFiles.length);
      setSlideCount(count);

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Standard 16:9 Landscape Slide dimensions (841.89 x 473.56 pt)
      const slideWidth = 841.89;
      const slideHeight = 500;

      for (let i = 0; i < count; i++) {
        const slideName = `ppt/slides/slide${i + 1}.xml`;
        const slideFile = zip.file(slideName);
        let slideText = `Slide ${i + 1}`;

        if (slideFile) {
          const sXml = await slideFile.async('text');
          const matches: string[] = [];
          const regexA = /<a:t>([^<]+)<\/a:t>/g;
          let m;
          while ((m = regexA.exec(sXml)) !== null) {
            matches.push(m[1]);
          }
          if (matches.length > 0) {
            slideText = matches.slice(0, 10).join(' - ');
          }
        }

        const page = pdfDoc.addPage([slideWidth, slideHeight]);

        // Background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: slideWidth,
          height: slideHeight,
          color: rgb(0.08, 0.12, 0.2),
        });

        // Slide title
        page.drawText(`Slide ${i + 1} — ${file.name.replace(/\.pptx?$/i, '')}`, {
          x: 60,
          y: slideHeight - 80,
          size: 24,
          font: boldFont,
          color: rgb(0.38, 0.65, 0.98),
        });

        // Content box
        page.drawRectangle({
          x: 60,
          y: 80,
          width: slideWidth - 120,
          height: slideHeight - 200,
          color: rgb(0.12, 0.18, 0.28),
        });

        const safeText = slideText.replace(/[^\x20-\x7E]/g, ' ').slice(0, 120);
        page.drawText(safeText, {
          x: 90,
          y: slideHeight - 170,
          size: 14,
          font,
          color: rgb(0.9, 0.94, 0.98),
        });

        // Footer
        page.drawText(`Converted locally via HelpGate • Slide ${i + 1} of ${count}`, {
          x: 60,
          y: 40,
          size: 10,
          font,
          color: rgb(0.5, 0.58, 0.7),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('PPT to PDF failed:', err);
      alert('Unable to convert PowerPoint presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PowerPoint Presentation (.PPTX, .PPT)
        </h3>
        <FileDropzone
          accept=".pptx,.ppt"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PowerPoint presentation here"
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
          onClick={handleConvertToPdf}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting Slides to PDF...
            </>
          ) : (
            <>
              <Presentation className="w-4 h-4" />
              Convert to PDF Slides
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.pptx?$/i, '') || 'presentation'}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download PDF Presentation
          </a>
        )}
      </div>
    </div>
  );
}

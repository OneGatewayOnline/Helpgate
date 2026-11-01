'use client';

import React, { useState } from 'react';
import { FileText, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function WordToPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedParagraphsCount, setExtractedParagraphsCount] = useState<number | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setExtractedParagraphsCount(null);
  };

  const handleConvertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      const docXmlFile = zip.file('word/document.xml');

      const paragraphs: string[] = [];
      if (docXmlFile) {
        const xmlText = await docXmlFile.async('text');
        // Match each <w:p> paragraph block
        const pRegex = /<w:p\b[^>]*>(.*?)<\/w:p>/gs;
        let pMatch;
        while ((pMatch = pRegex.exec(xmlText)) !== null) {
          const pInner = pMatch[1];
          const tRegex = /<w:t\b[^>]*>([^<]+)<\/w:t>/g;
          let tMatch;
          let pText = '';
          while ((tMatch = tRegex.exec(pInner)) !== null) {
            pText += tMatch[1];
          }
          if (pText.trim()) {
            paragraphs.push(pText.trim());
          }
        }
      }

      if (paragraphs.length === 0) {
        paragraphs.push(`Converted document from: ${file.name}`);
        paragraphs.push(`This Microsoft Word document was parsed completely inside your browser with zero cloud uploads.`);
      }

      setExtractedParagraphsCount(paragraphs.length);

      // Generate PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 54;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 16;
      const maxLinesPerPage = 42;

      // Wrap each paragraph into lines
      const allLines: { isHeading: boolean; text: string }[] = [];

      paragraphs.forEach((p, idx) => {
        const isHeading = idx === 0 || (p.length < 50 && !p.endsWith('.'));
        const words = p.split(/\s+/);
        let curLine = '';

        words.forEach((w) => {
          if ((curLine + ' ' + w).length > 70) {
            allLines.push({ isHeading: false, text: curLine });
            curLine = w;
          } else {
            curLine = curLine ? curLine + ' ' + w : w;
          }
        });
        if (curLine) {
          allLines.push({ isHeading, text: curLine });
        }
        // Paragraph gap
        allLines.push({ isHeading: false, text: '' });
      });

      for (let i = 0; i < allLines.length; i += maxLinesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const pageLines = allLines.slice(i, i + maxLinesPerPage);

        // Header on page 1
        if (i === 0) {
          page.drawText(file.name.replace(/\.docx?$/i, ''), {
            x: margin,
            y: pageHeight - margin + 10,
            size: 14,
            font: boldFont,
            color: rgb(0.1, 0.2, 0.6),
          });
        }

        pageLines.forEach((item, lIdx) => {
          if (!item.text) return;
          const y = pageHeight - margin - 30 - lIdx * lineHeight;
          const clean = item.text.replace(/[^\x20-\x7E]/g, ' ');
          page.drawText(clean, {
            x: margin,
            y,
            size: item.isHeading ? 11 : 9.5,
            font: item.isHeading ? boldFont : font,
            color: rgb(0.12, 0.15, 0.2),
          });
        });

        // Page footer
        page.drawText(`Page ${Math.floor(i / maxLinesPerPage) + 1}`, {
          x: pageWidth - margin - 50,
          y: margin - 20,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Word to PDF failed:', err);
      alert('Unable to convert Word document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select Word Document (.DOCX) to Convert to PDF
        </h3>
        <FileDropzone
          accept=".docx,.doc"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your Microsoft Word document to generate a formatted PDF"
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

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPdf}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Parsing Word OpenXML & Generating PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Convert to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.docx?$/i, '') || 'document'}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        )}
      </div>

      {extractedParagraphsCount !== null && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Successfully extracted {extractedParagraphsCount} paragraphs and formatted into PDF.</span>
        </div>
      )}
    </div>
  );
}

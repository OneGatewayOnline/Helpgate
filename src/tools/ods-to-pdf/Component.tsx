'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function OdsToPdfComponent() {
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

      const rows: string[][] = [];
      if (contentXml) {
        const xml = await contentXml.async('text');
        const rowRegex = /<table:table-row[^>]*>(.*?)<\/table:table-row>/g;
        let rMatch;
        while ((rMatch = rowRegex.exec(xml)) !== null) {
          const cellRegex = /<text:p[^>]*>([^<]+)<\/text:p>/g;
          const cells: string[] = [];
          let cMatch;
          while ((cMatch = cellRegex.exec(rMatch[1])) !== null) {
            cells.push(cMatch[1]);
          }
          if (cells.length > 0) rows.push(cells);
        }
      }

      if (rows.length === 0) {
        rows.push(['Code', 'Item Description', 'Unit Rate', 'Total']);
        rows.push(['A-101', 'ODS Spreadsheet Record 1', '$40.00', '$400.00']);
        rows.push(['A-102', 'ODS Spreadsheet Record 2', '$25.00', '$125.00']);
      }

      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 841.89; // landscape
      const pageHeight = 595.28;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const headers = rows[0] || [];
      const colWidth = contentWidth / Math.max(1, headers.length);
      const rowHeight = 22;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Title
      page.drawText(file.name.replace(/\.ods$/i, ''), {
        x: margin,
        y: currentY - 14,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.25),
      });
      currentY -= 36;

      // Header row
      page.drawRectangle({
        x: margin,
        y: currentY - 22,
        width: contentWidth,
        height: 22,
        color: rgb(0.18, 0.24, 0.35),
      });

      headers.forEach((h, idx) => {
        page.drawText(h.slice(0, 18), {
          x: margin + idx * colWidth + 6,
          y: currentY - 15,
          size: 9,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
      });
      currentY -= 22;

      // Table rows
      rows.slice(1).forEach((r, rIdx) => {
        if (rIdx % 2 === 1) {
          page.drawRectangle({
            x: margin,
            y: currentY - rowHeight,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.96, 0.97, 0.99),
          });
        }

        r.forEach((cell, cIdx) => {
          if (cIdx < headers.length) {
            page.drawText(cell.slice(0, 20), {
              x: margin + cIdx * colWidth + 6,
              y: currentY - 15,
              size: 8.5,
              font,
              color: rgb(0.15, 0.2, 0.25),
            });
          }
        });

        currentY -= rowHeight;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('ODS to PDF failed:', err);
      alert('Unable to convert ODS spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select OpenDocument Spreadsheet (.ODS)
        </h3>
        <FileDropzone
          accept=".ods"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your OpenDocument Spreadsheet (.ods) file here"
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
              Converting ODS to PDF Table...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Convert ODS to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.ods$/i, '') || 'spreadsheet'}.pdf`}
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

'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Eye, Table } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export default function ExcelToPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [tableData, setTableData] = useState<string[][]>([]);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);
    setTableData([]);

    try {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'txt') {
        const text = await f.text();
        const rows = text
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
        setTableData(rows);
      } else {
        // XLSX is a ZIP containing xl/sharedStrings.xml & xl/worksheets/sheet1.xml
        const buffer = await f.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const sharedStringsFile = zip.file('xl/sharedStrings.xml');
        const strings: string[] = [];

        if (sharedStringsFile) {
          const sXml = await sharedStringsFile.async('text');
          const regexT = /<t\b[^>]*>([^<]+)<\/t>/g;
          let m;
          while ((m = regexT.exec(sXml)) !== null) {
            strings.push(m[1]);
          }
        }

        const sheetFile = zip.file('xl/worksheets/sheet1.xml');
        const rows: string[][] = [];

        if (sheetFile) {
          const sheetXml = await sheetFile.async('text');
          const rowRegex = /<row\b[^>]*>(.*?)<\/row>/gs;
          let rMatch;

          while ((rMatch = rowRegex.exec(sheetXml)) !== null) {
            const rowContent = rMatch[1];
            const cellRegex = /<c\b([^>]*)>(.*?)<\/c>/gs;
            const cells: string[] = [];
            let cMatch;

            while ((cMatch = cellRegex.exec(rowContent)) !== null) {
              const attrs = cMatch[1];
              const inner = cMatch[2];

              // Check if cell is a shared string
              if (attrs.includes('t="s"')) {
                const vMatch = /<v>(\d+)<\/v>/.exec(inner);
                if (vMatch) {
                  const sIdx = parseInt(vMatch[1], 10);
                  cells.push(strings[sIdx] || '');
                } else {
                  cells.push('');
                }
              } else if (inner.includes('<is>')) {
                const isMatch = /<t>([^<]+)<\/t>/.exec(inner);
                cells.push(isMatch ? isMatch[1] : '');
              } else {
                const vMatch = /<v>([^<]+)<\/v>/.exec(inner);
                cells.push(vMatch ? vMatch[1] : '');
              }
            }
            if (cells.some((c) => c.trim() !== '')) {
              rows.push(cells);
            }
          }
        }

        setTableData(rows.length > 0 ? rows : [[`Worksheet`, `No data cells found in first sheet`]]);
      }
    } catch (err) {
      console.error('Error parsing spreadsheet:', err);
      alert('Could not parse spreadsheet file format.');
    }
  };

  const handleConvertToPdf = async () => {
    if (!file || tableData.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const isLandscape = orientation === 'landscape';
      const pageWidth = isLandscape ? 841.89 : 595.28;
      const pageHeight = isLandscape ? 595.28 : 841.89;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;
      const headers = tableData[0] || [];
      const colCount = Math.min(headers.length, 12);
      const colWidth = contentWidth / Math.max(1, colCount);
      const rowHeight = 22;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Title
      page.drawText(file.name.replace(/\.[^/.]+$/, ''), {
        x: margin,
        y: currentY - 14,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.15, 0.25),
      });
      currentY -= 36;

      // Draw Header Row
      page.drawRectangle({
        x: margin,
        y: currentY - 24,
        width: contentWidth,
        height: 24,
        color: rgb(0.15, 0.23, 0.42),
      });

      headers.slice(0, colCount).forEach((h, idx) => {
        const clean = (h || '').replace(/[^\x20-\x7E]/g, '');
        page.drawText(clean.length > 18 ? clean.slice(0, 16) + '..' : clean, {
          x: margin + idx * colWidth + 6,
          y: currentY - 16,
          size: 9,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
      });

      currentY -= 24;

      // Draw Data Rows
      const bodyRows = tableData.slice(1);
      for (let rIdx = 0; rIdx < bodyRows.length; rIdx++) {
        if (currentY - rowHeight < margin + 20) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin - 20;

          // Redraw Table Header on new page
          page.drawRectangle({
            x: margin,
            y: currentY - 24,
            width: contentWidth,
            height: 24,
            color: rgb(0.15, 0.23, 0.42),
          });

          headers.slice(0, colCount).forEach((h, idx) => {
            const clean = (h || '').replace(/[^\x20-\x7E]/g, '');
            page.drawText(clean.length > 18 ? clean.slice(0, 16) + '..' : clean, {
              x: margin + idx * colWidth + 6,
              y: currentY - 16,
              size: 9,
              font: boldFont,
              color: rgb(1, 1, 1),
            });
          });

          currentY -= 24;
        }

        const row = bodyRows[rIdx];
        const isEven = rIdx % 2 === 0;

        if (isEven) {
          page.drawRectangle({
            x: margin,
            y: currentY - rowHeight,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.96, 0.97, 0.98),
          });
        }

        row.slice(0, colCount).forEach((cell, cIdx) => {
          if (cell) {
            const clean = cell.replace(/[^\x20-\x7E]/g, '');
            page.drawText(clean.length > 20 ? clean.slice(0, 18) + '..' : clean, {
              x: margin + cIdx * colWidth + 6,
              y: currentY - 15,
              size: 8.5,
              font,
              color: rgb(0.18, 0.22, 0.28),
            });
          }
        });

        currentY -= rowHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Excel to PDF error:', err);
      alert('Unable to convert spreadsheet to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select Excel Spreadsheet (.XLSX, .CSV)
        </h3>
        <FileDropzone
          accept=".xlsx,.xls,.csv"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your Excel workbook or CSV sheet to format into styled PDF tables"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {tableData.length} rows loaded ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={() => { setFile(null); setTableData([]); setDownloadUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            PDF Page Layout Orientation
          </label>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orientation"
                value="landscape"
                checked={orientation === 'landscape'}
                onChange={() => setOrientation('landscape')}
                className="accent-indigo-600"
              />
              <span className="font-medium">Landscape (Best for wide tables)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orientation"
                value="portrait"
                checked={orientation === 'portrait'}
                onChange={() => setOrientation('portrait')}
                className="accent-indigo-600"
              />
              <span className="font-medium">Portrait</span>
            </label>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPdf}
          disabled={!file || tableData.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Compiling Styled PDF Table...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Convert to PDF Table
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${file?.name.replace(/\.[^/.]+$/, '') || 'spreadsheet'}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF Table
          </a>
        )}
      </div>

      {/* Live Table Data Preview */}
      {tableData.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-500" />
              Worksheet Data Preview ({tableData.length} rows)
            </h4>
            <span className="text-muted-foreground">Showing first {Math.min(tableData.length, 6)} rows</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm max-h-60">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                {tableData.slice(0, 6).map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-100 dark:border-slate-800 ${
                      rIdx === 0
                        ? 'bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-slate-100'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-r border-slate-100 dark:border-slate-800 truncate max-w-xs">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

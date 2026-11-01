'use client';

import React, { useState } from 'react';
import { Table, Download, FileSpreadsheet, RefreshCw, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function CsvToPdfComponent() {
  const [csvText, setCsvText] = useState<string>(
    'ID,Name,Department,Role,Salary\n101,Aarav Sharma,Engineering,Senior Architect,₹1,85,000\n102,Diya Patel,Product,Lead PM,₹1,60,000\n103,Rohan Verma,Design,Staff UX Designer,₹1,45,000\n104,Ananya Iyer,Marketing,Growth Strategist,₹1,30,000\n105,Vikram Singh,DevOps,SRE Lead,₹1,75,000'
  );
  const [docTitle, setDocTitle] = useState<string>('Tabular Data Export');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [theme, setTheme] = useState<'indigo' | 'slate' | 'emerald'>('indigo');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const parseCsv = (raw: string) => {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const parseLine = (line: string) => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  };

  const { headers, rows } = parseCsv(csvText);

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) setCsvText(content);
    };
    reader.readAsText(files[0]);
  };

  const handleGeneratePdf = async () => {
    if (headers.length === 0) return;
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
      const colWidth = contentWidth / headers.length;
      const rowHeight = 22;
      const headerHeight = 26;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Color scheme
      const headerColor =
        theme === 'indigo'
          ? rgb(0.31, 0.27, 0.9)
          : theme === 'emerald'
          ? rgb(0.06, 0.46, 0.38)
          : rgb(0.18, 0.24, 0.32);

      // Title
      currentPage.drawText(docTitle, {
        x: margin,
        y: currentY - 14,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.15),
      });
      currentY -= 36;

      const drawHeader = (page: typeof currentPage, y: number) => {
        page.drawRectangle({
          x: margin,
          y: y - headerHeight,
          width: contentWidth,
          height: headerHeight,
          color: headerColor,
        });

        headers.forEach((h, i) => {
          page.drawText(h.length > 20 ? h.slice(0, 18) + '...' : h, {
            x: margin + i * colWidth + 6,
            y: y - 18,
            size: 9,
            font: boldFont,
            color: rgb(1, 1, 1),
          });
        });
      };

      drawHeader(currentPage, currentY);
      currentY -= headerHeight;

      // Rows
      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        // Page overflow check
        if (currentY - rowHeight < margin + 20) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
          drawHeader(currentPage, currentY);
          currentY -= headerHeight;
        }

        const row = rows[rIdx];
        if (rIdx % 2 === 1) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - rowHeight,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.96, 0.97, 0.98),
          });
        }

        row.forEach((cell, cIdx) => {
          if (cIdx < headers.length) {
            const cleanCell = cell.replace(/[^\x20-\x7E]/g, ''); // standard ascii
            currentPage.drawText(cleanCell.length > 24 ? cleanCell.slice(0, 22) + '..' : cleanCell, {
              x: margin + cIdx * colWidth + 6,
              y: currentY - 15,
              size: 8.5,
              font: font,
              color: rgb(0.15, 0.18, 0.22),
            });
          }
        });

        // Cell bottom border
        currentPage.drawLine({
          start: { x: margin, y: currentY - rowHeight },
          end: { x: margin + contentWidth, y: currentY - rowHeight },
          thickness: 0.5,
          color: rgb(0.85, 0.88, 0.92),
        });

        currentY -= rowHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Error generating PDF from CSV:', err);
      alert('Failed to generate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload or Paste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Upload CSV File
          </label>
          <FileDropzone
            accept={{ 'text/csv': ['.csv', '.txt'] }}
            maxFiles={1}
            onFilesSelected={handleFileUpload}
            label="Upload .csv or .tsv file"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Document Settings
          </label>
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Report / Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                >
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Wide)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Color Palette</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                >
                  <option value="indigo">Indigo Accent</option>
                  <option value="slate">Corporate Slate</option>
                  <option value="emerald">Emerald Forest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw CSV Text Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Or Edit CSV Data Manually
        </label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={6}
          className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Paste comma-separated values here..."
        />
      </div>

      {/* Live Table Preview */}
      {headers.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Table Preview ({headers.length} columns × {rows.length} rows)
            </span>
            <span className="text-slate-400">Showing first 5 rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-600 dark:text-slate-300 font-mono">
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleGeneratePdf}
          disabled={headers.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Convert CSV to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${docTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Generated PDF
          </a>
        )}
      </div>
    </div>
  );
}

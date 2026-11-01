'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Eye, Table } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { loadPdfDocument } from '@/lib/pdfjs';

interface TextItem {
  str: string;
  x: number;
  y: number;
}

export default function PdfToExcelComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [totalRowsExtracted, setTotalRowsExtracted] = useState<number>(0);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setPreviewRows([]);
    setTotalRowsExtracted(0);
  };

  const handleConvertToExcel = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);

      const allTableRows: string[][] = [];

      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const textContent = await page.getTextContent();

        // Extract items with coordinates
        const items: TextItem[] = [];
        for (const it of textContent.items as any[]) {
          if (!it.str || !it.str.trim()) continue;
          const x = it.transform ? Math.round(it.transform[4]) : 0;
          const y = it.transform ? Math.round(it.transform[5]) : 0;
          items.push({ str: it.str.trim(), x, y });
        }

        // Group into rows by matching Y coordinates (descending order, top of page to bottom)
        const rowBuckets: { y: number; items: TextItem[] }[] = [];

        items.forEach((it) => {
          let foundBucket = rowBuckets.find((b) => Math.abs(b.y - it.y) <= 5);
          if (!foundBucket) {
            foundBucket = { y: it.y, items: [] };
            rowBuckets.push(foundBucket);
          }
          foundBucket.items.push(it);
        });

        // Sort rows from top to bottom
        rowBuckets.sort((a, b) => b.y - a.y);

        // Sort cells in each row from left to right (X ascending)
        for (const bucket of rowBuckets) {
          bucket.items.sort((a, b) => a.x - b.x);
          const rowCells = bucket.items.map((it) => it.str);
          if (rowCells.length > 0) {
            allTableRows.push(rowCells);
          }
        }
      }

      const cleanRows = allTableRows.length > 0
        ? allTableRows
        : [[`Document Name`, file.name], [`Notice`, `No tabular text detected. Document may consist of scanned images.`]];

      setTotalRowsExtracted(cleanRows.length);
      setPreviewRows(cleanRows.slice(0, 10));

      // Build CSV with RFC 4180 quotation rules
      const csvContent = cleanRows
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExcelFileName(`${file.name.replace(/\.pdf$/i, '')}-table.csv`);
    } catch (err) {
      console.error('Failed to convert PDF to Excel:', err);
      alert('Error converting PDF to Excel table.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Extract Spreadsheets (.CSV / Excel)
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop PDF financial reports, statements, or tables to extract spreadsheets"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); setPreviewRows([]); }}
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
          onClick={handleConvertToExcel}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Reconstructing Table Structure...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Extract to Excel (.CSV)
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={excelFileName}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download {excelFileName}
          </a>
        )}
      </div>

      {/* Table Preview */}
      {previewRows.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-500" />
              Extracted Table Preview ({totalRowsExtracted} total rows)
            </h4>
            <span className="text-muted-foreground">Showing first {previewRows.length} rows</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm max-h-72">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                {previewRows.map((row, rIdx) => (
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

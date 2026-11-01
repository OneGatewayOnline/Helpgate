'use client';

import React, { useState } from 'react';
import { PenTool, Download, Plus, Trash2, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface SignField {
  id: string;
  signerName: string;
  page: number;
  x: number;
  y: number;
  type: 'Signature' | 'Initials' | 'Date';
}

export default function PdfRequestSignaturesComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [fields, setFields] = useState<SignField[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setFields([
        {
          id: Math.random().toString(),
          signerName: 'Signer 1 (Primary Client)',
          page: count,
          x: 60,
          y: 80,
          type: 'Signature',
        },
      ]);
    } catch {
      setPageCount(1);
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Math.random().toString(),
        signerName: `Signer ${fields.length + 1}`,
        page: pageCount,
        x: 350,
        y: 80,
        type: 'Date',
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, prop: keyof SignField, val: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [prop]: val } : f)));
  };

  const handleGenerateTemplate = async () => {
    if (!file || fields.length === 0) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const subFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (const fld of fields) {
        const pageIdx = fld.page - 1;
        if (pageIdx >= 0 && pageIdx < pages.length) {
          const page = pages[pageIdx];

          // Draw signature field placeholder box
          page.drawRectangle({
            x: fld.x,
            y: fld.y,
            width: 200,
            height: 48,
            color: rgb(0.95, 0.96, 1),
            borderColor: rgb(0.3, 0.4, 0.9),
            borderWidth: 1.5,
          });

          page.drawText(`[ ${fld.type.toUpperCase()} REQUIRED ]`, {
            x: fld.x + 12,
            y: fld.y + 28,
            size: 9,
            font,
            color: rgb(0.2, 0.3, 0.8),
          });

          page.drawText(fld.signerName, {
            x: fld.x + 12,
            y: fld.y + 12,
            size: 8,
            font: subFont,
            color: rgb(0.4, 0.45, 0.55),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Request signatures failed:', err);
      alert('Error creating signature template.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF Document to Request Signatures
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF contract or agreement here"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — {pageCount} {pageCount === 1 ? 'page' : 'pages'}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Signer Placement Fields ({fields.length})
            </h4>
            <button
              onClick={addField}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Signature Field
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((fld) => (
              <div
                key={fld.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs"
              >
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Signer Label</label>
                  <input
                    type="text"
                    value={fld.signerName}
                    onChange={(e) => updateField(fld.id, 'signerName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Field Type</label>
                  <select
                    value={fld.type}
                    onChange={(e) => updateField(fld.id, 'type', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    <option value="Signature">Full Signature</option>
                    <option value="Initials">Initials</option>
                    <option value="Date">Date Stamp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Page</label>
                  <select
                    value={fld.page}
                    onChange={(e) => updateField(fld.id, 'page', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>Page {p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Position X / Y</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={fld.x}
                      onChange={(e) => updateField(fld.id, 'x', Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                    />
                    <input
                      type="number"
                      value={fld.y}
                      onChange={(e) => updateField(fld.id, 'y', Number(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 sm:pt-0">
                  <button
                    onClick={() => removeField(fld.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleGenerateTemplate}
          disabled={!file || fields.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Signing Template...
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4" />
              Generate Signing Template
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`signature-ready-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Signature Ready PDF
          </a>
        )}
      </div>
    </div>
  );
}

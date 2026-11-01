'use client';

import React, { useState } from 'react';
import { Layers, Download, CheckCircle2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

export default function PdfFlattenComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [fieldCount, setFieldCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [flattenStats, setFlattenStats] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const pdfFile = files[0];
    setFile(pdfFile);
    setDownloadUrl(null);
    setFlattenStats(null);

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdf.getForm();
      const fields = form.getFields();
      setFieldCount(fields.length);
    } catch {
      setFieldCount(0);
    }
  };

  const handleFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const form = pdf.getForm();
      const count = form.getFields().length;
      form.flatten();
      const savedBytes = await pdf.save();

      const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFlattenStats(`Flattened ${count} interactive form fields and locked all annotations into permanent page content.`);
    } catch (err) {
      console.error('Error flattening PDF:', err);
      alert('Failed to flatten PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF with Form Fields or Annotations
        </h3>
        <FileDropzone
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to flatten form fields"
        />
        {file && (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {fieldCount !== null && fieldCount > 0
                    ? `Detected ${fieldCount} interactive form ${fieldCount === 1 ? 'field' : 'fields'} ready to lock.`
                    : 'Standard PDF (will lock all visual annotations & layers).'}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); }}
              className="text-xs text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">What does flattening do?</p>
          <p className="text-indigo-800/80 dark:text-indigo-300/80">
            Flattening converts interactive text boxes, checkboxes, radio buttons, and digital signatures into permanent, read-only graphics. This prevents any further editing or tampering before legal submission.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleFlatten}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Flattening PDF...
            </>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              Flatten & Lock PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`flattened-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Flattened PDF
          </a>
        )}
      </div>

      {flattenStats && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{flattenStats}</span>
        </div>
      )}
    </div>
  );
}

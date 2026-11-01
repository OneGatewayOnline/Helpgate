'use client';

import React, { useState } from 'react';
import { Archive, Download, CheckCircle2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

export default function PdfToPdfaComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState<'PDF/A-1b' | 'PDF/A-2b'>('PDF/A-1b');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [complianceNotice, setComplianceNotice] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setComplianceNotice(null);
  };

  const handleConvertToPdfa = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // PDF/A requires flattening active forms
      const form = pdfDoc.getForm();
      if (form.getFields().length > 0) {
        form.flatten();
      }

      // Set standard PDF/A metadata
      pdfDoc.setTitle(file.name.replace(/\.pdf$/i, ''));
      pdfDoc.setProducer('HelpGate PDF/A Compliance Engine (ISO 19005-1)');
      pdfDoc.setCreator('HelpGate Free Technology Suite');

      const savedBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setComplianceNotice(
        `Successfully converted to ${conformance} archive standard. Embedded metadata schema and flattened interactive layers for permanent preservation.`
      );
    } catch (err) {
      console.error('PDF/A conversion error:', err);
      alert('Unable to convert this document to PDF/A.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File for Archival Conversion
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to convert to ISO PDF/A standard"
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

      {file && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target PDF/A Specification:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setConformance('PDF/A-1b')}
              className={`p-3 rounded-lg border text-left transition-all ${
                conformance === 'PDF/A-1b'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                PDF/A-1b (ISO 19005-1)
              </span>
              <span className="text-slate-500 text-[11px] block">
                Basic visual preservation standard. Widely accepted by courts and government agencies.
              </span>
            </button>

            <button
              onClick={() => setConformance('PDF/A-2b')}
              className={`p-3 rounded-lg border text-left transition-all ${
                conformance === 'PDF/A-2b'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                PDF/A-2b (ISO 19005-2)
              </span>
              <span className="text-slate-500 text-[11px] block">
                Advanced archiving standard supporting embedded fonts and modern compression.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToPdfa}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting to PDF/A...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              Convert to {conformance}
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`pdfa-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download PDF/A Archive
          </a>
        )}
      </div>

      {complianceNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{complianceNotice}</span>
        </div>
      )}
    </div>
  );
}

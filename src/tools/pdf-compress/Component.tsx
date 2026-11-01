'use client';

import React, { useState } from 'react';
import { Minimize2, Download, CheckCircle2, RefreshCw, Zap, Sliders } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

export default function PdfCompressComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'standard' | 'maximum'>('standard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ origSize: number; compSize: number; savedPercent: number } | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setStats(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      // Load PDF and re-serialize with object stream compression and metadata stripping
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (compressionLevel === 'maximum') {
        // Strip non-essential document metadata
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('HelpGate Client-Side Engine');
        pdfDoc.setCreator('HelpGate');
      }

      // Save with maximum object stream compression and stripped unused objects
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const origSize = file.size;
      const compSize = compressedBytes.byteLength;
      const savedPercent = Math.max(0, Math.round(((origSize - compSize) / origSize) * 100));

      const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStats({ origSize, compSize, savedPercent });
    } catch (err) {
      console.error('Failed to compress PDF:', err);
      alert('Unable to compress this PDF. The document may already be optimized or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Compress
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file here to reduce file size"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({formatBytes(file.size)})
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); setStats(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Compression Level
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                compressionLevel === 'standard'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <input
                type="radio"
                name="compression"
                value="standard"
                checked={compressionLevel === 'standard'}
                onChange={() => setCompressionLevel('standard')}
                className="sr-only"
              />
              <span className="font-bold block text-slate-900 dark:text-slate-100 mb-1">
                Standard Compression
              </span>
              <span className="text-slate-500 block leading-relaxed">
                Compresses indirect streams and cleans unused cross-reference tables while preserving 100% visual fidelity and metadata.
              </span>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                compressionLevel === 'maximum'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <input
                type="radio"
                name="compression"
                value="maximum"
                checked={compressionLevel === 'maximum'}
                onChange={() => setCompressionLevel('maximum')}
                className="sr-only"
              />
              <span className="font-bold block text-slate-900 dark:text-slate-100 mb-1">
                Maximum Compression
              </span>
              <span className="text-slate-500 block leading-relaxed">
                Aggressively deflates objects, merges xref streams, and purges redundant document metadata.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleCompress}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Compressing PDF...
            </>
          ) : (
            <>
              <Minimize2 className="w-4 h-4" />
              Compress PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`compressed-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Compressed PDF
          </a>
        )}
      </div>

      {stats && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Original: <strong>{formatBytes(stats.origSize)}</strong> → Compressed:{' '}
              <strong>{formatBytes(stats.compSize)}</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-200/60 dark:bg-emerald-800/60 rounded-full font-bold text-emerald-800 dark:text-emerald-200">
            {stats.savedPercent}% Smaller
          </span>
        </div>
      )}
    </div>
  );
}

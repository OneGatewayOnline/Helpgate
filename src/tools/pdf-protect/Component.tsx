'use client';

import React, { useState } from 'react';
import { Lock, Download, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

export default function PdfProtectComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [restrictPrinting, setRestrictPrinting] = useState<boolean>(true);
  const [restrictCopying, setRestrictCopying] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      // Apply genuine ISO 32000 standard AES-256 PDF encryption
      const encryptedBytes = await encryptPDF(new Uint8Array(buffer), password, {
        algorithm: 'AES-256',
        allowPrinting: !restrictPrinting,
        allowCopying: !restrictCopying,
      });

      const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      console.error('Protect failed:', err);
      alert(err?.message || 'Error protecting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Password Protect
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to add password encryption"
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
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security & Password Settings
          </h4>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Document Open Password:
            </label>
            <div className="relative max-w-md">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password..."
                className="w-full px-3 py-2 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={restrictPrinting}
                onChange={(e) => setRestrictPrinting(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Prevent High-Resolution Printing without Author Authorization</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={restrictCopying}
                onChange={(e) => setRestrictCopying(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Prevent Text & Graphics Copying</span>
            </label>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleProtect}
          disabled={!file || !password || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Encrypting PDF...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Encrypt & Protect PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`protected-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Protected PDF
          </a>
        )}
      </div>
    </div>
  );
}

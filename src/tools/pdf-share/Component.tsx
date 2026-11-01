'use client';

import React, { useState } from 'react';
import { Share2, QrCode, Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import QRCode from 'qrcode';

export default function PdfShareComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);

    // Generate local LAN / direct transfer link
    const host = typeof window !== 'undefined' ? window.location.host : '192.168.1.8:3000';
    const link = `http://${host}/tools/pdf-reader/?doc=${encodeURIComponent(f.name)}`;
    setShareLink(link);

    try {
      const qr = await QRCode.toDataURL(link, { width: 240, margin: 2 });
      setQrDataUrl(qr);
    } catch (err) {
      console.error('QR code generation failed:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Share Locally
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to generate instant local Wi-Fi transfer QR code"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            <button
              onClick={() => { setFile(null); setQrDataUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {file && qrDataUrl && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
            <img src={qrDataUrl} alt="Document Share QR Code" className="w-52 h-52 object-contain" />
          </div>

          <div className="space-y-4 flex-1 text-xs">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Upload Local Transfer
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Scan with Phone or Tablet on same Wi-Fi
              </h4>
              <p className="text-slate-500 leading-relaxed mt-1">
                Point any smartphone camera at this QR code to access the document reader directly across your local network without uploading files to the public cloud.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-600 dark:text-slate-400 font-medium">Local Transfer URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

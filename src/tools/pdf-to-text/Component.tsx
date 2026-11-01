'use client';

import React, { useState } from 'react';
import { FileText, Copy, Download, Check, RefreshCw, Search } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { extractAllTextFromPdf } from '@/lib/pdfjs';

export default function PdfToTextComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Extract text from PDF buffer using PDF.js
  const extractTextFromPdf = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setExtractedText('');

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pagesText = await extractAllTextFromPdf(buffer);

      const formatted = pagesText
        .map((text, idx) => `--- PAGE ${idx + 1} ---\n\n${text.trim() || '[No selectable text detected on this page — may be a scanned image]'}`)
        .join('\n\n');

      setExtractedText(formatted);
    } catch (err) {
      console.error('Failed to extract text:', err);
      setExtractedText('Error parsing text from this PDF document. The file may be password protected or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'extracted'}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Extract Text
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={(files: File[]) => files[0] && extractTextFromPdf(files[0])}
          label="Drag & drop your PDF file to extract genuine text directly in your browser"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            <button
              onClick={() => { setFile(null); setExtractedText(''); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Extracting text streams from PDF...</p>
        </div>
      )}

      {extractedText && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                {file?.name}
              </span>
              <span>•</span>
              <span>{wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{charCount.toLocaleString()} characters</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download .TXT
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter or search in extracted text..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Textarea View */}
          <textarea
            readOnly
            value={
              searchTerm
                ? extractedText
                    .split('\n')
                    .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
                    .join('\n')
                : extractedText
            }
            rows={14}
            className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { FileText, Download, RefreshCw, FileCode, Eye } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { extractAllTextFromPdf } from '@/lib/pdfjs';
import JSZip from 'jszip';

export default function PdfToWordComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [wordFileName, setWordFileName] = useState<string>('');
  const [paragraphCount, setParagraphCount] = useState<number>(0);
  const [previewSnippet, setPreviewSnippet] = useState<string>('');

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setDownloadUrl(null);
    setPreviewSnippet('');
  };

  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handleConvertToWord = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pagesText = await extractAllTextFromPdf(buffer);

      const allParagraphs: { isHeading: boolean; isPageBreak: boolean; text: string }[] = [];

      pagesText.forEach((pageText, pIdx) => {
        if (pIdx > 0) {
          allParagraphs.push({ isHeading: false, isPageBreak: true, text: '' });
        }

        const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          allParagraphs.push({
            isHeading: false,
            isPageBreak: false,
            text: `[Page ${pIdx + 1} contains image or non-selectable graphics]`,
          });
        } else {
          lines.forEach((line, lIdx) => {
            const isHeading = lIdx === 0 && line.length < 60;
            allParagraphs.push({ isHeading, isPageBreak: false, text: line });
          });
        }
      });

      setParagraphCount(allParagraphs.length);
      setPreviewSnippet(pagesText.slice(0, 2).join('\n\n').slice(0, 400) + '...');

      // Build real OpenXML .docx with JSZip
      const zip = new JSZip();

      // [Content_Types].xml
      zip.file(
        '[Content_Types].xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
      );

      // _rels/.rels
      zip.file(
        '_rels/.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
      );

      // word/document.xml
      const paragraphsXml = allParagraphs
        .map((p) => {
          if (p.isPageBreak) {
            return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
          }
          const escaped = escapeXml(p.text);
          if (p.isHeading) {
            return `<w:p><w:pPr><w:b/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${escaped}</w:t></w:r></w:p>`;
          }
          return `<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${escaped}</w:t></w:r></w:p>`;
        })
        .join('');

      zip.file(
        'word/document.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="2563EB"/></w:rPr><w:t>${escapeXml(file.name.replace(/\.pdf$/i, ''))}</w:t></w:r></w:p>
    ${paragraphsXml}
  </w:body>
</w:document>`
      );

      const docxBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = URL.createObjectURL(docxBlob);
      setDownloadUrl(url);
      setWordFileName(`${file.name.replace(/\.pdf$/i, '')}.docx`);
    } catch (err) {
      console.error('Failed to convert to Word:', err);
      alert('Error converting PDF to Word.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select PDF File to Convert to Word (.DOCX)
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file to convert to editable Microsoft Word (.docx)"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); setPreviewSnippet(''); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
        <FileCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          Generates genuine Microsoft Word (.DOCX) OpenXML documents. Editable in Microsoft Word, Google Docs, Apple Pages, and LibreOffice with 100% client-side privacy.
        </p>
      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleConvertToWord}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Extracting Content & Building .DOCX...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Convert to Word (.DOCX)
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={wordFileName}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download {wordFileName}
          </a>
        )}
      </div>

      {previewSnippet && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Document Preview ({paragraphCount} paragraphs extracted)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-normal">Ready to download</span>
          </div>
          <pre className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-xs">
            {previewSnippet}
          </pre>
        </div>
      )}
    </div>
  );
}

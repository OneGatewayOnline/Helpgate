'use client';

import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  RotateCw, 
  RotateCcw, 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function PdfRotatorComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const selected = files[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFile(selected);
      setPageCount(doc.getPageCount());
    } catch (err: any) {
      setError(`Failed to read PDF: ${err.message}`);
    }
  };

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to rotate PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          label="Drop a PDF file here to rotate pages"
          sublabel="Rotate all pages clockwise or counter-clockwise. Processed 100% locally."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} • {pageCount} Pages
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          {/* Rotation Options */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Select Rotation Angle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { angle: 90, label: '90° Clockwise', icon: RotateCw },
                { angle: 180, label: '180° Upside Down', icon: RotateCw },
                { angle: 270, label: '90° Counter-Clockwise', icon: RotateCcw },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.angle}
                    onClick={() => {
                      setRotationAngle(opt.angle);
                      setDownloadUrl(null);
                    }}
                    className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      rotationAngle === opt.angle
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rotating {pageCount} pages...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate and Save PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {downloadUrl && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm sm:text-base">PDF Successfully Rotated!</h4>
              <p className="text-xs text-muted-foreground">All {pageCount} pages rotated by {rotationAngle}°.</p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download={`rotated-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Rotated PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

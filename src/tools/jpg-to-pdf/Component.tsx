'use client';

import React, { useState } from 'react';
import { Image, Download, Trash2, ArrowUp, ArrowDown, RotateCw, RefreshCw, FileText } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
}

export default function JpgToPdfComponent() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const newItems: PhotoItem[] = files.map((file) => ({
      id: Math.random().toString(),
      file,
      previewUrl: URL.createObjectURL(file),
      rotation: 0,
    }));
    setPhotos((prev) => [...prev, ...newItems]);
    setDownloadUrl(null);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const rotatePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const movePhoto = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const list = [...photos];
    const [removed] = list.splice(idx, 1);
    list.splice(targetIdx, 0, removed);
    setPhotos(list);
  };

  const handleGeneratePdf = async () => {
    if (photos.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of photos) {
        const imgBytes = await item.file.arrayBuffer();
        const img = await pdfDoc.embedJpg(imgBytes);

        let pWidth = 595.28;
        let pHeight = 841.89;

        if (pageSize === 'letter') {
          pWidth = 612.0;
          pHeight = 792.0;
        } else if (pageSize === 'fit') {
          pWidth = img.width + margin * 2;
          pHeight = img.height + margin * 2;
        }

        const page = pdfDoc.addPage([pWidth, pHeight]);
        const availWidth = pWidth - margin * 2;
        const availHeight = pHeight - margin * 2;

        const scale = Math.min(availWidth / img.width, availHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = margin + (availWidth - drawWidth) / 2;
        const y = margin + (availHeight - drawHeight) / 2;

        page.drawImage(img, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to convert JPG to PDF:', err);
      alert('Error creating PDF from JPG photos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Upload JPG / JPEG Photos
        </h3>
        <FileDropzone
          accept=".jpg,.jpeg"
          multiple={true}
          onFilesSelected={handleFiles}
          label="Drag & drop JPG photos here, or click to browse multiple files"
        />
      </div>

      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{photos.length} photos loaded • Reorder and rotate before converting</span>
            <button
              onClick={() => setPhotos([])}
              className="text-rose-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map((p, idx) => (
              <div
                key={p.id}
                className="relative p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl group"
              >
                <div className="w-full h-28 overflow-hidden rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-900 mb-2">
                  <img
                    src={p.previewUrl}
                    alt={p.file.name}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="max-h-full max-w-full object-contain transition-transform"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="truncate max-w-[60px] font-mono">{idx + 1}. {p.file.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => movePhoto(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 hover:text-indigo-600 disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <button
                      onClick={() => movePhoto(idx, 1)}
                      disabled={idx === photos.length - 1}
                      className="p-1 hover:text-indigo-600 disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <button
                      onClick={() => rotatePhoto(p.id)}
                      className="p-1 hover:text-indigo-600"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removePhoto(p.id)}
                      className="p-1 hover:text-rose-600"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Page Format</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                <option value="a4">Standard A4 (Portrait)</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Photo Dimensions</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Page Margins: {margin}pt</label>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleGeneratePdf}
          disabled={photos.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Compiling PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Convert {photos.length} Photos to PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="photos.pdf"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Compiled PDF
          </a>
        )}
      </div>
    </div>
  );
}

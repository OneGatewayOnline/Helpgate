'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Settings2,
  FileStack
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

type PageSize = 'a4' | 'letter' | 'fit';
type PageOrientation = 'portrait' | 'landscape';

export default function ImagesToPdfComponent() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (files: File[]) => {
    setError(null);
    setDownloadUrl(null);

    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setError('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    const newItems: ImageItem[] = validImages.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setDownloadUrl(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
    setDownloadUrl(null);
  };

  // Convert image to JPEG/PNG bytes if needed (for WebP/unsupported formats)
  const getEmbeddableBytes = async (file: File): Promise<{ bytes: Uint8Array; type: 'jpeg' | 'png' }> => {
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
      const buffer = await file.arrayBuffer();
      return { bytes: new Uint8Array(buffer), type: 'jpeg' };
    }
    if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      const buffer = await file.arrayBuffer();
      return { bytes: new Uint8Array(buffer), type: 'png' };
    }

    // Convert via canvas (for WebP, AVIF, GIF, etc.) to JPEG
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context error'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob failed'));
              return;
            }
            const buffer = await blob.arrayBuffer();
            resolve({ bytes: new Uint8Array(buffer), type: 'jpeg' });
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      // Standard dimensions in points (72 points = 1 inch)
      const A4 = [595.28, 841.89];
      const LETTER = [612.0, 792.0];

      for (const item of images) {
        const { bytes, type } = await getEmbeddableBytes(item.file);
        const embeddedImage = type === 'jpeg' ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;

        if (pageSize === 'a4') {
          const dims = orientation === 'portrait' ? A4 : [A4[1], A4[0]];
          pageWidth = dims[0];
          pageHeight = dims[1];
        } else if (pageSize === 'letter') {
          const dims = orientation === 'portrait' ? LETTER : [LETTER[1], LETTER[0]];
          pageWidth = dims[0];
          pageHeight = dims[1];
        } else {
          // Fit to image
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted dimensions within margins
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        // Center on page
        const x = margin + (availableWidth - drawWidth) / 2;
        const y = margin + (availableHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
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
      setOutputSize(blob.size);
    } catch (err: any) {
      setError(`Failed to create PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone
        accept="image/*"
        multiple={true}
        onFilesSelected={handleFilesAdded}
        label="Drop photos or images here, or click to upload"
        sublabel="Supports JPG, PNG, WebP, GIF. Converts directly into a clean, unified PDF."
      />

      {images.length > 0 && (
        <div className="space-y-6">
          {/* Options Bar */}
          <div className="p-4 rounded-xl border border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Page Size */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value as PageSize);
                    setDownloadUrl(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold outline-none"
                >
                  <option value="a4">A4 Standard</option>
                  <option value="letter">US Letter</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              {/* Orientation */}
              {pageSize !== 'fit' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Orientation:</span>
                  <select
                    value={orientation}
                    onChange={(e) => {
                      setOrientation(e.target.value as PageOrientation);
                      setDownloadUrl(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold outline-none"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              )}

              {/* Margins */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Margin:</span>
                <select
                  value={margin}
                  onChange={(e) => {
                    setMargin(parseInt(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold outline-none"
                >
                  <option value={0}>No Margin (Edge-to-Edge)</option>
                  <option value={20}>Standard (20pt)</option>
                  <option value={40}>Wide Margin (40pt)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setImages([]);
                setDownloadUrl(null);
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear All ({images.length})
            </button>
          </div>

          {/* Image List Preview & Reorder */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all"
              >
                <div className="relative aspect-[3/4] bg-secondary/30 flex items-center justify-center p-2">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] font-bold">
                    #{idx + 1}
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between gap-1 border-t border-border bg-card">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move left"
                    >
                      <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <button
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20"
                      title="Move right"
                    >
                      <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeImage(item.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button
              onClick={handleConvertToPdf}
              disabled={isProcessing || images.length === 0}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting {images.length} Photos to PDF...</span>
                </>
              ) : (
                <>
                  <FileStack className="w-4 h-4" />
                  <span>Convert {images.length} Images to PDF</span>
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
              <h4 className="font-semibold text-sm sm:text-base">PDF Generated Successfully!</h4>
              <p className="text-xs text-muted-foreground">
                Output size: {outputSize ? formatBytes(outputSize) : ''} • {images.length} pages
              </p>
            </div>
          </div>

          <a
            href={downloadUrl}
            download="helpgate-images.pdf"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}

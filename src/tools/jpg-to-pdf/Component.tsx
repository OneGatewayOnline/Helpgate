'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ImageIcon, 
  Download, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  RotateCcw, 
  RefreshCw, 
  FileText,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Layers,
  Plus,
  ArrowUpDown,
  Sparkles,
  Maximize2,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';
import { formatBytes } from '@/lib/utils';

export interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
  naturalWidth: number;
  naturalHeight: number;
}

export const PAGE_SIZES = {
  a4: { name: 'A4 Standard (210 × 297 mm)', width: 595.28, height: 841.89, tag: 'Standard' },
  letter: { name: 'US Letter (8.5 × 11 in)', width: 612.0, height: 792.0, tag: 'Standard' },
  fit: { name: 'Fit to Photo Dimensions', width: 0, height: 0, tag: 'No Borders' },
  a3: { name: 'A3 Poster (297 × 420 mm)', width: 841.89, height: 1190.55, tag: 'Large' },
  a5: { name: 'A5 Booklet (148 × 210 mm)', width: 419.53, height: 595.28, tag: 'Compact' },
  legal: { name: 'US Legal (8.5 × 14 in)', width: 612.0, height: 1008.0, tag: 'Official' },
  tabloid: { name: 'Tabloid / Ledger (11 × 17 in)', width: 792.0, height: 1224.0, tag: 'Large' },
  photo4x6: { name: 'Photo (4 × 6 in)', width: 288.0, height: 432.0, tag: 'Photo' },
  photo5x7: { name: 'Photo (5 × 7 in)', width: 360.0, height: 504.0, tag: 'Photo' },
  business_card: { name: 'Business Card (3.5 × 2 in)', width: 252.0, height: 144.0, tag: 'Card' },
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;
export type OrientationMode = 'auto' | 'portrait' | 'landscape';

interface ProcessedImageResult {
  bytes: Uint8Array;
  width: number;
  height: number;
}

/**
 * Normalizes EXIF orientation, applies manual user rotation, fills transparent areas with white,
 * and outputs clean JPEG bytes ready for pdf-lib embedding.
 */
async function processImageForPdf(
  file: File, 
  rotationDegrees: number,
  quality: number = 0.90
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = img.naturalWidth || img.width || 800;
      const naturalHeight = img.naturalHeight || img.height || 600;

      // When rotated by 90 or 270 degrees, dimensions are swapped
      const normalizedRot = ((rotationDegrees % 360) + 360) % 360;
      const isSideways = normalizedRot === 90 || normalizedRot === 270;
      const canvasWidth = isSideways ? naturalHeight : naturalWidth;
      const canvasHeight = isSideways ? naturalWidth : naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Crisp white background so transparent PNG/WebP files don't turn black
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Rotate around the center of the canvas
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((normalizedRot * Math.PI) / 180);
      ctx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image to canvas blob'));
            return;
          }
          const arrayBuffer = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(arrayBuffer),
            width: canvasWidth,
            height: canvasHeight,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

export default function JpgToPdfComponent() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeKey>('a4');
  const [orientation, setOrientation] = useState<OrientationMode>('auto');
  const [margin, setMargin] = useState<number>(20);
  const [quality, setQuality] = useState<number>(0.90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Measure natural dimensions when files are loaded
  const handleFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name));
    if (valid.length === 0) return;

    valid.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const item: PhotoItem = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl,
          rotation: 0,
          naturalWidth: img.naturalWidth || 800,
          naturalHeight: img.naturalHeight || 600,
        };
        setPhotos((prev) => [...prev, item]);
      };
      img.onerror = () => {
        const item: PhotoItem = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl,
          rotation: 0,
          naturalWidth: 800,
          naturalHeight: 600,
        };
        setPhotos((prev) => [...prev, item]);
      };
      img.src = previewUrl;
    });

    setDownloadUrl(null);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setDownloadUrl(null);
  };

  const rotatePhoto = (id: string, deltaDegrees: number) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newRot = ((p.rotation + deltaDegrees) % 360 + 360) % 360;
        return { ...p, rotation: newRot };
      })
    );
    setDownloadUrl(null);
  };

  const rotateAll = (deltaDegrees: number) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: ((p.rotation + deltaDegrees) % 360 + 360) % 360,
      }))
    );
    setDownloadUrl(null);
  };

  const movePhoto = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const list = [...photos];
    const [removed] = list.splice(idx, 1);
    list.splice(targetIdx, 0, removed);
    setPhotos(list);
    setDownloadUrl(null);
  };

  const sortPhotosByName = () => {
    const sorted = [...photos].sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
    setPhotos(sorted);
    setDownloadUrl(null);
  };

  const reversePhotosOrder = () => {
    setPhotos((prev) => [...prev].reverse());
    setDownloadUrl(null);
  };

  // Drag and drop reordering handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const list = [...photos];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(idx, 0, draggedItem);
    setPhotos(list);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDownloadUrl(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Total input size
  const totalInputBytes = photos.reduce((acc, p) => acc + p.file.size, 0);

  // Generate the PDF
  const handleGeneratePdf = async () => {
    if (photos.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: photos.length, percent: 0 });

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];
        setProgress({
          current: i + 1,
          total: photos.length,
          percent: Math.round(((i + 1) / photos.length) * 100),
        });

        // Normalize EXIF and apply user rotation via Canvas
        const processed = await processImageForPdf(item.file, item.rotation, quality);
        const embeddedImg = await pdfDoc.embedJpg(processed.bytes);

        const imgWidth = processed.width;
        const imgHeight = processed.height;
        const isImageLandscape = imgWidth > imgHeight;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === 'fit') {
          // Fit exact photo dimensions
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        } else {
          const baseDim = PAGE_SIZES[pageSize];
          const portraitW = Math.min(baseDim.width, baseDim.height);
          const portraitH = Math.max(baseDim.width, baseDim.height);

          let useLandscape: boolean;
          if (orientation === 'auto') {
            // Smart Match: horizontal images get landscape pages, vertical images get portrait pages
            useLandscape = isImageLandscape;
          } else if (orientation === 'landscape') {
            useLandscape = true;
          } else {
            useLandscape = false;
          }

          pageWidth = useLandscape ? portraitH : portraitW;
          pageHeight = useLandscape ? portraitW : portraitH;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const availWidth = Math.max(1, pageWidth - margin * 2);
        const availHeight = Math.max(1, pageHeight - margin * 2);

        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        // Perfectly center the image on the page
        const x = margin + (availWidth - drawWidth) / 2;
        const y = margin + (availHeight - drawHeight) / 2;

        page.drawImage(embeddedImg, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        // Allow UI to breathe
        await new Promise((res) => setTimeout(res, 10));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setOutputSize(blob.size);
    } catch (err) {
      console.error('Failed to convert photos to PDF:', err);
      alert('Error creating PDF from photos. Please ensure files are valid image formats.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <div>
        <FileDropzone
          accept="image/*"
          multiple={true}
          onFilesSelected={handleFiles}
          label="Drag & drop JPG, PNG, or WebP photos here, or click to browse"
          sublabel="100% Client-Side Private • Instant zero-cloud processing with full rotation & multi-page size control."
        />
      </div>

      {photos.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Summary & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                {photos.length}
              </span>
              <span className="text-xs font-semibold text-foreground">
                {photos.length === 1 ? '1 Photo Loaded' : `${photos.length} Photos Loaded`}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({formatBytes(totalInputBytes)})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <input
                ref={additionalFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(Array.from(e.target.files));
                }}
              />

              <button
                type="button"
                onClick={() => additionalFileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all"
                title="Add more photos"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all"
                title="Rotate all photos 90° clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Rotate All</span>
              </button>

              <button
                type="button"
                onClick={sortPhotosByName}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all hidden sm:flex"
                title="Sort photos alphabetically"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Sort Name</span>
              </button>

              <button
                type="button"
                onClick={reversePhotosOrder}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all hidden md:flex"
                title="Reverse order of photos"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Reverse</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotos([]);
                  setDownloadUrl(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all ml-1"
                title="Remove all photos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Photos Grid with Drag & Drop and Instant Rotation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((p, idx) => {
              // Current visual orientation after rotation
              const isSideways = p.rotation === 90 || p.rotation === 270;
              const currentW = isSideways ? p.naturalHeight : p.naturalWidth;
              const currentH = isSideways ? p.naturalWidth : p.naturalHeight;
              const isLandscape = currentW > currentH;

              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={`relative flex flex-col justify-between rounded-2xl border bg-card p-2 text-foreground transition-all duration-200 group select-none ${
                    draggedIndex === idx
                      ? 'opacity-40 border-primary scale-95'
                      : dragOverIndex === idx
                      ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                      : 'border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div 
                    onClick={() => setPreviewPhoto(p)}
                    className="relative w-full aspect-[4/3] rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center cursor-zoom-in mb-2"
                  >
                    <img
                      src={p.previewUrl}
                      alt={p.file.name}
                      style={{
                        transform: `rotate(${p.rotation}deg)`,
                      }}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out"
                    />

                    {/* Page Number Badge */}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white font-mono text-[10px] font-bold shadow-sm">
                      #{idx + 1}
                    </span>

                    {/* Orientation Badge */}
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold tracking-tight">
                      {isLandscape ? 'Landscape' : 'Portrait'}
                    </span>

                    {/* Zoom Overlay on Hover */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="p-1 rounded-full bg-black/60 text-white">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="px-0.5 mb-2">
                    <p className="text-[11px] font-medium text-foreground truncate" title={p.file.name}>
                      {p.file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {formatBytes(p.file.size)} • {p.rotation !== 0 ? `${p.rotation}°` : `${currentW}×${currentH}`}
                    </p>
                  </div>

                  {/* Interactive Controls Toolbar */}
                  <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/60">
                    {/* Reordering */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => movePhoto(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                        title="Move left / earlier in PDF"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(idx, 1)}
                        disabled={idx === photos.length - 1}
                        className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                        title="Move right / later in PDF"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rotation & Removal */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => rotatePhoto(p.id, -90)}
                        className="p-1 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                        title="Rotate 90° Counter-Clockwise"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rotatePhoto(p.id, 90)}
                        className="p-1 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Configuration Options Card */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Sliders className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Document Settings & Formatting
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Page Format */}
              <div>
                <label className="block font-medium text-foreground mb-1.5">
                  Page Size & Format
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value as PageSizeKey);
                    setDownloadUrl(null);
                  }}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary transition-all"
                >
                  <optgroup label="Standard Paper">
                    <option value="a4">{PAGE_SIZES.a4.name}</option>
                    <option value="letter">{PAGE_SIZES.letter.name}</option>
                    <option value="legal">{PAGE_SIZES.legal.name}</option>
                  </optgroup>
                  <optgroup label="Responsive & Custom">
                    <option value="fit">{PAGE_SIZES.fit.name}</option>
                  </optgroup>
                  <optgroup label="Specialty Sizes">
                    <option value="a3">{PAGE_SIZES.a3.name}</option>
                    <option value="a5">{PAGE_SIZES.a5.name}</option>
                    <option value="tabloid">{PAGE_SIZES.tabloid.name}</option>
                    <option value="photo4x6">{PAGE_SIZES.photo4x6.name}</option>
                    <option value="photo5x7">{PAGE_SIZES.photo5x7.name}</option>
                    <option value="business_card">{PAGE_SIZES.business_card.name}</option>
                  </optgroup>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {pageSize === 'fit' 
                    ? 'Pages perfectly wrap each photo with zero borders.' 
                    : `Uses standard ${pageSize.toUpperCase()} dimensions.`}
                </p>
              </div>

              {/* Page Orientation */}
              <div>
                <label className="block font-medium text-foreground mb-1.5">
                  Page Orientation
                </label>
                <select
                  value={orientation}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => {
                    setOrientation(e.target.value as OrientationMode);
                    setDownloadUrl(null);
                  }}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary disabled:opacity-40 transition-all"
                >
                  <option value="auto">Auto (Smart Match per Photo)</option>
                  <option value="portrait">Always Portrait (Vertical)</option>
                  <option value="landscape">Always Landscape (Horizontal)</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {orientation === 'auto'
                    ? 'Adapts each page to the image orientation automatically.'
                    : orientation === 'portrait'
                    ? 'Forces all pages to stand vertically.'
                    : 'Forces all pages to orient horizontally.'}
                </p>
              </div>

              {/* Page Margins */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-foreground">
                    Page Margin
                  </label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {margin === 0 ? 'Borderless (0 pt)' : `${margin} pt`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={5}
                    value={margin}
                    onChange={(e) => {
                      setMargin(Number(e.target.value));
                      setDownloadUrl(null);
                    }}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <button 
                    type="button" 
                    onClick={() => { setMargin(0); setDownloadUrl(null); }}
                    className={`hover:underline ${margin === 0 ? 'text-primary font-bold' : ''}`}
                  >
                    None
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setMargin(15); setDownloadUrl(null); }}
                    className={`hover:underline ${margin === 15 ? 'text-primary font-bold' : ''}`}
                  >
                    Narrow
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setMargin(30); setDownloadUrl(null); }}
                    className={`hover:underline ${margin === 30 ? 'text-primary font-bold' : ''}`}
                  >
                    Standard
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setMargin(50); setDownloadUrl(null); }}
                    className={`hover:underline ${margin === 50 ? 'text-primary font-bold' : ''}`}
                  >
                    Wide
                  </button>
                </div>
              </div>

              {/* Image Quality / Compression */}
              <div>
                <label className="block font-medium text-foreground mb-1.5">
                  Image Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => {
                    setQuality(Number(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary transition-all"
                >
                  <option value={0.95}>Original / Sharp (95% Quality)</option>
                  <option value={0.88}>Balanced (88% Quality — Recommended)</option>
                  <option value={0.72}>Compact (72% Quality — Smallest File)</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {quality >= 0.90 
                    ? 'Maximum photo fidelity & crystal-clear printing.' 
                    : 'Optimized for quick sharing, email, and messaging.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar during compilation */}
      {isProcessing && progress && (
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-foreground">
            <span className="font-semibold flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
              Processing photo {progress.current} of {progress.total}...
            </span>
            <span className="font-mono font-bold text-primary">{progress.percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Convert Button & Download Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={photos.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Compiling {photos.length} Photos into PDF...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Convert {photos.length > 0 ? `${photos.length} Photos` : ''} to PDF</span>
            </>
          )}
        </button>

        {downloadUrl && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border border-border text-foreground hover:bg-secondary font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>Preview PDF</span>
            </a>

            <a
              href={downloadUrl}
              download="converted-photos.pdf"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF {outputSize ? `(${formatBytes(outputSize)})` : ''}</span>
            </a>
          </div>
        )}
      </div>

      {/* Full-Screen Photo Zoom Modal */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-card rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate max-w-sm">
                  {previewPhoto.file.name}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  ({formatBytes(previewPhoto.file.size)})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => rotatePhoto(previewPhoto.id, 90)}
                  className="p-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-all"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh] bg-black/20">
              <img
                src={previewPhoto.previewUrl}
                alt={previewPhoto.file.name}
                style={{
                  transform: `rotate(${previewPhoto.rotation}deg)`,
                }}
                className="max-h-[65vh] max-w-full object-contain rounded-lg transition-transform duration-300"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-secondary/10">
              <span>Current Rotation: {previewPhoto.rotation}°</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

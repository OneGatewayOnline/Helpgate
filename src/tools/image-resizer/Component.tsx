'use client';

import React, { useState, useRef } from 'react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { formatBytes } from '@/lib/utils';
import { 
  Download, 
  Lock, 
  Unlock, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageResizerComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [format, setFormat] = useState<ImageFormat>('image/webp');
  const [quality, setQuality] = useState<number>(85);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileSelected = (files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const selected = files[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const objectUrl = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      setFile(selected);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setPreviewUrl(objectUrl);
      imgRef.current = img;
    };
    img.src = objectUrl;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (aspectRatioLocked && originalWidth > 0) {
      setHeight(Math.round((val / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (aspectRatioLocked && originalHeight > 0) {
      setWidth(Math.round((val / originalHeight) * originalWidth));
    }
  };

  const handleProcessImage = () => {
    if (!imgRef.current || width <= 0 || height <= 0) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgRef.current, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Could not encode image.');
            return;
          }
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setOutputSize(blob.size);
        },
        format,
        quality / 100
      );
    } catch (err: any) {
      setError(`Failed to resize image: ${err.message}`);
    }
  };

  const getExtension = () => {
    switch (format) {
      case 'image/jpeg': return '.jpg';
      case 'image/png': return '.png';
      case 'image/webp': return '.webp';
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept="image/*"
          multiple={false}
          onFilesSelected={handleFileSelected}
          label="Drop an image here to resize, compress, or convert"
          sublabel="Supports PNG, JPG, WebP, GIF. All processing happens 100% inside your browser."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm text-foreground">{file.name}</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setDownloadUrl(null);
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Change Image
              </button>
            </div>

            {/* Dimension Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Dimensions (Pixels)</label>
                <button
                  onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {aspectRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{aspectRatioLocked ? 'Aspect Ratio Locked' : 'Unlocked'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-muted-foreground mb-1 block">Width (px)</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground mb-1 block">Height (px)</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Original: {originalWidth} × {originalHeight} px ({formatBytes(file.size)})
              </p>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Target Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['image/webp', 'image/jpeg', 'image/png'] as ImageFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setFormat(fmt);
                      setDownloadUrl(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      format === fmt
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPEG / WebP) */}
            {format !== 'image/png' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase text-muted-foreground">Quality Compression</span>
                  <span className="font-mono text-foreground font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseInt(e.target.value));
                    setDownloadUrl(null);
                  }}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={handleProcessImage}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              Resize & Convert Image
            </button>
          </div>

          {/* Preview & Download Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="border border-border rounded-xl p-4 bg-secondary/20 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[340px] max-w-full object-contain rounded-lg shadow-sm"
                />
              )}
            </div>

            {downloadUrl && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Ready! Size: {outputSize ? formatBytes(outputSize) : ''}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Savings: {outputSize && file ? `${Math.round(((file.size - outputSize) / file.size) * 100)}%` : 'Optimized'}
                    </p>
                  </div>
                </div>

                <a
                  href={downloadUrl}
                  download={`helpgate-resized${getExtension()}`}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

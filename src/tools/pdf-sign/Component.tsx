'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Download, Trash2, CheckCircle2, RefreshCw, Type, Move } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument } from 'pdf-lib';

export default function PdfSignComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState<string>('');
  const [inkColor, setInkColor] = useState<string>('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [positionPreset, setPositionPreset] = useState<'bottom-right' | 'bottom-left' | 'center' | 'custom'>('bottom-right');
  const [customX, setCustomX] = useState<number>(400);
  const [customY, setCustomY] = useState<number>(80);
  const [sigScale, setSigScale] = useState<number>(160);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const hasDrawnRef = useRef<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Inspect PDF when uploaded
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const pdfFile = files[0];
    setFile(pdfFile);
    setDownloadUrl(null);

    try {
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setTargetPage(count); // Default to last page where signatures usually go
    } catch (err) {
      console.error('Error loading PDF:', err);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    hasDrawnRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  };

  // Generate PNG Data URL for signature
  const getSignatureDataUrl = (): string | null => {
    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawnRef.current) return null;
      return canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) return null;
      const offscreen = document.createElement('canvas');
      offscreen.width = 600;
      offscreen.height = 200;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;
      ctx.font = 'italic 56px "Brush Script MT", "Caveat", "Segoe Script", cursive';
      ctx.fillStyle = inkColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 300, 100);
      return offscreen.toDataURL('image/png');
    }
  };

  const handleSignPdf = async () => {
    if (!file) return;
    const sigDataUrl = getSignatureDataUrl();
    if (!sigDataUrl) {
      alert('Please provide a signature by drawing or typing your name.');
      return;
    }

    setIsProcessing(true);
    try {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const signatureImage = await pdfDoc.embedPng(sigDataUrl);
      const sigDims = signatureImage.scaleToFit(sigScale, sigScale * 0.5);

      const pages = pdfDoc.getPages();
      const pageIndex = Math.min(Math.max(1, targetPage), pages.length) - 1;
      const page = pages[pageIndex];
      const { width: pWidth, height: pHeight } = page.getSize();

      let x = customX;
      let y = customY;

      if (positionPreset === 'bottom-right') {
        x = pWidth - sigDims.width - 50;
        y = 50;
      } else if (positionPreset === 'bottom-left') {
        x = 50;
        y = 50;
      } else if (positionPreset === 'center') {
        x = (pWidth - sigDims.width) / 2;
        y = (pHeight - sigDims.height) / 2;
      }

      page.drawImage(signatureImage, {
        x,
        y,
        width: sigDims.width,
        height: sigDims.height,
      });

      const signedBytes = await pdfDoc.save();
      const blob = new Blob([signedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to sign PDF:', err);
      alert('Failed to sign document. Please check the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Upload Document */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          1. Select PDF Document to Sign
        </h3>
        <FileDropzone
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your PDF file here, or click to browse"
        />
        {file && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB) — {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); }}
              className="text-xs text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Create Signature */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            2. Create Your Signature
          </h3>
          <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setSignMode('draw')}
              className={`px-3 py-1 rounded-md transition-colors ${
                signMode === 'draw'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => setSignMode('type')}
              className={`px-3 py-1 rounded-md transition-colors ${
                signMode === 'type'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Type
            </button>
          </div>
        </div>

        {/* Ink & Style Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Ink Color:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'Black', color: '#0f172a' },
                { label: 'Blue', color: '#1d4ed8' },
                { label: 'Dark Navy', color: '#1e3a8a' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setInkColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    inkColor === c.color ? 'scale-110 border-indigo-500 shadow' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {signMode === 'draw' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Stroke:</span>
              <select
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                <option value={2}>Fine (2px)</option>
                <option value={3}>Medium (3px)</option>
                <option value={5}>Bold (5px)</option>
              </select>
            </div>
          )}
        </div>

        {/* Draw Canvas or Type Input */}
        {signMode === 'draw' ? (
          <div>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair touch-none"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs flex items-center gap-1 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Draw your signature above using your mouse, trackpad, or touchscreen stylus
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your full legal name..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm"
            />
            {typedName.trim() && (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center shadow-inner">
                <span
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                    fontSize: '2.5rem',
                    color: inkColor,
                  }}
                >
                  {typedName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Placement & Scaling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Page to Sign
          </label>
          <select
            value={targetPage}
            onChange={(e) => setTargetPage(Number(e.target.value))}
            disabled={!file}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
          >
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pg) => (
              <option key={pg} value={pg}>
                Page {pg} {pg === pageCount ? '(Last Page)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Placement Position
          </label>
          <select
            value={positionPreset}
            onChange={(e) => setPositionPreset(e.target.value as any)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
          >
            <option value="bottom-right">Bottom Right (Standard)</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="center">Center</option>
            <option value="custom">Custom Coordinates (X, Y)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Signature Width: {sigScale}px
          </label>
          <input
            type="range"
            min={80}
            max={300}
            step={10}
            value={sigScale}
            onChange={(e) => setSigScale(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {positionPreset === 'custom' && (
          <div className="col-span-full grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">X Offset (pt)</label>
              <input
                type="number"
                value={customX}
                onChange={(e) => setCustomX(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Y Offset from bottom (pt)</label>
              <input
                type="number"
                value={customY}
                onChange={(e) => setCustomY(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleSignPdf}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Signing Document...
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4" />
              Sign & Embed onto PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`signed-${file?.name || 'document.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Signed PDF
          </a>
        )}
      </div>
    </div>
  );
}

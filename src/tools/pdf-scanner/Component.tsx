'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, RefreshCw, CheckCircle2, Sliders, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function PdfScannerComponent() {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [capturedScans, setCapturedScans] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'document' | 'grayscale' | 'color'>('document');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      mediaStreamRef.current = stream;
      setStreamActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access device camera. Please grant camera permissions, or upload a photo of the document.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setStreamActive(false);
  };

  // Ensure video element receives stream once mounted
  useEffect(() => {
    if (streamActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch((e) => console.log('Video play error:', e));
    }
  }, [streamActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const applyFilterToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (filterMode === 'document') {
      // High contrast B&W document filter
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = v > 135 ? 255 : 0;
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (filterMode === 'grayscale') {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  const capturePage = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyFilterToCanvas(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedScans((prev) => [...prev, dataUrl]);
    setDownloadUrl(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            applyFilterToCanvas(ctx, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            setCapturedScans((prev) => [...prev, dataUrl]);
            setDownloadUrl(null);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(f);
    });
  };

  const removeScan = (idx: number) => {
    setCapturedScans(capturedScans.filter((_, i) => i !== idx));
  };

  const handleGeneratePdf = async () => {
    if (capturedScans.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const dataUrl of capturedScans) {
        const response = await fetch(dataUrl);
        const imgBuffer = await response.arrayBuffer();
        const img = await pdfDoc.embedJpg(imgBuffer);

        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const margin = 20;
        const availWidth = 595.28 - margin * 2;
        const availHeight = 841.89 - margin * 2;

        const scale = Math.min(availWidth / img.width, availHeight / img.height);
        const dWidth = img.width * scale;
        const dHeight = img.height * scale;

        page.drawImage(img, {
          x: margin + (availWidth - dWidth) / 2,
          y: margin + (availHeight - dHeight) / 2,
          width: dWidth,
          height: dHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Scan compile failed:', err);
      alert('Error creating PDF scan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Viewfinder Section */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm">Document Camera Scanner</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {['document', 'grayscale', 'color'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m as any)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filterMode === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {m === 'document' ? 'Enhanced B&W' : m}
              </button>
            ))}
          </div>
        </div>

        {streamActive ? (
          <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[420px] object-cover"
            />
            {/* Viewfinder Guideline Box */}
            <div className="absolute inset-8 border-2 border-indigo-400/60 rounded-xl pointer-events-none" />
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">Camera is paused</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Scan paper documents directly with your phone/webcam or upload photos from your device.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {!streamActive ? (
            <button
              onClick={startCamera}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Activate Camera
            </button>
          ) : (
            <>
              <button
                onClick={capturePage}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Capture Page
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Pause Camera
              </button>
            </>
          )}

          {/* Upload Document Photo fallback */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Scanned Pages Tray */}
      {capturedScans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Scanned Pages ({capturedScans.length})
            </span>
            <button
              onClick={() => setCapturedScans([])}
              className="text-rose-600 hover:underline text-xs"
            >
              Clear All Scans
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {capturedScans.map((scan, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm group"
              >
                <img src={scan} alt={`Scan page ${idx + 1}`} className="w-full h-32 object-cover" />
                <div className="p-1.5 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">#{idx + 1}</span>
                  <button
                    onClick={() => removeScan(idx)}
                    className="p-1 hover:text-rose-600 text-slate-400"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PDF Compile Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
            <button
              onClick={handleGeneratePdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Compiling Scanned PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Compile {capturedScans.length} {capturedScans.length === 1 ? 'Page' : 'Pages'} to PDF
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="scanned-document.pdf"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Scanned PDF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

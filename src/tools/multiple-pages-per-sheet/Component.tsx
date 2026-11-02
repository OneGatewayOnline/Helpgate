'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sliders,
  LayoutGrid,
  Maximize2,
  FileCheck2,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, rgb, PDFName } from 'pdf-lib';
import { formatBytes } from '@/lib/utils';

// Standard paper dimensions in points (72 pt = 1 inch, 1 mm = 2.83465 pt)
const MM_TO_PT = 72 / 25.4;

export const SHEET_SIZES = {
  a4: { name: 'A4 (210 × 297 mm)', width: 595.28, height: 841.89 },
  letter: { name: 'US Letter (8.5 × 11 in)', width: 612.0, height: 792.0 },
  legal: { name: 'US Legal (8.5 × 14 in)', width: 612.0, height: 1008.0 },
  a3: { name: 'A3 (297 × 420 mm)', width: 841.89, height: 1190.55 },
  a5: { name: 'A5 (148 × 210 mm)', width: 419.53, height: 595.28 },
  tabloid: { name: 'Tabloid / Ledger (11 × 17 in)', width: 792.0, height: 1224.0 },
} as const;

export type SheetSizeKey = keyof typeof SHEET_SIZES;
export type SheetOrientation = 'auto' | 'portrait' | 'landscape';
export type ReadingOrder = 'row-ltr' | 'row-rtl' | 'col-ltr' | 'col-rtl';
export type PagesPerSheet = 1 | 2 | 4 | 6 | 8 | 9 | 16;

interface UploadedPdfItem {
  id: string;
  file: File;
  pageCount: number;
  firstPageAspect: number; // width / height
}

export default function MultiplePagesPerSheetComponent() {
  const [files, setFiles] = useState<UploadedPdfItem[]>([]);
  const [pagesPerSheet, setPagesPerSheet] = useState<PagesPerSheet>(4); // Default 4 as requested
  const [withBorder, setWithBorder] = useState<boolean>(true);
  const [readingOrder, setReadingOrder] = useState<ReadingOrder>('row-ltr');
  const [sheetSize, setSheetSize] = useState<SheetSizeKey>('a4');
  const [orientation, setOrientation] = useState<SheetOrientation>('auto');
  const [outerMarginMm, setOuterMarginMm] = useState<number>(5);
  const [innerMarginMm, setInnerMarginMm] = useState<number>(3);
  const [customFilename, setCustomFilename] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; percent: number } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [outputSheetCount, setOutputSheetCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = async (newFiles: File[]) => {
    setError(null);
    setDownloadUrl(null);

    const pdfFiles = newFiles.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setError('Please select valid PDF files.');
      return;
    }

    const loadedItems: UploadedPdfItem[] = [];

    for (const file of pdfFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        let aspect = 0.707; // Default A4 portrait
        if (count > 0) {
          const firstPage = doc.getPage(0);
          aspect = firstPage.getWidth() / firstPage.getHeight();
        }

        loadedItems.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          pageCount: count,
          firstPageAspect: aspect,
        });
      } catch (err) {
        console.error('Failed to parse PDF:', file.name, err);
        setError(`Could not read "${file.name}". Ensure the PDF is not password-protected.`);
      }
    }

    setFiles((prev) => {
      const updated = [...prev, ...loadedItems];
      if (!customFilename && updated.length > 0) {
        const base = updated[0].file.name.replace(/\.pdf$/i, '');
        setCustomFilename(`${base}-${pagesPerSheet}pages-per-sheet.pdf`);
      }
      return updated;
    });
  };

  // Keep filename updated if user changes pagesPerSheet
  useEffect(() => {
    if (files.length > 0) {
      const base = files[0].file.name.replace(/\.pdf$/i, '');
      setCustomFilename(`${base}-${pagesPerSheet}pages-per-sheet.pdf`);
    }
  }, [pagesPerSheet, files]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDownloadUrl(null);
  };

  const clearAll = () => {
    setFiles([]);
    setDownloadUrl(null);
    setOutputSize(null);
    setError(null);
  };

  const totalInputPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalInputBytes = files.reduce((acc, f) => acc + f.file.size, 0);
  const estimatedSheets = Math.ceil(totalInputPages / pagesPerSheet);

  // Compute grid rows and columns based on pagesPerSheet and target aspect
  const getGridDimensions = (count: PagesPerSheet, isSheetLandscape: boolean) => {
    switch (count) {
      case 1:
        return { rows: 1, cols: 1 };
      case 2:
        return isSheetLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
      case 4:
        return { rows: 2, cols: 2 };
      case 6:
        return isSheetLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
      case 8:
        return isSheetLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
      case 9:
        return { rows: 3, cols: 3 };
      case 16:
        return { rows: 4, cols: 4 };
      default:
        return { rows: 2, cols: 2 };
    }
  };

  // Determine whether the sheet should be landscape
  const resolveSheetLandscape = (): boolean => {
    if (orientation === 'landscape') return true;
    if (orientation === 'portrait') return false;

    // 'auto' orientation:
    // Determine average source page aspect ratio
    const avgSrcAspect = files.length > 0 ? files[0].firstPageAspect : 0.707;
    const isSourceLandscape = avgSrcAspect > 1.0;

    // For 2-up of portrait pages: 2 vertical pages side by side fit best on Landscape
    if (pagesPerSheet === 2) {
      return !isSourceLandscape;
    }
    // For 4-up (2x2): preserves the original source orientation!
    if (pagesPerSheet === 4 || pagesPerSheet === 9 || pagesPerSheet === 16) {
      return isSourceLandscape;
    }
    // For 6-up / 8-up: generally wider
    if (pagesPerSheet === 6 || pagesPerSheet === 8) {
      return true;
    }

    return false;
  };

  const isSheetLandscape = resolveSheetLandscape();
  const currentGrid = getGridDimensions(pagesPerSheet, isSheetLandscape);

  // Slot indexing based on reading order
  const getSlotCoord = (indexInBatch: number, rows: number, cols: number) => {
    switch (readingOrder) {
      case 'row-ltr':
        return { r: Math.floor(indexInBatch / cols), c: indexInBatch % cols };
      case 'row-rtl':
        return { r: Math.floor(indexInBatch / cols), c: cols - 1 - (indexInBatch % cols) };
      case 'col-ltr':
        return { c: Math.floor(indexInBatch / rows), r: indexInBatch % rows };
      case 'col-rtl':
        return { c: cols - 1 - Math.floor(indexInBatch / rows), r: indexInBatch % rows };
    }
  };

  // Generate the N-Up PDF
  const handleConvertNup = async () => {
    if (files.length === 0 || totalInputPages === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: estimatedSheets, percent: 0 });

    try {
      const outDoc = await PDFDocument.create();
      const allEmbeddedPages: any[] = [];

      // Step 1: Load each source PDF and embed its pages
      for (const item of files) {
        const buffer = await item.file.arrayBuffer();
        const loadedSrc = await PDFDocument.load(buffer, { ignoreEncryption: true });

        // Ensure blank pages have an empty stream so pdf-lib does not fail
        for (const page of loadedSrc.getPages()) {
          if (!page.node.Contents()) {
            const emptyStream = loadedSrc.context.stream('');
            const ref = loadedSrc.context.register(emptyStream);
            page.node.set(PDFName.of('Contents'), ref);
          }
        }

        const count = loadedSrc.getPageCount();
        const indices = Array.from({ length: count }, (_, i) => i);
        const embedded = await outDoc.embedPdf(loadedSrc, indices);
        allEmbeddedPages.push(...embedded);
      }

      // Sheet dimensions
      const baseDim = SHEET_SIZES[sheetSize];
      const portraitW = Math.min(baseDim.width, baseDim.height);
      const portraitH = Math.max(baseDim.width, baseDim.height);

      const sheetW = isSheetLandscape ? portraitH : portraitW;
      const sheetH = isSheetLandscape ? portraitW : portraitH;

      const outerMarginPt = outerMarginMm * MM_TO_PT;
      const innerMarginPt = innerMarginMm * MM_TO_PT;

      const { rows, cols } = currentGrid;

      const availGridW = Math.max(10, sheetW - outerMarginPt * 2 - (cols - 1) * innerMarginPt);
      const availGridH = Math.max(10, sheetH - outerMarginPt * 2 - (rows - 1) * innerMarginPt);

      const cellW = availGridW / cols;
      const cellH = availGridH / rows;

      let sheetCount = 0;

      // Step 2: Lay out batches of pages onto sheets
      for (let i = 0; i < allEmbeddedPages.length; i += pagesPerSheet) {
        sheetCount++;
        setProgress({
          current: sheetCount,
          total: estimatedSheets,
          percent: Math.min(100, Math.round((sheetCount / estimatedSheets) * 100)),
        });

        const targetSheet = outDoc.addPage([sheetW, sheetH]);
        const batch = allEmbeddedPages.slice(i, i + pagesPerSheet);

        for (let k = 0; k < batch.length; k++) {
          const ep = batch[k];
          const { r, c } = getSlotCoord(k, rows, cols);

          // Slot boundaries
          const slotLeft = outerMarginPt + c * (cellW + innerMarginPt);
          const slotBottom = sheetH - outerMarginPt - (r + 1) * cellH - r * innerMarginPt;

          // Scale to fit slot keeping original aspect ratio
          const scale = Math.min(cellW / ep.width, cellH / ep.height);
          const drawW = ep.width * scale;
          const drawH = ep.height * scale;

          // Center page inside its slot
          const x = slotLeft + (cellW - drawW) / 2;
          const y = slotBottom + (cellH - drawH) / 2;

          targetSheet.drawPage(ep, {
            x,
            y,
            width: drawW,
            height: drawH,
          });

          // Draw thin frame if requested
          if (withBorder) {
            targetSheet.drawRectangle({
              x,
              y,
              width: drawW,
              height: drawH,
              borderColor: rgb(0.65, 0.65, 0.65),
              borderWidth: 0.75,
            });
          }
        }

        // Allow UI to breathe
        await new Promise((res) => setTimeout(res, 5));
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setOutputSize(blob.size);
      setOutputSheetCount(sheetCount);
    } catch (err: any) {
      console.error('Failed to create N-Up PDF:', err);
      setError(`Error creating multi-page sheet PDF: ${err?.message || 'Check PDF contents'}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <FileDropzone
        accept=".pdf,application/pdf"
        multiple={true}
        onFilesSelected={handleFilesAdded}
        label="Drag & drop PDF files here, or click to browse"
        sublabel="Combine 2, 4, 6, 8, 9, or 16 pages onto a single sheet. 100% private in-browser imposition."
      />

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Files List Card */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {files.length}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {files.length === 1 ? '1 PDF Document' : `${files.length} PDF Documents`}
                </span>
                <span className="text-xs text-muted-foreground">
                  • Total {totalInputPages} pages ({formatBytes(totalInputBytes)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add More</span>
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* List of uploaded files */}
            <div className="divide-y divide-border/60 max-h-40 overflow-y-auto pr-1">
              {files.map((item, idx) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-xs sm:max-w-md">
                      {item.file.name}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      ({item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} • {formatBytes(item.file.size)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Imposition Layout Configuration Panel */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  PDF Page Layout & Arrangement
                </h4>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Output: ~{estimatedSheets} {estimatedSheets === 1 ? 'Sheet' : 'Sheets'} ({pagesPerSheet} pages/sheet)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column (8 cols) */}
              <div className="lg:col-span-8 space-y-5 text-xs">
                {/* 1. Pages Per Sheet & Border */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Pages Per Sheet (N-Up)
                    </label>
                    <select
                      value={pagesPerSheet}
                      onChange={(e) => {
                        setPagesPerSheet(Number(e.target.value) as PagesPerSheet);
                        setDownloadUrl(null);
                      }}
                      className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-semibold outline-none focus:border-primary transition-all"
                    >
                      <option value={1}>1 page per sheet (Format / Resizing)</option>
                      <option value={2}>2 pages per sheet (1 × 2 / 2 × 1)</option>
                      <option value={4}>4 pages per sheet (2 × 2) — Recommended</option>
                      <option value={6}>6 pages per sheet (2 × 3)</option>
                      <option value={8}>8 pages per sheet (2 × 4)</option>
                      <option value={9}>9 pages per sheet (3 × 3)</option>
                      <option value={16}>16 pages per sheet (4 × 4)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/50 transition-all select-none">
                      <input
                        type="checkbox"
                        checked={withBorder}
                        onChange={(e) => {
                          setWithBorder(e.target.checked);
                          setDownloadUrl(null);
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-xs font-medium text-foreground">
                        Draw frame/border around each page
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Reading Direction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Arrangement / Reading Direction
                    </label>
                    <select
                      value={readingOrder}
                      onChange={(e) => {
                        setReadingOrder(e.target.value as ReadingOrder);
                        setDownloadUrl(null);
                      }}
                      className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary transition-all"
                    >
                      <option value="row-ltr">Row by row (Left to right) [1 2 / 3 4]</option>
                      <option value="row-rtl">Row by row (Right to left) [2 1 / 4 3]</option>
                      <option value="col-ltr">Column by column (Top to bottom) [1 3 / 2 4]</option>
                      <option value="col-rtl">Column by column (Right to left) [3 1 / 4 2]</option>
                    </select>
                  </div>

                  {/* 3. Sheet Size & Orientation */}
                  <div>
                    <label className="block font-medium text-foreground mb-1.5">
                      Sheet Format & Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={sheetSize}
                        onChange={(e) => {
                          setSheetSize(e.target.value as SheetSizeKey);
                          setDownloadUrl(null);
                        }}
                        className="w-full px-2.5 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary transition-all"
                      >
                        <option value="a4">A4</option>
                        <option value="letter">US Letter</option>
                        <option value="legal">US Legal</option>
                        <option value="a3">A3</option>
                        <option value="a5">A5</option>
                        <option value="tabloid">Tabloid</option>
                      </select>

                      <select
                        value={orientation}
                        onChange={(e) => {
                          setOrientation(e.target.value as SheetOrientation);
                          setDownloadUrl(null);
                        }}
                        className="w-full px-2.5 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-medium outline-none focus:border-primary transition-all"
                      >
                        <option value="auto">Auto Orient</option>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Margins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-medium text-foreground">
                        Outer Margin (Sheet Padding)
                      </label>
                      <span className="font-mono text-muted-foreground">{outerMarginMm} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        step={1}
                        value={outerMarginMm}
                        onChange={(e) => {
                          setOuterMarginMm(Number(e.target.value));
                          setDownloadUrl(null);
                        }}
                        className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                      <button type="button" onClick={() => setOuterMarginMm(0)} className="hover:underline">0 mm</button>
                      <button type="button" onClick={() => setOuterMarginMm(5)} className="hover:underline">5 mm (Compact)</button>
                      <button type="button" onClick={() => setOuterMarginMm(10)} className="hover:underline">10 mm (Standard)</button>
                      <button type="button" onClick={() => setOuterMarginMm(20)} className="hover:underline">20 mm</button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-medium text-foreground">
                        Inner Margin (Space between pages)
                      </label>
                      <span className="font-mono text-muted-foreground">{innerMarginMm} mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={innerMarginMm}
                        onChange={(e) => {
                          setInnerMarginMm(Number(e.target.value));
                          setDownloadUrl(null);
                        }}
                        className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                      <button type="button" onClick={() => setInnerMarginMm(0)} className="hover:underline">None</button>
                      <button type="button" onClick={() => setInnerMarginMm(2)} className="hover:underline">2 mm</button>
                      <button type="button" onClick={() => setInnerMarginMm(5)} className="hover:underline">5 mm</button>
                      <button type="button" onClick={() => setInnerMarginMm(10)} className="hover:underline">10 mm</button>
                    </div>
                  </div>
                </div>

                {/* 5. Custom Output Filename */}
                <div className="pt-2 border-t border-border/40">
                  <label className="block font-medium text-foreground mb-1.5">
                    Filename After Conversion
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="output-nup.pdf"
                      className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-foreground text-xs font-mono outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Diagram Preview Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/20 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Live Layout Simulation
                </span>

                {/* Sheet Representation */}
                <div 
                  className={`bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg shadow-md p-2 transition-all duration-300 flex items-center justify-center ${
                    isSheetLandscape ? 'w-48 h-36' : 'w-36 h-48'
                  }`}
                >
                  {/* Grid of Mini-Pages */}
                  <div
                    className="w-full h-full grid gap-1 p-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${currentGrid.cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${currentGrid.rows}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: pagesPerSheet }).map((_, i) => {
                      const { r, c } = getSlotCoord(i, currentGrid.rows, currentGrid.cols);
                      return (
                        <div
                          key={i}
                          className={`rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all select-none ${
                            withBorder
                              ? 'border border-primary/50 bg-primary/10 text-primary'
                              : 'bg-secondary/60 text-muted-foreground'
                          }`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 text-center space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {pagesPerSheet} Pages per Sheet
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isSheetLandscape ? 'Landscape Sheet' : 'Portrait Sheet'} • {currentGrid.cols}×{currentGrid.rows} Grid
                  </p>
                </div>
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
              Imposing sheet {progress.current} of {progress.total}...
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

      {/* Convert Action Button & Download */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          type="button"
          onClick={handleConvertNup}
          disabled={files.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Multi-Page PDF...</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span>
                Convert to {pagesPerSheet} Pages Per Sheet ({totalInputPages} {totalInputPages === 1 ? 'Page' : 'Pages'})
              </span>
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
              download={customFilename || 'multi-page-sheet.pdf'}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
            >
              <Download className="w-4 h-4" />
              <span>
                Download PDF {outputSize ? `(${formatBytes(outputSize)})` : ''} • {outputSheetCount} {outputSheetCount === 1 ? 'Sheet' : 'Sheets'}
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

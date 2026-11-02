'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Sparkles, 
  LayoutGrid, 
  ChevronDown,
  FileStack,
  Scissors,
  PenTool,
  RotateCw,
  Trash2,
  Stamp,
  Hash,
  Layers,
  EyeOff,
  Image,
  FileText,
  FileSpreadsheet,
  Code2,
  Briefcase,
  DownloadCloud,
  CheckCircle2,
  Percent,
  Calculator,
  Terminal,
  KeyRound,
  GitCompare,
  Palette,
  QrCode,
  Shield,
  Clock,
  ArrowRight,
  Minimize2,
  ArrowRightLeft,
  ScanText,
  Archive,
  Presentation,
  Lock,
  Unlock,
  FileCode,
  Camera,
  FolderSync,
  FileCheck2
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { CommandPalette } from './CommandPalette';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);

  // Close mega-menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="HelpGate Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                  HelpGate
                  <span className="text-[10px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    100% Free
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground hidden lg:inline">
                  Free Technology. For Everyone.
                </span>
              </div>
            </Link>

            {/* Smallpdf-Style "Tools" Mega-Menu Button */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isMegaMenuOpen
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/60 hover:bg-secondary text-foreground border-border'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-Menu Dropdown Drawer */}
              {isMegaMenuOpen && (
                <>
                  {/* Darkened backdrop overlay to focus attention and dismiss on click */}
                  <div
                    className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
                    onClick={() => setIsMegaMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute top-full left-0 mt-2.5 w-[92vw] max-w-5xl -left-4 sm:left-0 bg-white dark:bg-[#121216] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 z-50 overflow-hidden text-slate-900 dark:text-slate-100">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Explore 50+ In-Browser Tools (100% Free Forever)
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Zero server uploads • 100% client-side privacy • No paywalls, accounts, or file limits
                      </p>
                    </div>
                    <Link
                      href="/"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View All Tools</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* 5-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
                    {/* Col 1: Compress & Convert */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <Minimize2 className="w-3.5 h-3.5 text-blue-500" />
                        Compress & Convert
                      </h5>
                      <div className="space-y-0.5">
                        <Link
                          href="/tools/pdf-compress/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium"
                        >
                          <Minimize2 className="w-3.5 h-3.5 text-primary" />
                          <span>Compress PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-converter/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Universal Converter</span>
                        </Link>
                        <Link
                          href="/tools/pdf-ocr/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <ScanText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF OCR (Text)</span>
                        </Link>
                        <Link
                          href="/tools/pdf-to-pdfa/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF to PDF/A</span>
                        </Link>
                        <Link
                          href="/tools/pdf-to-jpg/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Image className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF to JPG</span>
                        </Link>
                        <Link
                          href="/tools/pdf-to-png/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Image className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF to PNG</span>
                        </Link>
                        <Link
                          href="/tools/jpg-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Image className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>JPG to PDF</span>
                        </Link>
                        <Link
                          href="/tools/images-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Image className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Images to PDF</span>
                        </Link>
                      </div>
                    </div>

                    {/* Col 2: PDF to/from Office */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        PDF & Office
                      </h5>
                      <div className="space-y-0.5">
                        <Link
                          href="/tools/pdf-to-word/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>PDF to Word (.docx)</span>
                        </Link>
                        <Link
                          href="/tools/pdf-to-excel/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF to Excel (.xlsx)</span>
                        </Link>
                        <Link
                          href="/tools/pdf-to-ppt/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Presentation className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF to PPT (.pptx)</span>
                        </Link>
                        <Link
                          href="/tools/word-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Word to PDF</span>
                        </Link>
                        <Link
                          href="/tools/excel-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Excel to PDF</span>
                        </Link>
                        <Link
                          href="/tools/ppt-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Presentation className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PPT to PDF</span>
                        </Link>
                        <Link
                          href="/tools/odt-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>OpenOffice ODT</span>
                        </Link>
                        <Link
                          href="/tools/ods-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>OpenOffice ODS</span>
                        </Link>
                      </div>
                    </div>

                    {/* Col 3: Convert to PDF */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        Convert to PDF
                      </h5>
                      <div className="space-y-0.5">
                        <Link
                          href="/tools/html-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>HTML to PDF</span>
                        </Link>
                        <Link
                          href="/tools/epub-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>EPUB to PDF</span>
                        </Link>
                        <Link
                          href="/tools/zip-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>ZIP to PDF</span>
                        </Link>
                        <Link
                          href="/tools/text-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>TXT to PDF</span>
                        </Link>
                        <Link
                          href="/tools/rtf-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>RTF to PDF</span>
                        </Link>
                        <Link
                          href="/tools/csv-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>CSV to PDF</span>
                        </Link>
                        <Link
                          href="/tools/pages-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Apple Pages to PDF</span>
                        </Link>
                        <Link
                          href="/tools/hwp-to-pdf/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>HWP to PDF</span>
                        </Link>
                      </div>
                    </div>

                    {/* Col 4: Organize & Scan */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <FileStack className="w-3.5 h-3.5 text-amber-500" />
                        Organize & Scan
                      </h5>
                      <div className="space-y-0.5">
                        <Link
                          href="/tools/pdf-merger/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium"
                        >
                          <FileStack className="w-3.5 h-3.5 text-amber-500" />
                          <span>Merge PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-splitter/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium"
                        >
                          <Scissors className="w-3.5 h-3.5 text-amber-500" />
                          <span>Split PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-organizer/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FolderSync className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Organize PDF</span>
                        </Link>
                        <Link
                          href="/tools/multiple-pages-per-sheet/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium text-amber-500"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pages Per Sheet</span>
                        </Link>
                        <Link
                          href="/tools/pdf-rotator/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Rotate PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-deleter/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Delete Pages</span>
                        </Link>
                        <Link
                          href="/tools/pdf-extractor/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Extract Pages</span>
                        </Link>
                        <Link
                          href="/tools/pdf-scanner/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium text-emerald-500"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-500" />
                          <span>PDF Scanner (Camera)</span>
                        </Link>
                      </div>
                    </div>

                    {/* Col 5: Edit, Sign & Protect */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b border-border/40">
                        <PenTool className="w-3.5 h-3.5 text-pink-500" />
                        Edit, Sign & Protect
                      </h5>
                      <div className="space-y-0.5">
                        <Link
                          href="/tools/pdf-sign/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground font-medium text-pink-500"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Sign PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-editor/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <PenTool className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Edit PDF (Add Text)</span>
                        </Link>
                        <Link
                          href="/tools/pdf-request-signatures/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Request Signatures</span>
                        </Link>
                        <Link
                          href="/tools/pdf-reader/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>PDF Reader</span>
                        </Link>
                        <Link
                          href="/tools/pdf-protect/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Protect PDF (Password)</span>
                        </Link>
                        <Link
                          href="/tools/pdf-unlock/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Unlock PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-flatten/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Flatten PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-redact/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Redact PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-watermark/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <Stamp className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Watermark PDF</span>
                        </Link>
                        <Link
                          href="/tools/pdf-form-filler/"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary hover:text-primary transition-colors text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Form Filler</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quick Category Jump & Software Directory Footer Callout */}
                  <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/90 -mx-6 -mb-6 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground">Also on HelpGate:</span>
                      <Link href="/category/developer-tools/" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-primary underline">
                        Dev Tools (JSON, Regex, JWT, Diff)
                      </Link>
                      <span>•</span>
                      <Link href="/category/business-tools/" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-primary underline">
                        Business & GST
                      </Link>
                      <span>•</span>
                      <Link href="/category/productivity/" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-primary underline">
                        Focus & Timers
                      </Link>
                    </div>
                    <Link
                      href="/software/"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Software Directory</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Direct Quick Shortcuts in Desktop Header */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Link 
                href="/tools/pdf-merger/" 
                className="px-2.5 py-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                Merge
              </Link>
              <Link 
                href="/tools/pdf-splitter/" 
                className="px-2.5 py-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                Split
              </Link>
              <Link 
                href="/tools/pdf-sign/" 
                className="px-2.5 py-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                Sign PDF
              </Link>
              <Link 
                href="/category/developer-tools/" 
                className="px-2.5 py-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                Developer
              </Link>
              <Link 
                href="/software/" 
                className="px-2.5 py-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors flex items-center gap-1"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Directory</span>
              </Link>
            </nav>
          </div>

          {/* Right Controls: Search, Theme Toggle, Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search tools...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary md:hidden transition-all"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            <div className="text-[11px] font-bold uppercase text-muted-foreground px-2 pt-1">
              Popular Tools
            </div>
            <Link
              href="/tools/pdf-merger/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <FileStack className="w-4 h-4 text-primary" />
              <span>Merge PDF</span>
            </Link>
            <Link
              href="/tools/pdf-sign/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary font-medium text-primary"
            >
              <PenTool className="w-4 h-4" />
              <span>Sign PDF</span>
            </Link>
            <Link
              href="/tools/images-to-pdf/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <Image className="w-4 h-4 text-primary" />
              <span>Images to PDF</span>
            </Link>
            <Link
              href="/tools/pdf-splitter/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <Scissors className="w-4 h-4 text-primary" />
              <span>Split PDF</span>
            </Link>

            <div className="text-[11px] font-bold uppercase text-muted-foreground px-2 pt-3">
              Categories
            </div>
            <Link
              href="/category/document-tools/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>PDF & Document Tools (14)</span>
            </Link>
            <Link
              href="/category/developer-tools/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <Code2 className="w-4 h-4 text-primary" />
              <span>Developer Utilities (8)</span>
            </Link>
            <Link
              href="/category/business-tools/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Business & GST (3)</span>
            </Link>
            <Link
              href="/category/productivity/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span>Productivity & Focus (4)</span>
            </Link>
            <Link
              href="/software/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary"
            >
              <DownloadCloud className="w-4 h-4 text-primary" />
              <span>Verified Software Directory</span>
            </Link>
            <Link
              href="/about/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-foreground hover:bg-secondary border-t border-border/60 pt-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>About HelpGate & OneGate Ecosystem</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Command Palette Search Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

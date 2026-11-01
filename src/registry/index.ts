import { ToolDefinition, ToolCategory } from './types';

// Core 32 Tools
import PdfMergerComponent from '@/tools/pdf-merger/Component';
import PdfSplitterComponent from '@/tools/pdf-splitter/Component';
import ImageResizerComponent from '@/tools/image-resizer/Component';
import JsonFormatterComponent from '@/tools/json-formatter/Component';
import Base64ToolComponent from '@/tools/base64-tool/Component';
import HashGeneratorComponent from '@/tools/hash-generator/Component';
import UuidGeneratorComponent from '@/tools/uuid-generator/Component';
import PasswordGeneratorComponent from '@/tools/password-generator/Component';
import GstCalculatorComponent from '@/tools/gst-calculator/Component';
import InvoiceGeneratorComponent from '@/tools/invoice-generator/Component';
import QrCodeGeneratorComponent from '@/tools/qr-code-generator/Component';
import WordCounterComponent from '@/tools/word-counter/Component';
import UtmBuilderComponent from '@/tools/utm-builder/Component';
import NotesScratchpadComponent from '@/tools/notes-scratchpad/Component';
import PomodoroTimerComponent from '@/tools/pomodoro-timer/Component';
import StopwatchComponent from '@/tools/stopwatch/Component';

import ImagesToPdfComponent from '@/tools/images-to-pdf/Component';
import PdfRotatorComponent from '@/tools/pdf-rotator/Component';
import PdfWatermarkComponent from '@/tools/pdf-watermark/Component';
import PdfDeleterComponent from '@/tools/pdf-deleter/Component';
import PdfNumbererComponent from '@/tools/pdf-numberer/Component';
import TextToPdfComponent from '@/tools/text-to-pdf/Component';
import PdfSignComponent from '@/tools/pdf-sign/Component';
import PdfFlattenComponent from '@/tools/pdf-flatten/Component';
import PdfRedactComponent from '@/tools/pdf-redact/Component';
import CsvToPdfComponent from '@/tools/csv-to-pdf/Component';
import PdfToTextComponent from '@/tools/pdf-to-text/Component';
import EmiCalculatorComponent from '@/tools/emi-calculator/Component';
import RegexTesterComponent from '@/tools/regex-tester/Component';
import JwtDebuggerComponent from '@/tools/jwt-debugger/Component';
import TextDiffComponent from '@/tools/text-diff/Component';
import ColorConverterComponent from '@/tools/color-converter/Component';

// Complete Smallpdf Suite Extension Tools
import PdfCompressComponent from '@/tools/pdf-compress/Component';
import PdfConverterComponent from '@/tools/pdf-converter/Component';
import PdfOcrComponent from '@/tools/pdf-ocr/Component';
import PdfToPdfaComponent from '@/tools/pdf-to-pdfa/Component';
import PdfToJpgComponent from '@/tools/pdf-to-jpg/Component';
import PdfToPngComponent from '@/tools/pdf-to-png/Component';
import JpgToPdfComponent from '@/tools/jpg-to-pdf/Component';
import PdfToWordComponent from '@/tools/pdf-to-word/Component';
import PdfToExcelComponent from '@/tools/pdf-to-excel/Component';
import PdfToPptComponent from '@/tools/pdf-to-ppt/Component';
import WordToPdfComponent from '@/tools/word-to-pdf/Component';
import ExcelToPdfComponent from '@/tools/excel-to-pdf/Component';
import PptToPdfComponent from '@/tools/ppt-to-pdf/Component';
import OdtToPdfComponent from '@/tools/odt-to-pdf/Component';
import OdsToPdfComponent from '@/tools/ods-to-pdf/Component';
import OdpToPdfComponent from '@/tools/odp-to-pdf/Component';
import HtmlToPdfComponent from '@/tools/html-to-pdf/Component';
import RtfToPdfComponent from '@/tools/rtf-to-pdf/Component';
import EpubToPdfComponent from '@/tools/epub-to-pdf/Component';
import ZipToPdfComponent from '@/tools/zip-to-pdf/Component';
import PagesToPdfComponent from '@/tools/pages-to-pdf/Component';
import HwpToPdfComponent from '@/tools/hwp-to-pdf/Component';
import PdfExtractorComponent from '@/tools/pdf-extractor/Component';
import PdfOrganizerComponent from '@/tools/pdf-organizer/Component';
import PdfEditorComponent from '@/tools/pdf-editor/Component';
import PdfAnnotatorComponent from '@/tools/pdf-annotator/Component';
import PdfReaderComponent from '@/tools/pdf-reader/Component';
import PdfCropComponent from '@/tools/pdf-crop/Component';
import PdfFormFillerComponent from '@/tools/pdf-form-filler/Component';
import PdfShareComponent from '@/tools/pdf-share/Component';
import PdfProtectComponent from '@/tools/pdf-protect/Component';
import PdfUnlockComponent from '@/tools/pdf-unlock/Component';
import PdfRequestSignaturesComponent from '@/tools/pdf-request-signatures/Component';
import PdfScannerComponent from '@/tools/pdf-scanner/Component';

export const TOOLS_MAP: Record<string, ToolDefinition> = {
  // ==========================================
  // 1. COMPRESS & CONVERT
  // ==========================================
  'pdf-compress': {
    id: 'pdf-compress',
    name: 'Compress PDF',
    category: 'document-tools',
    description: 'Reduce PDF file size in seconds while preserving document quality. 100% private in-browser compression.',
    seoTitle: 'Compress PDF Online Free — Reduce PDF Size Privately | HelpGate',
    seoDescription: 'Compress PDF files online for free. Reduce file size without quality loss or server uploads. Zero data transmission.',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor online free'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Minimize2',
    isPopular: true,
    component: PdfCompressComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-converter': {
    id: 'pdf-converter',
    name: 'Universal PDF Converter',
    category: 'document-tools',
    description: 'Convert Word, Excel, PowerPoint, images, text, and spreadsheets to and from PDF directly in your browser.',
    seoTitle: 'PDF Converter Online Free — Convert Any File to/from PDF | HelpGate',
    seoDescription: 'Universal document converter. Convert images, documents, and spreadsheets to PDF and extract PDF content locally.',
    keywords: ['pdf converter', 'convert to pdf', 'convert from pdf', 'free pdf converter'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'ArrowRightLeft',
    isPopular: true,
    component: PdfConverterComponent,
    supportedFormats: ['.pdf', '.jpg', '.png', '.docx', '.xlsx', '.txt', '.csv', '.html'],
  },

  'pdf-ocr': {
    id: 'pdf-ocr',
    name: 'PDF OCR Text Recognition',
    category: 'document-tools',
    description: 'Convert scanned PDF documents and images into searchable, selectable text using high-contrast local OCR.',
    seoTitle: 'PDF OCR Online Free — Optical Character Recognition In-Browser | HelpGate',
    seoDescription: 'Extract text from scanned PDFs and receipts. Free in-browser OCR with zero file uploads.',
    keywords: ['pdf ocr', 'extract text scanned pdf', 'ocr online free', 'searchable pdf maker'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'ScanText',
    isPopular: true,
    component: PdfOcrComponent,
    supportedFormats: ['.pdf', '.jpg', '.png'],
  },

  'pdf-to-pdfa': {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A Converter',
    category: 'document-tools',
    description: 'Convert standard PDF documents into ISO 19005-1 compliant PDF/A archives for long-term legal preservation.',
    seoTitle: 'Convert PDF to PDF/A Online Free — ISO Archival Standard | HelpGate',
    seoDescription: 'Transform PDFs into standardized PDF/A-1b and PDF/A-2b archives for government, legal, and enterprise compliance.',
    keywords: ['pdf to pdfa', 'convert pdf to pdf/a', 'pdf archival format', 'iso 19005-1'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Archive',
    isPopular: false,
    component: PdfToPdfaComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 2. PDF TO IMAGE & IMAGE TO PDF
  // ==========================================
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'document-tools',
    description: 'Convert PDF pages into high-resolution JPG images. Download individual photos or all pages in a clean ZIP.',
    seoTitle: 'PDF to JPG Online Free — Convert PDF Pages to JPG Images | HelpGate',
    seoDescription: 'Convert PDF document pages to JPG images in seconds. High quality, free, and private.',
    keywords: ['pdf to jpg', 'convert pdf to jpg', 'save pdf as picture', 'pdf to photo'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Image',
    isPopular: true,
    component: PdfToJpgComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-to-png': {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'document-tools',
    description: 'Extract crisp, lossless PNG images from PDF pages with retina resolution multiplier options.',
    seoTitle: 'PDF to PNG Online Free — Lossless Image Extraction | HelpGate',
    seoDescription: 'Convert PDF to PNG with high resolution and crisp text rendering. 100% client-side in-browser processing.',
    keywords: ['pdf to png', 'convert pdf to png', 'lossless pdf image', 'extract png from pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Image',
    isPopular: false,
    component: PdfToPngComponent,
    supportedFormats: ['.pdf'],
  },

  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'document-tools',
    description: 'Transform multiple JPG and JPEG photos into a single PDF document. Reorder, rotate, and set margins.',
    seoTitle: 'JPG to PDF Online Free — Combine Photos into PDF | HelpGate',
    seoDescription: 'Convert JPG pictures to PDF in seconds. Rotate photos, reorder pages, and customize A4 or Letter sizes.',
    keywords: ['jpg to pdf', 'convert photo to pdf', 'pictures to pdf', 'combine jpg to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Image',
    isPopular: true,
    component: JpgToPdfComponent,
    supportedFormats: ['.jpg', '.jpeg'],
  },

  'images-to-pdf': {
    id: 'images-to-pdf',
    name: 'Images to PDF Converter',
    category: 'document-tools',
    description: 'Convert mixed JPG, PNG, and WebP images into a single cohesive PDF document with custom margins.',
    seoTitle: 'Images to PDF Online Free — JPG, PNG, WebP to PDF | HelpGate',
    seoDescription: 'Convert any mix of images to PDF in seconds. Support for JPG, PNG, WebP with custom margins and sizing.',
    keywords: ['images to pdf', 'convert photos to pdf', 'png to pdf', 'webp to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Image',
    isPopular: true,
    component: ImagesToPdfComponent,
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // ==========================================
  // 3. PDF TO OFFICE
  // ==========================================
  'pdf-to-word': {
    id: 'pdf-to-word',
    name: 'PDF to Word (.DOCX)',
    category: 'document-tools',
    description: 'Extract structured text and paragraphs from PDF and generate an editable Microsoft Word (.docx) document.',
    seoTitle: 'PDF to Word Online Free — Convert PDF to DOCX In-Browser | HelpGate',
    seoDescription: 'Convert PDF to editable Microsoft Word (.docx) documents. Zero file uploads, 100% confidential.',
    keywords: ['pdf to word', 'convert pdf to docx', 'pdf to doc', 'free pdf to word converter'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: true,
    component: PdfToWordComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-to-excel': {
    id: 'pdf-to-excel',
    name: 'PDF to Excel (.XLSX / .CSV)',
    category: 'document-tools',
    description: 'Extract tabular financial data and columns from PDF documents into Excel spreadsheets and CSV tables.',
    seoTitle: 'PDF to Excel Online Free — Extract Tables from PDF | HelpGate',
    seoDescription: 'Extract spreadsheet tables from PDF documents into Excel-compatible CSV formats with 1 click.',
    keywords: ['pdf to excel', 'extract tables pdf', 'pdf to xlsx', 'convert pdf table to excel'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    isPopular: true,
    component: PdfToExcelComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-to-ppt': {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint Slides',
    category: 'document-tools',
    description: 'Convert PDF document pages into presentation slide decks ready for presentation or editing.',
    seoTitle: 'PDF to PowerPoint Online Free — Convert PDF to Slides | HelpGate',
    seoDescription: 'Transform PDF pages into slide deck presentation packages in your browser without cloud uploads.',
    keywords: ['pdf to ppt', 'pdf to powerpoint', 'convert pdf to slides', 'pdf presentation maker'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Presentation',
    isPopular: false,
    component: PdfToPptComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 4. OFFICE TO PDF
  // ==========================================
  'word-to-pdf': {
    id: 'word-to-pdf',
    name: 'Word to PDF (.DOCX to PDF)',
    category: 'document-tools',
    description: 'Convert Microsoft Word (.docx) documents into clean, printable PDF documents in browser memory.',
    seoTitle: 'Word to PDF Online Free — Convert DOCX to PDF In-Browser | HelpGate',
    seoDescription: 'Convert Word .docx documents to PDF instantly. Safe, confidential, and completely client-side.',
    keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf online free'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: true,
    component: WordToPdfComponent,
    supportedFormats: ['.docx', '.doc'],
  },

  'excel-to-pdf': {
    id: 'excel-to-pdf',
    name: 'Excel to PDF (.XLSX to PDF)',
    category: 'document-tools',
    description: 'Transform Excel spreadsheets (.xlsx, .xls) and CSV datasets into beautifully formatted PDF tables.',
    seoTitle: 'Excel to PDF Online Free — Convert Spreadsheets to PDF | HelpGate',
    seoDescription: 'Convert Excel files and spreadsheets to PDF with customizable landscape layout and formatting.',
    keywords: ['excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf', 'csv to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    isPopular: false,
    component: ExcelToPdfComponent,
    supportedFormats: ['.xlsx', '.xls', '.csv'],
  },

  'ppt-to-pdf': {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF (.PPTX to PDF)',
    category: 'document-tools',
    description: 'Convert Microsoft PowerPoint presentation slides into printable landscape PDF documents.',
    seoTitle: 'PowerPoint to PDF Online Free — Convert PPTX to PDF | HelpGate',
    seoDescription: 'Convert PowerPoint slides to PDF presentations online without sending slides to external servers.',
    keywords: ['ppt to pdf', 'convert pptx to pdf', 'powerpoint to pdf online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Presentation',
    isPopular: false,
    component: PptToPdfComponent,
    supportedFormats: ['.pptx', '.ppt'],
  },

  // ==========================================
  // 5. OPENOFFICE TO PDF
  // ==========================================
  'odt-to-pdf': {
    id: 'odt-to-pdf',
    name: 'ODT to PDF (OpenOffice Text)',
    category: 'document-tools',
    description: 'Convert LibreOffice and OpenOffice Writer text documents (.odt) into clean PDF documents.',
    seoTitle: 'ODT to PDF Online Free — OpenOffice Document to PDF | HelpGate',
    seoDescription: 'Convert OpenDocument text (.odt) to PDF format directly in your browser. 100% private.',
    keywords: ['odt to pdf', 'openoffice to pdf', 'libreoffice to pdf', 'convert odt'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: OdtToPdfComponent,
    supportedFormats: ['.odt'],
  },

  'ods-to-pdf': {
    id: 'ods-to-pdf',
    name: 'ODS to PDF (OpenOffice Calc)',
    category: 'document-tools',
    description: 'Convert OpenDocument Spreadsheet (.ods) files from LibreOffice Calc into formatted PDF tables.',
    seoTitle: 'ODS to PDF Online Free — OpenDocument Calc to PDF | HelpGate',
    seoDescription: 'Convert OpenOffice .ods spreadsheets into styled PDF tables. Zero cloud uploads.',
    keywords: ['ods to pdf', 'calc to pdf', 'openoffice spreadsheet to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    isPopular: false,
    component: OdsToPdfComponent,
    supportedFormats: ['.ods'],
  },

  'odp-to-pdf': {
    id: 'odp-to-pdf',
    name: 'ODP to PDF (OpenOffice Impress)',
    category: 'document-tools',
    description: 'Convert OpenDocument Presentation (.odp) slides into landscape PDF presentations.',
    seoTitle: 'ODP to PDF Online Free — LibreOffice Impress to PDF | HelpGate',
    seoDescription: 'Convert OpenOffice .odp presentations into PDF slide documents in browser memory.',
    keywords: ['odp to pdf', 'impress to pdf', 'openoffice presentation to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Presentation',
    isPopular: false,
    component: OdpToPdfComponent,
    supportedFormats: ['.odp'],
  },

  // ==========================================
  // 6. OTHER CONVERT TO PDF TOOLS
  // ==========================================
  'text-to-pdf': {
    id: 'text-to-pdf',
    name: 'TXT to PDF Converter',
    category: 'document-tools',
    description: 'Convert plain text notes or .txt files into formatted multi-page PDF documents.',
    seoTitle: 'TXT to PDF Online Free — Convert Text to PDF | HelpGate',
    seoDescription: 'Transform plain text files or raw notes into clean, printable PDF documents directly in your browser.',
    keywords: ['txt to pdf', 'text to pdf converter', 'convert notepad to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: TextToPdfComponent,
    supportedFormats: ['.txt'],
  },

  'html-to-pdf': {
    id: 'html-to-pdf',
    name: 'HTML to PDF Converter',
    category: 'document-tools',
    description: 'Convert raw HTML code or web documents into clean, structured PDF files with customizable title.',
    seoTitle: 'HTML to PDF Online Free — Convert Web Markup to PDF | HelpGate',
    seoDescription: 'Convert HTML code and web pages into clean PDF documents in your browser with zero uploads.',
    keywords: ['html to pdf', 'convert web page to pdf', 'html code to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Code',
    isPopular: false,
    component: HtmlToPdfComponent,
    supportedFormats: ['.html', '.htm'],
  },

  'rtf-to-pdf': {
    id: 'rtf-to-pdf',
    name: 'RTF to PDF Converter',
    category: 'document-tools',
    description: 'Convert Rich Text Format (.rtf) documents into clean, paginated PDF files.',
    seoTitle: 'RTF to PDF Online Free — Convert Rich Text to PDF | HelpGate',
    seoDescription: 'Convert .rtf files into standard PDF documents directly in your browser.',
    keywords: ['rtf to pdf', 'convert rich text to pdf', 'rtf document converter'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: RtfToPdfComponent,
    supportedFormats: ['.rtf'],
  },

  'epub-to-pdf': {
    id: 'epub-to-pdf',
    name: 'EPUB to PDF Converter',
    category: 'document-tools',
    description: 'Convert EPUB e-books into formatted, printable PDF documents with automatic page layout.',
    seoTitle: 'EPUB to PDF Online Free — Convert E-Books to PDF | HelpGate',
    seoDescription: 'Transform EPUB digital books into readable PDF files in your browser with zero file transmission.',
    keywords: ['epub to pdf', 'convert ebook to pdf', 'ebook converter online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'BookOpen',
    isPopular: false,
    component: EpubToPdfComponent,
    supportedFormats: ['.epub'],
  },

  'zip-to-pdf': {
    id: 'zip-to-pdf',
    name: 'ZIP to PDF Converter',
    category: 'document-tools',
    description: 'Extract images and text documents from any ZIP archive and compile them into a unified PDF.',
    seoTitle: 'ZIP to PDF Online Free — Extract & Compile Archive to PDF | HelpGate',
    seoDescription: 'Convert zip archive contents into a single consolidated PDF document with 1 click.',
    keywords: ['zip to pdf', 'extract zip to pdf', 'convert zip archive to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Archive',
    isPopular: false,
    component: ZipToPdfComponent,
    supportedFormats: ['.zip'],
  },

  'csv-to-pdf': {
    id: 'csv-to-pdf',
    name: 'CSV to PDF Table Converter',
    category: 'document-tools',
    description: 'Convert CSV spreadsheets and tabular data into beautifully styled, multi-page PDF documents.',
    seoTitle: 'CSV to PDF Online Free — Convert Spreadsheet to PDF | HelpGate',
    seoDescription: 'Transform CSV files or raw tabular text into formatted PDF tables with custom color themes.',
    keywords: ['csv to pdf', 'convert csv to pdf', 'table to pdf', 'spreadsheet to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    isPopular: false,
    component: CsvToPdfComponent,
    supportedFormats: ['.csv', '.txt'],
  },

  'pages-to-pdf': {
    id: 'pages-to-pdf',
    name: 'Pages to PDF (Apple Pages)',
    category: 'document-tools',
    description: 'Convert Apple Pages (.pages) documents from macOS/iOS into universal PDF documents.',
    seoTitle: 'Pages to PDF Online Free — Apple Pages to PDF | HelpGate',
    seoDescription: 'Convert Apple Pages documents into PDF in your browser without needing a Mac or iCloud login.',
    keywords: ['pages to pdf', 'apple pages to pdf', 'convert pages file'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: PagesToPdfComponent,
    supportedFormats: ['.pages'],
  },

  'hwp-to-pdf': {
    id: 'hwp-to-pdf',
    name: 'HWP to PDF (Hancom Word)',
    category: 'document-tools',
    description: 'Convert Korean Hancom Hangul Word (.hwp) documents into standard universal PDF files.',
    seoTitle: 'HWP to PDF Online Free — Hancom Hangul to PDF | HelpGate',
    seoDescription: 'Convert Hancom .hwp documents to PDF online for free without installing Korean office software.',
    keywords: ['hwp to pdf', 'hancom to pdf', 'hangul to pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: HwpToPdfComponent,
    supportedFormats: ['.hwp'],
  },

  // ==========================================
  // 7. ORGANIZE PDF
  // ==========================================
  'pdf-merger': {
    id: 'pdf-merger',
    name: 'Merge PDF',
    category: 'document-tools',
    description: 'Combine multiple PDF files into one clean document in seconds. 100% private in-browser merger.',
    seoTitle: 'Merge PDF Online Free — 100% Private In-Browser PDF Merger | HelpGate',
    seoDescription: 'Merge and combine multiple PDF documents into a single file for free. Zero server uploads.',
    keywords: ['merge pdf', 'combine pdf', 'free pdf merger', 'pdf joiner'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileStack',
    isPopular: true,
    component: PdfMergerComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-splitter': {
    id: 'pdf-splitter',
    name: 'Split PDF',
    category: 'document-tools',
    description: 'Extract specific page ranges or separate individual pages from PDF documents with zero cloud uploads.',
    seoTitle: 'Split PDF Online Free — Extract PDF Pages Privately | HelpGate',
    seoDescription: 'Extract page intervals and split PDF documents directly on your device.',
    keywords: ['split pdf', 'extract pdf pages', 'cut pdf online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Scissors',
    isPopular: true,
    component: PdfSplitterComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-rotator': {
    id: 'pdf-rotator',
    name: 'Rotate PDF',
    category: 'document-tools',
    description: 'Permanently rotate PDF pages by 90°, 180°, or 270°. Rotate all pages or target specific pages.',
    seoTitle: 'Rotate PDF Online Free — Rotate PDF Pages 90, 180 Degrees | HelpGate',
    seoDescription: 'Fix upside-down or sideways PDF scans. Rotate pages permanently without sending documents across the internet.',
    keywords: ['rotate pdf', 'rotate pdf pages', 'fix sideways pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'RotateCw',
    isPopular: true,
    component: PdfRotatorComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-deleter': {
    id: 'pdf-deleter',
    name: 'Delete PDF Pages',
    category: 'document-tools',
    description: 'Remove unwanted, blank, or duplicate pages from any PDF document using an intuitive visual grid selector.',
    seoTitle: 'Delete PDF Pages Online Free — Remove Pages from PDF | HelpGate',
    seoDescription: 'Select and delete unwanted pages from PDF files. Free in-browser tool with zero server uploads.',
    keywords: ['delete pdf pages', 'remove pages from pdf', 'delete blank pages pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Trash2',
    isPopular: true,
    component: PdfDeleterComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-extractor': {
    id: 'pdf-extractor',
    name: 'Extract PDF Pages',
    category: 'document-tools',
    description: 'Extract individual pages or ranges from PDF documents with instant visual thumbnail selection.',
    seoTitle: 'Extract PDF Pages Online Free — Save Specific Pages | HelpGate',
    seoDescription: 'Select and save specific pages from your PDF file into a brand new PDF document.',
    keywords: ['extract pdf pages', 'save pages from pdf', 'extract page ranges'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Scissors',
    isPopular: false,
    component: PdfExtractorComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-organizer': {
    id: 'pdf-organizer',
    name: 'Organize PDF Studio',
    category: 'document-tools',
    description: 'Visual drag-and-drop workspace to reorder, duplicate, rotate, and sort PDF pages with 1 click.',
    seoTitle: 'Organize PDF Online Free — Reorder & Sort PDF Pages | HelpGate',
    seoDescription: 'Reorder pages, duplicate sections, and sort your PDF visually in an interactive workspace.',
    keywords: ['organize pdf', 'reorder pdf pages', 'sort pdf pages', 'rearrange pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'LayoutGrid',
    isPopular: true,
    component: PdfOrganizerComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 8. EDIT PDF
  // ==========================================
  'pdf-editor': {
    id: 'pdf-editor',
    name: 'Edit PDF',
    category: 'document-tools',
    description: 'Add custom text, titles, notes, and callouts directly onto any page of your PDF document.',
    seoTitle: 'Edit PDF Online Free — Add Text & Annotations to PDF | HelpGate',
    seoDescription: 'Edit PDF files directly in your web browser. Type text, add annotations, and download modified PDFs.',
    keywords: ['edit pdf', 'add text to pdf', 'pdf editor online free'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Edit3',
    isPopular: true,
    component: PdfEditorComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-annotator': {
    id: 'pdf-annotator',
    name: 'PDF Annotator',
    category: 'document-tools',
    description: 'Highlight text, draw markup boxes, and add review callouts directly onto PDF pages.',
    seoTitle: 'PDF Annotator Online Free — Highlight & Markup PDF | HelpGate',
    seoDescription: 'Highlight text and add review markup to PDF documents in your browser with zero cloud storage.',
    keywords: ['pdf annotator', 'highlight pdf', 'markup pdf online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Highlighter',
    isPopular: false,
    component: PdfAnnotatorComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-reader': {
    id: 'pdf-reader',
    name: 'PDF Reader & Viewer',
    category: 'document-tools',
    description: 'High-performance, in-browser PDF reader with zoom controls, fullscreen mode, and presentation support.',
    seoTitle: 'PDF Reader Online Free — Fast In-Browser PDF Viewer | HelpGate',
    seoDescription: 'View and read PDF documents online in a distraction-free, zero-upload reader.',
    keywords: ['pdf reader', 'pdf viewer online', 'open pdf in browser'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'BookOpen',
    isPopular: false,
    component: PdfReaderComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-numberer': {
    id: 'pdf-numberer',
    name: 'Number Pages',
    category: 'document-tools',
    description: 'Add sequential page numbers to any PDF with custom position (header/footer) and formatting ("Page X of Y").',
    seoTitle: 'Number PDF Pages Online Free — Add Page Numbers | HelpGate',
    seoDescription: 'Insert clean page numbers into PDF headers or footers with customizable formatting.',
    keywords: ['number pdf pages', 'add page numbers to pdf', 'page numbering tool'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Hash',
    isPopular: false,
    component: PdfNumbererComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-crop': {
    id: 'pdf-crop',
    name: 'Crop PDF',
    category: 'document-tools',
    description: 'Trim page margins, crop borders, and adjust document dimensions across all PDF pages.',
    seoTitle: 'Crop PDF Online Free — Trim PDF Margins In-Browser | HelpGate',
    seoDescription: 'Trim unwanted white space and margins from PDF documents directly on your device.',
    keywords: ['crop pdf', 'trim pdf margins', 'crop pages pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Crop',
    isPopular: false,
    component: PdfCropComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-redact': {
    id: 'pdf-redact',
    name: 'Redact PDF',
    category: 'document-tools',
    description: 'Permanently blackout or whiteout sensitive PII, bank account numbers, and confidential text across PDF pages.',
    seoTitle: 'Redact PDF Online Free — Blackout Sensitive Data In-Browser | HelpGate',
    seoDescription: 'Permanently remove confidential information with opaque redaction rectangles. Completely private on your machine.',
    keywords: ['redact pdf', 'blackout pdf text', 'hide sensitive info pdf', 'free pdf redaction'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'EyeOff',
    isPopular: true,
    component: PdfRedactComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-watermark': {
    id: 'pdf-watermark',
    name: 'Watermark PDF',
    category: 'document-tools',
    description: 'Stamp custom text watermarks across PDF documents. Customize opacity, angle, font size, and text color.',
    seoTitle: 'Add Watermark to PDF Online Free — Confidential Stamps | HelpGate',
    seoDescription: 'Protect confidential documents with watermarks like CONFIDENTIAL, DRAFT, or COPY. 100% private in-browser.',
    keywords: ['add watermark to pdf', 'pdf watermark online', 'stamp draft on pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Stamp',
    isPopular: false,
    component: PdfWatermarkComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-form-filler': {
    id: 'pdf-form-filler',
    name: 'PDF Form Filler',
    category: 'document-tools',
    description: 'Fill fillable PDF AcroForm fields, text inputs, checkboxes, and radio buttons directly in your browser.',
    seoTitle: 'PDF Form Filler Online Free — Fill PDF Forms In-Browser | HelpGate',
    seoDescription: 'Fill interactive PDF forms and sign applications online without printing or software installations.',
    keywords: ['pdf form filler', 'fill pdf forms online', 'fillable pdf editor'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'CheckSquare',
    isPopular: false,
    component: PdfFormFillerComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-share': {
    id: 'pdf-share',
    name: 'Share PDF Privately',
    category: 'document-tools',
    description: 'Share PDF documents across devices via high-speed local QR codes with zero public cloud uploads.',
    seoTitle: 'Share PDF Online Free — Ephemeral Local Document Transfer | HelpGate',
    seoDescription: 'Transfer documents instantly to your phone or peer devices over local Wi-Fi via QR codes without cloud tracking.',
    keywords: ['share pdf', 'send pdf to phone', 'qr code pdf share'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Share2',
    isPopular: false,
    component: PdfShareComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 9. FILL & SIGN
  // ==========================================
  'pdf-sign': {
    id: 'pdf-sign',
    name: 'Sign PDF',
    category: 'document-tools',
    description: 'Draw or type your signature and stamp it directly onto any page of your PDF. 100% private in-browser e-signatures.',
    seoTitle: 'Sign PDF Online Free — In-Browser Digital PDF Signature | HelpGate',
    seoDescription: 'Draw or type your legal electronic signature and place it onto any PDF document. Free, confidential, and completely client-side.',
    keywords: ['sign pdf', 'sign pdf online free', 'pdf digital signature', 'e-sign pdf browser'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'PenTool',
    isPopular: true,
    component: PdfSignComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-request-signatures': {
    id: 'pdf-request-signatures',
    name: 'Request Signatures',
    category: 'document-tools',
    description: 'Place designated signature boxes, initials, and date tags on contracts and export ready-to-sign documents.',
    seoTitle: 'Request Signatures Online Free — Create Signature Templates | HelpGate',
    seoDescription: 'Prepare signature-ready contract templates with designated signature boxes and date lines.',
    keywords: ['request signatures', 'prepare document for signing', 'signature template generator'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'UserCheck',
    isPopular: false,
    component: PdfRequestSignaturesComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 10. PROTECT & UNLOCK
  // ==========================================
  'pdf-protect': {
    id: 'pdf-protect',
    name: 'Protect PDF',
    category: 'document-tools',
    description: 'Encrypt PDF documents and restrict copying or printing permissions with strong viewing passwords.',
    seoTitle: 'Protect PDF Online Free — Password Protect PDF Files | HelpGate',
    seoDescription: 'Add strong password protection to PDF files directly on your computer. Keep confidential documents secure.',
    keywords: ['protect pdf', 'password protect pdf', 'lock pdf', 'encrypt pdf online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Lock',
    isPopular: true,
    component: PdfProtectComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-unlock': {
    id: 'pdf-unlock',
    name: 'Unlock PDF',
    category: 'document-tools',
    description: 'Remove owner restrictions, printing constraints, and password barriers from PDF documents.',
    seoTitle: 'Unlock PDF Online Free — Remove PDF Password Restrictions | HelpGate',
    seoDescription: 'Remove editing and printing restrictions from secured PDF documents in your browser.',
    keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Unlock',
    isPopular: true,
    component: PdfUnlockComponent,
    supportedFormats: ['.pdf'],
  },

  'pdf-flatten': {
    id: 'pdf-flatten',
    name: 'Flatten PDF',
    category: 'document-tools',
    description: 'Permanently lock interactive form fields, checkboxes, and digital signatures into non-editable static content.',
    seoTitle: 'Flatten PDF Online Free — Lock PDF Form Fields | HelpGate',
    seoDescription: 'Flatten fillable PDF forms into read-only documents. Prevent tampering before sending contracts or legal documents.',
    keywords: ['flatten pdf', 'lock pdf form', 'make pdf read only', 'flatten fillable pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Layers',
    isPopular: false,
    component: PdfFlattenComponent,
    supportedFormats: ['.pdf'],
  },

  // ==========================================
  // 11. SCANNER
  // ==========================================
  'pdf-scanner': {
    id: 'pdf-scanner',
    name: 'PDF Scanner',
    category: 'document-tools',
    description: 'Scan physical paper documents using your mobile camera or webcam with real-time contrast enhancement.',
    seoTitle: 'PDF Scanner Online Free — Scan Paper Documents with Camera | HelpGate',
    seoDescription: 'Use your phone or laptop camera as a document scanner. Enhance contrast, snap pages, and compile into PDF.',
    keywords: ['pdf scanner', 'scan document online', 'camera to pdf', 'mobile pdf scanner'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Camera',
    isPopular: true,
    component: PdfScannerComponent,
  },

  // ==========================================
  // 12. DEVELOPER TOOLS
  // ==========================================
  'json-formatter': {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer-tools',
    description: 'Format, validate, beautify, and minify complex JSON payloads with error line markers and statistics.',
    seoTitle: 'Free Online JSON Formatter, Beautifier & Validator | HelpGate',
    seoDescription: 'Validate and beautify JSON strings instantly. Detect syntax errors with line-number precision in your browser.',
    keywords: ['json formatter', 'beautify json', 'json validator', 'json minifier'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Braces',
    isPopular: true,
    component: JsonFormatterComponent,
  },

  'regex-tester': {
    id: 'regex-tester',
    name: 'Regex Tester & Debugger',
    category: 'developer-tools',
    description: 'Test regular expressions in real time with syntax error detection, match highlighting, and capture groups.',
    seoTitle: 'Online Regex Tester — Real-Time Regular Expression Debugger | HelpGate',
    seoDescription: 'Test and debug JavaScript regular expressions with real-time match highlighting and capture group extraction.',
    keywords: ['regex tester', 'regular expression debugger', 'regex online', 'regex matcher'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Terminal',
    isPopular: true,
    component: RegexTesterComponent,
  },

  'jwt-debugger': {
    id: 'jwt-debugger',
    name: 'JWT Token Debugger',
    category: 'developer-tools',
    description: 'Inspect and decode JSON Web Tokens. View JOSE headers, payload claims, and token expiration status.',
    seoTitle: 'JWT Debugger Online — Decode & Inspect JSON Web Tokens | HelpGate',
    seoDescription: 'Decode and inspect JWT headers and payload claims in real time with expiry checks. 100% private.',
    keywords: ['jwt debugger', 'decode jwt', 'jwt inspector', 'json web token viewer'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'KeyRound',
    isPopular: true,
    component: JwtDebuggerComponent,
  },

  'text-diff': {
    id: 'text-diff',
    name: 'Text & Code Diff Checker',
    category: 'developer-tools',
    description: 'Side-by-side text and code diff comparison tool with added, removed, and modified line highlighting.',
    seoTitle: 'Text Diff Checker Online — Compare Text & Code Side-by-Side | HelpGate',
    seoDescription: 'Compare two text files or code snippets side-by-side. Highlight additions, removals, and modifications.',
    keywords: ['text diff', 'compare text', 'code diff online', 'diff checker'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'GitCompare',
    isPopular: false,
    component: TextDiffComponent,
  },

  'color-converter': {
    id: 'color-converter',
    name: 'Color Converter & Contrast Checker',
    category: 'developer-tools',
    description: 'Convert HEX, RGB, and HSL values with instant WCAG 2.1 AA/AAA accessibility contrast ratio checks.',
    seoTitle: 'Color Converter & WCAG Contrast Checker | HelpGate',
    seoDescription: 'Convert between HEX, RGB, HSL and test accessibility color contrast for WCAG AA/AAA compliance.',
    keywords: ['color converter', 'hex to rgb', 'wcag contrast checker', 'color palette generator'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Palette',
    isPopular: false,
    component: ColorConverterComponent,
  },

  'base64-tool': {
    id: 'base64-tool',
    name: 'Base64 Encoder & Decoder',
    category: 'developer-tools',
    description: 'Encode and decode UTF-8 text strings to and from Base64 format with Unicode safe handling.',
    seoTitle: 'Base64 Encode & Decode Online — Free In-Browser Tool | HelpGate',
    seoDescription: 'Convert text to Base64 and Base64 to text with full Unicode support. Ultra-fast, private, and client-side.',
    keywords: ['base64 encode', 'base64 decode', 'base64 converter', 'unicode base64'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Binary',
    isPopular: false,
    component: Base64ToolComponent,
  },

  'hash-generator': {
    id: 'hash-generator',
    name: 'Cryptographic Hash Generator',
    category: 'developer-tools',
    description: 'Compute cryptographic hashes (SHA-256, SHA-512, SHA-1) using hardware-accelerated Web Crypto API.',
    seoTitle: 'Free Online SHA-256 & SHA-512 Hash Generator | HelpGate',
    seoDescription: 'Generate secure cryptographic message digests using Web Crypto API. Fast, secure, and client-side.',
    keywords: ['sha256 generator', 'sha512 online', 'crypto hash', 'checksum generator'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Fingerprint',
    isPopular: false,
    component: HashGeneratorComponent,
  },

  'uuid-generator': {
    id: 'uuid-generator',
    name: 'UUID / GUID Generator',
    category: 'developer-tools',
    description: 'Generate cryptographically random RFC 4122 Version 4 UUIDs in bulk with uppercase and hyphen options.',
    seoTitle: 'Free Online UUID / GUID v4 Generator | HelpGate',
    seoDescription: 'Generate random UUID v4 identifiers in bulk. Customizable casing and hyphens for developers.',
    keywords: ['uuid generator', 'guid generator', 'bulk uuid', 'rfc 4122 v4'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Cpu',
    isPopular: false,
    component: UuidGeneratorComponent,
  },

  // ==========================================
  // 13. BUSINESS & FINANCE TOOLS
  // ==========================================
  'gst-calculator': {
    id: 'gst-calculator',
    name: 'Indian GST Calculator',
    category: 'business-tools',
    description: 'Compute Indian Goods and Services Tax across all slabs (5%, 12%, 18%, 28%) with CGST, SGST, and IGST breakdowns.',
    seoTitle: 'Online GST Calculator India — Inclusive & Exclusive Tax | HelpGate',
    seoDescription: 'Calculate Indian GST amounts with CGST, SGST, and IGST breakdowns. Free business tax calculator.',
    keywords: ['gst calculator', 'india gst rates', 'inclusive gst', 'exclusive gst', 'cgst sgst calculator'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Percent',
    isPopular: true,
    component: GstCalculatorComponent,
  },

  'emi-calculator': {
    id: 'emi-calculator',
    name: 'Loan EMI Calculator',
    category: 'business-tools',
    description: 'Calculate monthly loan EMIs, total interest payable, and comprehensive amortization schedules for loans.',
    seoTitle: 'Loan EMI Calculator Online — Home, Car & Personal Loans | HelpGate',
    seoDescription: 'Calculate loan EMI payments with interactive sliders, total interest breakdown, and amortization schedule.',
    keywords: ['emi calculator', 'loan emi', 'home loan emi', 'car loan calculator', 'amortization calculator'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Calculator',
    isPopular: true,
    component: EmiCalculatorComponent,
  },

  'invoice-generator': {
    id: 'invoice-generator',
    name: 'Professional Invoice Generator',
    category: 'business-tools',
    description: 'Create, customize, and print client invoices with itemized line entries, tax calculation, and instant print/PDF export.',
    seoTitle: 'Free Invoice Generator Online — Print & Download PDF | HelpGate',
    seoDescription: 'Create professional client invoices with line items, tax rates, and instant PDF download. 100% private.',
    keywords: ['free invoice generator', 'invoice maker', 'freelance invoice', 'create invoice pdf'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    isPopular: true,
    component: InvoiceGeneratorComponent,
  },

  // ==========================================
  // 14. PRODUCTIVITY & UTILITIES
  // ==========================================
  'image-resizer': {
    id: 'image-resizer',
    name: 'Image Resizer & Converter',
    category: 'general-utilities',
    description: 'Resize, crop, and convert JPG, PNG, and WebP images directly on your device using Canvas hardware acceleration.',
    seoTitle: 'Free In-Browser Image Resizer & Converter — No Uploads | HelpGate',
    seoDescription: 'Resize images by width, height, or percentage. Convert between JPG, PNG, and WebP formats with zero cloud uploads.',
    keywords: ['image resizer', 'resize picture online', 'convert png to webp', 'photo compress'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Image',
    isPopular: true,
    component: ImageResizerComponent,
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  'password-generator': {
    id: 'password-generator',
    name: 'Cryptographic Password Generator',
    category: 'general-utilities',
    description: 'Generate high-entropy, cryptographically strong passwords using browser hardware randomness.',
    seoTitle: 'Strong Password Generator — Cryptographic Entropy | HelpGate',
    seoDescription: 'Generate secure, uncrackable passwords using Web Crypto CSPRNG. Customize length, symbols, and numbers.',
    keywords: ['password generator', 'strong password', 'secure password generator', 'random password'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Shield',
    isPopular: true,
    component: PasswordGeneratorComponent,
  },

  'qr-code-generator': {
    id: 'qr-code-generator',
    name: 'QR Code Studio',
    category: 'general-utilities',
    description: 'Create customizable QR codes for URLs, Wi-Fi networks, and contact cards with custom colors and high-res PNG export.',
    seoTitle: 'Free QR Code Generator Online — Custom Colors & PNG Export | HelpGate',
    seoDescription: 'Generate custom QR codes for websites, Wi-Fi, and text. High-resolution canvas rendering with instant download.',
    keywords: ['qr code generator', 'free qr maker', 'custom qr code', 'download qr code'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'QrCode',
    isPopular: true,
    component: QrCodeGeneratorComponent,
  },

  'word-counter': {
    id: 'word-counter',
    name: 'Word & Character Counter',
    category: 'productivity',
    description: 'Real-time text analyzer providing word counts, character statistics, estimated reading time, and keyword density.',
    seoTitle: 'Free Online Word Counter & Reading Time Analyzer | HelpGate',
    seoDescription: 'Analyze word count, characters, sentences, paragraphs, and reading time in real time. Private and client-side.',
    keywords: ['word counter', 'character count', 'reading time calculator', 'text analyzer'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'AlignLeft',
    isPopular: false,
    component: WordCounterComponent,
  },

  'notes-scratchpad': {
    id: 'notes-scratchpad',
    name: 'Ephemeral Notes Scratchpad',
    category: 'productivity',
    description: 'Distraction-free scratchpad with auto-save to browser storage and markdown preview mode.',
    seoTitle: 'Online Scratchpad & Notepad — Auto-Saved in Browser | HelpGate',
    seoDescription: 'Distraction-free scratchpad with auto-save to browser storage. Write notes, code, and markdown with zero cloud storage.',
    keywords: ['online notepad', 'scratchpad', 'quick notes online', 'browser notepad'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Edit3',
    isPopular: true,
    component: NotesScratchpadComponent,
  },

  'pomodoro-timer': {
    id: 'pomodoro-timer',
    name: 'Pomodoro Focus Timer',
    category: 'productivity',
    description: 'Boost focus and productivity with customizable 25-minute Pomodoro intervals and gentle synthesized audio chimes.',
    seoTitle: 'Online Pomodoro Timer — Free Focus & Productivity Timer | HelpGate',
    seoDescription: 'Stay productive with the Pomodoro technique. 25-minute work intervals, break alerts, and synthesized sound chimes.',
    keywords: ['pomodoro timer', 'focus timer', 'productivity timer', 'study timer'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Clock',
    isPopular: false,
    component: PomodoroTimerComponent,
  },

  'stopwatch': {
    id: 'stopwatch',
    name: 'Precision Stopwatch',
    category: 'productivity',
    description: 'High-resolution stopwatch with millisecond precision, lap tracking, and split comparisons.',
    seoTitle: 'Online Stopwatch with Laps — Millisecond Precision | HelpGate',
    seoDescription: 'High precision stopwatch with lap splits and millisecond accuracy. Clean, responsive, and easy to use.',
    keywords: ['online stopwatch', 'stopwatch with laps', 'digital stopwatch', 'millisecond timer'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Clock',
    isPopular: false,
    component: StopwatchComponent,
  },

  'utm-builder': {
    id: 'utm-builder',
    name: 'Campaign UTM Builder',
    category: 'marketing-tools',
    description: 'Construct clean, error-free marketing URLs with standard Google Analytics UTM parameters.',
    seoTitle: 'Free UTM Campaign URL Builder — Google Analytics Ready | HelpGate',
    seoDescription: 'Generate clean tracking URLs for marketing campaigns with presets for Google, Facebook, Twitter, and LinkedIn.',
    keywords: ['utm builder', 'campaign url builder', 'google analytics utm', 'link tracker maker'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'Link',
    isPopular: false,
    component: UtmBuilderComponent,
  },

  'pdf-to-text': {
    id: 'pdf-to-text',
    name: 'PDF to Text Extractor',
    category: 'document-tools',
    description: 'Extract raw text streams and content from PDF files with instant word count and search filtering.',
    seoTitle: 'PDF to Text Online Free — Extract Text from PDF In-Browser | HelpGate',
    seoDescription: 'Extract readable text from PDF documents for free. Copy to clipboard or download as .txt file.',
    keywords: ['pdf to text', 'extract text from pdf', 'pdf to txt online'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    icon: 'FileText',
    isPopular: false,
    component: PdfToTextComponent,
    supportedFormats: ['.pdf'],
  },
};

export const ALL_TOOLS = Object.values(TOOLS_MAP);

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS_MAP[id];
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return ALL_TOOLS.filter((t) => t.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return ALL_TOOLS.filter((t) => t.isPopular);
}

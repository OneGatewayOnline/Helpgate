# HelpGate 🌐

<p align="center">
  <strong>100% Free, Private, Client-Side Technology Platform</strong><br>
  <em>The zero-cloud, zero-tracking, open-source alternative to Smallpdf, iLovePDF, and Adobe Acrobat.</em>
</p>

<p align="center">
  <a href="https://github.com/onegatewayonline/helpgate/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald?style=flat-square" alt="Privacy First" />
  <img src="https://img.shields.io/badge/Zero-Cloud%20Uploads-success?style=flat-square" alt="Zero Cloud Uploads" />
</p>

---

## 💡 Why HelpGate?

Every day, millions of people upload confidential tax documents, signed legal contracts, financial spreadsheets, medical records, and personal photos to commercial PDF web converters.

In return, commercial platforms like Smallpdf, iLovePDF, and Adobe:
- ❌ **Upload your private files to remote cloud servers.**
- ❌ **Impose monthly recurring paywalls ($9–$15/month).**
- ❌ **Enforce artificial wait queues, daily conversion quotas, and file size throttles.**
- ❌ **Clutter the workspace with aggressive banner ads and tracking pixels.**

### The HelpGate Guarantee
**HelpGate changes everything.** Built by [One Gateway Online Pvt Ltd](https://helpgate.in), HelpGate executes **100% of all file transformations, rasterization, text extractions, encodings, and computations directly in your web browser's memory** using WebAssembly, modern Web Workers, Canvas, and Web Crypto APIs.

> 🛡️ **Zero bytes ever leave your device.** You can turn off your Wi-Fi or unplug your Ethernet cable, and HelpGate will continue to convert, merge, compress, and edit documents completely offline.

---

## ✨ Key Features

- 🔒 **100% Client-Side Privacy (Zero Server Uploads)**: Files never touch any backend server. Everything is processed locally in-browser via WebAssembly, `pdf-lib`, `pdfjs-dist`, and `jszip`.
- 🗜️ **Complete 66+ In-Browser Utility Catalog**: Includes the full Smallpdf feature set, developer utilities, Indian GST & financial calculators, QR generators, and productivity tools.
- 🚀 **Zero Paywalls & Zero Restrictions**: Unlimited file operations, no daily usage caps, no accounts required, no hidden credit cards.
- 📱 **Local Network / Wi-Fi Sharing**: Host locally on one laptop and seamlessly access all tools from smartphones, iPads, and office computers over local Wi-Fi (`0.0.0.0:3000`).
- ⚡ **Lightning Fast In-Memory Processing**: No network latency uploading large 100MB+ documents. Processing happens as fast as your device's CPU and RAM allow.
- 🌐 **Offline & Air-Gapped Ready**: Once loaded, all Web Workers and WebAssembly assets run without an active internet connection.

---

## 🧰 Complete Tool Directory (66 In-Browser Utilities)

### 📄 1. PDF & Document Utilities
| Tool | Description | Direct Path |
| :--- | :--- | :--- |
| **Compress PDF** | Reduce PDF file size with Extreme, Recommended, and Low compression tiers | `/tools/pdf-compress/` |
| **Merge PDF** | Combine multiple PDF files into a single unified document with drag-and-drop reordering | `/tools/pdf-merger/` |
| **Split PDF** | Extract page ranges or burst a PDF into separate files | `/tools/pdf-splitter/` |
| **PDF Reader** | Fast, high-fidelity in-browser PDF canvas viewer with zoom, rotation, and navigation | `/tools/pdf-reader/` |
| **Organize PDF** | Visual thumbnail grid to reorder, duplicate, rotate, and delete individual pages | `/tools/pdf-organizer/` |
| **Delete PDF Pages** | Select and strip unwanted pages from any PDF document | `/tools/pdf-deleter/` |
| **Extract PDF Pages** | Extract specific pages or thumbnail selections into a new PDF | `/tools/pdf-extractor/` |
| **Rotate PDF** | Permanently rotate pages (90°, 180°, 270°) | `/tools/pdf-rotator/` |
| **Crop PDF** | Trim page margins and set custom CropBox / MediaBox boundaries | `/tools/pdf-crop/` |
| **Flatten PDF** | Flatten interactive form fields and annotations into static document layers | `/tools/pdf-flatten/` |
| **PDF Editor** | Add annotations, text boxes, and shapes directly to PDF pages | `/tools/pdf-editor/` |
| **PDF Annotator** | Highlight, draw, and underline document sections | `/tools/pdf-annotator/` |
| **Page Numberer** | Add customizable header/footer page numbers (Page X of Y) | `/tools/pdf-numberer/` |
| **Watermark PDF** | Stamp transparent text or image watermarks across pages | `/tools/pdf-watermark/` |
| **Redact PDF** | Black out sensitive private text and confidential figures permanently | `/tools/pdf-redact/` |
| **Sign PDF** | Draw or upload digital signatures and place them on contract documents | `/tools/pdf-sign/` |
| **Protect PDF** | Encrypt PDFs with secure user and owner passwords | `/tools/pdf-protect/` |
| **Unlock PDF** | Decrypt password-protected PDFs (when password is provided) | `/tools/pdf-unlock/` |
| **PDF Scanner** | Capture physical documents with mobile or webcam, binarize, and export to PDF | `/tools/pdf-scanner/` |
| **PDF OCR** | Extract searchable text layers from scanned images and PDFs | `/tools/pdf-ocr/` |
| **PDF to PDF/A** | Convert PDFs to ISO 19005-1/19005-2 compliant archival format | `/tools/pdf-to-pdfa/` |

### 🔄 2. PDF Conversions
| Tool | Description | Direct Path |
| :--- | :--- | :--- |
| **Universal PDF Converter** | All-in-one conversion hub for documents, sheets, and images | `/tools/pdf-converter/` |
| **PDF to JPG** | Render PDF pages to high-resolution JPEG images with batch ZIP download | `/tools/pdf-to-jpg/` |
| **PDF to PNG** | Lossless PNG conversion with 1x/2x/3x retina scaling | `/tools/pdf-to-png/` |
| **PDF to Word (.docx)** | Extract text structures into clean Microsoft Word OpenXML packages | `/tools/pdf-to-word/` |
| **PDF to Excel (.xlsx / .csv)**| Coordinate-based 2D tabular detection exported to spreadsheet formats | `/tools/pdf-to-excel/` |
| **PDF to PowerPoint (.pptx)**| Convert PDF slides into presentation decks | `/tools/pdf-to-ppt/` |
| **PDF to Text (.txt)** | Extract full text streams directly using PDF.js | `/tools/pdf-to-text/` |
| **Word to PDF** | Parse client-side `.docx` XML into styled multi-page PDF documents | `/tools/word-to-pdf/` |
| **Excel to PDF** | Convert `.xlsx` and `.csv` worksheets into formatted PDF tables | `/tools/excel-to-pdf/` |
| **PowerPoint to PDF** | Convert `.pptx` slides into presentation PDFs | `/tools/ppt-to-pdf/` |
| **JPG to PDF** | Assemble photos into standardized A4 / Letter PDF documents | `/tools/jpg-to-pdf/` |
| **Images to PDF** | Combine PNG, JPG, WebP, and BMP images into a single PDF | `/tools/images-to-pdf/` |
| **HTML to PDF** | Convert HTML source code or web pages to PDF | `/tools/html-to-pdf/` |
| **TXT to PDF** | Convert plain text files with customizable typography and margins | `/tools/text-to-pdf/` |
| **RTF to PDF** | Rich Text Format converter to PDF | `/tools/rtf-to-pdf/` |
| **CSV to PDF** | Format tabular CSV data into clean printable PDF tables | `/tools/csv-to-pdf/` |
| **ODT to PDF** | OpenDocument Text (`.odt`) to PDF converter | `/tools/odt-to-pdf/` |
| **ODS to PDF** | OpenDocument Spreadsheet (`.ods`) to PDF converter | `/tools/ods-to-pdf/` |
| **ODP to PDF** | OpenDocument Presentation (`.odp`) to PDF converter | `/tools/odp-to-pdf/` |
| **EPUB to PDF** | Format digital EPUB e-books into printable PDF reading books | `/tools/epub-to-pdf/` |
| **ZIP to PDF** | Unpack archived documents and images and merge them into PDF | `/tools/zip-to-pdf/` |
| **Pages to PDF** | Apple Pages document converter to PDF | `/tools/pages-to-pdf/` |
| **HWP to PDF** | Hancom Hangul Word Processor file converter | `/tools/hwp-to-pdf/` |

### 💻 3. Developer & Data Utilities
| Tool | Description | Direct Path |
| :--- | :--- | :--- |
| **JSON Formatter & Validator** | Beautify, minify, validate, and inspect JSON trees | `/tools/json-formatter/` |
| **Base64 Tool** | Encode and decode text or binary data with full UTF-8 Unicode support | `/tools/base64-tool/` |
| **UUID v4 Generator** | Generate cryptographically secure RFC 4122 v4 UUIDs in bulk | `/tools/uuid-generator/` |
| **Hash Generator** | Compute SHA-256, SHA-512, SHA-1, and MD5 hashes in-browser | `/tools/hash-generator/` |
| **JWT Decoder** | Inspect JSON Web Token headers, payloads, and timestamps safely | `/tools/jwt-decoder/` |
| **URL Encoder / Decoder** | Encode and decode query strings and special URI components | `/tools/url-encoder-decoder/` |
| **Markdown Editor** | Real-time split-pane Markdown editor with live preview and HTML export | `/tools/markdown-editor/` |
| **Diff Checker** | Side-by-side visual text and code diff comparison | `/tools/diff-checker/` |
| **Regex Tester** | Real-time JavaScript regular expression tester with capture group matches | `/tools/regex-tester/` |
| **Color Picker & Converter** | Convert HEX, RGB, HSL, and HSV colors with palette previews | `/tools/color-converter/` |

### 💼 4. Business, Finance & Productivity
| Tool | Description | Direct Path |
| :--- | :--- | :--- |
| **GST Calculator India** | Compute Indian GST (5%, 12%, 18%, 28%) with Inclusive and Exclusive splits | `/tools/gst-calculator/` |
| **Invoice Generator** | Create and export professional PDF invoices with custom line items and tax | `/tools/invoice-generator/` |
| **EMI Calculator** | Calculate loan monthly installments, total interest, and amortization schedules | `/tools/emi-calculator/` |
| **Margin & Markup Calculator** | Calculate cost, revenue, gross margin, and markup percentages | `/tools/margin-calculator/` |
| **QR Code Generator** | Generate custom QR codes with color customization and high-res PNG export | `/tools/qr-code-generator/` |
| **Barcode Generator** | Generate Code128, EAN, UPC, and Code39 barcodes | `/tools/barcode-generator/` |
| **Password Generator** | Cryptographically random password generator with entropy meters | `/tools/password-generator/` |
| **Word & Character Counter** | Real-time text analytics, reading times, and keyword density | `/tools/word-counter/` |
| **Pomodoro Focus Timer** | Configurable work/break interval timer with browser notifications | `/tools/pomodoro-timer/` |
| **Notes Scratchpad** | Instant persistent scratchpad stored safely in browser `localStorage` | `/tools/notes-scratchpad/` |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or later (v20+ or v22+ recommended)
- `npm` v9+ or `pnpm` / `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/onegatewayonline/helpgate.git
   cd helpgate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📶 Sharing over Wi-Fi / LAN (Zero Setup)

HelpGate can be served across your entire home or office network so any device (smartphones, tablets, and computers) can access it without installing any app:

```bash
npm run dev -- -H 0.0.0.0 -p 3000
```

Find your machine's local IP address (`ip route` or `ifconfig` or `ipconfig`), and access HelpGate from your phone's browser:
```text
http://192.168.1.X:3000
```

---

## 🐳 Docker & Self-Hosting

HelpGate is 100% self-contained and can be self-hosted on your home server, VPS, Raspberry Pi, or NAS using Docker:

### Using Docker Compose
```bash
docker compose up -d
```
Access the application at `http://localhost:3000`.

### Building the Docker Image Manually
```bash
docker build -t helpgate:latest .
docker run -d -p 3000:3000 --name helpgate helpgate:latest
```

---

## 🧪 Testing & Quality Assurance

HelpGate includes an extensive multi-tier verification suite covering TypeScript typing, unit tests, algorithmic transformation logic, and automated headless Chrome browser execution.

```bash
# 1. Verify TypeScript types (0 errors)
npm run typecheck

# 2. Run unit tests
npm run test

# 3. Verify core transformation algorithms (PDF, DOCX, XLSX, QR, GST)
npm run test:logic

# 4. Run automated headless Chrome browser end-to-end suite
npm run test:browser

# 5. Build static production release
npm run build
```

---

## 🏗️ Technical Architecture

HelpGate is built with a pure client-side architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Web Browser                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 React 19 / Next.js 15               │   │
│   │               Tailwind CSS Design System            │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│      ┌───────────────────────┼───────────────────────┐      │
│      ▼                       ▼                       ▼      │
│ ┌──────────┐          ┌──────────────┐        ┌──────────┐  │
│ │  PDF.js  │          │   pdf-lib    │        │  JSZip   │  │
│ │ (Canvas) │          │ (Manipulate) │        │ (OpenXML)│  │
│ └────┬─────┘          └──────┬───────┘        └────┬─────┘  │
│      │                       │                     │        │
│      ▼                       ▼                     ▼        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │        Sandboxed In-Memory Browser Blob System         │  │
│ │   Zero Network Uploads • In-Browser Data Protection    │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Next.js 15 App Router**: High-performance static site generation (`output: export` compatible).
- **React 19**: Modern declarative UI components.
- **pdf-lib**: In-memory PDF byte manipulation, page recombination, annotation stamping, form flattening, and encryption.
- **pdfjs-dist**: High-precision rendering of PDF page viewports onto HTML5 `<canvas>` elements and coordinate-aware text stream extraction.
- **JSZip**: In-memory creation and parsing of OpenXML archives (`.docx`, `.xlsx`, `.pptx`, `.odt`).
- **Web Crypto API**: Native browser cryptographic hashing (SHA-256, SHA-512, UUID v4) without external runtime dependencies.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you want to add a new tool, fix a bug, or enhance documentation:

1. Read our [Contributing Guide](CONTRIBUTING.md).
2. Adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
3. Follow the [Step-by-Step Tool Recipe](CONTRIBUTING.md#adding-a-new-tool) to create a new client-side utility.
4. Open an issue or submit a Pull Request!

---

## 🔒 Security & Privacy

For details on our security threat model and how to report vulnerabilities responsibly, please review our [Security Policy](SECURITY.md).

---

## 📄 License

HelpGate is open-source software licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for a free and private internet by <strong>One Gateway Online Pvt Ltd</strong><br>
  <em>HelpGate — Free Technology. For Everyone.</em>
</p>

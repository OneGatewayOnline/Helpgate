# HelpGate — Product Catalogue & Execution Classification
**Document ID:** HG-DOC-02  
**Version:** 1.0.0  

---

## 1. Catalog Overview & Architectural Criteria

Every tool in the HelpGate ecosystem is classified into one of three execution categories:

1. **Client-Only (Browser Native / WASM / Web Worker):** Executes 100% within the browser session. Zero outbound HTTP requests with user payload. Absolute privacy. Target: >= 85% of all platform tools.
2. **Edge / Worker (Serverless Compute):** Requires lightweight compute not possible directly in browser due to CORS, socket restrictions, or network isolation (e.g., DNS queries, SSL inspection, HTTP header fetch). Operates ephemerally without persistent database storage.
3. **External / Hybrid (Disclosed API / External Source):** Optional integrations (e.g., real-time live currency exchange rates, external AI models). Explicitly flagged with privacy notices.

---

## 2. Category A: Productivity Tools

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Online Quick Notes** | `notes-scratchpad` | Client-Only | `localStorage` / `IndexedDB` auto-save, Markdown parser | P1 |
| **Task / To-Do Manager** | `todo-list` | Client-Only | `localStorage` + drag & drop reorder, priority tags | P1 |
| **Pomodoro & Focus Timer** | `pomodoro-timer` | Client-Only | Web Audio API (chimes) + Web Worker intervals | P1 |
| **Multi-Interval Stopwatch**| `stopwatch` | Client-Only | `performance.now()`, lap split tracking | P1 |
| **Countdown Timer** | `countdown-timer` | Client-Only | Web Worker background countdown, audio notifications | P1 |
| **QR Code Generator** | `qr-code-generator`| Client-Only | `qrcode` / SVG rendering, custom colors & logo embed | P1 |
| **Barcode Generator** | `barcode-generator`| Client-Only | `jsbarcode` (CODE128, EAN, UPC, QR) | P2 |
| **Clipboard Inspector** | `clipboard-cleaner`| Client-Only | Clipboard API, rich text to plain text strip | P2 |
| **Text Diff & Compare** | `text-diff` | Client-Only | `diff` (Myers diff algorithm), side-by-side visualization | P1 |
| **Word & Character Counter**| `word-counter` | Client-Only | Regex Unicode word boundary, reading/speaking time | P1 |
| **Date & Duration Calc** | `date-calculator` | Client-Only | Native `Intl` & date-fns math, working day count | P2 |
| **Calendar Utilities** | `calendar-planner` | Client-Only | Local ICS calendar file generator | P2 |
| **Time Duration Calc** | `time-calculator` | Client-Only | Time add/subtract/multiply, timezone math | P2 |

---

## 3. Category B: Document & Media Tools

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **PDF Merger** | `pdf-merger` | Client-Only | `pdf-lib` (pure browser binary manipulation) | P1 |
| **PDF Splitter & Slicer** | `pdf-splitter` | Client-Only | `pdf-lib` (extract page ranges, split to individual) | P1 |
| **PDF Page Extractor** | `pdf-extractor` | Client-Only | `pdf-lib` (select arbitrary page sequences) | P1 |
| **PDF Page Rotator** | `pdf-rotator` | Client-Only | `pdf-lib` (rotate 90/180/270 deg per page) | P1 |
| **PDF Compressor** | `pdf-compressor` | Client-Only | Downsample embedded image streams via canvas / `pdf-lib` | P2 |
| **PDF to Images** | `pdf-to-images` | Client-Only | `pdfjs-dist` render page to Canvas -> PNG/JPEG | P2 |
| **Images to PDF** | `images-to-pdf` | Client-Only | `pdf-lib` embed PNG/JPEG, custom page dimensions | P1 |
| **PDF Metadata Reader** | `pdf-metadata` | Client-Only | `pdf-lib` inspect title, author, producer, encryption | P2 |
| **Image Compressor** | `image-compressor` | Client-Only | Browser Canvas `toBlob` / WebP + MozJPEG WASM | P1 |
| **Image Resizer & Crop** | `image-resizer` | Client-Only | OffscreenCanvas, bicubic interpolation, aspect ratio locks | P1 |
| **Image Format Converter**| `image-converter` | Client-Only | Native Canvas export (PNG <-> JPEG <-> WebP <-> AVIF) | P1 |
| **SVG to PNG/JPEG** | `svg-converter` | Client-Only | Vector render to Canvas, resolution multiplier | P2 |

---

## 4. Category C: Developer Tools

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **JSON Formatter & Tree** | `json-formatter` | Client-Only | `monaco-editor` or `CodeMirror` 6, interactive tree view | P1 |
| **JSON Validator & Fixer** | `json-validator` | Client-Only | Structured error line markers, common syntax auto-fix | P1 |
| **JSON Minifier** | `json-minifier` | Client-Only | Strict non-whitespace JSON serialization | P1 |
| **YAML <-> JSON Converter**| `yaml-converter` | Client-Only | `yaml` / `js-yaml` isomorphic parsing | P1 |
| **XML Formatter & Viewer** | `xml-formatter` | Client-Only | `DOMParser` + XMLSerializer indentation engine | P2 |
| **Base64 Encoder / Decoder**| `base64-tool` | Client-Only | Unicode-safe `TextEncoder`/`TextDecoder` + `btoa`/`atob` | P1 |
| **URL Encoder / Decoder** | `url-encoder` | Client-Only | Standard `encodeURIComponent` & strict decode | P1 |
| **JWT Token Inspector** | `jwt-debugger` | Client-Only | Base64Url decode header/payload, timestamp expiry check | P1 |
| **UUID / GUID Generator** | `uuid-generator` | Client-Only | `crypto.randomUUID()` (v4 RFC 4122) batch generator | P1 |
| **Hash Generator** | `hash-generator` | Client-Only | `crypto.subtle.digest` (SHA-1, SHA-256, SHA-384, SHA-512) | P1 |
| **Regex Tester & Explainer**| `regex-tester` | Client-Only | JavaScript RegExp engine, capture group highlights | P1 |
| **HTML / CSS / JS Formatter**| `code-beautifier`| Client-Only | `prettier/standalone` or custom tokenizer | P2 |
| **Color Code Converter** | `color-converter` | Client-Only | HEX, RGB, HSL, HSV, OKLCH, CMYK converter + contrast check| P1 |
| **Unix Timestamp Converter**| `timestamp-tool` | Client-Only | Epoch ms/sec <-> ISO 8601, timezone formatting | P1 |
| **HTTP Request Tester** | `http-tester` | Client / Proxy | Direct `fetch()` for CORS-enabled APIs; optional edge proxy| P2 |

*Note on JWT Debugger: HelpGate explicitly labels that client-side JWT decoding parses claims without cryptographic verification unless user provides public key.*

---

## 5. Category D: Internet & Network Diagnostics

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **My IP Address Inspector**| `ip-lookup` | Edge Worker | Cloudflare Request Header (`cf-connecting-ip`), ASN lookup | P1 |
| **DNS Record Lookup** | `dns-lookup` | Edge / DoH | Google/Cloudflare DNS over HTTPS (`/resolve?name=...`) | P1 |
| **HTTP Header Inspector** | `http-headers` | Edge Worker | Serverless edge fetch with CORS bypass, security headers | P2 |
| **SSL Certificate Info** | `ssl-checker` | Edge Worker | TLS handshake inspector via Cloudflare Worker | P2 |
| **Redirect Chain Checker** | `redirect-checker`| Edge Worker | Edge HEAD request loop tracing 301/302 redirects | P2 |
| **Website Ping & Response** | `ping-tool` | Edge Worker | TTFB and latency probe from multi-region edge | P2 |

---

## 6. Category E: Business & Financial Calculators

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Professional Invoice Maker**| `invoice-generator`| Client-Only | Dynamic template, local storage draft, instant PDF export | P1 |
| **GST / VAT Calculator** | `gst-calculator` | Client-Only | India GST slabs (0, 5, 12, 18, 28%), CGST/SGST/IGST breakdown| P1 |
| **Profit & Margin Calc** | `margin-calculator`| Client-Only | Gross margin, markup %, revenue, cost formulas | P1 |
| **Loan EMI Calculator** | `emi-calculator` | Client-Only | Amortization schedule table, principal/interest breakdown | P1 |
| **Compound Interest Calc** | `interest-calc` | Client-Only | Monthly compounding, interactive growth chart | P1 |
| **Discount Calculator** | `discount-calc` | Client-Only | Multiple discounts, tax combination | P1 |
| **Quotation / Estimate Gen**| `quotation-maker` | Client-Only | Client-side customizable PDF quotation generator | P2 |
| **Live Currency Calculator**| `currency-calc` | Hybrid (API) | Daily cached exchange rates via edge CDN cache | P2 |

*Disclaimer Standard: Every financial/tax tool renders a prominent informational disclaimer.*

---

## 7. Category F: AI Productivity Utilities

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Client-Side Text Formatter**| `text-cleanser` | Client-Only | Tokenizer, whitespace normalizer, casing transformations | P1 |
| **Markdown to HTML Studio** | `markdown-studio` | Client-Only | `marked` / `remark` parser, live preview, clean export | P1 |
| **Local Summarizer / Keyword**| `text-summarizer` | Client (WebGPU/WASM)| Transformers.js (Xenova) running locally in Web Worker | P3 |
| **OCR Text Extractor** | `ocr-extractor` | Client (WASM) | `tesseract.js` running 100% locally in Web Worker | P2 |

---

## 8. Category G: Software & Open-Source Directory

| Tool Name | Identifier | Execution Model | Scope & Verification | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Linux Software Directory** | `software-linux` | Static / Edge | Verified open-source packages, official repos, apt/snap/flatpak | P1 |
| **Windows Utilities Guide** | `software-windows`| Static / Edge | Official vendor releases, Winget packages, checksum hashes | P1 |
| **Android FOSS Directory** | `software-android`| Static / Edge | F-Droid & GitHub verified releases, APK hashes | P2 |
| **Open-Source Tools Index** | `software-foss` | Static / Edge | Permissive licenses (MIT, Apache, GPL), direct GitHub links | P1 |

---

## 9. Category H: General Utilities

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Password Generator** | `password-gen` | Client-Only | `crypto.getRandomValues()`, entropy score, zero leakage | P1 |
| **Random Number & Die** | `random-generator` | Client-Only | Cryptographic PRNG, distributions, roll simulations | P1 |
| **Unit Converter** | `unit-converter` | Client-Only | Length, weight, volume, temperature, digital bytes | P1 |
| **Timezone Comparison** | `timezone-converter`| Client-Only | `Intl.DateTimeFormat`, interactive multi-city slider | P1 |
| **Case Converter** | `case-converter` | Client-Only | camelCase, snake_case, kebab-case, PascalCase, CONSTANT | P1 |

---

## 10. Category I: Meta & Digital Marketing Tools

| Tool Name | Identifier | Execution Model | Technical Library / API | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **UTM Campaign URL Builder** | `utm-builder` | Client-Only | UTM param parsing, URL validation, preset saving | P1 |
| **Open Graph & Meta Preview**| `og-previewer` | Client / Edge | Simulate Google, Facebook, Twitter, LinkedIn cards | P1 |
| **Robots.txt Analyzer** | `robots-analyzer` | Client-Only | Googlebot parsing rules, directive syntax validation | P2 |
| **Sitemap XML Inspector** | `sitemap-checker` | Client / Edge | XML structure validation, URL count, lastmod format | P2 |

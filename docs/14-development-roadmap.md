# HelpGate — Multi-Phase Development Roadmap
**Document ID:** HG-DOC-14  
**Version:** 1.0.0  

---

## 1. Roadmap Overview & Phased Progression

HelpGate's development is organized into 8 distinct execution phases designed for immediate early value delivery followed by compounding scale.

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Platform Foundation & Architecture (Current)        │
│ - Design System, Registry Core, Next.js SSG Shell, SEO Base │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Core High-Velocity Tools                           │
│ - JSON Studio, Base64, UUID, Hashes, Quick Notes, Timers    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Client-Side Document & Media Suite                 │
│ - PDF Merger, Splitter, Extractor, Image Resizer & Compress │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Business, Financial & Internet Diagnostics         │
│ - Invoice Generator, GST Calc, Margin Calc, DNS/IP lookup   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Verified Software Directory & Technical Guides     │
│ - Linux, Windows, FOSS catalog, package manager snippets    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: Marketing, Meta & Web Diagnostics                  │
│ - UTM Builder, Open Graph Previewer, Robots.txt analyzer    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 7: Local AI Utilities & PWA Offline Engine            │
│ - Offline Service Worker, local OCR, client summarization   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 8: Long-Term Growth, Monitoring & Tool Catalog Scale  │
│ - 100+ tools expansion, localized multi-language SEO        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Milestone Checklist

### Phase 1: Foundation (Milestone M1)
- [x] Comprehensive 18-part Master Architecture & Planning Documentation
- [ ] Next.js 15+ App Router codebase setup with TypeScript Strict Mode
- [ ] Tailwind CSS design system with CSS custom variable dark/light theming
- [ ] Extensible Tool Registry engine with dynamic imports and type contracts
- [ ] SEO Shell: Meta tag generator, OpenGraph images, JSON-LD Schema builder, dynamic sitemap.xml & robots.txt
- [ ] Global Command Palette (`Cmd + K`) search modal with fuzzy matching

### Phase 2: Core High-Velocity Utilities (Milestone M2)
- [ ] JSON Studio: Formatter, Minifier, Validator, Tree Inspector
- [ ] Developer Encoders: Base64 (Unicode-safe), URL Encoder/Decoder, HTML Entities
- [ ] Security Generators: Cryptographic Password Generator, UUID v4 batch generator
- [ ] Cryptographic Hash Generator: SHA-256, SHA-512, SHA-1, MD5
- [ ] Time & Text: Unix Timestamp converter, Word/Character Counter, Case Converter
- [ ] Productivity: Quick Notes Scratchpad (LocalStorage), Pomodoro Focus Timer, Stopwatch

### Phase 3: Document & Media Suite (Milestone M3)
- [ ] Client-side PDF Merger: Multi-file reordering, page preview, instant merge
- [ ] PDF Splitter & Page Extractor: Extract arbitrary page intervals
- [ ] PDF to Image / Images to PDF: Canvas-based conversion engine
- [ ] Image Resizer & Compressor: WebP/JPEG compression with aspect ratio locking
- [ ] QR Code Studio: Custom colors, SVG export, high error-correction levels

### Phase 4: Business & Financial Calculators (Milestone M4)
- [ ] Professional Invoice Generator: Customizable invoice template, client-side print/PDF export
- [ ] Indian GST Calculator: All tax slabs (0%, 5%, 12%, 18%, 28%), CGST/SGST/IGST breakdown
- [ ] Profit & Margin Calculator: Gross profit, markup %, cost analysis
- [ ] Loan EMI Calculator: Monthly amortization schedule with interest/principal chart
- [ ] Internet Diagnostics: Ephemeral Cloudflare Worker for IP, DNS, and HTTP header checking

### Phase 5: Software Directory & Guides (Milestone M5)
- [ ] Curated Software Index: Linux, Windows, macOS, Android, FOSS categories
- [ ] Verified download links, package manager commands (`apt`, `winget`, `brew`, `flatpak`)
- [ ] In-depth guides: High-quality programmatic markdown articles for core tools

### Phase 6: Marketing & Meta Diagnostics (Milestone M6)
- [ ] UTM Builder: Parameter generation and preset management
- [ ] Open Graph & Meta Previewer: Live social card rendering for Twitter, FB, LinkedIn
- [ ] Robots.txt Validator & Sitemap Inspector

### Phase 7: Local AI & PWA Offline Engine (Milestone M7)
- [ ] Progressive Web App (PWA) manifest and Service Worker caching for offline usage
- [ ] Local OCR (Tesseract.js WASM) for offline text extraction from images
- [ ] Client-side text summarization

### Phase 8: Scale & Community Ecosystem (Milestone M8)
- [ ] Continuous tool onboarding pipeline
- [ ] Community tool submission guidelines
- [ ] Automated Lighthouse Core Web Vitals CI regression tests

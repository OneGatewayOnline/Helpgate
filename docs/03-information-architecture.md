# HelpGate — Information Architecture & Routing
**Document ID:** HG-DOC-03  
**Version:** 1.0.0  

---

## 1. Global Sitemap & Route Hierarchy

HelpGate adopts a shallow, deterministic URL structure designed for optimal human readability and maximum search engine crawl efficiency.

```
/
├── /tools/                              # Comprehensive catalog of all digital tools
│   ├── /tools/[tool-slug]/              # Dedicated tool workspace + guide (e.g. /tools/pdf-merger/)
│   └── ...
├── /category/                           # Category hubs with curated tool listings
│   ├── /category/productivity/          # Productivity utilities
│   ├── /category/document-tools/        # PDF & image processing
│   ├── /category/developer-tools/       # JSON, regex, formatters, tokens
│   ├── /category/internet-tools/        # DNS, IP, network diagnostics
│   ├── /category/business-tools/        # Invoices, GST, EMI, calculators
│   ├── /category/ai-utilities/          # Text formatting, local OCR, AI tools
│   ├── /category/general-utilities/     # Passwords, units, timezones
│   └── /category/marketing-tools/       # UTM, meta tags, SEO checkers
├── /software/                           # Verified Software & Open-Source Directory
│   ├── /software/linux/                 # Linux applications & repos
│   ├── /software/windows/               # Windows verified tools
│   ├── /software/android/               # Android open-source & utility apps
│   └── /software/open-source/           # General FOSS index
├── /guides/                             # In-depth technical guides & tutorials
│   ├── /guides/[guide-slug]/            # Canonical articles (e.g., /guides/how-to-compress-pdf-securely/)
│   └── ...
├── /about/                              # Corporate identity, One Gateway Online, mission
├── /privacy/                            # Privacy policy, local processing charter, cookie policy
├── /terms/                              # Terms of service, acceptable use, liability disclaimers
├── /sitemap.xml                         # Programmatically generated index sitemap
├── /robots.txt                          # Crawl instructions for Googlebot, Bingbot
└── /manifest.json                       # Progressive Web App manifest
```

---

## 2. Individual Tool Page Architecture

Every tool route `/tools/[tool-slug]/` is structured as a dual-purpose page:
1. **Top Section (Above the fold):** High-efficiency interactive workspace. Clean, fast, zero clutter, accessible.
2. **Bottom Section (Below the fold):** Rich technical documentation, usage examples, FAQs, structured data, related tools, and privacy disclosures.

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo | Global Search (Cmd+K) | Categories | Dark Mode   │
├─────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Category > Tool Name                         │
│ Tool Title (H1) + Short Description + Privacy Badge [100% Local]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│             ACTIVE INTERACTIVE WORKSPACE (CANVAS)               │
│     - Drag & Drop Zone / Input Textarea / Options Controls      │
│     - Primary Action Trigger (e.g., "Merge PDFs", "Format")     │
│     - Output / Preview Area + Download / Copy Buttons           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Optional 1 Non-Intrusive Display Ad Slot]                      │
├─────────────────────────────────────────────────────────────────┤
│ How to Use [Tool Name] (Step-by-Step Instructions)              │
│ Features & Supported Specifications Table                       │
│ Security & Privacy Guarantee (Detailed explanation)             │
│ Frequently Asked Questions (Accordion + FAQ Schema JSON-LD)     │
│ Related Tools (Curated internal cross-links)                    │
├─────────────────────────────────────────────────────────────────┤
│ Footer: Corporate by One Gateway Online | Links | Disclaimers   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Global Navigation & Search Engine

### Primary Header
- **Brand Identity:** HelpGate logo with tagline "Free Technology. For Everyone."
- **Command Palette (`Cmd + K` / `Ctrl + K`):** Instant client-side fuzzy search across all tools, categories, and guides.
- **Top Category Dropdown:** Quick access to the 8 primary tool domains.
- **Software Hub:** Direct link to `/software/`.
- **Theme Toggle:** System default with seamless manual Dark/Light toggle.

### Footer Structure
- **Column 1 (Platform):** About HelpGate, All Tools, Software Directory, Guides, Roadmap.
- **Column 2 (Categories):** Productivity, Document Tools, Developer Tools, Business Calculators.
- **Column 3 (OneGate Ecosystem):** One Gateway Online Pvt Ltd, OneGate Core, CrediGate, TourGate.
- **Column 4 (Legal & Trust):** Privacy Policy, Terms of Service, Security Charter, Ad Policy, Contact.

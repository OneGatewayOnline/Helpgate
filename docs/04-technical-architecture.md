# HelpGate — Technical Architecture & Stack Specification
**Document ID:** HG-DOC-04  
**Version:** 1.0.0  

---

## 1. Architectural Philosophy: Edge-First & Zero-Database

HelpGate is built upon the principle of **Client-First In-Browser Computation** coupled with **Static Edge Distribution**. 

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│                                                             │
│   ┌───────────────────┐    ┌────────────────────────────┐   │
│   │   Next.js React   │    │     Tool Execution Core    │   │
│   │    App Shell      │    │  (Web Workers / WASM /     │   │
│   │  (Static HTML+JS) │    │   Canvas / Web Crypto)     │   │
│   └─────────▲─────────┘    └──────────────▲─────────────┘   │
└─────────────┼─────────────────────────────┼─────────────────┘
              │ 1. Static Assets (Cached)   │ 2. Edge API (Only for DNS/IP)
              ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────────┐
│  Cloudflare Pages / CDN   │ │   Cloudflare Worker (Edge)    │
│  - Zero bandwidth costs   │ │   - Ephemeral proxy for DNS   │
│  - Global sub-20ms TTFB   │ │   - IP / Header inspection    │
│  - Static pre-rendered    │ │   - Zero database persistence │
└───────────────────────────┘ └───────────────────────────────┘
```

### Core Architecture Tenets:
1. **Zero Database for Standard Usage:** No PostgreSQL, MongoDB, Supabase, or Redis. State is kept in client memory, `localStorage`, or `IndexedDB`.
2. **Pre-Rendered Static Generation (SSG):** All tool landing pages, category indexes, software directories, and guides are fully pre-rendered at build time into pure static HTML/CSS/JS.
3. **Dynamic Import & Route-Level Code Splitting:** Heavy libraries (e.g., `pdf-lib`, `monaco-editor`, `tesseract.js`) are dynamically imported only when a user visits that specific tool and initiates an action. The core bundle remains tiny (< 75 KB gzipped).
4. **Sandboxed Worker Compute:** Heavy computational tasks (compression, hashing large inputs, diff generation) run in non-blocking Web Workers to prevent UI thread freezing.

---

## 2. Technology Stack Selection & Rationales

| Layer | Selected Technology | Justification & Alternatives Considered |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+ (App Router, Static Export)** | Industry standard for React, unmatched SEO capabilities, out-of-the-box static export (`output: 'export'`), robust TypeScript support. *Considered: Astro (less dynamic interactive tooling ecosystem), Vite SPA (inferior native static SEO indexability).* |
| **Language** | **TypeScript (Strict Mode)** | Enforces rock-solid type safety across the Tool Registry schemas, props, and execution handlers. Prevents runtime regressions. |
| **Styling** | **Tailwind CSS v3/v4 + Lucide React** | Zero runtime CSS overhead, rapid responsive layout development, native dark mode support, tiny production stylesheet footprint. |
| **Client Storage** | **Native `localStorage` + `IndexedDB` (idb-keyval)** | High-speed local persistence for draft notes, invoice templates, and recent tool history with zero server transmission. |
| **PDF Manipulation**| **`pdf-lib` + `pdfjs-dist`** | Pure JavaScript/WASM client-side PDF creation, modification, splitting, and rendering without server binary requirements. |
| **Image Engine** | **HTML5 Canvas / OffscreenCanvas + WebCodecs** | Ultra-fast client-side compression, resizing, format conversion (WebP, PNG, JPEG). |
| **Hosting & CDN** | **Cloudflare Pages** | Unlimited bandwidth, zero egress charges, 300+ global edge data centers, automated Git CI/CD deployments. |
| **Edge Compute** | **Cloudflare Workers** | Sub-5ms execution for non-browser operations (DNS-over-HTTPS, IP geolocation, SSL diagnostics). |

---

## 3. High-Performance Client Execution Engine

Heavy tool execution is isolated from the main UI thread via standard Web Workers:

```typescript
// Tool Execution Flow
UI Trigger -> Dispatch Web Worker -> Transfer ArrayBuffer (Zero-Copy) -> Process -> Return Output
```

1. **Zero-Copy Memory Transfer:** Files selected via drag-and-drop or file input are read into `ArrayBuffer` instances and transferred directly to Web Workers, avoiding browser memory duplication.
2. **Memory Cleanup:** Once an operation (e.g., PDF merge) is finalized, `URL.revokeObjectURL()` and buffer detachment ensure instant memory reclamation, preventing memory leaks even on low-RAM mobile devices.
3. **Graceful Fallbacks:** If WebAssembly or Web Worker features are disabled or unavailable in legacy environments, tools degrade gracefully to single-threaded synchronous processing or issue informative compatibility messages.

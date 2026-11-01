# HelpGate — Privacy Architecture & Security Specification
**Document ID:** HG-DOC-09  
**Version:** 1.0.0  

---

## 1. Privacy as a Competitive Advantage

HelpGate views privacy not as a compliance checkbox, but as a foundational architectural design constraint. Most document and utility websites monetize user data or expose confidential documents (tax forms, legal contracts, private JSON schemas, JWT authentication secrets) to cloud servers and storage buckets where they could be logged, leaked, or breached.

HelpGate's **Local Execution Architecture** ensures that user files, tokens, and inputs **never leave the user's browser**.

---

## 2. Privacy Classification Tiers

Every tool published in HelpGate is assigned an explicit, public-facing Privacy Classification Badge:

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Tier 1: Local-Only (Client-Side)                         │
│ - 0% outbound network traffic for tool payload              │
│ - Processing runs in Web Worker, Canvas, or WebAssembly     │
│ - Examples: PDF Merger, Image Resizer, JSON Formatter,      │
│   Hash Generator, Password Generator, Invoice Maker         │
├─────────────────────────────────────────────────────────────┤
│ 🟡 Tier 2: Ephemeral Edge Utility                           │
│ - Outbound request to HelpGate Cloudflare Worker            │
│ - Request carries no personal data (e.g. query domain/IP)   │
│ - Worker retains ZERO logs, zero databases, zero cookies    │
│ - Examples: DNS Record Lookup, My IP Address, Header Check  │
├─────────────────────────────────────────────────────────────┤
│ 🔵 Tier 3: External Disclosed API                           │
│ - Request contacts third-party services (e.g. live FX rate) │
│ - Explicit user consent prompt before initiating request    │
│ - Explicit disclosure of external endpoint domain           │
│ - Examples: Live Currency Converter                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic Security Standards

1. **Password & Token Generation:** Uses `window.crypto.getRandomValues()`, seeded by the operating system's cryptographic entropy source. Math.random() is strictly prohibited across all security-sensitive tools.
2. **Hash & Digest Calculation:** Uses native `window.crypto.subtle.digest('SHA-256', buffer)`. Computation occurs within the browser's hardware-accelerated security primitives.
3. **JWT Decoding:** Decodes header and payload using base64url decoding without sending tokens to any server. Displays a warning that token verification requires signature checking with a secret key.

---

## 4. Content Security Policy (CSP) & Web Isolation

To prevent XSS, script injection, and unauthorized data exfiltration, HelpGate deploys a strict Content Security Policy:

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self' https://cloudflare-dns.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

---

## 5. Memory Sanitization & File Buffer Destruction

When handling large PDF or image files in memory:
1. File buffers read as `ArrayBuffer` or `Blob` are explicitly set to `null` or detached immediately after export.
2. Temporary blob URLs created via `URL.createObjectURL(blob)` are revoked using `URL.revokeObjectURL(url)` immediately after the user triggers the download or when navigating away.
3. No user documents or processed results are saved to persistent client storage without explicit user confirmation (e.g., in the Invoice Generator, where the user can click "Save Draft Locally").

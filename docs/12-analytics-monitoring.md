# HelpGate — Privacy-Preserving Analytics & Monitoring
**Document ID:** HG-DOC-12  
**Version:** 1.0.0  

---

## 1. Zero-PII Telemetry Architecture

HelpGate measures platform usage and reliability without profiling individual users or harvesting private information.

### What HelpGate NEVER Logs:
- ❌ File contents, file names, or document text.
- ❌ Passwords, encryption keys, tokens, or hashes generated.
- ❌ Query strings containing personal credentials.
- ❌ User IP addresses stored alongside browsing behavior.

### What HelpGate Measures:
-  Tool page impressions (to identify most utilized utilities).
-  Tool execution success/failure counter (aggregated metric).
-  Client-side JavaScript exceptions and runtime errors (for debugging).
-  Lighthouse & Core Web Vitals (INP, LCP, CLS) from real users.
-  Global command-palette search queries with 0 results (to prioritize new tool development).

---

## 2. Analytics Stack Comparison & Decision

| Solution | Privacy / Cookie-free | Overhead | Cost | Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Web Analytics** *(Primary)* | 100% Cookieless, respects Do-Not-Track, GDPR compliant | < 1 KB JS beacon, zero main-thread impact | **Free** | **Selected as Primary Production Telemetry** |
| **Self-Hosted Umami / Plausible** | 100% Cookieless, open-source | Lightweight script | Requires tiny server / DB | Available via OGO existing Docker stack if detailed custom funnel metrics needed |
| **Google Analytics (GA4)** | Requires cookie banner consent, heavier script | ~45 KB script bundle | Free | Optional fallback, deferred until strictly needed |

---

## 3. Real-Time Error Monitoring & Health Checks

1. **Client Error Catching:** React Error Boundary reports unhandled tool crashes as anonymized events (e.g. `event: "tool_crash", toolId: "pdf-merger", reason: "InvalidPDFException"`).
2. **Synthetic Health Monitoring:** Daily automated GitHub Actions run synthetic tests validating that all core tool routes respond with HTTP 200 and valid HTML bundles.

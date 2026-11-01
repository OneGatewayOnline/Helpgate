# HelpGate — Advertising Policy & Ethical Monetization Model
**Document ID:** HG-DOC-11  
**Version:** 1.0.0  

---

## 1. Monetization Charter & Ethical Boundaries

HelpGate is permanently free to end users. Limited, non-intrusive advertising is permitted solely to offset domain renewals, CDN maintenance, and ongoing open-source tool development.

Advertising is subservient to user experience. Under no circumstances will advertising compromise usability, performance, or user privacy.

---

## 2. Strict Placement Limits

| Page Type | Maximum Permitted Ad Placements | Allowed Locations |
| :--- | :--- | :--- |
| **Homepage** | **1 Placement** | Sub-hero banner or bottom sponsor card |
| **Category Hubs** | **1 Placement** | Sidebar or between tool grid sections |
| **Tool Detail Pages** | **2 Placements** | 1 below interactive workspace, 1 in bottom guide section |
| **Active Tool Workspace** | **ZERO (0)** | **Strictly prohibited inside the active input/output canvas** |
| **Software Download Pages**| **1 Placement** | Below verified download details (strictly non-deceptive) |

---

## 3. The Anti-Deception Ad Code

To protect users and maintain high domain trust:

1. **No Fake Download Buttons:** Advertisements disguised as "Download Now", "Start", "Play", or "Convert" are strictly banned.
2. **No Interstitials or Popups:** No fullscreen modals, countdown timers, or popunders.
3. **No Audio / Auto-Play Video:** Video ads with sound are blocked.
4. **No Content Shifting (CLS = 0):** All ad containers must have fixed, pre-allocated CSS dimensions (`min-height: 280px`, `min-width: 336px` or `728x90`) so page content does not jump when ads load.
5. **Zero Impact on Tool Functionality:** If an ad blocker is enabled (e.g. uBlock Origin, Brave Shields), tools remain 100% operational with zero anti-adblock nag screens.

---

## 4. Provider Evaluation & Technical Implementation

- **Initial Stage:** Self-hosted tech sponsorships or single ethical network (e.g., Google AdSense Auto-Optimized or EthicalAds for developers).
- **Asynchronous Isolation:** Ad scripts are loaded with `strategy="lazyOnload"` via Next.js Script, ensuring they do not delay DOMContentLoaded, LCP, or Core Web Vitals.
- **Privacy Compliance:** Integration with standard GDPR/CCPA Consent Management Platform (CMP) ensuring personalized ads only load upon consent.

---

## 5. Revenue vs. Infrastructure Model

```
Net Operating Contribution = Advertising Revenue - Hosting/CDN - Operational Expenses
```

- Target CPM: \$1.50 – \$4.00 (Developer / Business utility traffic in US/EU/IN).
- At 500,000 monthly page views with 1.5 ad impressions/page view (750k impressions):
  - Conservative Revenue (RPM \$1.80): ~\$900 / month (₹78,300).
  - Infrastructure Cost (Cloudflare Pages + Workers): ~\$5.00 / month (₹435).
  - **Net Operating Surplus: ~\$895 / month**, providing self-sustaining funding for continuous platform expansion.

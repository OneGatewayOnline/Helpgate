# HelpGate — Infrastructure Cost Engineering & Traffic Scaling Model
**Document ID:** HG-DOC-06  
**Version:** 1.0.0  

---

## 1. Cost Engineering Principles

Traditional utility websites incur crippling server and egress costs because they stream large user files (multi-megabyte PDFs, images, media) to backend servers for processing.

HelpGate's **Client-First Architecture** eliminates up to 99% of variable bandwidth and compute expenditure:
- Static HTML/JS/CSS assets are cached at Cloudflare edge nodes with a **95%+ Cache Hit Ratio**.
- PDF merging, image resizing, formatting, and hashing happen entirely on the user's CPU/RAM.
- Zero server compute is consumed for 85–90% of user interactions.

---

## 2. Infrastructure Provider Comparison

*Exchange rate reference: \$1 USD = ₹87 INR*

| Provider & Stack | Free Tier Allowance | Paid Plan Base | Bandwidth / Egress Cost | Worker / Edge Compute | Vendor Lock-In & Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages + Workers** *(Recommended)* | **Unlimited Bandwidth**, 500 builds/mo, 100k worker req/day | **\$5/mo (Workers Paid)** or \$20/mo (Pages Pro) | **\$0.00 / GB** (Free unlimited egress) | \$0.30 per 1M requests, 50ms CPU included | **Extremely Low.** Static assets can be migrated to any CDN in minutes. |
| **Vercel** | 100 GB bandwidth, 1M edge requests | **\$20/seat/mo + usage** | \$0.15 / GB after 1 TB (Risk of massive bill shock) | \$0.65 per 1M invocations | **High.** Proprietary middleware and edge runtime dependencies. |
| **Netlify** | 100 GB bandwidth, 300 build mins | **\$19/seat/mo + usage** | \$55 per 100 GB overage | \$25 per 1M serverless invocations | **Moderate.** Expensive overage tiers. |
| **AWS (S3 + CloudFront + Lambda@Edge)** | 1 TB CloudFront free tier | Pay-as-you-go | \$0.085 / GB data transfer out | \$0.60 per 1M requests + duration fees | **Low.** But complex billing and operational overhead. |

**Architectural Decision:** **Cloudflare Pages** is selected for primary static hosting due to its zero-cost unmetered bandwidth policy, paired with **Cloudflare Workers** (Standard Tier) for ephemeral network diagnostics.

---

## 3. Traffic Scenario Cost Forecast

We model monthly infrastructure expenses across 7 traffic tiers:

```
Monthly Traffic Scaling (Visitors vs Total Estimated Monthly Cost in USD / INR)
┌──────────────────┬─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Monthly Visitors │ Pageviews   │ Edge Bandw.  │ Edge Worker  │ Total USD    │ Total INR    │
│                  │ (2.5 pv/u)  │ (Avg 350KB)  │ Req (10% u)  │              │              │
├──────────────────┼─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 10,000           │ 25,000      │ 8.75 GB      │ 2,500        │ **$0.00**    │ **₹0**       │
│ 50,000           │ 125,000     │ 43.75 GB     │ 12,500       │ **$0.00**    │ **₹0**       │
│ 100,000          │ 250,000     │ 87.50 GB     │ 25,000       │ **$0.00**    │ **₹0**       │
│ 500,000          │ 1,250,000   │ 437.50 GB    │ 125,000      │ **$5.00**    │ **₹435**     │
│ 1,000,000        │ 2,500,000   │ 875.00 GB    │ 250,000      │ **$5.00**    │ **₹435**     │
│ 5,000,000        │ 12,500,000  │ 4.37 TB      │ 1,250,000    │ **$6.25**    │ **₹544**     │
│ 10,000,000       │ 25,000,000  │ 8.75 TB      │ 2,500,000    │ **$8.50**    │ **₹740**     │
└──────────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

*Notes on Calculations:*
- Fixed Costs: Domain registration (`helpgate.in`): ~\$10/yr (~\$0.83/mo or ₹72/mo).
- Edge Bandwidth: Cloudflare Pages includes unlimited egress without transfer fees.
- Edge Workers: Free tier includes 100,000 requests/day (3M/mo). Tiers above 1M visitors comfortably fit within Cloudflare's \$5/mo plan (includes 10M requests).
- Database & Storage: **\$0.00** because no central persistent storage is provisioned for basic tool operation.
- Cost per 100,000 visitors: **<\$0.50 (₹43)**.

---

## 4. Usage Profiles

1. **Lightweight Visitor (60%):** Visits a single text/code tool (e.g. JSON formatter, timestamp converter, password generator). Edge data transferred: ~120 KB total. Server compute: 0 ms.
2. **Document / Media Visitor (30%):** Loads a PDF or image tool (PDF merger, image resizer). Initial tool bundle transferred: ~350 KB (cached afterwards). Processing: 100% on client device. Server compute: 0 ms.
3. **Network Diagnostic Visitor (10%):** Uses IP address lookup, DNS checker, or HTTP header inspector. Makes 1–3 lightweight requests to Cloudflare Edge Worker. Server compute: ~2 ms CPU time.

---

## 5. Budget Controls & Anomaly Alerts

To prevent unexpected cost escalation from DDoS or automated scraping:
1. **Tier 1 Alert (50% Budget - \$2.50):** Automated notification to engineering team.
2. **Tier 2 Alert (75% Budget - \$3.75):** Cloudflare Rate Limiting rule threshold inspection.
3. **Tier 3 Alert (90% Budget - \$4.50):** Activate "Under Attack Mode" on edge workers to challenge bot scraping.
4. **Hard Cap (100% Budget - \$5.00):** Ephemeral network diagnostic worker returns cached stale responses rather than incurring overage invocations.

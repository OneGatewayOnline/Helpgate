# HelpGate — Architecture Decision Records (ADRs)
**Document ID:** HG-DOC-16  
**Version:** 1.0.0  

---

## ADR-001: Selection of Next.js 15+ App Router (SSG Export)

### Context
HelpGate requires instantaneous static rendering for 100+ tool pages to maximize SEO indexability and achieve sub-100ms global TTFB, while supporting high-performance interactive React UI states.

### Alternatives Considered
1. **Astro:** Excellent for content, but cumbersome when managing hundreds of deeply interactive React client-state machines and shared React component contexts.
2. **Vite SPA:** Fast development, but relies heavily on client-side hydration, which hampers deep crawlability and structured metadata indexing by non-Google search engines.
3. **Next.js 15+ App Router (`output: 'export'`):** Delivers fully pre-rendered static HTML/CSS at build time, rich TypeScript support, native image optimization, and dynamic route splitting.

### Decision
Adopt **Next.js 15+ with static export**. All routes compile to pure static assets deployable on any global CDN without requiring Node.js server runtimes.

---

## ADR-002: Zero-Database Architecture for Platform Operations

### Context
Utility platforms often introduce PostgreSQL, MongoDB, or Supabase early, creating database connection pools, cold starts, credential management, migration scripts, and continuous hosting fees.

### Decision
HelpGate will operate with **ZERO central persistent databases**.
- User preferences, recent tool history, and draft notes are saved in the client's `localStorage` or `IndexedDB`.
- Tool definitions, categories, software directory entries, and guide content are version-controlled static TypeScript/Markdown files in the repository.

### Consequences
- **Positive:** Zero database hosting cost, zero database downtime, zero risk of central database data leaks, infinite horizontal scaling.
- **Negative:** No cross-device synchronization without local file import/export. (Addressed by offering JSON backup export in tools like Notes and Invoices).

---

## ADR-003: Cloudflare Pages & Edge Workers over Vercel/AWS

### Context
Hosting a global site with millions of file downloads and views on platforms like Vercel or AWS can lead to unpredictable bandwidth bills (e.g. \$0.15/GB or higher).

### Decision
Deploy primary production to **Cloudflare Pages** for static asset distribution, paired with **Cloudflare Workers** for ephemeral network diagnostics.

### Consequences
- Unmetered bandwidth: \$0.00 data transfer costs regardless of traffic spikes.
- Low-latency edge delivery across 300+ worldwide PoPs.
- Zero vendor lock-in: The static build output in `out/` can be moved to Netlify, AWS S3, or Nginx in minutes if desired.

---

## ADR-004: Extensible Modular Tool Registry Design

### Context
A monolith with hardcoded routes for hundreds of tools creates merge conflicts, bloated bundle sizes, and maintenance gridlock.

### Decision
Implement a **TypeScript Tool Registry** where each tool lives in its own directory with a typed `ToolDefinition`. Tools are lazy-loaded via `React.lazy()` and dynamically imported only upon navigation.

### Consequences
- Clean separation of concerns: Engineers can add or update a tool without touching global code.
- Minimal initial bundle: Users only download code for the specific tool they use.

---

## ADR-005: Web Workers for Heavy Computation

### Context
Operations like PDF merging, image compression, large text diffing, and cryptographic hashing can block the main JavaScript UI thread, causing UI freezes and failing Google's Interaction to Next Paint (INP) metric.

### Decision
Offload all non-trivial CPU-bound operations to **dedicated Web Workers** or **OffscreenCanvas** workers with zero-copy `ArrayBuffer` transfers.

### Consequences
- UI remains responsive at 60 FPS even while processing large multi-megabyte files.
- Perfect INP scores (< 50ms) across all devices.

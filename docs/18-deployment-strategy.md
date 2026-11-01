# HelpGate — Deployment & Continuous Delivery Strategy
**Document ID:** HG-DOC-18  
**Version:** 1.0.0  

---

## 1. Continuous Deployment Pipeline

HelpGate utilizes a fully automated Git-driven Continuous Integration & Continuous Delivery (CI/CD) workflow. 

Every commit pushed to the `main` branch triggers an automated build, linting, testing, and deployment pipeline to Cloudflare Pages edge network in under 2 minutes.

```
Git Push (main) ──► GitHub Actions CI
                         │
                         ├── 1. TypeScript Typecheck (`tsc --noEmit`)
                         ├── 2. ESLint & Prettier Code Style Verification
                         ├── 3. Algorithmic Unit Tests (`vitest run`)
                         ├── 4. Static Export Build (`next build`)
                         └── 5. Cloudflare Pages Deploy (`wrangler pages deploy out/`)
                                 │
                                 ▼
                     Global Edge Activation (300+ PoPs)
```

---

## 2. Environment Configuration

| Environment | Branch | Deployment Target | Access URL |
| :--- | :--- | :--- | :--- |
| **Production** | `main` | Cloudflare Pages Production | `https://helpgate.in` |
| **Staging / Preview** | Feature branches / PRs | Cloudflare Pages Ephemeral Previews | `https://[branch-hash].helpgate-preview.pages.dev` |

---

## 3. Zero-Downtime Rollback & Cache Invalidation

1. **Instant Rollback:** Cloudflare Pages stores every immutable build artifact. If a bug is detected in production, rolling back to the previous deployment takes a single click or CLI command (`wrangler pages deployment rollback`), achieving instantaneous global traffic redirection in < 5 seconds.
2. **Atomic Cache Invalidation:** Because HTML files reference version-hashed CSS and JS bundles (e.g. `_next/static/chunks/main-c98f12.js`), new releases are atomically deployed without stale script mismatch or asset race conditions.
3. **Security Headers at the Edge:** Cloudflare Pages `_headers` file enforces HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, and Content-Security-Policy automatically on every static response.

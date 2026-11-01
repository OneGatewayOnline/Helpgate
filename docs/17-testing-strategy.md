# HelpGate — Testing & Quality Assurance Strategy
**Document ID:** HG-DOC-17  
**Version:** 1.0.0  

---

## 1. Testing Philosophy: Quality Gates for Every Tool

Before any tool is registered or released to production, it must pass a rigorous automated testing matrix. 

Because HelpGate handles financial calculations, file manipulation, and security keys, algorithmic accuracy is paramount.

```
┌─────────────────────────────────────────────────────────────┐
│                 Continuous Quality Pipeline                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Unit Tests   │      │ Component &   │      │  End-to-End   │
│  (Algorithmic)│      │ Accessibility │      │  (Playwright) │
├───────────────┤      ├───────────────┤      ├───────────────┤
│ GST formulas  │      │ React Testing │      │ PDF merge     │
│ Hash output   │      │ Library       │      │ JSON format   │
│ Base64 unicode│      │ Axe-core a11y │      │ Mobile click  │
│ Regex matcher │      │ ARIA labels   │      │ Lighthouse CI │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## 2. Test Execution Tiers

### Tier 1: Algorithmic Unit Tests
- **Framework:** `Vitest` / `Jest`
- **Scope:** Pure computation functions:
  - GST / VAT calculation accuracy across all tax slabs.
  - EMI amortization formulas against verified standard financial outputs.
  - Unicode Base64 encoding/decoding without character corruption.
  - Cryptographic hash generation against known RFC test vectors.
  - Diff generation accuracy.

### Tier 2: Component & Accessibility Tests
- **Framework:** React Testing Library + `@axe-core/react`
- **Scope:**
  - Proper form submission, validation error state rendering.
  - Drag-and-drop file rejection for unsupported MIME types.
  - Zero accessibility violations (WCAG 2.1 AA minimum, AAA target).
  - Keyboard focus trapping inside modal dialogs (`Cmd + K` search).

### Tier 3: End-to-End (E2E) Browser Tests
- **Framework:** `Playwright`
- **Scope:** Real browser execution (Chromium, Firefox, WebKit):
  - Upload 2 test PDF files -> Click merge -> Verify output PDF blob is generated.
  - Input invalid JSON -> Verify error line is highlighted with syntax guidance.
  - Verify zero console errors or uncaught exceptions across all major routes.

### Tier 4: Lighthouse CI & SEO Audit
- Automated check on static build:
  - Performance: >= 95
  - Accessibility: >= 95
  - Best Practices: >= 95
  - SEO: >= 95
  - Strict budget enforcement: fail build if total initial JS bundle exceeds 100 KB.

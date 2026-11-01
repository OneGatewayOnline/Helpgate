# Contributing to HelpGate 🤝

Thank you for your interest in contributing to HelpGate! HelpGate is a 100% free, client-side, zero-upload technology platform. Our mission is to make powerful document, developer, and business utilities globally accessible without paywalls, subscriptions, or privacy compromises.

---

## 📜 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Our Core Architecture Rule](#our-core-architecture-rule)
- [Getting Started with Development](#getting-started-with-development)
- [Adding a New Tool (Step-by-Step)](#adding-a-new-tool-step-by-step)
- [Code Style & Standards](#code-style--standards)
- [Verification & Testing](#verification--testing)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## 📜 Code of Conduct

HelpGate is dedicated to providing a welcoming, diverse, and harassment-free experience for everyone. By participating in this project, you agree to abide by the terms outlined in our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛡️ Our Core Architecture Rule

> **CRITICAL**: Every single tool in HelpGate **MUST operate 100% client-side**.
> 
> - **NO** sending user files, text, images, or documents to external servers.
> - **NO** remote cloud API dependencies (unless the tool explicitly is a network diagnostic tool like IP lookup that queries an open endpoint).
> - **NO** third-party telemetry, trackers, or analytic scripts embedded inside tools.
> - Processing must happen in-memory using WebAssembly, Web Workers, Canvas, Web Crypto, `pdf-lib`, `pdfjs-dist`, or `jszip`.

---

## 💻 Getting Started with Development

1. **Fork the repository** on GitHub.
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/helpgate.git
   cd helpgate
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch**:
   ```bash
   git checkout -b feat/my-new-tool
   ```
5. **Run the local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview your changes.

---

## 🛠️ Adding a New Tool (Step-by-Step)

Adding a new tool to HelpGate is clean and modular. Follow these three steps:

### Step 1: Create the Tool Component
Create a new folder and component under `src/tools/<tool-slug>/Component.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';

export default function MyNewToolComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      // Perform 100% client-side in-memory processing here
      const arrayBuffer = await file.arrayBuffer();
      
      // Example: Create a Blob from processed data
      const processedBlob = new Blob([arrayBuffer as any], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(processedBlob));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your modern, clean UI using Tailwind CSS */}
    </div>
  );
}
```

### Step 2: Register the Tool in the Registry
Open `src/registry/index.ts` and add your tool definition:

1. Import your component:
   ```ts
   import MyNewToolComponent from '@/tools/my-new-tool/Component';
   ```
2. Add your tool definition to `TOOLS`:
   ```ts
   'my-new-tool': {
     id: 'my-new-tool',
     name: 'My New Tool',
     description: 'Describe what the tool does in one clear sentence.',
     category: 'document-tools', // or 'developer-tools', 'business-tools', etc.
     component: MyNewToolComponent,
     privacyTier: 'client-only',
     keywords: ['keyword 1', 'keyword 2'],
     seoTitle: 'My New Tool Online Free — 100% Private | HelpGate',
     seoDescription: 'Fast, free, and private online utility running 100% in your browser.',
     features: [
       '100% client-side processing',
       'Zero file uploads',
       'Instant download'
     ],
     howToSteps: [
       'Select or drop your file.',
       'Configure processing options.',
       'Download your output instantly.'
     ],
     faq: [
       {
         question: 'Are my files uploaded to a server?',
         answer: 'No. HelpGate executes all processing locally in your browser memory.'
       }
     ]
   }
   ```

### Step 3: Verify & Test
Run the verification suite to ensure 0 errors:
```bash
npm run typecheck
npm run test
npm run test:logic
npm run test:browser
```

---

## 🎨 Code Style & Standards

- **TypeScript**: Strict typechecking enabled. Avoid `any` where possible; use explicit types.
- **Tailwind CSS**: Follow our design token system (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.). Ensure full responsive support for mobile and desktop screens.
- **Icons**: Use [`lucide-react`](https://lucide.dev/icons/) icons.
- **Accessibility**: Include accessible labels, keyboard focus rings, and proper ARIA tags.
- **Git Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(tool-name): add new tool description`
  - `fix(tool-name): resolve rendering bug`
  - `docs: update README with new instructions`

---

## 🧪 Verification & Testing

Before creating a Pull Request, make sure all tests pass:

```bash
# Verify TypeScript types
npm run typecheck

# Run unit tests
npm run test

# Run core logic tests
npm run test:logic

# Run headless Chrome browser tests
npm run test:browser

# Test static production build
npm run build
```

---

## 🚀 Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feat/my-new-tool
   ```
2. Open a Pull Request against the `master` branch.
3. Fill out the PR template with a clear description of your changes and screenshots/GIFs if you modified UI components.
4. Ensure CI checks pass.

Thank you for helping keep the internet free, open, and private! 🌟

# HelpGate — Tool Registry Design & Plugin Architecture
**Document ID:** HG-DOC-05  
**Version:** 1.0.0  

---

## 1. Registry Architecture & Motivation

To scale HelpGate to 1,000+ tools over the next decade without creating an unmaintainable monolith, the platform centers around an **Extensible Tool Registry**.

Adding a new tool requires creating an isolated directory in `src/tools/[tool-id]/` with its metadata, UI component, and execution logic, and registering it in the registry definition. No modifications to global routing or unrelated tools are required.

```
src/
├── registry/
│   ├── index.ts                # Master registry index and query functions
│   ├── types.ts                # ToolDefinition, Category, ExecutionType interfaces
│   └── categories.ts           # Category definitions, icons, metadata
└── tools/
    ├── pdf-merger/
    │   ├── definition.ts       # Metadata, SEO, keywords, capabilities
    │   ├── Component.tsx       # Interactive workspace component
    │   ├── worker.ts          # Optional dedicated Web Worker
    │   └── __tests__/          # Isolated unit and integration tests
    ├── json-formatter/
    └── ...
```

---

## 2. Tool Definition TypeScript Schema

```typescript
export type ExecutionType = 'client-only' | 'edge-worker' | 'external-api';
export type PrivacyTier = 'local-only' | 'ephemeral-edge' | 'external-disclosed';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;                               // Unique slug: e.g. "pdf-merger"
  name: string;                             // Display name: e.g. "PDF Merger"
  category: ToolCategory;                  // Category enum: "document-tools", "productivity", etc.
  description: string;                      // 1-2 sentence description
  seoTitle: string;                         // SEO optimized title tag
  seoDescription: string;                   // Meta description (150-160 chars)
  keywords: string[];                       // Target search keywords
  executionType: ExecutionType;             // Where code runs
  privacyTier: PrivacyTier;                 // Privacy level
  version: string;                          // SemVer string: "1.0.0"
  author: string;                           // "HelpGate Team" or contributor
  iconName: string;                         // Lucide icon identifier
  isPopular?: boolean;                      // Featured on home page
  isNew?: boolean;                          // Badge for recent additions
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  faqs: ToolFaq[];                          // FAQ items for structured schema
  relatedToolIds: string[];                 // Slugs for cross-linking
  instructions: {
    steps: string[];
    tips?: string[];
  };
  supportedFormats?: string[];              // e.g. [".pdf", "application/pdf"]
  browserRequirements?: {
    webWorkers?: boolean;
    webAssembly?: boolean;
    webCrypto?: boolean;
    canvas?: boolean;
  };
}
```

---

## 3. Dynamic Tool Loader Engine

The Tool Loader uses React `Suspense` and `React.lazy()` to ensure that when a user lands on `/tools/pdf-merger/`, only the minimal initial HTML shell loads first. The PDF processing library and interactive canvas are asynchronously chunked:

```typescript
// Example dynamic registration
export const tools: Record<string, ToolDefinition> = {
  'pdf-merger': {
    id: 'pdf-merger',
    name: 'PDF Merger',
    category: 'document-tools',
    description: 'Merge multiple PDF files into a single document directly in your browser. 100% private and secure.',
    seoTitle: 'Merge PDF Online Free — 100% Private Client-Side PDF Merger | HelpGate',
    seoDescription: 'Combine multiple PDF documents into one cleanly formatted PDF file for free. Files are processed locally on your device and never uploaded to any server.',
    keywords: ['merge pdf', 'combine pdf online', 'free pdf merger', 'secure pdf merger'],
    executionType: 'client-only',
    privacyTier: 'local-only',
    version: '1.0.0',
    author: 'HelpGate Engineering',
    iconName: 'FileStack',
    isPopular: true,
    component: React.lazy(() => import('@/tools/pdf-merger/Component')),
    relatedToolIds: ['pdf-splitter', 'pdf-compressor', 'images-to-pdf'],
    faqs: [
      {
        question: 'Are my confidential PDF documents uploaded to your server?',
        answer: 'No. HelpGate merges your PDF files locally using your browser WebAssembly and Web Crypto capabilities. Your documents never leave your computer or phone.'
      },
      {
        question: 'Is there a file size limit for merging PDFs?',
        answer: 'Because processing is local, the limit depends on your device RAM. Standard devices can easily merge hundreds of pages without issue.'
      }
    ],
    instructions: {
      steps: [
        'Drag and drop your PDF files into the upload box or click to select files.',
        'Reorder the PDF documents by dragging them into your desired sequence.',
        'Click the "Merge PDFs" button to combine the files instantly in memory.',
        'Save the merged PDF file directly to your device.'
      ],
      tips: [
        'You can rotate or remove individual files before merging.',
        'The process works completely offline once the page has loaded.'
      ]
    }
  }
};
```

---

## 4. Error Boundary & Sandbox Isolation

Every tool runtime is enclosed in an isolated React `ErrorBoundary`. If an edge case file or malformed user input crashes a specific tool's state machine, the outer platform shell (navigation, search, related tools) remains completely interactive and intact, with a clear user error prompt offering a clean reset.

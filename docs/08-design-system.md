# HelpGate — Design System & UI/UX Specification
**Document ID:** HG-DOC-08  
**Version:** 1.0.0  

---

## 1. Visual Identity & Brand Philosophy

HelpGate is styled as an **ultra-clean, modern, developer-grade digital workspace**. It avoids tacky advertising widgets, cartoon illustrations, and generic stock photography. 

The aesthetic is focused on **high information density, crisp typography, subtle borders, and razor-sharp contrast**.

---

## 2. Color Palette & Theming (Light / Dark Mode)

Built entirely on Tailwind CSS with native CSS variables for instantaneous, zero-flicker theme switching.

```css
/* Color Tokens */
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --popover: #ffffff;
  --popover-foreground: #09090b;
  --primary: #2563eb;          /* HelpGate Deep Indigo-Blue */
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #eff6ff;
  --accent-foreground: #1d4ed8;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #2563eb;
  --radius: 0.5rem;
}

.dark {
  --background: #09090b;        /* Pure Zinc-950 */
  --foreground: #fafafa;
  --card: #121215;              /* Subdued dark card */
  --card-foreground: #fafafa;
  --popover: #121215;
  --popover-foreground: #fafafa;
  --primary: #3b82f6;          /* Vibrant Blue */
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #1e293b;
  --accent-foreground: #93c5fd;
  --destructive: #7f1d1d;
  --destructive-foreground: #fef2f2;
  --border: #27272a;
  --input: #27272a;
  --ring: #3b82f6;
}
```

---

## 3. Typography Hierarchy

- **Primary Sans Font:** `Inter` or system sans fallback (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Monospace Font (Code & Developer Tools):** `JetBrains Mono` or `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.

```
Display Large: 2.25rem (36px) | Font-Weight: 700 | Tracking: -0.025em
Section Heading (H2): 1.5rem (24px) | Font-Weight: 600 | Tracking: -0.02em
Component Title (H3): 1.125rem (18px) | Font-Weight: 600
Body Text: 0.9375rem (15px) | Line-Height: 1.6
Code / Input Text: 0.875rem (14px) | Font-Family: Monospace | Line-Height: 1.5
Caption & Badges: 0.75rem (12px) | Font-Weight: 500
```

---

## 4. Reusable Shared UI Components

1. **`ToolWorkspace`:** Unified wrapper providing breadcrumb navigation, title, privacy badges, full-screen expansion toggle, reset action, and share buttons.
2. **`FileDropzone`:** Responsive drag-and-drop file target supporting drag-over animation, file type verification, multi-file reordering, and direct paste from clipboard.
3. **`CodeEditorPane`:** Dual-pane split viewer (Input / Output) with syntax highlighting, line numbers, minification controls, copy-to-clipboard, and download buttons.
4. **`CommandPalette` (`Cmd + K`):** Instant modal search dialog querying all tools, categories, and shortcuts with fuzzy matching and keyboard arrow navigation.
5. **`PrivacyBadge`:** Visual pill indicator showing:
   - 🟢 `100% Local (Client-Side)`
   - 🟡 `Edge Network Utility (Ephemeral)`
   - 🔵 `External API Verified`

---

## 5. Keyboard Navigation & Accessibility (a11y)

- Complete tab index order: users can operate every tool using only `Tab`, `Shift + Tab`, `Enter`, and `Space`.
- Global keyboard shortcuts:
  - `Cmd + K` / `Ctrl + K`: Open search palette.
  - `Esc`: Close open modals/palettes.
  - `Cmd + Enter` / `Ctrl + Enter`: Trigger primary tool action (e.g., execute format or convert).
- ARIA live announcements (`aria-live="polite"`) for background status changes (e.g. "File merged successfully", "JSON is valid").

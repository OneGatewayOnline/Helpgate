# HelpGate Tools — Spendo Ad Intel & WhatsApp Suite

> **Version:** 1.0.0 &nbsp;|&nbsp; **Author:** One Gateway Online Pvt Ltd &nbsp;|&nbsp; **Website:** [helpgate.in](https://helpgate.in)  
> **Privacy Guarantee:** 100% Client-Side Processing • Zero Server Uploads • Zero Logins or Subscriptions

Official browser extension for **HelpGate** ([helpgate.in](https://helpgate.in)). Brings full, unlimited **Spendo Meta Ad Library intelligence** and powerful **WhatsApp Web contact tools** directly to your browser for free.

---

## 🎯 Feature Overview

### 1. Spendo Meta Ad Library Intelligence (100% Free & Unlimited)
Injected seamlessly into **Meta Ads Library** (`facebook.com/ads/library`):
- **Ad Spend & View Estimation (India Calibrated)**:
  - Estimated **Day Spend** (`₹/day`) and **Total Spend** in native Indian units: **₹, Lakhs (L), Crores (Cr)** or USD ($).
  - Total Impressions (Views), Reach, and Frequency modeling.
  - One-click toggle between Indian Currency (`₹ Lakh/Cr`) and International (`$ USD`).
- **Sales & Revenue Intel**:
  - Calibrated total orders and estimated gross revenue.
  - Automatic product pricing extraction from ad headlines, copy, and landing pages.
  - Real-time **ROAS** (Return on Ad Spend) calculation.
- **Performance & Hook Metrics**:
  - Estimated Click-Through Rate (**CTR**), Cost Per Click (**CPC**), **CPM**, and **CPA**.
  - Video **3-second Hook Rate** (thumb-stop ratio) and **15-second Hold Rate** (ThruPlay).
  - Estimated engagement signals (Likes, Comments, Shares).
- **Audience & Targeting Intelligence**:
  - Target **Age Distribution** (18–24, 25–34, 35–44, 45+).
  - **Gender Split** (Women % vs Men %).
  - **Top Indian States** ranking (Maharashtra, Karnataka, Delhi NCR, UP, Gujarat, Tamil Nadu, etc.).
  - Predicted Targeting Interests & Lookalikes.
- **Creative & Campaign Intel**:
  - Status classification: `Winning — Scaled` 🔥, `Scaling` 📈, `Testing` 🧪, or `Paused / Fatigued` ⏸.
  - Campaign Objective (Sales/Conversions vs WhatsApp Leads), Budget type (CBO vs ABO), and Bid Strategy.
- **1-Click HD Creative Downloader**:
  - Instant one-click download for high-definition ad videos (`.mp4`) and high-res images (`.jpg`) with clean, sanitized filenames.
- **1-Click Ad Copy Extractor**:
  - Quick-copy headline, primary text, and offer angles directly to clipboard.
- **Sticky Summary & Filter Toolbar**:
  - Real-time aggregate metrics at the top of the Meta Ads Library page: Total Ads, Total Spend, Total Revenue, Avg ROAS, Winning Creatives.
  - Instant filters: All Ads, Winning Only, High Spend (> ₹1L), Videos Only, Images Only, WhatsApp Leads.
  - **Export CSV**: One-click download of all analyzed ads as a structured spreadsheet.
- **Saved Ads Vault**:
  - Bookmark winning competitor ads to your local vault (stored safely in local `chrome.storage`).

---

### 2. WhatsApp Web Tools (Pure Public Utility — Zero Cloud Sync)
Injected into **WhatsApp Web** (`web.whatsapp.com`):
- **Quick Contact Extract**:
  - Instantly grabs all visible contacts (names and phone numbers) in your current chat viewport and exports to CSV.
- **Full Auto-Scroll Extract**:
  - Automatically scrolls through up to thousands of chats with smart virtualization handling.
  - Real-time progress bar tracking extracted contacts and validated phone numbers.
  - Normalizes Indian (+91) and international numbers automatically.
- **Universal CSV Export**:
  - Generates clean, spreadsheet-ready CSV (`whatsapp-contacts-full-YYYY-MM-DD.csv`).
- **Direct WhatsApp Chat (No Contact Save)**:
  - Enter any 10-digit phone number and optional message directly in the popup.
  - Opens official WhatsApp chat instantly without saving the number to your phone book.
- **Quick Copy**:
  - Copy all extracted phone numbers to clipboard in 1 click (comma-separated format).

---

### 3. HelpGate Web Tools Hub & Tab Screenshot
- **1-Click Web Tools Launcher**:
  - Direct access to flagship in-browser utilities on [helpgate.in](https://helpgate.in):
    - Merge PDF
    - PDF to Word
    - Compress PDF
    - GST Calculator India
    - QR Code Generator
    - JSON Formatter
- **Full Tab Screenshot**:
  - Captures the current visible browser tab to high-res PNG with 1 click.

---

## 🚀 Installation Guide (Developer Mode)

Works on **Google Chrome**, **Brave**, **Microsoft Edge**, and **Opera**:

1. Open your browser and navigate to `chrome://extensions/` (or `brave://extensions/`, `edge://extensions/`).
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left toolbar.
4. Select the directory:
   ```
   /home/suraj/Desktop/OGO/Helpgate/chrome-extension
   ```
5. The **HelpGate Tools** icon (`HG`) will appear in your browser toolbar!
6. Click the extension icon anytime to open the popup, or visit [web.whatsapp.com](https://web.whatsapp.com/) or [facebook.com/ads/library](https://www.facebook.com/ads/library/) to see the tools in action.

---

## 📁 File Structure

```
chrome-extension/
├── manifest.json          # Manifest V3 configuration & permissions
├── background.js          # Service worker: media downloader, CSV generator, tab screenshots
├── whatsapp-content.js    # WhatsApp Web content script (contact & lead extractor)
├── spendo-content.js      # Meta Ad Library Spendo intelligence engine
├── spendo-styles.css      # Ad Library overlay cards, top sticky toolbar, and badges
├── popup.html             # 3-Tab popup interface (Spendo, WhatsApp, HelpGate Web Tools)
├── popup.js               # Popup controller, vault storage, direct chat & stats
├── icons/                 # Official HelpGate HG icons (16px, 32px, 48px, 128px)
└── README.md              # Documentation & usage guide
```

---

## 🔒 Privacy & Security

HelpGate Tools operates with **zero external telemetry and zero cloud sync**:
- Extracted WhatsApp contacts stay 100% inside your local browser memory.
- Saved competitor ads are stored exclusively in your browser's private `chrome.storage.local`.
- No user accounts, logins, telemetry, or server tracking are required or used.

---

Made with 💙 by **[One Gateway Online Pvt Ltd](https://helpgate.in)**

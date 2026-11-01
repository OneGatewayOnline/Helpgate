# HelpGate — Verified Software & Open-Source Directory
**Document ID:** HG-DOC-13  
**Version:** 1.0.0  

---

## 1. Directory Mission & Non-Hosting Policy

The HelpGate Software Directory provides curated, trustworthy guides and direct download links to verified open-source and free digital software across Linux, Windows, macOS, and Android.

### Critical Legal & Security Policies:
1. **Zero Piracy / Zero Unauthorized Warez:** HelpGate never hosts or mirrors copyrighted proprietary binaries.
2. **Official Destination Links Only:** All download actions link directly to the official project repository (GitHub, GitLab), verified package manager (APT, Snap, Flathub, Winget, Homebrew), or verified vendor website.
3. **Checksum & Integrity Verification:** Software entries display official SHA-256 / GPG signature references so users can verify file authenticity.

---

## 2. Software Listing Schema

```typescript
export type OperatingSystem = 'linux' | 'windows' | 'macos' | 'android' | 'cross-platform';
export type LicenseType = 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'Freeware' | 'Open-Source';

export interface SoftwareEntry {
  id: string;                     // e.g. "obs-studio"
  name: string;                   // "OBS Studio"
  category: string;               // "Video & Streaming", "Developer Tools", "System Utilities"
  description: string;            // Crisp 2-sentence overview
  iconUrl: string;                // Vector or optimized WebP logo
  platforms: OperatingSystem[];   // Supported OS list
  license: LicenseType;           // License classification
  officialWebsite: string;        // Canonical developer domain
  downloadUrl: string;            // Direct official download link
  latestVersion: string;          // e.g. "30.1.2"
  lastVerifiedDate: string;       // ISO Date: e.g. "2026-10-15"
  installCommands?: {             // CLI package manager installation snippets
    apt?: string;
    flatpak?: string;
    winget?: string;
    brew?: string;
  };
  systemRequirements: string;
}
```

---

## 3. Initial Curated Launch Directory

| Software Name | Category | Primary OS | License | Official Source |
| :--- | :--- | :--- | :--- | :--- |
| **OBS Studio** | Video / Streaming | Cross-platform | GPL-2.0 | `obsproject.com` / GitHub |
| **VLC Media Player** | Media Player | Cross-platform | GPL-2.0 | `videolan.org` |
| **7-Zip** | File Compression | Windows | GNU LGPL | `7-zip.org` |
| **GIMP** | Image Editing | Cross-platform | GPL-3.0 | `gimp.org` |
| **HandBrake** | Video Transcoder | Cross-platform | GPL-2.0 | `handbrake.fr` |
| **Krita** | Digital Painting | Cross-platform | GPL-3.0 | `krita.org` |
| **Audacity** | Audio Editing | Cross-platform | GPL-3.0 | `audacityteam.org` |
| **KeePassXC** | Password Vault | Cross-platform | GPL-3.0 | `keepassxc.org` |
| **F-Droid** | App Store (FOSS) | Android | GNU GPL | `f-droid.org` |
| **Termux** | Terminal Emulator | Android | GPL-3.0 | `termux.dev` |
| **Neovim** | Code Editor | Cross-platform | Apache-2.0 | `neovim.io` |
| **Blender** | 3D Graphics | Cross-platform | GPL-3.0 | `blender.org` |

---

## 4. Automated Link & Version Verification

A monthly automated GitHub Action crawls all external download destinations:
- Verifies HTTP 200 response (no broken links).
- Checks GitHub Releases API for new version numbers.
- Alerts the maintainers of version bumps or deprecated links.

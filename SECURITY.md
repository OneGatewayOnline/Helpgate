# Security Policy 🛡️

HelpGate takes user privacy and security with the utmost seriousness. Because HelpGate is fundamentally designed as a **100% client-side platform**, files and confidential documents are processed directly in your browser's memory without being transmitted to any remote backend server.

---

## 🔒 Threat Model & Architecture

- **No Remote File Storage**: HelpGate runs zero backend databases or file ingestion servers for document conversions.
- **Client-Side Sandboxing**: File contents remain inside the browser JavaScript / WebAssembly runtime environment and are freed from memory once tab execution finishes or user operations are complete.
- **No Third-Party Analytics Trackers in Tool Workspaces**: We do not load remote analytics or marketing pixels in tool canvases that inspect document data.

---

## 📦 Supported Versions

Security updates and dependency patches are actively applied to the following version branches:

| Version | Supported          |
| :---    | :---               |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability, memory leak, or unintended external data leakage in HelpGate, please report it privately:

1. **Email us directly at**: [support@helpgate.in](mailto:support@helpgate.in) with the subject line `[SECURITY] HelpGate Vulnerability Report`.
2. **Include in your report**:
   - A description of the vulnerability and potential impact.
   - Exact steps or proof-of-concept (PoC) code to reproduce the issue.
   - Browser version and operating system details.
3. **Disclosure Timeline**:
   - We will acknowledge receipt of your vulnerability report within **48 hours**.
   - We will provide an assessment and targeted remediation plan within **7 business days**.
   - Please do not disclose the vulnerability publicly until a patch has been merged and released.

Thank you for helping us keep HelpGate safe, private, and secure for everyone! 🛡️

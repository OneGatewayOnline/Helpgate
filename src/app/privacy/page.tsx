import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Charter & Policy — 100% Local In-Browser Processing | HelpGate',
  description: 'HelpGate is engineered around client-side computation. Your documents, passwords, code, and financial calculations never leave your device.',
  alternates: {
    canonical: 'https://helpgate.in/privacy/',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Radical Privacy Commitment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Privacy Charter & Policy
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          At HelpGate, privacy is not a legal disclaimer—it is our fundamental architectural constraint. 
          We believe you should never have to surrender your personal data, confidential contracts, or API keys 
          just to format a line of JSON or merge two PDF documents.
        </p>
      </div>

      {/* The 4 Privacy Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card">
          <ServerOff className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="font-bold text-sm text-foreground mb-1">Zero File Uploads</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All PDF and image manipulation occurs purely in your device RAM via WebAssembly and Canvas. Files are never transmitted over the internet to any server.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <EyeOff className="w-6 h-6 text-blue-400 mb-2" />
          <h3 className="font-bold text-sm text-foreground mb-1">Zero Secret Logging</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Passwords, hashes, JWT tokens, and invoices generated in our tools are created ephemerally and never logged, cached, or transmitted to any database.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <Lock className="w-6 h-6 text-purple-400 mb-2" />
          <h3 className="font-bold text-sm text-foreground mb-1">No Tracking Cookies</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            HelpGate does not use persistent tracking cookies, fingerprinting libraries, or cross-site user surveillance mechanisms.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <ShieldCheck className="w-6 h-6 text-amber-400 mb-2" />
          <h3 className="font-bold text-sm text-foreground mb-1">No Mandatory Accounts</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every tool is immediately accessible upon landing. We do not demand email registrations or social logins to unlock basic functionality.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed pt-6 border-t border-border">
        <h2 className="text-lg font-bold text-foreground">1. What Information We Do NOT Collect</h2>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>We do not collect or store documents, PDFs, images, or files you load into any tool.</li>
          <li>We do not record passwords generated with the Password Generator.</li>
          <li>We do not store invoice data on our servers (optional drafts are stored strictly in your browser localStorage).</li>
          <li>We do not record tokens or JSON payloads entered into developer tools.</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground">2. Ephemeral Network Diagnostics</h2>
        <p>
          Certain network diagnostic utilities (e.g. My IP Address lookup) require an edge network request to return your public IP header. 
          This information is processed ephemerally on Cloudflare edge workers in memory and is immediately discarded without database persistence.
        </p>

        <h2 className="text-lg font-bold text-foreground">3. Analytics & Telemetry</h2>
        <p>
          We employ privacy-preserving, cookieless edge analytics (such as Cloudflare Web Analytics) solely to count aggregated page views and 
          monitor system uptime. This data does not track individual user identity or cross-site browsing history.
        </p>

        <h2 className="text-lg font-bold text-foreground">4. Contact & Inquiries</h2>
        <p>
          For privacy inquiries or technical security disclosures, please contact the engineering team at One Gateway Online Pvt Ltd via 
          our official domain at <strong>https://helpgate.in</strong>.
        </p>
      </div>
    </div>
  );
}

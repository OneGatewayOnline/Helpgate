'use client';

import React, { useState } from 'react';
import { 
  DownloadCloud, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { VERIFIED_SOFTWARE, SoftwareItem, OperatingSystem } from '@/data/software';

export default function SoftwareDirectoryPage() {
  const [selectedOs, setSelectedOs] = useState<OperatingSystem | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredSoftware = VERIFIED_SOFTWARE.filter((item) => {
    const matchesOs = selectedOs === 'all' || item.platforms.includes(selectedOs);
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOs && matchesQuery;
  });

  const handleCopyCommand = (key: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Curated Open-Source & Freeware</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Verified Software Directory
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Discover trustworthy open-source software and tools for Linux, Windows, macOS, and Android. 
          Every link points directly to verified upstream developer repositories, package managers, and official downloads.
        </p>
      </div>

      {/* Non-Hosting Legal & Security Notice */}
      <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong>Official Link Policy:</strong> HelpGate does not host or redistribute proprietary executable binaries. 
          All download links route directly to canonical developer websites, GitHub releases, or certified package manager repositories.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card">
        {/* OS Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'linux', label: '🐧 Linux' },
            { id: 'windows', label: '🪟 Windows' },
            { id: 'macos', label: '🍎 macOS' },
            { id: 'android', label: '🤖 Android' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedOs(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedOs === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified software..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Software Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSoftware.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              {/* Title & Meta */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                      v{item.latestVersion}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.license}
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium">{item.category}</span>
                </div>

                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>Download</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>

              {/* Supported OS badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1">OS:</span>
                {item.platforms.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-secondary text-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* CLI Package Manager Commands */}
              {item.installCommands && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    <span>Package Manager Commands</span>
                  </span>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    {item.installCommands.apt && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
                        <span className="truncate mr-2 text-foreground">
                          <strong className="text-primary font-sans mr-1">apt:</strong>
                          {item.installCommands.apt}
                        </span>
                        <button
                          onClick={() => handleCopyCommand(`${item.id}-apt`, item.installCommands!.apt!)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {copiedKey === `${item.id}-apt` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {item.installCommands.winget && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
                        <span className="truncate mr-2 text-foreground">
                          <strong className="text-blue-400 font-sans mr-1">winget:</strong>
                          {item.installCommands.winget}
                        </span>
                        <button
                          onClick={() => handleCopyCommand(`${item.id}-winget`, item.installCommands!.winget!)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {copiedKey === `${item.id}-winget` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {item.installCommands.brew && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
                        <span className="truncate mr-2 text-foreground">
                          <strong className="text-amber-400 font-sans mr-1">brew:</strong>
                          {item.installCommands.brew}
                        </span>
                        <button
                          onClick={() => handleCopyCommand(`${item.id}-brew`, item.installCommands!.brew!)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {copiedKey === `${item.id}-brew` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
              <a
                href={item.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline flex items-center gap-1"
              >
                <span>Official Developer Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>Verified: {item.lastVerifiedDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

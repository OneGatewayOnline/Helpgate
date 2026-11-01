'use client';

import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Trash2, Eye, Edit3, ShieldCheck } from 'lucide-react';

export default function NotesScratchpadComponent() {
  const [content, setContent] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('helpgate-quick-note');
    if (saved) {
      setContent(saved);
      setLastSaved('Restored from local storage');
    } else {
      setContent('# Welcome to HelpGate Notes\n\n- Everything you type here is auto-saved locally in your browser.\n- Zero cloud storage. Zero servers.\n- Works even when you are completely offline!\n\nFeel free to write your quick thoughts, code snippets, or to-do items here.');
    }
  }, []);

  const handleChange = (val: string) => {
    setContent(val);
    localStorage.setItem('helpgate-quick-note', val);
    const now = new Date().toLocaleTimeString();
    setLastSaved(`Saved locally at ${now}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (ext: 'md' | 'txt') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helpgate-note.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !isPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[11px] text-muted-foreground mr-2 hidden sm:inline">
              {lastSaved}
            </span>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => downloadFile('md')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            onClick={() => downloadFile('txt')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear current scratchpad?')) {
                handleChange('');
              }
            }}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive transition-colors"
            title="Clear note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor or Preview Pane */}
      {!isPreview ? (
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing your thoughts, notes, tasks, or code..."
          className="w-full h-[450px] p-4 rounded-xl border border-border bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary resize-y"
          spellCheck={false}
        />
      ) : (
        <div className="w-full h-[450px] p-6 rounded-xl border border-border bg-card text-foreground overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {content}
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-foreground">{words}</strong></span>
          <span>Characters: <strong className="text-foreground">{chars}</strong></span>
        </div>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Storage Only</span>
        </span>
      </div>
    </div>
  );
}

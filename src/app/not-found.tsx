import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Sparkles, Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">404</h1>
          <h2 className="text-xl font-bold text-foreground">Tool or Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The tool or page you are looking for doesn&apos;t exist, or has moved to a new URL.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/category/document-tools/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Wrench className="w-4 h-4 text-primary" />
            <span>Browse PDF Tools</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

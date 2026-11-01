import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Layers, FileStack } from 'lucide-react';
import { CATEGORIES, CATEGORY_LIST } from '@/registry/categories';
import { getToolsByCategory, ALL_TOOLS } from '@/registry';
import { PrivacyBadge } from '@/components/tools/PrivacyBadge';
import { ToolCategory } from '@/registry/types';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({
    category: c.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as ToolCategory];

  if (!cat) {
    return {
      title: 'Category Not Found | HelpGate',
    };
  }

  return {
    title: cat.seoTitle,
    description: cat.seoDescription,
    alternates: {
      canonical: `https://helpgate.in/category/${cat.id}/`,
    },
    openGraph: {
      title: cat.seoTitle,
      description: cat.seoDescription,
      url: `https://helpgate.in/category/${cat.id}/`,
      siteName: 'HelpGate',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES[category as ToolCategory];

  if (!cat) {
    notFound();
  }

  const categoryTools = getToolsByCategory(cat.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{cat.name}</span>
      </nav>

      {/* Category Header */}
      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {cat.name}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {cat.description}
        </p>
        <div className="text-xs text-muted-foreground font-medium">
          Showing {categoryTools.length} {categoryTools.length === 1 ? 'utility' : 'utilities'} • 100% Free
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categoryTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}/`}
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/30 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <FileStack className="w-4 h-4" />
                </div>
                <PrivacyBadge tier={tool.privacyTier} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

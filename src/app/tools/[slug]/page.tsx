import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ALL_TOOLS, getToolById } from '@/registry';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found | HelpGate',
    };
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: `https://helpgate.in/tools/${tool.id}/`,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `https://helpgate.in/tools/${tool.id}/`,
      siteName: 'HelpGate',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    notFound();
  }

  // Get related tools
  const relatedTools = (tool.relatedToolIds || [])
    .map((id) => getToolById(id))
    .filter((t): t is typeof tool => t !== undefined);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://helpgate.in/tools/${tool.id}/#app`,
        name: tool.name,
        url: `https://helpgate.in/tools/${tool.id}/`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All modern web browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: tool.description,
      },
      ...(tool.faqs && tool.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `https://helpgate.in/tools/${tool.id}/#faq`,
              mainEntity: tool.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        '@id': `https://helpgate.in/tools/${tool.id}/#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://helpgate.in' },
          { '@type': 'ListItem', position: 2, name: tool.category, item: `https://helpgate.in/category/${tool.category}/` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `https://helpgate.in/tools/${tool.id}/` },
        ],
      },
    ],
  };

  const ToolComponent = tool.component;
  const { component: _comp, ...toolMetadata } = tool;
  const sanitizedRelated = relatedTools.map(({ component: _c, ...rest }) => rest);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolWorkspace tool={toolMetadata as any} relatedTools={sanitizedRelated as any}>
        <ToolComponent />
      </ToolWorkspace>
    </>
  );
}

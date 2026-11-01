import { CategoryDefinition, ToolCategory } from './types';

export const CATEGORIES: Record<ToolCategory, CategoryDefinition> = {
  'developer-tools': {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Format, validate, encode, decode, and generate code, hashes, and tokens with 100% client-side privacy.',
    icon: 'Code2',
    seoTitle: 'Free Online Developer Utilities & Tools | HelpGate',
    seoDescription: 'Zero-latency, private developer tools: JSON formatter, Base64, cryptographic hashes, UUID generator, and token inspectors running entirely in your browser.',
  },
  'document-tools': {
    id: 'document-tools',
    name: 'Document & Media Tools',
    description: 'Merge, split, compress, and convert PDF documents and images locally on your computer with zero file uploads.',
    icon: 'FileText',
    seoTitle: 'Free Client-Side PDF & Document Tools — No Uploads | HelpGate',
    seoDescription: '100% private document manipulation. Merge PDF, split PDF, compress and resize images in memory without uploading files to any cloud server.',
  },
  'business-tools': {
    id: 'business-tools',
    name: 'Business & Finance',
    description: 'Create professional invoices and calculate GST, margins, loan EMIs, and profit margins instantly.',
    icon: 'Briefcase',
    seoTitle: 'Free Business Calculators & Invoice Generator | HelpGate',
    seoDescription: 'Generate instant PDF invoices and compute Indian GST slabs, profit margins, and loan EMIs without signups or hidden costs.',
  },
  'productivity': {
    id: 'productivity',
    name: 'Productivity',
    description: 'Timers, scratchpads, focus tools, and word counters designed for distraction-free execution.',
    icon: 'CheckSquare',
    seoTitle: 'Free Productivity Utilities, Timers & Scratchpad | HelpGate',
    seoDescription: 'Stay focused with online scratchpads, Pomodoro focus timers, stopwatches, and word counters that persist safely in your browser storage.',
  },
  'general-utilities': {
    id: 'general-utilities',
    name: 'General Utilities',
    description: 'Cryptographic password generators, unit converters, and random number generators.',
    icon: 'Wrench',
    seoTitle: 'Essential Free Digital Utilities & Generators | HelpGate',
    seoDescription: 'High-entropy password generation, cryptographic random values, and unit conversions running locally on your device.',
  },
  'marketing-tools': {
    id: 'marketing-tools',
    name: 'Marketing & SEO',
    description: 'UTM campaign link builders, OpenGraph social card previews, and SEO metadata inspectors.',
    icon: 'BarChart2',
    seoTitle: 'Free Marketing & Campaign URL Tools | HelpGate',
    seoDescription: 'Generate clean tracking URLs with our UTM builder, inspect meta tags, and preview social cards on Google, Twitter, and LinkedIn.',
  },
  'internet-tools': {
    id: 'internet-tools',
    name: 'Internet & Network',
    description: 'Inspect IP addresses, DNS records, HTTP headers, and domain information.',
    icon: 'Globe',
    seoTitle: 'Free Internet & Network Diagnostic Tools | HelpGate',
    seoDescription: 'Fast, ephemeral network diagnostics: my IP address lookup, DNS over HTTPS, and HTTP response checkers without persistent logging.',
  },
  'ai-utilities': {
    id: 'ai-utilities',
    name: 'AI & Text Utilities',
    description: 'Browser-based text formatting, Markdown studio, and local client-side OCR extraction.',
    icon: 'Sparkles',
    seoTitle: 'Free Browser-Based Text & AI Utilities | HelpGate',
    seoDescription: 'Format text, preview Markdown, and extract OCR text locally using modern WebAssembly and browser APIs without cloud transmission.',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

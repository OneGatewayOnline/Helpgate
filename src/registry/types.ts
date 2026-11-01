import { ComponentType } from 'react';

export type ToolCategory =
  | 'productivity'
  | 'document-tools'
  | 'developer-tools'
  | 'internet-tools'
  | 'business-tools'
  | 'ai-utilities'
  | 'general-utilities'
  | 'marketing-tools';

export type ExecutionType = 'client-only' | 'edge-worker' | 'external-api';
export type PrivacyTier = 'local-only' | 'ephemeral-edge' | 'external-disclosed';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolInstruction {
  steps: string[];
  tips?: string[];
}

export interface ToolDefinition {
  id: string;                               // Unique URL slug, e.g. "pdf-merger"
  name: string;                             // Display name, e.g. "PDF Merger"
  category: ToolCategory;                  // Category slug
  description: string;                      // Short description
  seoTitle: string;                         // Meta title
  seoDescription: string;                   // Meta description
  keywords: string[];                       // Keywords for search and SEO
  executionType: ExecutionType;             // Where code executes
  privacyTier: PrivacyTier;                 // Privacy level
  version: string;                          // Semver, e.g. "1.0.0"
  icon: string;                             // Lucide icon name
  isPopular?: boolean;                      // Featured on home page
  isNew?: boolean;                          // Badge as new
  component: ComponentType<any>;            // React component implementing the tool
  faqs?: ToolFaq[];                         // FAQ accordion items
  instructions?: ToolInstruction;           // How to use instructions
  relatedToolIds?: string[];                // Cross-links
  supportedFormats?: string[];              // e.g. [".pdf"]
  disclaimer?: string;                      // Optional disclaimer (for financial tools)
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
}

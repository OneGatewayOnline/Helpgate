import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Acceptable Use & Disclaimers | HelpGate',
  description: 'Review the terms of service and acceptable use policies for HelpGate.in by One Gateway Online Pvt Ltd.',
  alternates: {
    canonical: 'https://helpgate.in/terms/',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: November 1, 2026 • Product of One Gateway Online Pvt Ltd
        </p>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using HelpGate (https://helpgate.in), you agree to be bound by these Terms of Service. 
            If you disagree with any portion of these terms, please discontinue use of the platform immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Permanent Free-Service Guarantee</h2>
          <p>
            HelpGate tools are provided completely free of charge for personal and commercial productivity. 
            One Gateway Online Pvt Ltd pledges never to charge subscriptions or introduce paywalls for existing free utilities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Financial & Tax Calculation Disclaimers</h2>
          <p>
            Calculators on HelpGate (including the GST Calculator, EMI Calculator, and Margin Calculator) provide mathematical estimations 
            based on user inputs. They are provided solely for informational purposes and do not constitute certified accounting, 
            tax, or legal counsel. Users should consult a qualified chartered accountant or financial advisor for official compliance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Software Directory External Links</h2>
          <p>
            HelpGate curates and links to third-party open-source software and official vendor websites. HelpGate does not host, compile, 
            or distribute copyrighted proprietary software binaries. Users must review individual licenses and terms of third-party software 
            before installation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">5. Disclaimer of Warranties & Limitation of Liability</h2>
          <p>
            HelpGate utilities are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. 
            One Gateway Online Pvt Ltd shall not be liable for any indirect, incidental, or consequential damages resulting from the use of 
            or inability to use the platform.
          </p>
        </section>
      </div>
    </div>
  );
}

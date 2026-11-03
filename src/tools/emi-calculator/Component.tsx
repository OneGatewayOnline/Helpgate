'use client';

import React, { useState } from 'react';
import { IndianRupee, Calculator, Copy, Check, Calendar, PieChart } from 'lucide-react';

export default function EmiCalculatorComponent() {
  const [loanAmount, setLoanAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const principal = loanAmount;
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (monthlyRate > 0 && totalMonths > 0) {
    emi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    totalPayment = emi * totalMonths;
    totalInterest = Math.max(0, totalPayment - principal);
  } else if (monthlyRate === 0 && totalMonths > 0) {
    emi = Math.round(principal / totalMonths);
    totalPayment = principal;
    totalInterest = 0;
  }

  const principalPercent = totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 50;
  const interestPercent = 100 - principalPercent;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const copyBreakdown = () => {
    const text = `HelpGate Loan EMI Calculation:
Loan Principal: ${formatCurrency(principal)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureYears} Years (${totalMonths} Months)
Monthly EMI: ${formatCurrency(emi)}
Total Interest: ${formatCurrency(totalInterest)}
Total Payment: ${formatCurrency(totalPayment)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders and Inputs Column */}
        <div className="lg:col-span-7 space-y-6 p-6 rounded-2xl border border-border bg-secondary/20">
          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold uppercase text-muted-foreground">Loan Amount</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">₹</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-36 pl-6 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono font-bold text-sm outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="50000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>₹50K</span>
              <span>₹1 Cr</span>
              <span>₹2 Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold uppercase text-muted-foreground">Interest Rate (% p.a.)</span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono font-bold text-sm outline-none text-right pr-6"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>1%</span>
              <span>10%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold uppercase text-muted-foreground">Loan Tenure (Years)</span>
              <div className="relative">
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono font-bold text-sm outline-none text-right pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xs">Yr</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={tenureYears}
              onChange={(e) => setTenureYears(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* EMI Summary Card Column */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Monthly Loan EMI</span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-primary mt-1">
              {formatCurrency(emi)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              for {totalMonths} monthly installments
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Principal Loan Amount:</span>
              <span className="font-bold font-mono text-foreground">{formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Interest Payable:</span>
              <span className="font-bold font-mono text-primary">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-border/60">
              <span className="font-semibold text-foreground">Total Payment (Principal + Interest):</span>
              <span className="font-bold font-mono text-foreground text-sm">{formatCurrency(totalPayment)}</span>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Principal ({principalPercent}%)</span>
              <span>Interest ({interestPercent}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-secondary flex overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${principalPercent}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${interestPercent}%` }} />
            </div>
          </div>

          <button
            onClick={copyBreakdown}
            className="w-full py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Loan Summary'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

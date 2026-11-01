'use client';

import React, { useState } from 'react';
import { IndianRupee, Copy, Check, Calculator, RefreshCw } from 'lucide-react';

type GstMode = 'exclusive' | 'inclusive';
type SupplyType = 'intra' | 'inter';

export default function GstCalculatorComponent() {
  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<number>(18);
  const [customRate, setCustomRate] = useState<number>(18);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [mode, setMode] = useState<GstMode>('exclusive');
  const [supplyType, setSupplyType] = useState<SupplyType>('intra');
  const [copied, setCopied] = useState<boolean>(false);

  const activeRate = isCustom ? customRate : rate;

  // Calculation formulas
  let netAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (mode === 'exclusive') {
    netAmount = amount;
    gstAmount = (amount * activeRate) / 100;
    totalAmount = netAmount + gstAmount;
  } else {
    totalAmount = amount;
    netAmount = (amount * 100) / (100 + activeRate);
    gstAmount = totalAmount - netAmount;
  }

  const cgst = supplyType === 'intra' ? gstAmount / 2 : 0;
  const sgst = supplyType === 'intra' ? gstAmount / 2 : 0;
  const igst = supplyType === 'inter' ? gstAmount : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const copySummary = () => {
    const text = `HelpGate GST Calculation:
Original Amount: ${formatCurrency(amount)}
GST Rate: ${activeRate}% (${mode === 'exclusive' ? 'Exclusive' : 'Inclusive'})
Net Base Amount: ${formatCurrency(netAmount)}
Total GST: ${formatCurrency(gstAmount)} ${supplyType === 'intra' ? `(CGST: ${formatCurrency(cgst)}, SGST: ${formatCurrency(sgst)})` : `(IGST: ${formatCurrency(igst)})`}
Final Gross Amount: ${formatCurrency(totalAmount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Mode & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-border bg-secondary/20">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Calculation Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('exclusive')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                mode === 'exclusive'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              GST Exclusive (+ Add GST)
            </button>
            <button
              onClick={() => setMode('inclusive')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                mode === 'inclusive'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              GST Inclusive (- Remove GST)
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            {mode === 'exclusive' ? 'Base Net Amount (₹)' : 'Total Gross Amount (₹)'}
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono text-base font-bold outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* GST Slabs Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-muted-foreground">
          Select GST Tax Slab
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {[0, 5, 12, 18, 28].map((slab) => (
            <button
              key={slab}
              onClick={() => {
                setRate(slab);
                setIsCustom(false);
              }}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                !isCustom && rate === slab
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border text-foreground hover:bg-secondary'
              }`}
            >
              {slab}%
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
              isCustom
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-foreground hover:bg-secondary'
            }`}
          >
            Custom %
          </button>
        </div>

        {isCustom && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Enter custom rate:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={customRate}
              onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-sm font-bold outline-none"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        )}
      </div>

      {/* Intra / Inter State Supply Type */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-semibold text-muted-foreground uppercase">Supply Location:</span>
        <label className="flex items-center gap-1.5 text-foreground cursor-pointer">
          <input
            type="radio"
            name="supply"
            checked={supplyType === 'intra'}
            onChange={() => setSupplyType('intra')}
            className="accent-primary"
          />
          <span>Intra-State (CGST + SGST)</span>
        </label>
        <label className="flex items-center gap-1.5 text-foreground cursor-pointer">
          <input
            type="radio"
            name="supply"
            checked={supplyType === 'inter'}
            onChange={() => setSupplyType('inter')}
            className="accent-primary"
          />
          <span>Inter-State (IGST)</span>
        </label>
      </div>

      {/* Result Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Tax Calculation Breakdown</h3>
          </div>
          <button
            onClick={copySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Breakdown'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Base Net Amount</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatCurrency(netAmount)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total GST ({activeRate}%)</p>
            <p className="text-lg font-bold font-mono text-primary">
              {formatCurrency(gstAmount)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary font-semibold mb-1">Final Total Amount</p>
            <p className="text-xl font-bold font-mono text-primary">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Tax component breakdown */}
        <div className="pt-2 text-xs space-y-1.5 border-t border-border/60">
          {supplyType === 'intra' ? (
            <div className="flex justify-between text-muted-foreground">
              <span>CGST ({activeRate / 2}%): <strong className="text-foreground">{formatCurrency(cgst)}</strong></span>
              <span>SGST ({activeRate / 2}%): <strong className="text-foreground">{formatCurrency(sgst)}</strong></span>
            </div>
          ) : (
            <div className="flex justify-between text-muted-foreground">
              <span>Integrated GST (IGST {activeRate}%): <strong className="text-foreground">{formatCurrency(igst)}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

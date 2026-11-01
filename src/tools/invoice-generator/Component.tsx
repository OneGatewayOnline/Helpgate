'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download, Save, RefreshCw, FileText } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGeneratorComponent() {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('HG-2026-001');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<string>('₹');
  const [senderName, setSenderName] = useState<string>('Your Company / Freelancer Name');
  const [senderDetails, setSenderDetails] = useState<string>('123 Tech Park, Bengaluru, India\nGSTIN: 29AAAAA0000A1Z5\ncontact@example.com');
  const [clientName, setClientName] = useState<string>('Client Business Ltd');
  const [clientDetails, setClientDetails] = useState<string>('456 Market St, Mumbai, India\nGSTIN: 27BBBBB1111B2Z6');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [notes, setNotes] = useState<string>('Thank you for your business! Payment is due within 15 days.');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Software Development & Architecture Consulting', quantity: 40, rate: 1500 },
    { id: '2', description: 'Cloud Infrastructure & Security Audit', quantity: 1, rate: 25000 },
  ]);

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('helpgate-invoice-draft');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.invoiceNumber) setInvoiceNumber(d.invoiceNumber);
        if (d.senderName) setSenderName(d.senderName);
        if (d.senderDetails) setSenderDetails(d.senderDetails);
        if (d.clientName) setClientName(d.clientName);
        if (d.clientDetails) setClientDetails(d.clientDetails);
        if (d.items) setItems(d.items);
      } catch (e) {}
    }
  }, []);

  const saveDraftLocally = () => {
    const draft = { invoiceNumber, senderName, senderDetails, clientName, clientDetails, items, taxRate, notes };
    localStorage.setItem('helpgate-invoice-draft', JSON.stringify(draft));
    alert('Invoice draft saved locally on this browser!');
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, description: 'New Service or Product', quantity: 1, rate: 1000 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-secondary/30 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-bold outline-none"
          >
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveDraftLocally}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="p-6 sm:p-10 rounded-2xl border border-border bg-card shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Header: Company & Invoice Info */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2 max-w-sm">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="text-xl sm:text-2xl font-bold text-foreground bg-transparent border-b border-dashed border-border/60 hover:border-primary focus:border-primary outline-none w-full"
            />
            <textarea
              rows={3}
              value={senderDetails}
              onChange={(e) => setSenderDetails(e.target.value)}
              className="text-xs text-muted-foreground bg-transparent border-b border-dashed border-border/60 hover:border-primary focus:border-primary outline-none w-full resize-none leading-relaxed"
            />
          </div>

          <div className="text-left sm:text-right space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-primary uppercase">INVOICE</h2>
            <div className="space-y-1 text-xs">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-muted-foreground">Invoice #:</span>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-32 px-2 py-1 rounded border border-border bg-background sm:text-right font-mono font-bold text-foreground text-xs outline-none"
                />
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-muted-foreground">Date:</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="px-2 py-1 rounded border border-border bg-background text-foreground text-xs outline-none"
                />
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-muted-foreground">Due Date:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-2 py-1 rounded border border-border bg-background text-foreground text-xs outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="space-y-2 max-w-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bill To:</span>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="text-base font-bold text-foreground bg-transparent border-b border-dashed border-border/60 hover:border-primary focus:border-primary outline-none w-full"
          />
          <textarea
            rows={2}
            value={clientDetails}
            onChange={(e) => setClientDetails(e.target.value)}
            className="text-xs text-muted-foreground bg-transparent border-b border-dashed border-border/60 hover:border-primary focus:border-primary outline-none w-full resize-none leading-relaxed"
          />
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="py-2.5 font-semibold">Item Description</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-center">Qty</th>
                <th className="py-2.5 px-3 font-semibold w-32 text-right">Rate ({currency})</th>
                <th className="py-2.5 px-3 font-semibold w-32 text-right">Total ({currency})</th>
                <th className="py-2.5 w-10 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent outline-none text-foreground border-b border-transparent focus:border-primary py-1"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-mono outline-none text-foreground border-b border-transparent focus:border-primary py-1"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-right font-mono outline-none text-foreground border-b border-transparent focus:border-primary py-1"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    {(item.quantity * item.rate).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right print:hidden">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-primary hover:bg-primary/10 transition-colors print:hidden"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Line Item</span>
        </button>

        {/* Calculation Totals */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6 border-t border-border">
          <div className="space-y-2 max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes & Terms:</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs text-muted-foreground bg-transparent border rounded-lg p-2.5 border-border hover:border-primary focus:border-primary outline-none w-full resize-none leading-relaxed"
            />
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-foreground">{currency} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-muted-foreground">
              <span>Tax ({taxRate}%):</span>
              <span className="font-mono font-bold text-foreground">{currency} {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-border text-sm font-bold text-primary">
              <span>Total Due:</span>
              <span className="font-mono text-base">{currency} {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CheckSquare, Download, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';

interface DetectedField {
  name: string;
  type: string;
  value: string;
  checked?: boolean;
}

export default function PdfFormFillerComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<DetectedField[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setDownloadUrl(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const form = pdf.getForm();
      const rawFields = form.getFields();

      const detected: DetectedField[] = rawFields.map((fld) => {
        const name = fld.getName();
        const type = fld.constructor.name;
        let value = '';
        let checked = false;

        if (fld instanceof PDFTextField) {
          value = fld.getText() || '';
        } else if (fld instanceof PDFCheckBox) {
          checked = fld.isChecked();
        }

        return { name, type, value, checked };
      });

      if (detected.length === 0) {
        // Sample fields for demo if blank PDF
        detected.push(
          { name: 'Full Legal Name', type: 'PDFTextField', value: 'Jane Doe' },
          { name: 'Email Address', type: 'PDFTextField', value: 'jane@example.com' },
          { name: 'I Agree to Terms & Conditions', type: 'PDFCheckBox', value: '', checked: true }
        );
      }

      setFields(detected);
    } catch {
      setFields([]);
    }
  };

  const updateFieldValue = (name: string, val: string) => {
    setFields(fields.map((f) => (f.name === name ? { ...f, value: val } : f)));
  };

  const toggleCheckbox = (name: string) => {
    setFields(fields.map((f) => (f.name === name ? { ...f, checked: !f.checked } : f)));
  };

  const handleSaveForm = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();

      for (const f of fields) {
        try {
          if (f.type === 'PDFTextField') {
            const field = form.getTextField(f.name);
            field.setText(f.value);
          } else if (f.type === 'PDFCheckBox') {
            const field = form.getCheckBox(f.name);
            if (f.checked) field.check();
            else field.uncheck();
          }
        } catch {
          // Field not matching standard AcroForm
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Failed to fill form:', err);
      alert('Error saving form data.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Select Fillable PDF Form
        </h3>
        <FileDropzone
          accept=".pdf"
          maxFiles={1}
          onFilesSelected={handleFileSelect}
          label="Drag & drop your fillable PDF form here"
        />
        {file && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.name} — Detected {fields.length} interactive fields
            </span>
            <button
              onClick={() => { setFile(null); setDownloadUrl(null); }}
              className="text-rose-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Fill Form Fields
          </h4>

          <div className="space-y-3">
            {fields.map((f, idx) => (
              <div key={idx} className="space-y-1">
                {f.type === 'PDFCheckBox' ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={!!f.checked}
                      onChange={() => toggleCheckbox(f.name)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="font-medium">{f.name}</span>
                  </label>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {f.name}
                    </label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateFieldValue(f.name, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
        <button
          onClick={handleSaveForm}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Completed Form...
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              Save & Download Completed PDF
            </>
          )}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`completed-${file?.name || 'form.pdf'}`}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
          >
            <Download className="w-4 h-4" />
            Download Filled Form
          </a>
        )}
      </div>
    </div>
  );
}

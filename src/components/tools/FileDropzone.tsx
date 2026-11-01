'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string | Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  accept,
  multiple = false,
  maxFiles,
  maxSizeMB = 100,
  label = 'Drag and drop files here, or click to browse',
  sublabel = 'Processed 100% locally on your computer. Zero uploads.',
  className = '',
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedAccept = typeof accept === 'object' && accept !== null
    ? Object.values(accept).flat().join(',')
    : accept;

  const handleFiles = (fileList: FileList | null) => {
    setError(null);
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Validate size
    for (const f of filesArray) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
    }

    onFilesSelected(filesArray);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-secondary/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={resolvedAccept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1">{label}</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-3">{sublabel}</p>

        {resolvedAccept && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 px-2 py-0.5 rounded bg-secondary">
            Supported: {resolvedAccept}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

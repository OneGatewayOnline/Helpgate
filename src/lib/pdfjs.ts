// Client-side PDF.js loader and rendering utility
export async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
  return pdfjs;
}

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array) {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(data),
    useSystemFonts: true,
    isEvalSupported: false,
  });
  return await loadingTask.promise;
}

export async function renderPageToCanvas(
  page: any,
  scale: number = 1.5
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

export async function extractTextFromPdfPage(page: any): Promise<string> {
  const textContent = await page.getTextContent();
  let lastY: number | null = null;
  let text = '';

  for (const item of textContent.items as any[]) {
    if (!item.str) continue;
    // item.transform[5] is the Y-coordinate on the page
    const currentY = item.transform ? Math.round(item.transform[5]) : null;

    if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
      text += '\n' + item.str;
    } else {
      text += (text.length > 0 && !text.endsWith('\n') && !text.endsWith(' ') ? ' ' : '') + item.str;
    }
    lastY = currentY;
  }

  return text.trim();
}

export async function extractAllTextFromPdf(data: ArrayBuffer | Uint8Array): Promise<string[]> {
  const doc = await loadPdfDocument(data);
  const pagesText: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await extractTextFromPdfPage(page);
    pagesText.push(text);
  }

  return pagesText;
}

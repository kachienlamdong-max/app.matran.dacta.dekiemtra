import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const textPieces: string[] = [];

    // Read up to 50 pages to keep it fast
    const pagesToRead = Math.min(numPages, 50);

    for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      if (pageText.trim().length > 0) {
        textPieces.push(`--- Trang ${pageNum} ---\n${pageText}`);
      }
    }

    return textPieces.join('\n\n');
  } catch (error) {
    console.error('Error parsing PDF with pdfjs-dist:', error);
    throw error;
  }
}

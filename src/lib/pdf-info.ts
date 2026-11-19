export type PdfInfo = {
  pageCount: number;
  title: string | null;
  author: string | null;
};

export async function readPdfInfo(bytes: Uint8Array): Promise<PdfInfo> {
  const { PDFDocument } = await import("pdf-lib");
  const document = await PDFDocument.load(bytes, { updateMetadata: false });

  return {
    pageCount: document.getPageCount(),
    title: document.getTitle()?.trim() || null,
    author: document.getAuthor()?.trim() || null,
  };
}
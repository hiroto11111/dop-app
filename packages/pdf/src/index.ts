import { PDFDocument, StandardFonts } from "pdf-lib";
import type { InvoiceDraft } from "@dop/domain";
import { summarizeInvoice } from "@dop/domain";

export async function createInvoicePdf(invoice: InvoiceDraft): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const summary = summarizeInvoice(invoice);

  page.drawText(`Invoice ${invoice.invoiceNumber}`, { x: 48, y: 780, size: 18, font });
  page.drawText(`Customer: ${invoice.customer.name}`, { x: 48, y: 744, size: 11, font });
  page.drawText(`Issue date: ${invoice.issueDate}`, { x: 48, y: 724, size: 11, font });
  page.drawText(`Total: ${summary.total.toLocaleString("ja-JP")} JPY`, {
    x: 48,
    y: 704,
    size: 13,
    font
  });

  return pdf.save();
}


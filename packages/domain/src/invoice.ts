import { z } from "zod";

export const InvoiceItemSchema = z.strictObject({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(1)
});

export const InvoiceDraftSchema = z.strictObject({
  schemaVersion: z.string().default("v1"),
  issuer: z.strictObject({
    name: z.string().min(1),
    registrationNumber: z.string().min(1)
  }),
  customer: z.strictObject({
    code: z.string().min(1),
    name: z.string().min(1)
  }),
  invoiceNumber: z.string().min(1),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.literal("JPY").default("JPY"),
  items: z.array(InvoiceItemSchema).min(1)
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type InvoiceDraft = z.infer<typeof InvoiceDraftSchema>;

export function createInvoiceDraft(input: unknown): InvoiceDraft {
  return InvoiceDraftSchema.parse(input);
}

export function validateInvoiceDraft(input: unknown) {
  return InvoiceDraftSchema.safeParse(input);
}

export function summarizeInvoice(invoice: InvoiceDraft) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxTotal = invoice.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice * item.taxRate),
    0
  );

  return {
    subtotal,
    taxTotal,
    total: subtotal + taxTotal
  };
}


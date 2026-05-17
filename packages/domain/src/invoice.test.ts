import { describe, expect, it } from "vitest";
import { createInvoiceDraft, summarizeInvoice, validateInvoiceDraft } from "./invoice";

describe("invoice domain", () => {
  it("validates and summarizes a draft invoice", () => {
    const invoice = createInvoiceDraft({
      issuer: { name: "Issuer", registrationNumber: "T1234567890123" },
      customer: { code: "C001", name: "Customer" },
      invoiceNumber: "INV-001",
      issueDate: "2026-05-17",
      dueDate: "2026-06-16",
      items: [{ description: "Work", quantity: 2, unitPrice: 1000, taxRate: 0.1 }]
    });

    expect(summarizeInvoice(invoice)).toEqual({
      subtotal: 2000,
      taxTotal: 200,
      total: 2200
    });
  });

  it("rejects missing invoice items", () => {
    const result = validateInvoiceDraft({
      issuer: { name: "Issuer", registrationNumber: "T1234567890123" },
      customer: { code: "C001", name: "Customer" },
      invoiceNumber: "INV-001",
      issueDate: "2026-05-17",
      dueDate: "2026-06-16",
      items: []
    });

    expect(result.success).toBe(false);
  });
});


import { createInvoiceDraft, summarizeInvoice } from "@dop/domain";

const sampleInvoice = createInvoiceDraft({
  issuer: {
    name: "Example Studio",
    registrationNumber: "T1234567890123"
  },
  customer: {
    code: "C001",
    name: "Sample Customer"
  },
  invoiceNumber: "INV-2026-0001",
  issueDate: "2026-05-17",
  dueDate: "2026-06-16",
  items: [
    {
      description: "Consulting",
      quantity: 2,
      unitPrice: 50000,
      taxRate: 0.1
    }
  ]
});

const summary = summarizeInvoice(sampleInvoice);

export default function Home() {
  return (
    <main>
      <section className="shell">
        <p className="eyebrow">Invoice pipeline</p>
        <h1>Data-oriented invoice generation</h1>
        <dl>
          <div>
            <dt>Invoice</dt>
            <dd>{sampleInvoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>{sampleInvoice.customer.name}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{summary.total.toLocaleString("ja-JP")} JPY</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}


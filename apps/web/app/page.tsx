"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type InvoiceDraft,
  summarizeInvoice,
  validateInvoiceDraft
} from "@dop/domain";

type ItemForm = {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

type InvoiceForm = {
  issuerName: string;
  registrationNumber: string;
  customerCode: string;
  customerName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: ItemForm[];
};

const initialForm: InvoiceForm = {
  issuerName: "",
  registrationNumber: "",
  customerCode: "",
  customerName: "",
  invoiceNumber: "",
  issueDate: "",
  dueDate: "",
  items: [
    {
      description: "",
      quantity: "",
      unitPrice: "",
      taxRate: ""
    }
  ]
};

const formStorageKey = "dop.invoiceForm.v1";

function isItemForm(value: unknown): value is ItemForm {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.description === "string" &&
    typeof item.quantity === "string" &&
    typeof item.unitPrice === "string" &&
    typeof item.taxRate === "string"
  );
}

function isInvoiceForm(value: unknown): value is InvoiceForm {
  if (!value || typeof value !== "object") {
    return false;
  }

  const form = value as Record<string, unknown>;
  return (
    typeof form.issuerName === "string" &&
    typeof form.registrationNumber === "string" &&
    typeof form.customerCode === "string" &&
    typeof form.customerName === "string" &&
    typeof form.invoiceNumber === "string" &&
    typeof form.issueDate === "string" &&
    typeof form.dueDate === "string" &&
    Array.isArray(form.items) &&
    form.items.length > 0 &&
    form.items.every(isItemForm)
  );
}

function loadStoredForm() {
  try {
    const stored = window.localStorage.getItem(formStorageKey);
    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);
    return isInvoiceForm(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function emptyToUndefined(value: string) {
  return value === "" ? undefined : value;
}

function toDraft(form: InvoiceForm): unknown {
  return {
    issuer: {
      name: form.issuerName,
      registrationNumber: form.registrationNumber
    },
    customer: {
      code: form.customerCode,
      name: form.customerName
    },
    invoiceNumber: form.invoiceNumber,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    currency: "JPY",
    items: form.items.map((item) => ({
      description: item.description,
      quantity: emptyToUndefined(item.quantity),
      unitPrice: emptyToUndefined(item.unitPrice),
      taxRate: emptyToUndefined(item.taxRate)
    }))
  };
}

function formatYen(value: number) {
  return `${value.toLocaleString("ja-JP")} JPY`;
}

export default function Home() {
  const [form, setForm] = useState<InvoiceForm>(initialForm);
  const [hasLoadedStoredForm, setHasLoadedStoredForm] = useState(false);

  useEffect(() => {
    const storedForm = loadStoredForm();
    if (storedForm) {
      setForm(storedForm);
    }
    setHasLoadedStoredForm(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredForm) {
      return;
    }

    window.localStorage.setItem(formStorageKey, JSON.stringify(form));
  }, [form, hasLoadedStoredForm]);

  const validation = useMemo(() => validateInvoiceDraft(toDraft(form)), [form]);
  const invoice = validation.success ? validation.data : null;
  const summary = invoice ? summarizeInvoice(invoice) : null;
  const errors = validation.success
    ? []
    : validation.error.issues.map((issue) => ({
        path: issue.path.join(".") || "input",
        message: issue.message
      }));

  function updateField<K extends keyof InvoiceForm>(key: K, value: InvoiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateItem(index: number, key: keyof ItemForm, value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        { description: "", quantity: "", unitPrice: "", taxRate: "" }
      ]
    }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">Invoice input</p>
          <h1>請求書データ入力</h1>
        </div>
        <div className={invoice ? "status ok" : "status error"}>
          {invoice ? "検証OK" : "要修正"}
        </div>
      </header>

      <div className="workspace">
        <form className="input-pane">
          <section className="form-section">
            <h2>発行者</h2>
            <div className="field-grid two">
              <label>
                <span>発行者名</span>
                <input
                  value={form.issuerName}
                  onChange={(event) => updateField("issuerName", event.target.value)}
                />
              </label>
              <label>
                <span>登録番号</span>
                <input
                  value={form.registrationNumber}
                  onChange={(event) =>
                    updateField("registrationNumber", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>取引先</h2>
            <div className="field-grid two">
              <label>
                <span>取引先コード</span>
                <input
                  value={form.customerCode}
                  onChange={(event) =>
                    updateField("customerCode", event.target.value)
                  }
                />
              </label>
              <label>
                <span>取引先名</span>
                <input
                  value={form.customerName}
                  onChange={(event) =>
                    updateField("customerName", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>請求情報</h2>
            <div className="field-grid three">
              <label>
                <span>請求書番号</span>
                <input
                  value={form.invoiceNumber}
                  onChange={(event) =>
                    updateField("invoiceNumber", event.target.value)
                  }
                />
              </label>
              <label>
                <span>発行日</span>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(event) => updateField("issueDate", event.target.value)}
                />
              </label>
              <label>
                <span>支払期日</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateField("dueDate", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h2>明細</h2>
              <button type="button" className="secondary" onClick={addItem}>
                追加
              </button>
            </div>
            <div className="line-items">
              {form.items.map((item, index) => (
                <fieldset className="line-item" key={index}>
                  <legend>{index + 1}</legend>
                  <label className="description">
                    <span>品目</span>
                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>数量</span>
                    <input
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>単価</span>
                    <input
                      inputMode="numeric"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(index, "unitPrice", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>税率</span>
                    <select
                      value={item.taxRate}
                      onChange={(event) =>
                        updateItem(index, "taxRate", event.target.value)
                      }
                    >
                      <option value="">選択</option>
                      <option value="0.1">10%</option>
                      <option value="0.08">8%</option>
                      <option value="0">非課税</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`${index + 1}行目を削除`}
                    title="削除"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                  >
                    🗑
                  </button>
                </fieldset>
              ))}
            </div>
          </section>
        </form>

        <aside className="preview-pane">
          <section className="summary-panel">
            <h2>プレビュー</h2>
            <dl>
              <div>
                <dt>請求先</dt>
                <dd>{form.customerName || "-"}</dd>
              </div>
              <div>
                <dt>小計</dt>
                <dd>{summary ? formatYen(summary.subtotal) : "-"}</dd>
              </div>
              <div>
                <dt>消費税</dt>
                <dd>{summary ? formatYen(summary.taxTotal) : "-"}</dd>
              </div>
              <div className="total-row">
                <dt>合計</dt>
                <dd>{summary ? formatYen(summary.total) : "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="validation-panel">
            <h2>検証結果</h2>
            {errors.length === 0 ? (
              <p className="empty">canonical schema に変換できます。</p>
            ) : (
              <ul>
                {errors.map((error) => (
                  <li key={`${error.path}-${error.message}`}>
                    <strong>{error.path}</strong>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="json-panel">
            <h2>Canonical JSON</h2>
            <pre>{JSON.stringify((invoice ?? toDraft(form)) as InvoiceDraft, null, 2)}</pre>
          </section>
        </aside>
      </div>
    </main>
  );
}

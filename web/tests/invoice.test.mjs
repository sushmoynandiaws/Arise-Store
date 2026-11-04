import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Invoice module and QR generator are correctly integrated and structured", () => {
  const invoiceCode = fs.readFileSync("src/Invoice.tsx", "utf8");
  const appCode = fs.readFileSync("src/App.tsx", "utf8");
  const stylesCode = fs.readFileSync("src/styles.css", "utf8");

  // Verify Invoice.tsx contents
  assert.ok(invoiceCode.includes("export function generateQrMatrix"), "Invoice.tsx should export generateQrMatrix");
  assert.ok(invoiceCode.includes("export function QrCodeSvg"), "Invoice.tsx should export QrCodeSvg");
  assert.ok(invoiceCode.includes("export function AriseSellInvoice"), "Invoice.tsx should export AriseSellInvoice");
  assert.ok(invoiceCode.includes("Scan to Track Parcel"), "Invoice.tsx should include Scan to Track Parcel caption");
  assert.ok(invoiceCode.includes("BALANCE DUE"), "Invoice.tsx should include BALANCE DUE banner");
  assert.ok(invoiceCode.includes("invoice-watermark"), "Invoice.tsx should include invoice watermark");

  // Verify App.tsx integration
  assert.ok(appCode.includes("AriseSellInvoice"), "App.tsx should import and render AriseSellInvoice");
  assert.ok(appCode.includes("arisesell-invoice-print"), "App.tsx should render arisesell-invoice-print container");
  assert.ok(appCode.includes("view-invoice-btn"), "App.tsx should render view-invoice-btn");
  assert.ok(appCode.includes("print-receipt-btn"), "App.tsx should render print-receipt-btn");

  // Verify styles.css integration
  assert.ok(stylesCode.includes(".arisesell-invoice-card"), "styles.css should style .arisesell-invoice-card");
  assert.ok(stylesCode.includes(".invoice-table"), "styles.css should style .invoice-table");
  assert.ok(stylesCode.includes(".invoice-watermark"), "styles.css should style .invoice-watermark");
  assert.ok(stylesCode.includes(".invoice-balance-banner"), "styles.css should style .invoice-balance-banner");
  assert.ok(stylesCode.includes(".arisesell-invoice-print"), "styles.css should define .arisesell-invoice-print print styles");
});

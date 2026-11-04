import React from "react";
import type {Purchase} from "./types";
import {money, paymentMethodLabel} from "./api";

// Pure TypeScript standalone QR matrix generator (GF256 + Reed-Solomon, Level L)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
for (let x = 1, i = 0; i < 255; i++) {
  GF_EXP[i] = GF_EXP[i + 255] = x;
  GF_LOG[x] = i;
  x = (x << 1) ^ (x & 128 ? 0x11d : 0);
}
function gfMul(x: number, y: number): number {
  return x === 0 || y === 0 ? 0 : GF_EXP[GF_LOG[x] + GF_LOG[y]];
}
function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}
function rsCompute(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGenerator(ecCount);
  const res = new Uint8Array(data.length + ecCount);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], coef);
    }
  }
  return res.slice(data.length);
}

export function generateQrMatrix(text: string): {size: number; matrix: number[][]} {
  const bytes = new TextEncoder().encode(text);
  const len = bytes.length;
  let version = 4;
  let dataCapacity = 80;
  let ecCount = 20;
  let align = 26;

  if (len > 78) {
    version = 5;
    dataCapacity = 108;
    ecCount = 26;
    align = 30;
  }
  if (len > 106) {
    version = 6;
    dataCapacity = 136;
    ecCount = 28;
    align = 34;
  }

  const size = 17 + 4 * version;

  let bits = "0100"; // Byte mode
  bits += len.toString(2).padStart(8, "0");
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  bits += "0000"; // Terminator
  while (bits.length % 8 !== 0) bits += "0";

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8), 2));
  const pad = [0xec, 0x11];
  let pIdx = 0;
  while (data.length < dataCapacity) {
    data.push(pad[pIdx]);
    pIdx ^= 1;
  }

  const ec = rsCompute(new Uint8Array(data), ecCount);
  const allCodewords = [...data, ...ec];
  let allBits = "";
  for (const cw of allCodewords) allBits += cw.toString(2).padStart(8, "0");

  const matrix: number[][] = Array.from({length: size}, () => new Array(size).fill(-1));

  function setFinder(r0: number, c0: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = r0 + r;
        const nc = c0 + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            matrix[nr][nc] =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
                ? 1
                : 0;
          } else {
            matrix[nr][nc] = 0;
          }
        }
      }
    }
  }

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === -1) matrix[6][i] = i % 2 === 0 ? 1 : 0;
    if (matrix[i][6] === -1) matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Alignment
  for (let r = align - 2; r <= align + 2; r++) {
    for (let c = align - 2; c <= align + 2; c++) {
      matrix[r][c] =
        Math.abs(r - align) === 2 || Math.abs(c - align) === 2 || (r === align && c === align)
          ? 1
          : 0;
    }
  }

  // Dark module
  matrix[4 * version + 9][8] = 1;

  // Format info (Level L, Mask 0): 0x77c4 ^ 0x5412 = 0x23d6
  const formatVal = 0x77c4 ^ 0x5412;
  for (let i = 0; i < 15; i++) {
    const bit = (formatVal >> i) & 1;
    if (i < 6) matrix[8][i] = bit;
    else if (i < 8) matrix[8][i + 1] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  // Zigzag placement
  let bitIdx = 0;
  let dir = -1;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--;
    const rStart = dir === -1 ? size - 1 : 0;
    const rEnd = dir === -1 ? -1 : size;
    for (let r = rStart; r !== rEnd; r += dir === -1 ? -1 : 1) {
      for (const colOffset of [0, -1]) {
        const curCol = c + colOffset;
        if (matrix[r][curCol] === -1) {
          const bit = bitIdx < allBits.length ? (allBits[bitIdx] === "1" ? 1 : 0) : 0;
          bitIdx++;
          const masked = bit ^ ((r + curCol) % 2 === 0 ? 1 : 0);
          matrix[r][curCol] = masked;
        }
      }
    }
    dir = -dir;
  }

  return {size, matrix};
}

export function QrCodeSvg({
  value,
  size = 110,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const {size: qrSize, matrix} = generateQrMatrix(value);
  const cellSize = size / qrSize;

  const rects: React.ReactElement[] = [];
  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      if (matrix[r][c] === 1) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize + 0.05}
            height={cellSize + 0.05}
            fill="#000000"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      shapeRendering="crispEdges"
      aria-label="Scan to Track Parcel QR"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {rects}
    </svg>
  );
}

export function AriseSellInvoice({
  order,
  lang = "en",
}: {
  order: Purchase;
  lang?: "bn" | "en";
}) {
  const isPaid = order.payment_status === "paid";
  const total = Number(order.total || 0);
  const deliveryCharge = Number(order.delivery_charge || 0);
  const discount = Number(order.discount || 0);
  const advancePaid = Number(order.advance_amount || 0);
  const subtotal = Math.max(0, total - deliveryCharge + discount);
  const balanceDue = isPaid ? 0 : Math.max(0, total - advancePaid);

  // Shop monogram / initials
  const initials = (order?.shop?.name || "AS")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/purchases/${order.id}`
      : `https://store.arisesell.com/purchases/${order.id}`;

  const customerName = order.buyer_name || order.buyer_fields?.name || "Customer";
  const customerPhone = order.buyer_phone || order.buyer_fields?.phone || "";
  const deliveryAddress = [
    order.address || order.buyer_fields?.address,
    order.district || order.buyer_fields?.district,
  ]
    .filter(Boolean)
    .join(", ");

  // Custom designs from custom_summary (filtering out answers/artwork labels if needed, or displaying bullets)
  const customBullets = (order.custom_summary || []).filter(text =>
    text.includes("×") || text.includes("x") || text.includes("Design") || text.includes("ডিজাইন")
  );
  const otherSpecs = (order.custom_summary || []).filter(
    text => !customBullets.includes(text)
  );

  const items = order.items?.length
    ? order.items.map(item => ({
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        unit_price: Number(item.unit_price || 0),
        total: Number(item.unit_price || 0) * item.quantity,
        sku: undefined,
        custom_designs: customBullets,
      }))
    : [
        {
          name: order.name,
          variant: "",
          quantity: order.quantity || 1,
          unit_price: order.quantity > 0 ? subtotal / order.quantity : subtotal,
          total: subtotal,
          sku: (order as any).sku ? `SKU: ${(order as any).sku}` : undefined,
          custom_designs: customBullets,
        },
      ];

  const paymentMethodShort = (order.payment_method || "COD").toUpperCase();

  return (
    <article className="arisesell-invoice-card" aria-label="Official AriseSell Invoice">
      {/* Background Verified Watermark */}
      <div className="invoice-watermark" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="watermark-svg">
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text
            x="100"
            y="54"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="4"
            fill="currentColor"
          >
            ★★★★★
          </text>
          <text
            x="100"
            y="114"
            textAnchor="middle"
            fontSize="42"
            fontWeight="900"
            fill="currentColor"
          >
            {initials}
          </text>
          <text
            x="100"
            y="150"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="3"
            fill="currentColor"
          >
            VERIFIED
          </text>
        </svg>
      </div>

      {/* Invoice Top Header */}
      <header className="invoice-header">
        <div className="invoice-brand-col">
          <div className="invoice-seal-badge" aria-hidden="true">
            <span className="seal-stars">★★★★★</span>
            <span className="seal-monogram">{initials}</span>
            <span className="seal-verified">VERIFIED</span>
          </div>
          <div className="invoice-brand-text">
            <h2 className="invoice-shop-name">{order?.shop?.name || "Store"}</h2>
            <p className="invoice-shop-domain">store.arisesell.com</p>
          </div>
        </div>

        <div className="invoice-meta-col">
          <h1 className="invoice-title">INVOICE</h1>
          <div className="invoice-meta-grid">
            <span className="meta-label">Invoice Ref:</span>
            <strong className="meta-val">#{order.ref}</strong>
            <span className="meta-label">Date:</span>
            <span className="meta-val">{formattedDate}</span>
            <span className="meta-label">Payment:</span>
            <span className="meta-val">{paymentMethodLabel(order.payment_method || "cod")}</span>
            <span className="meta-label">Status:</span>
            <span className="meta-val invoice-status-pill">{(order.delivery_status || "confirmed").toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Customer & Delivery Block */}
      <section className="invoice-customer-card">
        <div className="customer-info-col">
          <span className="customer-heading">CUSTOMER &amp; DELIVERY</span>
          <h3 className="customer-name">{customerName}</h3>
          {customerPhone && <p className="customer-phone">📞 {customerPhone}</p>}
          {deliveryAddress && <p className="customer-address">📍 {deliveryAddress}</p>}
          {order.buyer_fields?.note && (
            <p className="customer-note">
              <strong>Note:</strong> {String(order.buyer_fields.note)}
            </p>
          )}
        </div>
      </section>

      {/* Items Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="th-num">#</th>
            <th className="th-desc">ITEM DESCRIPTION</th>
            <th className="th-qty">QTY</th>
            <th className="th-price">PRICE</th>
            <th className="th-total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="td-num">{idx + 1}</td>
              <td className="td-desc">
                <strong className="item-name">{item.name}</strong>
                {item.variant && <span className="item-variant"> — {item.variant}</span>}
                {item.custom_designs && item.custom_designs.length > 0 && (
                  <div className="item-custom-list">
                    {item.custom_designs.map((d, dIdx) => (
                      <span key={dIdx} className="item-design-bullet">
                        {d}
                        {dIdx < item.custom_designs!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
                {otherSpecs.length > 0 && (
                  <div className="item-specs-list">
                    {otherSpecs.map((s, sIdx) => (
                      <span key={sIdx} className="item-spec-item">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {item.sku && <div className="item-sku">{item.sku}</div>}
              </td>
              <td className="td-qty">{item.quantity}</td>
              <td className="td-price">{money(String(item.unit_price), order.currency)}</td>
              <td className="td-total">{money(String(item.total), order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary & QR Code Section */}
      <div className="invoice-bottom-grid">
        {/* Left: Scan to track parcel */}
        <div className="invoice-qr-box">
          <div className="invoice-qr-canvas">
            <QrCodeSvg value={trackingUrl} size={110} />
          </div>
          <div className="invoice-qr-caption">
            <span className="qr-dot">●</span>
            <strong>Scan to Track Parcel</strong>
          </div>
          <small className="invoice-qr-url">store.arisesell.com/purchases/{order.id.slice(0, 8)}...</small>
        </div>

        {/* Right: Breakdown & Balance Due banner */}
        <div className="invoice-totals-box">
          <div className="invoice-breakdown-row">
            <span>Subtotal</span>
            <span>{money(String(subtotal), order.currency)}</span>
          </div>
          <div className="invoice-breakdown-row">
            <span>Delivery Fee {order.district ? `(${order.district})` : ""}</span>
            <span>+{money(String(deliveryCharge), order.currency)}</span>
          </div>
          {discount > 0 && (
            <div className="invoice-breakdown-row discount">
              <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
              <span>-{money(String(discount), order.currency)}</span>
            </div>
          )}
          <div className="invoice-breakdown-row">
            <span>VAT (0%)</span>
            <span>{money("0", order.currency)}</span>
          </div>
          <div className="invoice-breakdown-row total-row">
            <strong>Total Payable</strong>
            <strong>{money(String(total), order.currency)}</strong>
          </div>

          {/* Prominent Balance Due or Paid Banner */}
          <div className={`invoice-balance-banner ${isPaid ? "paid" : "due"}`}>
            {isPaid ? (
              <div className="banner-content">
                <div className="banner-row">
                  <span className="banner-label">PAID</span>
                  <strong className="banner-amount">{money(String(total), order.currency)}</strong>
                </div>
                <div className="banner-sub">BALANCE DUE: {money("0", order.currency)}</div>
              </div>
            ) : (
              <div className="banner-content">
                <div className="banner-row">
                  <span className="banner-label">BALANCE DUE ({paymentMethodShort})</span>
                  <strong className="banner-amount">{money(String(balanceDue), order.currency)}</strong>
                </div>
                {advancePaid > 0 && (
                  <div className="banner-sub">
                    Advance Paid: {money(String(advancePaid), order.currency)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Footer */}
      <footer className="invoice-footer">
        <p>
          Thank you for choosing <strong>{order?.shop?.name || "Store"}</strong>!
        </p>
        <small>
          This is an official computer-generated invoice from store.arisesell.com
        </small>
      </footer>
    </article>
  );
}

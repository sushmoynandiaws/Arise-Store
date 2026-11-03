import {useEffect, useRef, useState, type ReactNode} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {api, checkoutQuantity, craftPrice, money} from "./api";
import {useLang} from "./i18n";
import type {Product} from "./types";
import {designName} from "./product";

type SavedImage = {kind: "image"; message_id: string; url?: string};
type Selection = {id: string; ready: boolean; reason: string; product_id: string; variant_id: string; quantity: number; unit_price?: string | null; summary?: string[]; selection?: {code: string; qty: number}[]; answers?: Record<string, string | SavedImage>; artwork?: SavedImage | null; proof: {id: string; url: string; revision: string; approved: boolean} | null};

async function imageData(file?: File) {
  if (!file) return "";
  if (file.size > 1000000) throw new Error("Choose an image smaller than 1 MB.");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("This image could not be read."));
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

export function CraftCheckout({product, children}: {product: Product; children: (unitPrice?: string) => ReactNode}) {
  const {lang} = useLang(), bn = lang === "bn";
  const [params, setParams] = useSearchParams();
  const id = params.get("craft");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [designs, setDesigns] = useState<Record<string, number>>({});
  const [hasArtwork, setHasArtwork] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [retainedImages, setRetainedImages] = useState<Record<string, SavedImage>>({});
  const [retainedArtwork, setRetainedArtwork] = useState<SavedImage | null>(null);
  const [previousId, setPreviousId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const config = product.custom_order!;
  const variant = product.variants.find(v => v.id === params.get("variant")) || product.variants.find(v => v.stock > 0);
  const quantity = checkoutQuantity(params.get("quantity"));
  const craft = config.craft;
  const selectedCount = Object.values(designs).reduce((total, count) => total + count, 0);
  const capacity = variant?.pieces_per_set;
  const suppliedCount = selectedCount + (hasArtwork || retainedArtwork ? 1 : 0);
  const perPiece = craft?.pricing_mode === "per_piece";
  const extras = config.fields.filter(field => field.type === "select").flatMap(field => {
    const option = field.options.find(option => option.label === answers[field.id]);
    return option ? [String(option.extra_price)] : [];
  });
  const pricing = variant ? craftPrice(variant.price, perPiece ? suppliedCount : 1, perPiece ? capacity || 0 : 1, quantity, extras) : null;
  const validCount = !craft?.designs.length && !craft?.allow_artwork || suppliedCount > 0;
  function changeDesign(code: string, count: number) {
    if (busy) return;
    setChecked(false);
    setDesigns(previous => ({...(craft?.allow_mixing === false && count > 0 ? {} : previous), [code]: Math.max(0, Math.min(100, count))}));
  }
  function selectAll() {
    if (busy || craft?.allow_mixing === false) return;
    setChecked(false);
    setDesigns(previous => Object.fromEntries((craft?.designs || []).map(design => [design.code, previous[design.code] || 1])));
  }
  function changePackage(variantId: string) {
    const next = new URLSearchParams(params);
    next.set("variant", variantId); next.delete("craft");
    setParams(next);
    setError("");
    setChecked(false);
  }
  function hydrate(result: Selection) {
    setSelection(result);
    if (result.product_id !== product.id) return;
    if (result.selection) setDesigns(Object.fromEntries(result.selection.map(piece => [piece.code, piece.qty])));
    if (result.answers) {
      setAnswers(Object.fromEntries(Object.entries(result.answers).filter(([,value]) => typeof value === "string")) as Record<string,string>);
      setRetainedImages(Object.fromEntries(Object.entries(result.answers).filter(([,value]) => typeof value === "object" && value?.kind === "image")) as Record<string,SavedImage>);
    }
    if (result.artwork !== undefined) setRetainedArtwork(result.artwork);
    setPreviousId(result.id);
  }
  function editSelection() {
    if (busy) return;
    if (selection) hydrate(selection);
    setChecked(false);
    const next = new URLSearchParams(params); next.delete("craft"); setParams(next);
  }
  async function refresh() {
    if (!id) return;
    controller.current?.abort();
    const signal = (controller.current = new AbortController()).signal;
    setBusy(true);
    try { hydrate(await api<Selection>(`/craft/${encodeURIComponent(id)}`, {signal})); setError(""); }
    catch (e) { if (!signal.aborted) setError((e as Error).message); }
    finally { if (!signal.aborted) setBusy(false); }
  }
  useEffect(() => {setSelection(null); setHasArtwork(false); void refresh(); return () => controller.current?.abort();}, [id]);
  const matching = selection && selection.product_id === product.id && selection.variant_id === variant?.id && selection.quantity === quantity;
  if (id && matching && selection.ready) return <><div className="container craft-checkout-status"><p>{bn ? "কাস্টম পণ্যের নির্বাচন নিশ্চিত করা হয়েছে।" : "Custom product selection confirmed."}</p>{selection.summary?.map((text,i)=><p key={i}>{text}</p>)}<button className="button secondary" onClick={editSelection}>{bn ? "নির্বাচন পরিবর্তন করুন" : "Change selection"}</button></div>{children(selection.unit_price || undefined)}</>;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!variant || busy || !validCount || !checked || !pricing) return;
    const fields = new FormData(event.currentTarget);
    controller.current?.abort();
    const signal = (controller.current = new AbortController()).signal;
    setBusy(true); setError("");
    try {
      const answers: Record<string, string> = {};
      let bytes = 0;
      for (const field of config.fields) {
        const value = fields.get(`answer:${field.id}`);
        if (value instanceof File) {bytes += value.size; if (value.size) answers[field.id] = await imageData(value);}
        else if (value) answers[field.id] = String(value);
      }
      const artwork = fields.get("artwork");
      if (artwork instanceof File) bytes += artwork.size;
      if (bytes > 1000000) throw new Error("Keep all uploaded images together under 1 MB.");
      const result = await api<Selection>("/craft", {method: "POST", body: JSON.stringify({shop_id: product.shop_id, product_id: product.id,
        variant_id: variant.id, quantity, config_revision: config.revision, answers,
        selection: (craft?.designs || []).map(d => ({code: d.code, qty: Number(fields.get(`design:${d.code}`) || 0)})).filter(d => d.qty > 0),
        previous_draft_id: previousId || undefined, keep_artwork: !!retainedArtwork,
        keep_image_answers: Object.keys(retainedImages),
        artwork: artwork instanceof File && artwork.size ? await imageData(artwork) : undefined}), signal});
      hydrate(result);
      const next = new URLSearchParams(params); next.set("craft", result.id); setParams(next, {replace: true});
    } catch (e) {if (!signal.aborted) setError((e as Error).message);} finally {if (!signal.aborted) setBusy(false);}
  }
  async function approve() {
    if (!selection?.proof || busy) return;
    controller.current?.abort();
    const signal = (controller.current = new AbortController()).signal;
    setBusy(true); setError("");
    try {hydrate(await api<Selection>(`/craft/${id}/approve`, {method: "POST", body: JSON.stringify({proof_id: selection.proof.id, revision: selection.proof.revision}), signal}));}
    catch(e) {if (!signal.aborted) setError((e as Error).message);} finally {if (!signal.aborted) setBusy(false);}
  }
  return <main id="main" className="container section craft-checkout"><h1>{bn ? "কাস্টম পণ্যের বিবরণ" : "Custom product details"}</h1><p>{product.name} · {variant?.name} × {quantity}</p>
    {variant?.pieces_per_set && <p>{variant.pieces_per_set} {bn ? "পিস প্রতি সেট" : "pieces per set"} · {variant.size} {variant.color}</p>}
    {craft?.production_days && <p>{bn ? "তৈরির সময়" : "Production time"}: {craft.production_days}{craft.production_days_to ? `–${craft.production_days_to}` : ""} {bn ? "দিন" : "days"}</p>}
    <div className="panel"><div className="summary-line" role="status" aria-live="polite" data-testid="craft-product-total"><span>{bn ? "পণ্যের মোট দাম" : "Product total"}</span><strong>{pricing ? money(pricing.total, product.currency) : (bn ? "দাম পাওয়া যায়নি" : "Price unavailable")}</strong></div><small>{bn ? "ডেলিভারি চার্জ checkout-এ যোগ হবে। নিজের artwork বা ছবি দিলে চূড়ান্ত দাম বিক্রেতা যাচাই করবেন।" : "Shipping is calculated at checkout. Customer artwork or images require seller pricing review."}</small></div>
    {error && <p role="alert">{error}</p>}
    {id ? <section className="panel" aria-live="polite">
      <h2>{bn ? "বিক্রেতার রিভিউ ও প্রিভিউ" : "Seller review and preview"}</h2>
      <p>{matching ? selection.reason : bn ? "আপনার নির্বাচন যাচাই করুন।" : "Check your current selection."}</p>
      {matching && selection.summary?.map((text,index) => <p key={index}>{text}</p>)}
      {matching && selection.proof && <><img className="craft-proof" src={selection.proof.url} alt={bn ? "বিক্রেতার দেওয়া প্রিভিউ" : "Seller's print preview"}/><button className="button primary" disabled={busy || selection.proof.approved} onClick={approve}>{bn ? "এই প্রিভিউ অনুমোদন করছি" : "I approve this preview"}</button></>}
      <p>{bn ? "বিক্রেতা রিভিউ সংরক্ষণ করলে আপডেট দেখুন। অনুমোদনের পর দাম ও ডেলিভারি চার্জ রিভিউ করতে পারবেন।" : "Check for updates after the seller saves the review. Review the final price and shipping before ordering."}</p>
      <button className="button secondary" disabled={busy} onClick={refresh}>{bn ? "আপডেট দেখুন" : "Check for updates"}</button>
      <button className="button secondary" disabled={busy} onClick={editSelection}>{bn ? "নির্বাচন পরিবর্তন করুন" : "Change selection"}</button>
    </section> : <form className="panel" onSubmit={submit} onChange={event => {if (!(event.target instanceof HTMLInputElement) || event.target.name !== "selection_confirm") setChecked(false);}}>
      <p>{bn ? "প্যাকেজ ও নির্বাচন মিলিয়ে জমা দিন। পরিবর্তন করলে আবার নিশ্চিত করতে হবে। নিজের artwork ও প্রয়োজনীয় print preview বিক্রেতাকে যাচাই করতে হবে।" : "Check your package and choices before submitting. Changes need a new confirmation; customer artwork and required previews need seller review."}</p>
      {product.variants.length > 1 && <label className="field">{bn ? "প্যাকেজ" : "Package"}<select aria-label={bn ? "প্যাকেজ" : "Package"} value={variant?.id || ""} disabled={busy} onChange={event => changePackage(event.target.value)}>{product.variants.map(option => <option key={option.id} value={option.id} disabled={option.stock < quantity}>{option.name} · {option.pieces_per_set ? `${option.pieces_per_set} ${bn ? "পিস" : "pieces"} · ` : ""}{option.size} {option.color} · ৳{option.price}{option.stock < quantity ? (bn ? " · স্টক নেই" : " · Unavailable") : ""}</option>)}</select></label>}
      {!!craft?.designs.length && <fieldset className="craft-picker" disabled={busy}><legend>{bn ? "ডিজাইন নির্বাচন" : "Choose designs"}</legend>
        <div className="craft-selection-count" role="status" aria-live="polite"><strong>{bn ? "নির্বাচিত" : "Selected"}: {suppliedCount}</strong><span>{capacity ? (bn ? `প্যাকেজে প্রতি সেটে ${capacity} পিস আছে` : `Package includes ${capacity} pieces per set`) : (bn ? "প্রতি সেটের জন্য ডিজাইন বেছে নিন" : "Choose designs for each set")}</span></div>
        <p className="craft-picker-hint">{bn ? "ছবিতে চাপ দিয়ে বাছাই করুন। একই ডিজাইনের একাধিক কপির জন্য + ব্যবহার করুন।" : "Tap a picture to select it. Use + for more copies of the same design."}</p>
        <div className="button-row">
          {craft.allow_mixing !== false && craft.designs.length > 1 && <button type="button" className="button secondary" disabled={craft.designs.every(design => designs[design.code] > 0)} onClick={selectAll}>{bn ? "সব ডিজাইন বাছুন" : "Select all"}</button>}
          <button type="button" className="button secondary" disabled={!selectedCount} onClick={() => {setDesigns({}); setChecked(false);}}>{bn ? "ডিজাইনগুলো বাদ দিন" : "Clear designs"}</button>
        </div>
        <div className="craft-design-grid">{craft.designs.map((design, index) => {
          const count = designs[design.code] || 0;
          const label = designName(design.label, index, bn);
          return <div key={design.code} className={`craft-design-card${count ? " is-selected" : ""}`}>
            <button type="button" className="craft-design-choice" aria-label={label} aria-pressed={count > 0} onClick={() => changeDesign(design.code, count ? 0 : 1)}>
              {design.image_url ? <img src={design.image_url} alt="" loading="lazy"/> : <span className="craft-design-placeholder">{label}</span>}
              <span className="craft-design-label">{label}</span><span className="craft-design-check" aria-hidden="true">{count ? "✓" : "+"}</span>
            </button>
            <input type="hidden" name={`design:${design.code}`} value={count}/>
            {count > 0 && <div className="craft-design-quantity"><button type="button" aria-label={`${bn ? "কমান" : "Decrease"} ${label}`} onClick={() => changeDesign(design.code, count - 1)}>−</button><output aria-label={`${label} ${bn ? "পরিমাণ" : "quantity"}`}>{count}</output><button type="button" aria-label={`${bn ? "বাড়ান" : "Increase"} ${label}`} disabled={count >= 100} onClick={() => changeDesign(design.code, count + 1)}>+</button></div>}
          </div>;
        })}</div>
        {capacity && suppliedCount > 0 && suppliedCount !== capacity && <p className="craft-picker-hint" role="status">{perPiece ? (bn ? "নির্বাচিত পিস অনুযায়ী দাম স্বয়ংক্রিয়ভাবে হিসাব হয়েছে। অর্ডারের আগে এই custom package বিক্রেতাকে যাচাই করতে হবে।" : "The price updates automatically for your selected pieces. The seller must verify this custom package before ordering.") : (bn ? `আপনার নির্বাচন প্রতি সেটে ${suppliedCount} পিস, প্যাকেজে ${capacity} পিস আছে। অর্ডারের আগে বিক্রেতাকে প্যাকেজ ও চূড়ান্ত দাম যাচাই করতে হবে।` : `You selected ${suppliedCount} pieces per set; this package includes ${capacity}. The seller must confirm the package and final price before ordering.`)}</p>}
      </fieldset>}
      {config.fields.map(f => <div key={f.id}><label className="field">{f.label}<small>{f.question}</small>{f.type === "select" ? <select name={`answer:${f.id}`} disabled={busy} required={f.required} value={answers[f.id] || ""} onChange={event => setAnswers({...answers, [f.id]: event.target.value})}><option value="">{bn ? "বেছে নিন" : "Choose an option"}</option>{f.options.map(o => <option key={o.label} value={o.label}>{o.label}{Number(o.extra_price) > 0 ? ` (+${o.extra_price})` : ""}</option>)}</select> : f.type === "image" ? <input name={`answer:${f.id}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} required={f.required && !retainedImages[f.id]}/> : <input name={`answer:${f.id}`} type={f.type} disabled={busy} required={f.required} min={f.minimum} max={f.maximum} maxLength={2000} step={f.type === "number" ? "any" : undefined} value={answers[f.id] || ""} onChange={event => setAnswers({...answers, [f.id]: event.target.value})}/>}</label>
        {retainedImages[f.id] && <div className="craft-retained-image"><span>{bn ? "আগের ছবি সংরক্ষিত আছে। নতুন ছবি দিলে এটি বদলাবে।" : "Your saved image is kept. A new upload replaces it."}</span><button type="button" className="button secondary" disabled={busy} onClick={() => {setChecked(false); setRetainedImages(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => key !== f.id)));}}>{bn ? "আগের ছবি বাদ দিন" : "Remove saved image"}</button></div>}
      </div>)}
      {craft?.allow_artwork && <div><label className="field">{bn ? "আপনার artwork (ঐচ্ছিক)" : "Your artwork (optional)"}<input type="file" name="artwork" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => setHasArtwork(!!event.target.files?.length)}/></label>{retainedArtwork && <div className="craft-retained-image"><span>{bn ? "আগের artwork সংরক্ষিত আছে। নতুন ছবি দিলে এটি বদলাবে।" : "Your saved artwork is kept. A new upload replaces it."}</span><button type="button" className="button secondary" disabled={busy} onClick={() => {setChecked(false); setRetainedArtwork(null);}}>{bn ? "আগের artwork বাদ দিন" : "Remove saved artwork"}</button></div>}</div>}
      <small>{bn ? "সব ছবি মিলিয়ে সর্বোচ্চ ১ MB।" : "All uploaded images together: maximum 1 MB."}</small>
      <label className="check-field"><input type="checkbox" name="selection_confirm" checked={checked} onChange={event => setChecked(event.target.checked)} required disabled={busy}/>{bn ? "প্যাকেজ ও আমার নির্বাচন মিলিয়ে নিশ্চিত করছি।" : "I checked and confirm this package and my selection."}</label>
      <button className="button primary" disabled={busy || !variant || variant.stock < quantity || !validCount || !checked || !pricing}>{busy ? (bn ? "জমা হচ্ছে…" : "Submitting…") : (bn ? "নির্বাচন জমা দিন" : "Submit selection")}</button>
    </form>}
    <Link className="back-link" to={`/products/${product.id}`}>{bn ? "পণ্যে ফিরে যান" : "Back to product"}</Link>
  </main>;
}

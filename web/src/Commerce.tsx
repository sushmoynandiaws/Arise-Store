import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  api,
  canCheckout,
  checkoutItemsTotal,
  checkoutTotal,
  money,
  productFulfilment,
  productPayments,
  deliveryLabel,
} from "./api";
import { productForRoute, productPath } from "./product";
import { useLang } from "./i18n";
import { ShoppingCart, X, ShieldCheck, ShoppingBag, Minus, Plus, Trash2, Truck, Check, Package } from "./icons";
import type {
  CartLine,
  Catalog,
  Offer,
  Product,
  Shop,
  Purchase,
} from "./types";

export function CourierStatus({ order }: { order: Purchase }) {
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const bn = lang === "bn";
  const tracking = order.tracking;
  if (order.fulfilment_kind !== "physical") return null;

  const status = tracking?.status || order.delivery_status || "confirmed";
  let activeStep = 1;
  if (["courier_booked", "booked", "awaiting_pickup", "pickup_pending"].includes(status)) activeStep = 2;
  else if (["in_transit", "out_for_delivery"].includes(status)) activeStep = 3;
  else if (["delivered", "settled"].includes(status)) activeStep = 4;

  const steps = [
    { title: bn ? "অর্ডার নিশ্চিত" : "Order confirmed", desc: bn ? "বিক্রেতা গ্রহণ করেছেন" : "Seller accepted" },
    { title: bn ? "কুরিয়ারে হস্তান্তর" : "Handed to courier", desc: tracking?.provider ? `${tracking.provider}` : (bn ? "পিকআপ সম্পন্ন" : "Picked up") },
    { title: bn ? "ডেলিভারির পথে" : "In transit", desc: bn ? "গন্তব্যে যাত্রা করছে" : "On the way" },
    { title: bn ? "ডেলিভারি সম্পন্ন" : "Delivered", desc: bn ? "পণ্য পৌঁছেছে" : "Delivered" },
  ];

  return (
    <div className="courier-status-card">
      <div className="courier-status-header">
        <div className="courier-badge-row">
          <span className="courier-provider-tag">
            <Truck size={15} />
            {tracking?.provider || (bn ? "কুরিয়ার পার্সেল" : "Courier Parcel")}
          </span>
          {tracking?.tracking && (
            <span className="courier-tracking-code">
              {bn ? "ট্র্যাকিং:" : "Tracking:"} <strong>{tracking.tracking}</strong>
            </span>
          )}
        </div>
        <div className="courier-current-status">
          <span className="status-live-dot" />
          <strong>{deliveryLabel(status, lang)}</strong>
        </div>
      </div>

      <div className="courier-milestone-stepper" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={4}>
        {steps.map((s, idx) => {
          const stepNum = idx + 1;
          const isDone = activeStep > stepNum;
          const isCurrent = activeStep === stepNum;
          return (
            <div key={s.title} className={`stepper-node ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
              <div className="stepper-marker">
                {isDone ? <Check size={14} /> : <span>{stepNum}</span>}
              </div>
              <div className="stepper-labels">
                <strong>{s.title}</strong>
                <small>{s.desc}</small>
              </div>
            </div>
          );
        })}
      </div>

      {tracking?.updated_at && (
        <div className="courier-meta-footer">
          <small>
            {bn ? "সর্বশেষ আপডেট:" : "Last update:"}{" "}
            {new Date(tracking.updated_at).toLocaleString(bn ? "bn-BD" : undefined)}
          </small>
          {tracking.poll_delayed && (
            <span className="poll-delay-notice" role="status">
              {bn ? "কুরিয়ার সিঙ্ক হচ্ছে…" : "Syncing latest update…"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
export function LiveTracking({ ready }: { ready: boolean }) {
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [orders, setOrders] = useState<Purchase[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    if (!ready) return;
    setBusy(true);
    try {
      const result = await api<{ orders: Purchase[] }>("/orders");
      setOrders(
        result.orders.filter((order) => order.fulfilment_kind === "physical"),
      );
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [ready]);
  return (
    <section className="panel live-tracking">
      <div className="section-heading">
        <h2>{lang === "bn" ? "কুরিয়ার ট্র্যাকিং" : "Courier tracking"}</h2>
        <button
          type="button"
          className="button secondary"
          onClick={() => void load()}
          disabled={busy || !ready}
        >
          {busy ? (lang === "bn" ? "রিফ্রেশ হচ্ছে…" : "Refreshing…") : (lang === "bn" ? "স্ট্যাটাস রিফ্রেশ করুন" : "Refresh status")}
        </button>
      </div>
      <p>
        {lang === "bn"
          ? "এই ব্রাউজার বা সাইন-ইন করা অ্যাকাউন্টের সাথে যুক্ত ফিজিক্যাল অর্ডারগুলো এখানে দেখা যাবে।"
          : "Physical orders linked to this browser or signed-in account appear here."}
      </p>
      {error && <p role="alert">{error}</p>}
      {!orders.length && !busy && (
        <p>
          {lang === "bn"
            ? "এখনও কোনো ফিজিক্যাল অর্ডার যুক্ত নেই। যে ব্রাউজার থেকে অর্ডার করেছিলেন সেটি খুলুন অথবা চেকআউটে ব্যবহৃত অ্যাকাউন্টে সাইন ইন করুন।"
            : "No physical orders are linked yet. Open your purchase in the browser you ordered from, or sign in with the account used at checkout."}
        </p>
      )}
      {orders.map((order) => (
        <article key={order.id}>
          <Link className="text-link" to={`/purchases/${order.id}`}>
            {order.ref} · {order.shop.name}
          </Link>
          <p>{order.name}</p>
          <CourierStatus order={order} />
        </article>
      ))}
    </section>
  );
}

const CART = "arise-cart-v1",
  RECENT = "arise-recent-v1";
function stored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browsing can disable storage. */
  }
}
function routeParts(pathname: string) {
  return pathname.split("/").map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });
}
export function readCart(): CartLine[] {
  const value = stored<unknown>(CART, []);
  return Array.isArray(value)
    ? value
        .filter(
          (v): v is CartLine =>
            v &&
            typeof v.product_id === "string" &&
            typeof v.variant_id === "string" &&
            Number.isInteger(v.quantity) &&
            v.quantity > 0 &&
            v.quantity <= 100,
        )
        .slice(0, 20)
    : [];
}
type Bag = {
  items: CartLine[];
  add: (product: Product, variant: string, quantity: number) => void;
  purchased: (items: CartLine[]) => void;
  open: () => void;
};
const CartContext = createContext<Bag>(null!);
export const useCart = () => useContext(CartContext);
export function CartProvider({
  catalog,
  stale = false,
  children,
}: {
  catalog: Catalog | null;
  stale?: boolean;
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartLine[]>(readCart),
    [shown, setShown] = useState(false),
    [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  useEffect(() => {
    persist(CART, items);
  }, [items]);
  useEffect(() => {
    const update = () => setItems(readCart());
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  useEffect(() => {
    if (!shown || !dialog.current) return;
    dialog.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.current?.close();
      document.body.style.overflow = previous;
    };
  }, [shown]);
  const rows = items
    .map((item) => ({
      ...item,
      product: catalog?.products.find((p) => p.id === item.product_id),
    }))
    .map((row) => ({
      ...row,
      variant: row.product?.variants.find((v) => v.id === row.variant_id),
    }));
  const first = rows[0]?.product;
  const shop = catalog?.shops.find((s) => s.id === first?.shop_id);
  const methods =
    first && shop
      ? productPayments(first, shop).filter((method) =>
          rows.every(
            (row) =>
              row.product &&
              productPayments(row.product, shop).includes(method),
          ),
        )
      : [];
  const subtotal = checkoutItemsTotal(
    rows.map((row) => ({ price: row.variant?.price, quantity: row.quantity })),
  );
  const valid =
    !!shop &&
    !stale &&
    methods.length > 0 &&
    subtotal !== null &&
    rows.every(
      (row) =>
        row.product &&
        row.variant &&
        canCheckout(row.product, shop) &&
        !row.product.custom_order &&
        row.product.shop_id === shop.id &&
        productFulfilment(row.product) === productFulfilment(first!) &&
        row.product.currency === first?.currency &&
        row.quantity <= row.variant.stock &&
        checkoutTotal(row.variant.price, row.quantity) !== null,
    );
  function add(product: Product, variant: string, quantity: number) {
    if (product.custom_order) {
      setError(
        lang === "bn"
          ? "কাস্টম অর্ডারের তথ্য দিতে সরাসরি কিনুন বাটন ব্যবহার করুন।"
          : "Complete custom product details using Buy now.",
      );
      setShown(true);
      return;
    }
    setError("");
    setShown(true);
    if (
      items.length &&
      (!first ||
        first.shop_id !== product.shop_id ||
        productFulfilment(first) !== productFulfilment(product))
    ) {
      setError(
        lang === "bn"
          ? "এই ব্যাগের অর্ডার শেষ করুন বা খালি করুন। একসাথে একই শপ ও ডেলিভারি ধরনের পণ্য যোগ করুন।"
          : "Complete or empty this bag first. Add products from one shop and fulfillment type together.",
      );
      return;
    }
    const existing = items.find((item) => item.variant_id === variant),
      option = product.variants.find((v) => v.id === variant);
    const count = (existing?.quantity || 0) + quantity;
    if (
      !option ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > Math.min(100, option.stock) ||
      (!existing && items.length >= 20)
    ) {
      setError(
        lang === "bn"
          ? "স্টক যাচাই করুন। ব্যাগে সর্বোচ্চ ২০টি অপশন এবং প্রতিটিতে সর্বোচ্চ ১০০টি পণ্য যোগ করা যাবে।"
          : "Check available stock. A bag supports up to 20 options, each with up to 100 items.",
      );
      return;
    }
    setItems((previous) =>
      existing
        ? previous.map((item) =>
            item.variant_id === variant ? { ...item, quantity: count } : item,
          )
        : [
            ...previous,
            { product_id: product.id, variant_id: variant, quantity },
          ],
    );
  }
  return (
    <CartContext.Provider
      value={{
        items,
        add,
        open: () => {
          setError("");
          setShown(true);
        },
        purchased: (bought) =>
          setItems((previous) =>
            previous.flatMap((item) => {
              const count =
                item.quantity -
                (bought.find((line) => line.variant_id === item.variant_id)
                  ?.quantity || 0);
              return count > 0 ? [{ ...item, quantity: count }] : [];
            }),
          ),
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="cart-drawer"
        aria-labelledby="cart-title"
        onCancel={(event) => {
          event.preventDefault();
          setShown(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setShown(false);
        }}
      >
        <header>
          <h2 id="cart-title">{lang === "bn" ? "আপনার ব্যাগ" : "Your bag"}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close bag"
            onClick={() => setShown(false)}
          >
            <X size={20} />
          </button>
        </header>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {!items.length ? (
          <div className="cart-empty-state">
            <div className="empty-icon">
              <ShoppingBag size={28} />
            </div>
            <p>
              {lang === "bn"
                ? "ব্যাগে এখনও কোনো পণ্য যোগ করা হয়নি।"
                : "Your shopping bag is empty."}
            </p>
            <Link
              to="/products"
              className="button primary small"
              onClick={() => setShown(false)}
            >
              {lang === "bn" ? "পণ্য দেখুন" : "Browse products"}
            </Link>
          </div>
        ) : (
          <>
            <p>
              {shop?.name || (lang === "bn" ? "অনুপলব্ধ শপ" : "Unavailable shop")} ·{" "}
              {lang === "bn"
                ? "চেকআউটে দাম ও স্টক যাচাই হবে।"
                : "Prices and stock are confirmed at checkout."}
            </p>
            <ul className="bag-lines">
              {rows.map((row) => (
                <li key={row.variant_id}>
                  <div className="bag-line-thumb" aria-hidden="true">
                    {row.product?.image_url ? (
                      <img src={row.product.image_url} alt="" loading="lazy" />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>
                  <div className="bag-line-content">
                    {row.product ? (
                      <Link
                        className="bag-line-title"
                        onClick={() => setShown(false)}
                        to={productPath(row.product, catalog!)}
                      >
                        {row.product.name}
                      </Link>
                    ) : (
                      <strong>
                        {lang === "bn"
                          ? "পণ্যটি আর পাওয়া যাচ্ছে না"
                          : "Product no longer available"}
                      </strong>
                    )}
                    <div className="bag-line-meta">
                      <span className="bag-line-variant">{row.variant?.name}</span>
                      <span className="bag-line-price">
                        {row.variant
                          ? money(row.variant.price, row.product?.currency)
                          : lang === "bn"
                            ? "অনুপলব্ধ"
                            : "Unavailable"}
                      </span>
                      <span className={`bag-line-kind ${row.product?.fulfilment_kind === "digital" ? "is-digital" : "is-courier"}`}>
                        {row.product?.fulfilment_kind === "digital"
                          ? (lang === "bn" ? "ডিজিটাল ডেলিভারি" : "Digital")
                          : (lang === "bn" ? "কুরিয়ার পার্সেল" : "Courier")}
                      </span>
                    </div>
                    <div className="bag-line-actions">
                      <div className="cart-stepper-control" role="group" aria-label={`Quantity for ${row.product?.name || row.variant_id}`}>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          aria-label={lang === "bn" ? "পরিমাণ কমান" : "Decrease quantity"}
                          disabled={row.quantity <= 1}
                          onClick={() => {
                            if (row.quantity > 1) {
                              setItems((previous) =>
                                previous.map((item) =>
                                  item.variant_id === row.variant_id
                                    ? { ...item, quantity: item.quantity - 1 }
                                    : item,
                                ),
                              );
                            }
                          }}
                        >
                          <Minus size={15} />
                        </button>
                        <span className="cart-stepper-val">{row.quantity}</span>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          aria-label={lang === "bn" ? "পরিমাণ বাড়ান" : "Increase quantity"}
                          disabled={row.quantity >= Math.min(100, row.variant?.stock || 100)}
                          onClick={() => {
                            if (row.quantity < Math.min(100, row.variant?.stock || 100)) {
                              setItems((previous) =>
                                previous.map((item) =>
                                  item.variant_id === row.variant_id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item,
                                ),
                              );
                            }
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="bag-remove-btn text-link"
                        onClick={() =>
                          setItems((previous) =>
                            previous.filter(
                              (item) => item.variant_id !== row.variant_id,
                            ),
                          )
                        }
                      >
                        {lang === "bn" ? "সরান" : "Remove"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="review-row">
              <span>{lang === "bn" ? "পণ্যের সাবটোটাল" : "Products subtotal"}</span>
              <strong>{money(subtotal || "0.00", first?.currency)}</strong>
            </div>
            {!valid && (
              <p role="status">
                {lang === "bn"
                  ? "কিছু পণ্য, স্টক বা পেমেন্ট মাধ্যম পরিবর্তিত হয়েছে। চেকআউটের আগে আপনার ব্যাগ আপডেট করুন।"
                  : "Some items, stock or payment methods changed. Update your bag before checkout."}
              </p>
            )}
            {valid && first ? (
              <Link
                className="button primary full-width"
                onClick={() => setShown(false)}
                to={`/checkout/${first.id}?variant=${rows[0].variant_id}&cart=1`}
              >
                {lang === "bn" ? "একসাথে চেকআউট করুন" : "Checkout together"}
              </Link>
            ) : (
              <button className="button primary full-width" disabled>
                {lang === "bn" ? "চেকআউট অনুপলব্ধ" : "Checkout unavailable"}
              </button>
            )}
            <div className="cart-footer-actions">
              {confirmEmpty ? (
                <div className="confirm-empty-row" role="alert">
                  <span>{lang === "bn" ? "ব্যাগ খালি করবেন?" : "Empty entire bag?"}</span>
                  <div className="confirm-empty-buttons">
                    <button
                      type="button"
                      className="button danger-small"
                      onClick={() => {
                        setItems([]);
                        setError("");
                        setConfirmEmpty(false);
                      }}
                    >
                      {lang === "bn" ? "হ্যাঁ, খালি করুন" : "Yes, empty"}
                    </button>
                    <button
                      type="button"
                      className="button secondary-small"
                      onClick={() => setConfirmEmpty(false)}
                    >
                      {lang === "bn" ? "না" : "Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="bag-empty-quiet-btn"
                  onClick={() => setConfirmEmpty(true)}
                >
                  <Trash2 size={14} />
                  <span>{lang === "bn" ? "ব্যাগ খালি করুন" : "Empty bag"}</span>
                </button>
              )}
            </div>
          </>
        )}
      </dialog>
    </CartContext.Provider>
  );
}
export function CartButton() {
  const cart = useCart();
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  return (
    <button
      type="button"
      className="icon-button header-cart"
      aria-label={`${lang === "bn" ? "ব্যাগ" : "Open bag"} (${cart.items.reduce((sum, item) => sum + item.quantity, 0)})`}
      onClick={cart.open}
    >
      <ShoppingCart size={19} />
      <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </button>
  );
}
export function rememberProduct(id: string) {
  const previous = stored<unknown>(RECENT, []);
  persist(
    RECENT,
    [
      id,
      ...(Array.isArray(previous)
        ? previous.filter((value) => typeof value === "string" && value !== id)
        : []),
    ].slice(0, 12),
  );
}
export function RecentlyViewed({
  catalog,
  renderProduct,
}: {
  catalog: Catalog | null;
  renderProduct: (product: Product) => ReactNode;
}) {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const value = stored<unknown>(RECENT, []);
    setIds(
      Array.isArray(value) ? value.filter((v) => typeof v === "string") : [],
    );
  }, [pathname, catalog]);
  if (
    !catalog ||
    !(/^\/(products|shops)(\/|$)/.test(pathname) || pathname === "/")
  )
    return null;
  const parts = routeParts(pathname);
  const current = productForRoute(catalog, {
    id: pathname.match(/^\/products\/([^/]+)$/)?.[1],
    slug: parts[2],
    productSlug: parts[4],
  });
  const products = ids
    .filter((id) => id !== current?.id)
    .flatMap((id) => catalog.products.find((p) => p.id === id) || []);
  if (!products.length) return null;
  return (
    <section
      className="container section"
      aria-label="Recently viewed products"
    >
      <div className="section-heading">
        <h2>{lang === "bn" ? "সম্প্রতি দেখা পণ্য" : "Recently viewed"}</h2>
        <button
          className="text-link"
          onClick={() => {
            persist(RECENT, []);
            setIds([]);
          }}
        >
          {lang === "bn" ? "ইতিহাস মুছুন" : "Clear history"}
        </button>
      </div>
      <div className="recent-products" tabIndex={0}>
        {products.map((product) => (
          <div key={product.id}>{renderProduct(product)}</div>
        ))}
      </div>
    </section>
  );
}
export function ShopBadge({ shop }: { shop: Shop }) {
  const badge = shop.merchant_badge;
  return badge && badge.expires_at > Date.now() / 1000 ? (
    <span
      className="merchant-badge"
      title="Manually reviewed by Arise Store. This badge is not a payment or delivery guarantee."
    >
      <ShieldCheck size={14} />
      {badge.label}
    </span>
  ) : null;
}
export function OfferCountdown({ end }: { end: string }) {
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [end]);
  const seconds = Math.max(0, Math.floor((Date.parse(end) - now) / 1000));
  return (
    <time
      dateTime={end}
      aria-label={`Offer ends ${new Date(end).toLocaleString()}`}
    >
      {seconds
        ? `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m ${seconds % 60}s`
        : lang === "bn"
          ? "অফার শেষ"
          : "Offer ended"}
    </time>
  );
}
export function FlashDeals({
  catalog,
  shopId,
}: {
  catalog: Catalog | null;
  shopId?: string;
}) {
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!catalog) return null;
  const offers = (catalog.offers || []).filter(
    (offer) =>
      (!shopId || offer.shop_id === shopId) &&
      Date.parse(offer.starts_at) <= now &&
      Date.parse(offer.expires_at) > now,
  );
  if (!offers.length) return null;
  return (
    <section className="container section flash-deals" aria-label="Flash deals">
      <div className="section-heading">
        <h2>{lang === "bn" ? "সীমিত সময়ের অফার" : "Flash deals"}</h2>
      </div>
      <div className="flash-grid">
        {offers.map((offer) => {
          const shop = catalog.shops.find((shop) => shop.id === offer.shop_id);
          const product =
            shop &&
            catalog.products.find(
              (p) =>
                p.shop_id === offer.shop_id &&
                (!offer.product_ids?.length ||
                  offer.product_ids.includes(p.id)) &&
                canCheckout(p, shop) &&
                p.variants.some((v) => v.stock > 0),
            );
          return product && shop ? (
            <article className="panel" key={`${offer.shop_id}:${offer.code}`}>
              <p className="eyebrow">{shop.name}</p>
              <h3>{offer.title}</h3>
              <p>
                {lang === "bn" ? (
                  <>
                    {offer.benefit} ছাড় · কোড <strong>{offer.code}</strong>
                  </>
                ) : (
                  <>
                    {offer.benefit} off · Use <strong>{offer.code}</strong>
                  </>
                )}
              </p>
              {Number(offer.min_spend) > 0 && (
                <p>
                  {lang === "bn"
                    ? "সর্বনিম্ন পণ্যের মূল্য:"
                    : "Minimum products total:"}{" "}
                  {money(offer.min_spend, shop.currency)}
                </p>
              )}
              <OfferCountdown end={offer.expires_at} />
              <Link
                className="button secondary"
                to={`${productPath(product, catalog)}?coupon=${encodeURIComponent(offer.code)}`}
              >
                {lang === "bn" ? "অফার দেখুন" : "View offer"}
              </Link>
            </article>
          ) : null;
        })}
      </div>
    </section>
  );
}
export function VisitTracker({
  catalog,
  ready,
}: {
  catalog: Catalog | null;
  ready: boolean;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (
      !ready ||
      !catalog ||
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    let kind = "",
      target_id = "";
    const parts = routeParts(pathname);
    const product = productForRoute(catalog, {
      id: parts[1] === "products" ? parts[2] : undefined,
      slug: parts[2],
      productSlug: parts[4],
    });
    if (product) {
      kind = "product";
      target_id = product.id;
    } else if (parts[1] === "shops" && parts.length === 3) {
      const shop = catalog.shops.find((s) => s.slug === parts[2]);
      if (shop) {
        kind = "shop";
        target_id = shop.id;
      }
    } else if (pathname === "/") kind = "home";
    else if (pathname === "/products" || pathname === "/shops") {
      kind = "listing";
      target_id = parts[1];
    }
    if (!kind) return;
    const key = `arise-visit:${Math.floor(Date.now() / 86400000)}:${kind}:${target_id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}
    void api("/traffic", {
      method: "POST",
      body: JSON.stringify({ kind, target_id }),
    })
      .then(() => {
        try {
          sessionStorage.setItem(key, "1");
        } catch {}
      })
      .catch(() => {});
  }, [pathname, catalog, ready]);
  return null;
}

export type Question = {
  id: string;
  product_id: string;
  shop_id: string;
  display_name: string;
  question: string;
  answer: string;
  hidden: boolean;
  created_at: number;
  answered_at: number;
};
export function ProductQuestions({ productId }: { productId: string }) {
  const { lang } = useLang();
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [items, setItems] = useState<Question[]>([]),
    [more, setMore] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load(offset = 0) {
    try {
      const result = await api<{ questions: Question[]; has_more: boolean }>(
        `/products/${productId}/questions?offset=${offset}`,
      );
      setItems((previous) =>
        offset ? [...previous, ...result.questions] : result.questions,
      );
      setMore(result.has_more);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  }
  useEffect(() => {
    setItems([]);
    setMessage("");
    void load();
  }, [productId]);
  return (
    <details className="product-questions">
      <summary>
        {lang === "bn" ? "বিক্রেতাকে প্রশ্ন করুন" : "Ask seller / Product Q&A"}
      </summary>
      {items.map((item) => (
        <article key={item.id}>
          <p className="preserve-lines">
            <strong>{item.display_name}:</strong> {item.question}
          </p>
          <p className="preserve-lines">
            <strong>{lang === "bn" ? "বিক্রেতা:" : "Seller:"}</strong> {item.answer}
          </p>
          <time>{new Date(item.answered_at * 1000).toLocaleDateString(lang === "bn" ? "bn-BD" : undefined)}</time>
        </article>
      ))}
      {!items.length && <p>{lang === "bn" ? "এখনও কোনো প্রকাশিত উত্তর নেই।" : "No published answers yet."}</p>}
      {more && (
        <button
          type="button"
          className="button secondary"
          onClick={() => void load(items.length)}
        >
          {lang === "bn" ? "আরও উত্তর দেখুন" : "More answers"}
        </button>
      )}
      {message ? (
        <p role="status">{message}</p>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            const data = new FormData(event.currentTarget);
            try {
              const result = await api<{ message: string }>(
                `/products/${productId}/questions`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    display_name: data.get("display_name"),
                    question: data.get("question"),
                  }),
                },
              );
              setMessage(result.message);
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>
            {lang === "bn"
              ? "বিক্রেতার উত্তর এলে নাম, প্রশ্ন ও উত্তর সবাই দেখতে পাবেন। ব্যক্তিগত তথ্য দেবেন না।"
              : "Your name, question and seller’s answer become public after a reply. Keep contact details, passwords and payment information private."}
          </p>
          <label className="field">
            {lang === "bn" ? "আপনার নাম (পাবলিক)" : "Public name"}
            <input name="display_name" required minLength={2} maxLength={60} />
          </label>
          <label className="field">
            {lang === "bn" ? "আপনার প্রশ্ন" : "Question"}
            <textarea
              name="question"
              required
              minLength={10}
              maxLength={1000}
              rows={3}
            />
          </label>
          <button className="button secondary" disabled={busy}>
            {busy ? (lang === "bn" ? "পাঠানো হচ্ছে…" : "Sending…") : (lang === "bn" ? "প্রশ্ন পাঠান" : "Send question")}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="notice error">
          {error}
          <button
            type="button"
            className="text-link"
            onClick={() => void load()}
          >
            {lang === "bn" ? "আবার চেষ্টা করুন" : "Retry"}
          </button>
        </p>
      )}
    </details>
  );
}

export function SellerQuestions({ shopId }: { shopId: string }) {
  const [items, setItems] = useState<Question[]>([]),
    [offset, setOffset] = useState(0),
    [more, setMore] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const data = await api<{ questions: Question[]; has_more: boolean }>(
        `/seller/stores/${shopId}/questions?offset=${offset}`,
      );
      setItems(data.questions);
      setMore(data.has_more);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, [shopId, offset]);
  return (
    <section className="panel seller-growth">
      <h2>Product questions</h2>
      <p>
        Answer customer questions here. Replies publish on the product page.
      </p>
      <button className="text-link" onClick={() => void load()}>
        Refresh questions
      </button>
      {error && <p role="alert">{error}</p>}
      {!items.length && <p>No questions on this page.</p>}
      {items.map((item) => (
        <form
          key={item.id}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            const data = new FormData(event.currentTarget);
            try {
              await api(`/seller/stores/${shopId}/questions/${item.id}`, {
                method: "PUT",
                body: JSON.stringify({ answer: data.get("answer") }),
              });
              await load();
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>
            <strong>{item.display_name}</strong> ·{" "}
            {new Date(item.created_at * 1000).toLocaleDateString()}
          </p>
          <p className="preserve-lines">{item.question}</p>
          {item.hidden && (
            <p>Hidden by moderation. Replying does not restore visibility.</p>
          )}
          <label className="field">
            Public reply
            <textarea
              name="answer"
              defaultValue={item.answer}
              required
              minLength={2}
              maxLength={2000}
            />
          </label>
          <button className="button secondary" disabled={busy}>
            Publish answer
          </button>
        </form>
      ))}
      <div className="pagination">
        <button
          className="button secondary"
          disabled={!offset}
          onClick={() => setOffset(Math.max(0, offset - 50))}
        >
          Previous
        </button>
        <button
          className="button secondary"
          disabled={!more}
          onClick={() => setOffset(offset + 50)}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export function OffersEditor({
  shopId,
  products,
  admin = false,
  onSaved,
}: {
  shopId: string;
  products: Product[];
  admin?: boolean;
  onSaved?: () => void;
}) {
  const path = `/${admin ? "admin" : "seller"}/stores/${shopId}/offers`;
  const [data, setData] = useState<{
      offers: Offer[];
      revision: string;
    } | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    setData(null);
    setError("");
    setMessage("");
    try {
      setData(await api(path));
    } catch (error) {
      setError((error as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, [path]);
  async function save(change: {
    offer?: Offer;
    remove_code?: string;
    active_code?: string;
    enabled?: boolean;
  }) {
    if (!data || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<typeof data>(path, {
        method: "PUT",
        body: JSON.stringify({ revision: data.revision, ...change }),
      });
      setData(result);
      setMessage("Offers saved in AriseSell.");
      onSaved?.();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel seller-growth">
      <h2>Coupons & flash deals</h2>
      <p>
        Offers are saved in AriseSell and checked against the order total. Times
        use your device’s timezone. A flash deal appears only during its
        schedule.
      </p>
      <button className="text-link" onClick={() => void load()} disabled={busy}>
        Reload offers
      </button>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {data && (
        <>
          <ul className="offer-list">
            {data.offers.map((offer, index) => (
              <li key={index}>
                <strong>{offer.code}</strong> · {offer.benefit} ·{" "}
                {offer.active === false ? "Paused" : "Enabled"}
                {offer.flash ? " · Flash deal" : ""}
                <span>
                  {offer.expires_at
                    ? new Date(offer.expires_at).toLocaleString()
                    : "No expiry"}
                </span>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    void save({
                      active_code: offer.code,
                      enabled: offer.active === false,
                    })
                  }
                >
                  {offer.active === false ? "Activate" : "Pause"}
                </button>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void save({ remove_code: offer.code })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget,
                fields = new FormData(form);
              const offer: Offer = {
                code: String(fields.get("code")).trim().toUpperCase(),
                title: String(fields.get("title")),
                benefit: String(fields.get("benefit")),
                min_spend: String(fields.get("min_spend")),
                starts_at: new Date(
                  String(fields.get("starts_at")),
                ).toISOString(),
                expires_at: new Date(
                  String(fields.get("expires_at")),
                ).toISOString(),
                active: true,
                flash: fields.has("flash"),
                product_ids: fields.getAll("product_ids").map(String),
              };
              void save({ offer });
            }}
          >
            <p>Use an existing code to replace that offer’s settings.</p>
            <div className="form-grid">
              <label className="field">
                Coupon code
                <input
                  name="code"
                  pattern="[A-Za-z0-9_-]{3,64}"
                  required
                  maxLength={64}
                />
              </label>
              <label className="field">
                Title
                <input name="title" required minLength={2} maxLength={100} />
              </label>
              <label className="field">
                Discount (10% or 100 BDT)
                <input
                  name="benefit"
                  required
                  pattern="[0-9]+([.][0-9]{1,2})?%?"
                  placeholder="10%"
                />
              </label>
              <label className="field">
                Minimum spend
                <input
                  name="min_spend"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue="0"
                  required
                />
              </label>
              <label className="field">
                Starts
                <input name="starts_at" type="datetime-local" required />
              </label>
              <label className="field">
                Ends
                <input name="expires_at" type="datetime-local" required />
              </label>
            </div>
            <label className="checkbox">
              <input name="flash" type="checkbox" />
              Show as a flash deal
            </label>
            <fieldset>
              <legend>
                Eligible products (leave empty for every product in this shop)
              </legend>
              <div className="offer-products">
                {products
                  .filter((product) => product.shop_id === shopId)
                  .map((product) => (
                    <label className="checkbox" key={product.id}>
                      <input
                        name="product_ids"
                        value={product.id}
                        type="checkbox"
                      />
                      {product.name}
                    </label>
                  ))}
              </div>
            </fieldset>
            <button
              className="button primary"
              disabled={busy || data.offers.length >= 100}
            >
              {busy ? "Saving…" : "Save offer"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

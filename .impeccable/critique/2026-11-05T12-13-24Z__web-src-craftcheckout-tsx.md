---
target: checkout
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:E:\\Ship Studio\\Arise Digital Store\\web\\src\\CraftCheckout.tsx"
target_fingerprint: "sha256:e79bf3d43b84a75ac397b33b9c616dbcd948bda288b810ae0cf4e8ad16afa8e5"
target_path: "E:\\Ship Studio\\Arise Digital Store\\web\\src\\CraftCheckout.tsx"
timestamp: 2026-11-05T12-13-24Z
slug: web-src-craftcheckout-tsx
---
Method: dual-agent (A: 8bf928c7-d53d-4f70-ae2b-0150ff105b67 · B: 9ce481e8-5a9e-43fe-9c3a-33e8939de7dc)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Live payment countdown and step progress are strong; `CraftCheckout` proof review waiting state lacks active polling feedback. |
| 2 | Match System / Real World | 3/4 | Native BDT and bilingual Bengali/English flow; free-form District input conflicts with binary courier logistics (Inside/Outside Dhaka). |
| 3 | User Control and Freedom | 3/4 | "Edit order details" reverts step 1 without state loss; locked out of editing address once payment request is created. |
| 4 | Consistency and Standards | 2.5/4 | Stepper buttons on product page vs. raw `<input type="number">` on checkout vs. custom mini-stepper in craft commissioning. |
| 5 | Error Prevention | 3/4 | High-contrast Merchant vs. Personal MFS alerts and 1-click copy buttons; phone number lacks input masking and 11-digit regex validation. |
| 6 | Recognition Rather Than Recall | 3/4 | Desktop sticky summary with live totals is clean; mobile viewport collapses summary below 7+ form fields. |
| 7 | Flexibility and Efficiency | 2.5/4 | Auto-fill for logged-in buyers; guest repeat buyers must re-enter entire shipping address from scratch without autofill or district autocomplete. |
| 8 | Aesthetic and Minimalist Design | 3.5/4 | Exemplary Artisan Pavilion discipline; pure white cards on cool grey canvas; terms box dumps dense unformatted text. |
| 9 | Error Recovery | 2.5/4 | Contextual error boxes on submit; payment request timeout is a terminal dead-end that discards order state. |
| 10 | Help and Documentation | 3/4 | Clear 1-6 numbered payment instructions; missing inline FAQ for delayed or unconfirmed TrxID SMS. |
| **Total** | | **29/40** | **Functional with Notable Friction** |

#### Design Specificity Verdict

**LLM assessment**: Authentically grounded in Bangladeshi digital and artisanal commerce. The checkout avoids generic Stripe/Shopify paradigms by directly confronting the reality of local Mobile Financial Services (bKash, Nagad, Rocket), distinguishing Merchant "Payment" from Personal "Send Money" accounts with dedicated copy actions and TrxID verification. The Craft Commissioning workflow (`CraftCheckout`) introduces a bespoke design matrix rather than a generic textarea. However, generic form field rhythm on Step 1, an unconstrained text field for administrative districts, and single-column mobile layout collapse slip into generic template patterns.

**Deterministic scan**: Scanned `web/src/CraftCheckout.tsx` and `web/src/App.tsx` with Impeccable CLI detector. The direct `.tsx` static scan returned 0 regex findings (`[]`). Inspection of the coupled stylesheet (`web/src/styles.css`) identified 2 warning-level findings under the `side-tab` anti-pattern rule (lines 2526 and 2532: `border-left: 3px solid var(--amber)` and `border-left: 3px solid var(--info)`) directly styling `.payment-type-alert` rendered in `App.tsx:3502`.

**Visual overlays**: Deterministic scan performed via CLI. Live browser script injection was not executed in this headless session; deterministic source and stylesheet findings served as the verification signal.

#### Overall Impression
The checkout flow demonstrates impressive cultural competence and high data integrity, tailored specifically to Bangladeshi MFS transactions and bespoke craft commissioning. Its greatest weakness is form friction: an unconstrained district input that misaligns with courier APIs, lack of mobile sticky reassurance, and a silent promo code input that defers feedback until Step 2.

#### What's Working
1. **Authoritative MFS Guidance (Merchant vs. Personal)**: Resolves the single highest source of transaction failure in Bangladesh by explicitly identifying wallet type, detailing exact app actions (`Payment` vs. `Send Money`), and providing 1-click copy buttons for Account, Amount, and Reference.
2. **Server-Bound Two-Step Verification**: Step 2 binds quote hashes and delivery calculations into an immutable snapshot, protecting both seller and buyer from price tampering and phantom stock changes before payment.
3. **Dedicated Craft Commissioning Matrix**: `CraftCheckout` provides multi-piece package allocation, dynamic price calculation per piece, and artwork proof approvals rather than an unstructured order note.

#### Priority Issues

- **[P1] Free-Form District Text Input & Missing Phone Mask**
  - **Why it matters**: Bangladeshi courier providers (Pathao, Steadfast, RedX) strictly calculate shipping based on Inside Dhaka (৳60-70) vs. Outside Dhaka (৳120-150). Free-form district text entry ("Dhk", "ঢাকা", "Dhaka City") breaks automated courier booking and causes quote mismatches. Unmasked phone inputs allow incomplete digits.
  - **Fix**: Replace the free-form text input with a searchable Combobox of the 64 official administrative districts of Bangladesh (with quick chips for "ঢাকা", "চট্টগ্রাম", "সিলেট"). Add an 11-digit phone input mask enforcing `01...` with a fixed `+880` badge.
  - **Suggested command**: `$impeccable harden`

- **[P1] Silent Coupon Validation (Deferred Feedback)**
  - **Why it matters**: Entering a promo code in Step 1 gives no instant visual validation; confirmation is silently postponed until the user clicks "Review order". Shoppers experience doubt about whether their discount was recognized, inflating drop-offs at the primary conversion button.
  - **Fix**: Introduce an inline "Apply" button with instant debounced feedback showing a success badge (`✓ 10% discount applied`) or specific error text without requiring a page step advance.
  - **Suggested command**: `$impeccable clarify`

- **[P2] Mobile Visual Hierarchy Collapse & Order Summary Disconnection**
  - **Why it matters**: On viewports under 800px, `.checkout-grid` collapses into a single column, burying the `.order-summary` beneath 7+ form fields. Mobile shoppers must complete checkout without seeing their product thumbnail, selected variant, or calculated total.
  - **Fix**: Implement a top-anchored compact collapsible order summary bar on mobile that displays thumbnail, variant title, and live total with a tap-to-expand itemized breakdown.
  - **Suggested command**: `$impeccable layout`

- **[P2] Fragmented Quantity Selector Paradigms**
  - **Why it matters**: The product page uses pill stepper buttons `(- / +)`, Checkout Step 1 uses a native HTML5 `<input type="number">`, and `CraftCheckout` uses custom mini-stepper cards. On mobile, tapping the native number input summons the full software keyboard, obscuring form controls.
  - **Fix**: Standardize on a unified, tactile `QuantityControl` component with 44px minimum touch targets across all three surfaces.
  - **Suggested command**: `$impeccable polish`

- **[P3] Terminal Dead-End on Payment Expiry**
  - **Why it matters**: If a buyer exceeds the 15-minute payment window, the view renders a terminal message with only a "Browse products" button. The customer's cart, address, and variant choices are discarded, requiring a complete restart.
  - **Fix**: Add a "Re-quote & Retry Order" action that retains the filled shipping and variant details and generates a fresh payment request in a single tap.
  - **Suggested command**: `$impeccable onboard`

#### Persona Red Flags

- **Tanvir (23, Mobile-First Buyer in Chittagong using bKash)**:
  - *District Input Ambiguity*: Hesitates at the free-form `District` field, unsure whether to type "Chittagong", "Chattogram", "চট্টগ্রাম", or his sub-district "Chawkbazar", fearing wrong courier calculation.
  - *App-Switch Anxiety*: Sees the 15-minute countdown and fears switching between Chrome and bKash on a 4GB Android device will cause browser tab eviction and lose his progress.
  - *TrxID SMS Friction*: Must manually copy the 10-character TrxID from SMS and paste it back; lacks inline feedback that the TrxID format is valid before submitting.

- **Nusrat (31, Design Agency Lead in Dhaka, Repeat Craft Buyer)**:
  - *Zero Guest Memory*: Even after multiple purchases, she must re-enter her full address, tax email, and phone number every time.
  - *Craft Choice Fatigue*: In `CraftCheckout`, an unpaginated 3-column grid of 16 design variations requires manual mental math to allocate 20 pieces across cards.
  - *Proof Review Limbo*: Submitting a custom craft commission displays a static "Seller review" banner with no estimated turnaround time (e.g. "Usually responds within 2 hours"), leaving her unsure whether to leave the browser open.

#### Minor Observations
- In `ManualPaymentInstructions`, the TrxID input does not explicitly declare `font-family: var(--font-mono)`, missing `JetBrains Mono` character alignment.
- The 3px solid colored borders on `.payment-type-alert` in `styles.css` (lines 2526 & 2532) trigger the `side-tab` anti-pattern rule; replacing them with a subtle tint wash and icon badge aligns with *The Solid Interior Rule*.
- Step 2 seller terms container (`.terms-box`) lacks max-height constraints, causing multi-paragraph policies to dominate the review screen.

#### Questions to Consider
1. What if Arise Store offered a 1-tap "Paste TrxID from Clipboard" button when the buyer switches back from bKash/Nagad?
2. What if District was replaced by a fast binary switch (**Dhaka Metro: ৳60** / **All Other Districts: ৳120**) backed by a standardized 64-district autocomplete?
3. Could `CraftCheckout` generate instant client-side preview renders for custom text and vector artwork, eliminating the multi-hour proof waiting limbo?

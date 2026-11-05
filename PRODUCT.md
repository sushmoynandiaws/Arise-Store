# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Buyers (Bangladesh):** Creative professionals, students, small business owners, and general consumers seeking trusted digital goods (software licenses, design templates, digital courses) and custom handcrafted physical products. They need seamless local transactions via mobile financial services (bKash, Nagad, Rocket) or Cash on Delivery, transparent BDT pricing without hidden markups, and instant, secure access to private digital purchases.
- **Independent Sellers & Creators:** Digital makers, educators, and artisan craft shops who distribute branded goods via the AriseSell platform infrastructure. They need authoritative inventory management, custom-order craft specifications, and verified payment workflows.

## Product Purpose

Arise Digital Store is a curated, premium storefront marketplace engineered specifically for local commerce in Bangladesh. It exists to bridge the trust and experience gap in local e-commerce by pairing frictionless regional payment workflows with an uncompromised standard of digital craft. Success means buyers complete transactions with confidence in under two minutes, receive authentic digital or physical goods without fragile authentication friction, and enjoy a cohesive bilingual experience.

## Positioning

Unlike cluttered, deal-heavy e-commerce websites or generic drop-shipping templates filled with artificial timers and fabricated testimonials, Arise Store positions itself as an authentic, high-integrity marketplace:
- **Source-Owned Truth:** All prices, stock levels, delivery timelines, and reviews come strictly from verified backend records in AriseSell. No simulated counters, no fake reviews, no synthetic urgency.
- **Native Localization:** Built thoughtfully around Bangladeshi commerce realities — native bKash/Nagad merchant vs. personal account detection, TrxID confirmation, BDT currency formatting (`৳`), and native typographic harmony between English (`Urbanist`) and Bengali (`Hind Siliguri`).

## Operating Context

- **Environment:** Responsive web application used primarily on mobile devices (smartphones on 4G/LTE mobile networks) and desktop workstations across Bangladesh.
- **Transaction Flows:** Checkout transitions into local MFS payment prompts with step-by-step guidance, followed by instant access to a private delivery vault (`My purchases`) keyed by CSRF, route, and account authorization.
- **Fulfillment Spectrum:** Dual-mode handling for automated digital file/key delivery and physical craft shipments integrated with Bangladeshi courier stage tracking.

## Capabilities and Constraints

- **Confirmed Capabilities:**
  - Multi-shop directory and dedicated seller storefronts (`/shops/:slug`).
  - Search, category exploration, and real-time query filtering.
  - Interactive shopping bag (`CartProvider`) with multi-item and single-item direct checkout flows.
  - Custom craft specification editor (`CraftCheckout`) with design package calculation, piece counts, and custom artwork support.
  - Verified customer reviews tied strictly to delivered, paid purchases.
  - AI Shopping Assistant (`ShoppingAssistant`) offering shop-isolated conversational assistance, product matching, and Bengali voice input support.
- **Technical & Security Constraints:**
  - Phone and email OTP recovery is decommissioned; order access relies strictly on authenticated session identity and browser-owned purchase keys.
  - Public catalog failure displays cached snapshot with explicit stale-data notice while pausing checkout until refreshed.
  - Touch targets strictly maintain $\ge 44\text{px}$; mobile form inputs maintain $\ge 16\text{px}$ font size to prevent iOS view zooming.
  - Negative letter-spacing is strictly forbidden on Bengali text.

## Brand Commitments

- **Identity:** "arise/store" — understated, modern, restrained.
- **Palette:** Violet Primary (`#6336D6`), Deep Ink (`#1D1D1F`), Muted Slate (`#626269`), Clean Canvas (`#F5F5F7`), Pure White Surface (`#FFFFFF`).
- **Voice:** Direct, honest, respectful, and helpful. Tone remains factual and clear in both English and Bengali, avoiding corporate marketing jargon or hyperbole.

## Evidence on Hand

- Production-tested React 19 storefront located in `web/`.
- Concrete design tokens and guidelines established in `web/src/styles.css` and `design-system/arise-digital-store/MASTER.md`.
- Content and terminology reference in `design-system/arise-digital-store/content-style-guide.md`.
- Comprehensive automated test suite in `web/tests/` (53 unit/integration tests and Playwright browser specs).

## Product Principles

1. **Integrity Over Artificial Urgency:** Every badge, review, countdown, and stock notification reflects verifiable backend truth. Never fabricate social proof or fake scarcity to drive conversions.
2. **Frictionless Regional Commerce:** Streamline payment, courier tracking, and digital delivery around the exact habits of Bangladeshi consumers. Eliminate dead ends and unnecessary steps.
3. **Restraint and Craftsmanship:** High-contrast readability, unified surfaces, and Apple-inspired materials. White space and hierarchy do the heavy lifting rather than loud gradients or visual noise.
4. **Bilingual Equality:** Bengali is a first-class language, not an afterthought. Typography, button dimensions, and microcopy must feel natural and legible across both English and Bengali.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA contrast standards for all ink, canvas, and accent combinations.
- Full keyboard navigation and visible focus rings (`focus-visible`) for all interactive elements.
- Screen-reader accessible dialog modals and live regions for dynamic order totals and inventory statuses.
- Support for `prefers-reduced-motion` and forced high-contrast color modes.

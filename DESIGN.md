---
name: Arise Digital Store
description: Curated digital goods and custom crafts storefront marketplace in Bangladesh
colors:
  primary: "#6336d6"
  primary-dark: "#5128b8"
  primary-light: "#f2eefc"
  ink: "#1d1d1f"
  ink-soft: "#424245"
  muted: "#626269"
  canvas: "#f5f5f7"
  surface: "#ffffff"
  line: "rgba(0, 0, 0, 0.07)"
  line-strong: "#d2d2d7"
  mint: "#10b981"
  success: "#08765b"
  amber: "#8a5a0a"
  error: "#b42332"
typography:
  display:
    fontFamily: "Urbanist, Hind Siliguri, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Urbanist, Hind Siliguri, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Hind Siliguri, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Hind Siliguri, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, Hind Siliguri, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  control: "12px"
  card: "18px"
  panel: "22px"
  hero: "26px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "44px"
  card-product:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
---

# Design System: Arise Digital Store

## Overview

**Creative North Star: "The Artisan Pavilion"**

Arise Digital Store's visual identity embodies "The Artisan Pavilion" — an airy, sunlit gallery of digital craft and tactile physical creation. Set against a cool grey canvas (`#F5F5F7`), white display trays and monolithic surface cards showcase products with quiet confidence. The environment borrows the material discipline of modern industrial design: restrained glassmorphic navigation, neutral hairlines, and purposeful Royal Violet accents (`#6336D6`) reserved strictly for decisions and actions.

The interface rejects the frantic, high-decibel clutter typical of regional e-commerce. There are no garish gradient banners, flashing discount stickers, or synthetic countdown timers. Instead, space and precision elevate each item. Authentic textures, crisp typographic geometry, and calm bilingual symmetry provide buyers with an atmosphere of absolute commercial legitimacy and trust.

**Key Characteristics:**
- **Restrained Materiality:** Translucent frosted glass reserved strictly for floating navigation headers and dialog backdrops; solid pure-white panels for content.
- **Bilingual Typographic Harmony:** Geometric sans (`Urbanist`) paired seamlessly with the graceful humanist letterforms of Bengali (`Hind Siliguri`).
- **Tactile Sensation:** Pill-shaped interactive triggers with spring compression (`scale(0.97)`) on press, providing satisfying physical feedback.
- **Source-Owned Integrity:** Clean visual hierarchy driven exclusively by verifiable AriseSell backend data.

## Colors

The palette balances clean neutral surfaces with targeted Royal Violet actions and unambiguous regional status indicators.

### Primary
- **Royal Violet** (`#6336D6` / `--primary`): The singular action voice of the storefront. Reserved for primary checkout CTAs, active navigation items, selected payment methods, and interactive highlights.
- **Deep Violet** (`#5128B8` / `--primary-dark`): Hover and pressed states on primary action triggers.
- **Soft Violet Surface** (`#F2EEFC` / `--primary-light`): Subtle tint for category pills, active filter badges, and selected item highlights.
- **Violet Glow** (`rgba(99, 54, 214, 0.14)` / `--primary-glow`): Atmospheric halo applied to keyboard focus rings and active card selections.

### Neutral
- **Deep Ink** (`#1D1D1F` / `--ink`): High-contrast charcoal black for headings, essential product titles, and dark thematic footers.
- **Soft Ink** (`#424245` / `--ink-soft`): Secondary headings, active labels, and emphasized metadata.
- **Muted Slate** (`#626269` / `--muted`): Secondary explanatory guidance, delivery terms, timestamps, and breadcrumbs.
- **Cool Grey Canvas** (`#F5F5F7` / `--surface-ground` / `--wash`): The ambient, non-glare marketplace ground canvas.
- **Pure White** (`#FFFFFF` / `--surface`): Clean display trays, product cards, inputs, and popover panels.
- **Hairline Border** (`rgba(0, 0, 0, 0.07)` / `--line`): Subtle structural boundary separating surface layers.
- **Strong Line** (`#D2D2D7` / `--line-strong`): Input boundaries and unselected card hover borders.

### Accents & Status Indicators
- **Stock Mint** (`#10B981` / `--mint`): In-stock indicator dots and availability pings.
- **Success Ink** (`#08765B` / `--success`): Confirmed payment receipts and verified delivery states.
- **Status Amber** (`#8A5A0A` / `--amber`): Payment guidance notices, expiration alerts, and pending action callouts.
- **Critical Red** (`#B42332` / `--error`): Form error alerts, stock exhaustion warnings, and destructive actions.

### Named Rules
**The Rarity of Violet Rule:** The primary violet accent (`#6336D6`) must never cover more than 10% of any viewport. Its power comes from restraint; when everything is violet, nothing is an action.

## Typography

**Display / Heading Font:** `Urbanist` (Latin) paired with `Hind Siliguri` (Bengali)
**Body Font:** Native system UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI"`) paired with `Hind Siliguri` (Bengali)
**Monospace / Financial Font:** `JetBrains Mono` with tabular figures

**Character:** Modern geometric clarity meets regional humanism. Latin headings present tall x-heights and tight apertures, while Bengali text retains open counters, natural vowel-sign ligatures, and zero artificial distortion.

### Hierarchy
- **Page Display** (`Urbanist` 700, `clamp(1.75rem, 2.4vw, 2rem)`, line-height 1.2, letter-spacing -0.035em): Homepage hero statements and primary section banners.
- **Status / Product Headline** (`Urbanist` 700, `1.75rem` / `28px` desktop, `26px` mobile, line-height 1.25): Dedicated product titles, order status headings, and checkout milestones.
- **Section Title** (`Urbanist` 700, `1.375rem` / `22px` desktop, `20px` mobile, line-height 1.3): Major category divisions, review headers, and checkout step legends.
- **Subsection Title** (`Urbanist` 650, `1.125rem` / `18px`, line-height 1.35): Product card names, modal dialog titles, and panel headings.
- **Body Text** (System / `Hind Siliguri` 400, `1rem` / `16px`, line-height 1.65, max width 65-75ch): Essential descriptions, terms, and purchase instructions.
- **Action Label** (`Urbanist` / System 600, `0.875rem` / `14px`, line-height 1.4): Buttons, interactive chips, table headers, and form labels.
- **Metadata & Microcopy** (System 400-500, `0.8125rem` / `13px`, line-height 1.5): Timestamps, breadcrumbs, badge text, and auxiliary notes.
- **Price & Financial Figures** (System / `JetBrains Mono` 700-800, `1.625rem` / `26px` desktop, `24px` mobile, tabular-nums): Prominently displayed in Bangladeshi Taka (`2,799.00 ৳` / `৳ 2,799`).

### Named Rules
**The Script Harmony Rule:** Bengali text (`:lang(bn)`) strictly uses `Hind Siliguri` with `letter-spacing: 0` and `line-height: 1.4` minimum. Negative tracking (`letter-spacing: -0.035em`) looks modern in English but destroys Bengali vowel ligatures. Never apply negative letter-spacing to Bengali copy.

## Layout

The layout uses a fluid container model with fixed max-width and proportional gutter scaling:
- **Maximum Container Width:** `1200px` centered with fluid margin `calc(100% - 80px)` on desktop, adapting to `16px` padding on mobile viewports.
- **Spacing Scale:** Standard 8pt spatial grid: `4px` (xs), `8px` (sm), `16px` (md), `24px` (lg), `32px` (xl), `48px` (xxl).
- **Responsive Product Grid:**
  - Desktop ($\ge 1100\text{px}$): 4 equal columns (`repeat(4, minmax(0, 1fr))`, `20px` gap).
  - Small Desktop / Laptop ($800\text{px} - 1099\text{px}$): 3 equal columns (`repeat(3, minmax(0, 1fr))`, `20px` gap).
  - Tablet ($481\text{px} - 799\text{px}$): 2 equal columns (`repeat(2, minmax(0, 1fr))`, `16px` gap).
  - Mobile ($\le 480\text{px}$): Single fluid column (`minmax(0, 1fr)`, `16px` gap) ensuring full image fidelity and touch accessibility.
- **Product Detail Layout:** Two-column split on desktop (Artwork Gallery left 55%, Purchase Options & Checkout Actions right 45%), collapsing into a single stacked column on mobile.

## Elevation & Depth

Arise Store employs an **Ambient Restraint** elevation model. Depth is established through subtle tonal contrast and hairline borders at rest, lifting into focused elevation only during interaction.

### Shadow Vocabulary
- **Resting Layer** (`--shadow-sm: 0 1px 2px rgb(0 0 0 / 4%), 0 8px 24px rgb(0 0 0 / 3%)`): Subtle ambient ground for cards and input containers.
- **Interactive Lift** (`--shadow-panel: 0 1px 3px rgb(0 0 0 / 4%), 0 14px 40px rgb(0 0 0 / 4%)`): Engaged during card hover (`transform: translateY(-2px)`), displaying responsive surface depth.
- **Floating Overlays** (`--shadow-overlay: 0 2px 8px rgb(0 0 0 / 10%), 0 30px 80px rgb(0 0 0 / 18%)`): Applied to cart drawers, modal dialogs, and sticky floating bars.
- **Frosted Glass (Backdrop Filter):** `backdrop-filter: blur(14px) saturate(145%)` with `--glass-nav` tint (`rgb(255 255 255 / 72%)`) applied exclusively to sticky top navigation and popup menus.

### Named Rules
**The Solid Interior Rule:** Glassmorphism and blur filters belong only on outer floating shells (navigation, sticky bottom bars, modal backdrops). Internal content cards, payment selector tiles, and forms must remain 100% solid white (`#FFFFFF`) to ensure uncompromised contrast and legibility.

## Shapes

- **Controls & Form Fields:** `border-radius: 12px` (`--radius-control`).
- **Product Cards:** `border-radius: 18px` (`--r-card`).
- **Content Panels & Summary Trays:** `border-radius: 22px` (`--r-panel`).
- **Hero Banners:** `border-radius: 26px` (`--r-hero`).
- **Pill Triggers & Badges:** `border-radius: 999px` (`--radius-pill`). All primary action buttons, search fields, category chips, and filter pills employ full pill rounding.
- **Touch Target Integrity:** Every clickable, tappable, or interactive element enforces a strict minimum dimension of $44\text{px} \times 44\text{px}$.

## Components

### Buttons
- **Shape:** Pill-shaped (`border-radius: 999px`), minimum height $44\text{px}$.
- **Primary:** Royal Violet background (`#6336D6`), pure white text, bold weight. Hover shifts to `#5128B8`; active tap triggers `scale(0.97)` spring compression.
- **Secondary / Ghost:** Soft wash background (`#F5F5F7`), neutral ink text (`#1D1D1F`), border hairline. Hover shifts to `#F2EEFC` with violet text.
- **Icon Buttons:** Circular $44\text{px} \times 44\text{px}$ targets with centered SVGs and subtle hover halo.

### Product Cards
- **Structure:** 1:1 or 4:3 art visual wrapper on top, separated info tray below with title, category, verified seller attribution, availability pill, price, and floating quick-buy button.
- **Hover Behavior:** Smooth $220\text{ms}$ transition with `translateY(-2px)` lift, border darkening to `#D2D2D7`, and soft panel shadow.
- **Stock Indicators:** Pulsing mint dot (`#10B981`) for in-stock goods; muted slate tag for sold-out items.

### Inputs & Form Fields
- **Metrics:** Minimum height $44\text{px}$, padding $10\text{px} \times 14\text{px}$, font-size strictly $\ge 16\text{px}$ on mobile viewports.
- **Resting Stroke:** `1px solid #D2D2D7` on pure white background.
- **Focus Treatment:** Smooth border transition to `#6336D6` with a $3\text{px}$ violet glow ring (`rgba(99, 54, 214, 0.14)`).

### Payment Method Selector
- **Structure:** Responsive grid of touchable cards ($54\text{px}$ height) featuring official MFS provider logos (bKash, Nagad, Rocket, COD), radio trigger, and right-aligned checkmark.
- **Selected State:** Border turns `#6336D6` with soft violet background (`#F2EEFC`), subtle glow shadow, and scale-in checkmark indicator.

### Shopping Assistant Drawer
- **Drawer:** Floating right-anchored drawer on desktop, bottom-sheet drawer on mobile.
- **Chat Bubbles:** Asymmetric rounding (user questions in primary violet with white text; assistant answers in solid white with subtle hairline border).
- **Typing Indicator:** Three animated bouncing dots with smooth wave delays.

## Do's and Don'ts

### Do:
- **Do** maintain a strict minimum touch target of $44\text{px}$ on every button, link, and interactive trigger.
- **Do** ensure all form inputs on mobile devices have a font-size of at least $16\text{px}$ to prevent iOS auto-zoom disruption.
- **Do** preserve the dual-font hierarchy: `Urbanist` for English headings, `Hind Siliguri` for Bengali, and native system fonts for body text.
- **Do** use tabular numerals (`font-variant-numeric: tabular-nums`) for all prices, quantities, and transaction IDs.
- **Do** respect the `prefers-reduced-motion` media query by disabling hover lifts and transitions when requested by the OS.
- **Do** keep product descriptions and long content in accessible modal dialogs on product pages rather than building multi-page scroll clutter.

### Don't:
- **Don't** apply negative letter-spacing or tight tracking to Bengali text.
- **Don't** use synthetic or fake urgency patterns (e.g., "5 people are looking at this item", fake countdown clocks, or unverified reviews).
- **Don't** use multi-color gradient backgrounds on buttons, cards, or hero banners; stick to the solid Royal Violet action palette and clean wash canvas.
- **Don't** use glassmorphism or backdrop-filter inside solid content cards or forms.
- **Don't** hardcode merchant phone numbers, emails, or personal payment accounts across store templates; all payment details must resolve dynamically from AriseSell.
- **Don't** invent or import third-party reviews without an authentic, verified order reference.

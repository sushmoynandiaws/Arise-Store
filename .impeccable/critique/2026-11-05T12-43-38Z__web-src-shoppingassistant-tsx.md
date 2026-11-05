---
target: AI Shopping Assistant
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:E:\\Ship Studio\\Arise Digital Store\\web\\src\\ShoppingAssistant.tsx"
target_fingerprint: "sha256:41918ac75ed0d2ffd38f1ba70ebc20352e08553551869c15666f147548a6b990"
target_path: "E:\\Ship Studio\\Arise Digital Store\\web\\src\\ShoppingAssistant.tsx"
timestamp: 2026-11-05T12-43-38Z
slug: web-src-shoppingassistant-tsx
---
Method: dual-agent (A: aced43ae-20c2-429f-b3d0-f825936adecb · B: 681e4746-af96-49d2-a8ab-e1df5b1da9be)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2/4 | Text generation typing dots (`assistant-pulse`) are sound; voice input mic state lacks live audio waveform, volume level ripple, and interim transcript. |
| 2 | Match System / Real World | 3/4 | Culturally authentic Bengali phrasing in `Hind Siliguri`; voice recognition hardcodes `input.lang = "bn-BD"` and "বাংলায় বলুন" even in English mode. |
| 3 | User Control and Freedom | 3/4 | Suggestions load into draft without consuming an API turn; no in-drawer reset button to clear or restart a conversation without refreshing. |
| 4 | Consistency and Standards | 2/4 | Drawer header is coated in solid Royal Violet, pushing violet coverage past 35% in the drawer (*The Rarity of Violet Rule* violation); secondary conversation buttons share full-width pill styling with primary checkout CTAs. |
| 5 | Error Prevention | 3/4 | Solid IME composition guard (`!e.nativeEvent.isComposing`) prevents premature submits; out-of-stock items disable checkout triggers automatically. |
| 6 | Recognition Rather Than Recall | 3/4 | Selected product context badge keeps active subject visible; multi-turn dialogues scroll earlier budget constraints and products far out of view. |
| 7 | Flexibility and Efficiency | 2/4 | 3 quick prompts shown on initial empty state; quick reply pills vanish completely after turn 0, forcing manual mobile typing on clarifying questions. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Embedding full product metadata, select dropdowns, and two full-width buttons inside conversational speech bubbles causes severe visual noise. |
| 9 | Error Recovery | 3/4 | Out-of-scope queries provide actionable links to verified seller contact pages; network errors render plain text without an in-thread Retry button. |
| 10 | Help and Documentation | 2/4 | Defensive disclaimers in `<details className="assistant-help">` explain AI limitations, but offer zero proactive examples of how the assistant can assist. |
| **Total** | | **25/40** | **Functional with Notable Friction** |

#### Design Specificity Verdict

**LLM assessment**: The underlying data architecture is authentically grounded in local commerce integrity—it strictly verifies product prices, stock, and shop boundaries against AriseSell backend contracts, refusing to hallucinate discounts or take unauthorized in-chat payments. However, the visual veneer regresses into a generic 2021 SaaS chatbot clone: (1) cartoon Lucide `Bot` toy-robot icons across 4 touchpoints degrade the elegance of *The Artisan Pavilion*; (2) a solid Royal Violet top header pushes purple viewport coverage past 35%, violating *The Rarity of Violet Rule*; and (3) squashing native HTML `<select>` dropdowns, pricing tables, and dual full-width action buttons into speech bubbles creates a chaotic "mini-form in a chat bubble" aesthetic.

**Deterministic scan**: Scanned `web/src/ShoppingAssistant.tsx` and assistant styles in `web/src/styles.css` (lines 3673–3751) with the Impeccable CLI detector. The direct `.tsx` scan returned **0 primary detector findings** (`[]`). Across the actual assistant DOM structure (`.assistant-view`, `.assistant-thread`, `.assistant-turn`, `.assistant-input-tray`), zero slop rules were triggered. Stylistic slice checks identified 8 ad-hoc radius values (e.g. `10px`, `16px`, `20px`, `24px`) diverging from the unified token scale in `DESIGN.md`. The only 2 warning-level findings in the repository are isolated to checkout modal alert styling in `web/src/styles.css` (`side-tab` warning).

**Visual overlays**: Deterministic scan performed via CLI. Live browser script injection was not executed in this headless session; deterministic source and stylesheet analysis served as the verification signal.

#### Overall Impression
The AI Shopping Assistant has remarkable factual integrity and strict shop isolation, but it dresses like a generic Zendesk live-chat widget. Shifting the header to a clean artisan surface, replacing the cartoon robot icon with a refined concierge mark, turning stacked product bubbles into compact preview cards, and adding live audio feedback will elevate the assistant into a true luxury shopping concierge.

#### What's Working
1. **Source-Owned Commercial Truth & Zero Hallucination**: The assistant strictly reads AriseSell backend contracts; it never invents fictitious return windows, phantom stock, or fake promo codes. Prices reflect live BDT currency formatting, and checkout links route directly to verified checkout snapshots (`/checkout/:id?variant=...`).
2. **IME-Safe Composition & Non-Consumptive Drafts**: Line 112 protects phonetic Bengali typing with `!e.nativeEvent.isComposing`. Prompt chips and voice dictation populate the composer draft without auto-submitting, allowing buyers to edit transcripts before sending.
3. **Strict Route & Shop Sandboxing**: Keyed to `shop.id` in `App.tsx`, ensuring that switching artisan storefronts flushes conversational history and cached context, preventing cross-shop inventory confusion.

#### Priority Issues

- **[P1] Saturated Violet Dominance & "Toy Robot" Iconography Degrade Artisan Identity**
  - **Why it matters**: The drawer header is coated in solid Royal Violet (`#6336D6`), paired with violet user bubbles, violet launch button, violet send button, and 4 cartoon Lucide `Bot` robot icons. This violates **The Rarity of Violet Rule** (<10% viewport coverage) and conflicts with *The Artisan Pavilion* design direction, making the assistant feel like an off-the-shelf support bot.
  - **Fix**: Invert the drawer header to a crisp white/canvas surface with subtle hairline borders and dark ink typography. Replace the cartoon robot head with a refined concierge sparkle or artisan pavilion mark. Reserve Royal Violet strictly for user bubbles, active states, and the send action.
  - **Suggested command**: `$impeccable quieter` / `$impeccable polish`

- **[P1] Overloaded Vertical Card Stacking Inside Conversational Speech Bubbles**
  - **Why it matters**: Multiple matching products are rendered as full vertical cards with `<select>` elements and dual full-width buttons directly inside the assistant's speech bubble (`.assistant-answer`). Returning 3 matching products consumes ~780px of vertical space, completely pushing the assistant's text reply and user query off-screen on mobile devices.
  - **Fix**: Re-architect multi-product recommendations into a horizontal swipeable recommendation rail or compact artisan preview cards (1:1 thumbnail, title, price, stock pill, and a single "View / Options" action).
  - **Suggested command**: `$impeccable layout` / `$impeccable distill`

- **[P2] Opaque & Language-Locked Voice Input Experience**
  - **Why it matters**: `input.lang = "bn-BD"` is hardcoded regardless of language selection, the button title always displays "বাংলায় বলুন", and there is zero audio waveform or interim transcription feedback while speaking. Mobile users in noisy environments cannot tell if their phone is listening.
  - **Fix**: Dynamically assign `input.lang = lang === "bn" ? "bn-BD" : "en-US"`, update accessibility labels dynamically, and add a pulsing voice ripple / listening bar during recording with live interim speech transcript previews.
  - **Suggested command**: `$impeccable clarify` / `$impeccable delight`

- **[P2] Composer Tray Height Bloats Mobile Viewport**
  - **Why it matters**: The composer tray (`.assistant-compose`) stacks the context badge, input pill, and a 44px `<details className="assistant-help">` accordion, occupying 140px+ of vertical height. When the mobile virtual keyboard opens, less than 150px of visible chat history remains.
  - **Fix**: Move the verbose AI disclaimers and microphone instructions into a header info popover `(i)` or quiet inline microcopy, reclaiming 44px of vertical height for conversational history.
  - **Suggested command**: `$impeccable compact` / `$impeccable distill`

- **[P3] Vanishing Quick Suggestions After Initial Message Turn**
  - **Why it matters**: Contextual prompt chips only render when `turns.length === 0`. Once a dialogue starts, quick reply pills disappear entirely, forcing mobile users to type long replies manually when the assistant asks clarifying questions.
  - **Fix**: Supply dynamic contextual reply pills below assistant responses (e.g. "বাজেট ২০০০ এর মধ্যে", "ডেলিভারি চার্জ কত?", "ক্যাশ অন ডেলিভারি").
  - **Suggested command**: `$impeccable adapt`

#### Persona Red Flags

- **Shakil (29, Creative Freelancer, Mobile 4G in Dhaka)**:
  - *Opaque Voice Capture*: Taps the mic while commuting. Button turns light violet, but there is no waveform or "শুনছি…" indicator. Amidst Dhaka traffic noise, he has no idea if the microphone is capturing his words until timeout.
  - *Squashed Screen Height*: When 3 products return, they consume ~800px vertically. Opening the keyboard leaves almost zero visible conversation space.

- **Shama (34, Interior Architect, Desktop in Chittagong)**:
  - *Lost Context on Contact Handoff*: Asking about custom wood engraving on a walnut tray, the assistant replies: "এই বিষয়ে নিশ্চিত তথ্য পাচ্ছি না। বিক্রেতার সঙ্গে কথা বলবেন?". Clicking the contact link navigates away, closing the assistant and erasing her typed query.
  - *Mini-Form Bubble Friction*: Product cards in bubbles present raw `<select>` dropdowns rather than tactile finish swatches.

#### Minor Observations
- In `ShoppingAssistant.tsx:115`, `{voiceError && <p role="status">{voiceError}</p>}` renders an unclassed `<p>` tag inside the composer, causing layout jitter when an error fires.
- Hardcoded z-index `991` on `.assistant-launch` risks collision with mobile sticky purchase bars on product pages.
- Variant prices in `ResultCard` lack `font-variant-numeric: tabular-nums`, causing numbers to jitter during option changes.

#### Questions to Consider
1. Why should an artisan shopping concierge look like an Intercom/Zendesk live-chat widget at all? Could the assistant expand into a graceful split-pane atelier drawer on desktop, allowing buyers to browse the visual catalog alongside their dialogue?
2. Is an interactive HTML `<select>` inside a chat bubble a conversational anti-pattern? Shouldn't technical variant configuration happen in a dedicated product sheet or native checkout flow?
3. Could the assistant remember buyer preferences (e.g. "prefers leather crafts under ৳2,000") within the same shop session to offer personalized concierge recommendations?

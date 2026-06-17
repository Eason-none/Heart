---
name: Heart 心脏康复
description: 面向冠心病患者的居家康复 AI 辅助工具
colors:
  bg: "#F7F5F1"
  card: "#F0EDE8"
  ink: "#2C2A26"
  ink-muted: "#888780"
  trust-blue: "#185FA5"
  trust-blue-light: "#E6F1FB"
  caution-amber: "#BA7517"
  caution-amber-light: "#FAEEDA"
  alert-red: "#A32D2D"
  alert-red-light: "#FCEBEB"
  milestone-green: "#1D9E75"
  milestone-green-light: "#D4F2E7"
  milestone-green-dark: "#085041"
  divider: "#C8C5BE"
typography:
  title:
    fontFamily: "-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  card: "12px"
  btn: "8px"
  pill: "16px"
spacing:
  page: "16px"
  gap: "12px"
  card-pad: "16px"
components:
  chip-info:
    backgroundColor: "{colors.trust-blue}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  chip-success:
    backgroundColor: "{colors.milestone-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  chip-caution:
    backgroundColor: "{colors.caution-amber}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  chip-alert:
    backgroundColor: "{colors.alert-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  card-default:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-info:
    backgroundColor: "{colors.trust-blue-light}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-caution:
    backgroundColor: "{colors.caution-amber-light}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-alert:
    backgroundColor: "{colors.alert-red-light}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-success:
    backgroundColor: "{colors.milestone-green-light}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.trust-blue}"
    rounded: "{rounded.btn}"
    padding: "0"
  button-primary:
    backgroundColor: "{colors.trust-blue}"
    textColor: "#FFFFFF"
    rounded: "{rounded.btn}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "#1252A0"
    textColor: "#FFFFFF"
    rounded: "{rounded.btn}"
    padding: "14px 24px"
  button-danger:
    backgroundColor: "{colors.alert-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.btn}"
    padding: "14px 24px"
---

# Design System: Heart 心脏康复

## 1. Overview

**Creative North Star: "康复日志 — The Recovery Journal"**

Heart is designed as a personal recovery record that a patient keeps with quiet discipline — not a medical dashboard that monitors them, not a fitness tracker that scores them. Every screen should feel like a well-kept notebook: warm paper, structured entries, green milestones at meaningful moments. The warmth invites compliance; the structure builds trust; the milestones give the courage to continue.

This system is built for middle-aged and older adults recovering from a cardiac event. They carry health anxiety, need clear direction at each step, and must never feel judged or overwhelmed. Density is minimized. The primary task on every screen is visually dominant. Secondary information is tucked away but retrievable.

Heart explicitly rejects the cold authority of hospital information systems (white surfaces, small fonts, table-heavy forms), the competitive energy of fitness apps like Keep (bright accents, performance scoring), the enterprise detachment of SaaS dashboards (blue-gray palettes, data-first layouts), and the garish urgency of eldercare supplement advertising (oversized red, gold accents, fear-driven messaging). None of these moods serve a patient who is healing.

**Key Characteristics:**
- Warm off-white paper surface — not clinical white, not cream-AI beige
- 390px mobile-first phone shell — the only canvas
- Color communicates state exclusively, never used decoratively
- One primary action per screen; supporting actions are visually subordinate
- Milestones celebrated, never weaponized as pressure
- System font stack: instant, familiar, legible at any size

## 2. Colors: The Recovery Palette

Five semantic roles carry all color communication. The palette is quiet by default; color appears only when the system has something meaningful to say. Neutrals are warm-tinted to reinforce the paper-notebook quality without reading as the generic "AI beige" of 2026.

### Primary (State Colors)

**Trust Blue** (`#185FA5`): The guidance color. Used on interactive elements, section chips, primary CTAs, and information banners. Signals "this is the path forward." Paired with `#E6F1FB` as the tinted surface for info-state cards.

**Caution Amber** (`#BA7517`): The moderate attention color. Used when the system needs the user's awareness without alarm — a slightly off day, a soft adjustment reminder. Paired with `#FAEEDA` as a surface.

**Alert Red** (`#A32D2D`): The stop color. Reserved exclusively for dangerous symptoms, locked states, and hard warnings. If this color appears, the user must stop and read. Paired with `#FCEBEB` as a surface.

**Milestone Green** (`#1D9E75`): The completion color. Used for completed states, safe readings, positive check-ins, and milestone achievements. Paired with `#D4F2E7` as a light surface, and `#085041` as text on green surfaces.

### Neutral

**Warm Paper** (`#F7F5F1`): Page background. A barely-there warm tint that reads as paper, not clinical white.

**Card Surface** (`#F0EDE8`): Card background — one tonal step warmer and darker than the page. This step creates depth without shadows.

**Deep Ink** (`#2C2A26`): Primary text. Near-black with a warm undertone. Never pure `#000000`.

**Muted Ink** (`#888780`): Secondary text, metadata, timestamps, placeholder states.

**Warm Divider** (`#C8C5BE`): Borders and rule lines. Warm-tinted so dividers recede rather than cut.

### Named Rules

**The State Rule.** Color is reserved for system state communication only. Blue = guidance/interaction. Amber = caution/attention. Red = stop/danger. Green = complete/safe. If an element can't be assigned one of these four roles, it uses neutral. No fifth accent exists until a fifth semantic role is defined.

**The Tonal Step Rule.** Depth is expressed through the two-step surface scale (page → card), not through shadows or gradients. If a component needs to "stand out," fix the layout — don't add elevation.

## 3. Typography

**Font:** System Stack — `-apple-system`, `PingFang SC`, `Hiragino Sans GB`, `sans-serif`

No web font is loaded. The system stack is chosen deliberately: instant rendering with no FOUT, PingFang SC reads cleanly on aging eyes at 16px, and familiar letterforms reduce cognitive friction for users already managing health anxiety.

**Character:** Functional clarity. The content carries the voice; the type gets out of the way.

### Hierarchy

- **Title** (700, 1.125rem / 18px, 1.4): Card headings, section names. The primary content anchor on each screen.
- **Body** (400, 1rem / 16px, 1.6): All explanatory content, instructions, knowledge cards. Maximum line length 65ch.
- **Label** (500, 0.75rem / 12px, 1.4): Status chips, metadata, secondary annotations. No uppercase — Chinese characters gain nothing from tracking and forced case creates friction.

### Named Rules

**The No-Display-Scale Rule.** There is no hero or display size. The largest text on any screen is a card heading (1.125rem / 18px). Importance is communicated through weight and color, not scale escalation.

**The 16px Floor Rule.** No readable body content appears below 16px. Labels at 12px are permitted only when contrast ≥ 4.5:1 is confirmed. Shrinking body text to 14px is forbidden regardless of aesthetic intent.

## 4. Elevation

Heart uses tonal layering exclusively. There are no box-shadows.

Two surface levels exist: the page ground (`#F7F5F1`) and the card surface (`#F0EDE8`). Depth is perceived through the color difference between these two levels, reinforced by the `#C8C5BE` divider on structural rule lines. The absence of shadow is intentional — shadows read as "lift and drama," which conflicts with the calm, grounded mood of a recovery context.

### Named Rules

**The Flat-by-Default Rule.** If a layout requires a shadow to separate two elements, the layout is wrong. Fix the grouping, not the elevation. Shadows are permanently prohibited unless an interaction state (e.g. a mid-drag element) makes tonal differentiation impossible.

## 5. Components

### Chips / Status Badges

Small pill labels that tag content by semantic role.

- **Shape:** Fully rounded pill (16px radius)
- **Size:** 12px / 500 weight; 2px top/bottom padding, 10px left/right; min-height 28px
- **Variants:** Info (trust-blue bg), Success (milestone-green bg), Caution (caution-amber bg), Alert (alert-red bg) — all with `#FFFFFF` text
- **Rule:** Chips are labels, never interactive. If an element needs to be tappable, it is a button or selection card, not a chip.

### Cards

The primary content container. Every meaningful interaction lives inside a card.

- **Corner Style:** Gently curved (12px radius)
- **Background:** Card Surface (`#F0EDE8`) default; semantic tinted surfaces for state cards
- **Shadow:** None
- **Border:** None on default cards; `1px solid #C8C5BE` allowed as internal dividers within a card
- **Internal Padding:** 16px all sides
- **Nested Cards Rule:** Prohibited. A card inside a card is always a layout failure. Use a `border-top` divider or tinted inner section instead.

### Buttons

- **Primary:** Trust Blue fill (`#185FA5`), white text, 8px radius, 14px/24px padding, min-height 44px
- **Primary Hover/Focus:** Darken to `#1252A0`. No scale transform — unexpected motion disorients older users
- **Danger:** Alert Red fill (`#A32D2D`), white text, same shape. Reserved for destructive confirmations only
- **Text Button:** No background, trust-blue text, min-height 44px. Used for secondary in-card actions
- **Disabled:** 40% opacity on any variant; no color change

### Selection Cards (Choice Inputs)

Card-shaped radio inputs used in exercise check-in (sleep quality, fatigue level, bad-day alternatives).

- **Default:** Card surface bg, `1px solid #C8C5BE` border, 12px radius, 16px padding
- **Selected:** `1px solid #185FA5` border + `#E6F1FB` bg tint
- **Touch target:** Full card height (min 44px) tappable

### Inline Alerts / Banners

Full-width state cards in the scroll context — never floating toasts.

- **Info:** `#E6F1FB` bg, `#185FA5` text
- **Caution:** `#FAEEDA` bg, `#BA7517` text
- **Alert:** `#FCEBEB` bg, `#A32D2D` text
- **Success:** `#D4F2E7` bg, `#085041` text

### Bottom Navigation

- 5-tab bar, `position: fixed; bottom: 0`, `padding-bottom: env(safe-area-inset-bottom)`
- Default: `#888780` icon + label; Active: `#185FA5` icon + label (no pill highlight)
- Background: `#F7F5F1` + `border-top: 1px solid #C8C5BE`

### RPE Selector (Signature Component)

Four-option intensity selector used in exercise feedback. Communicates both the system's target zone and the user's selection simultaneously via a three-tier visual weight system.

- **「适中」(RPE 12–14) — default highlighted:** `2px solid #185FA5` border + `#E6F1FB` bg + "✓ 目标区间" blue chip badge. This target marker never disappears, even when another option is selected.
- **Other options (unselected):** `1px solid #C8C5BE` border, `#F0EDE8` bg
- **Other options (selected):** `1px solid #2C2A26` border (darker, but never blue), `#F0EDE8` bg — visually subordinate to the target marker at all times
- Full-card tap target; no native radio button affordance

## 6. Do's and Don'ts

### Do:

- **Do** use color only to communicate system state. Ask "what is this element telling the user?" before adding any non-neutral color.
- **Do** reserve the four semantic colors (blue, amber, red, green) for their designated roles. Emphasis without a state meaning uses font weight, not color.
- **Do** set all body text at ≥ 16px with 1.6 line-height. Optimize for aging eyes and anxious readers who read slowly and carefully.
- **Do** give every tappable element a minimum 44px touch target height, including text buttons and inline links inside cards.
- **Do** use the card `border-top` divider to separate distinct sections within one card (e.g. content from actions).
- **Do** celebrate milestones (12th exercise, 18th exercise, day 90) with milestone-green and unambiguous achievement language. These are the emotional highlights of the product.

### Don't:

- **Don't** use shadows. Depth is tonal. A shadow is a sign the layout needs fixing.
- **Don't** add a fifth accent color without defining a new semantic role. Decorative color is prohibited.
- **Don't** nest cards. Use a border-top divider or tinted inner section instead.
- **Don't** build anything that looks like a hospital HIS system: clinical white, small dense forms, blue-gray palettes, table-heavy layouts.
- **Don't** build anything that looks like a SaaS dashboard: hero metric tiles (big number + small label), left-side navigation, data-dense filter bars, enterprise-blue color systems.
- **Don't** use big red, gold, or high-saturation advertising aesthetics. Red is reserved exclusively for genuine danger signals. This is a medical tool; urgency aesthetics cause patient anxiety.
- **Don't** use animation or transition effects on state changes. The design spec mandates instant replacement. This is a deliberate decision for the user population: patients on beta blockers and older adults for whom unexpected motion is disorienting.
- **Don't** display readable content below 16px. 12px is permitted only for chip labels and metadata at confirmed ≥ 4.5:1 contrast.
- **Don't** use color as the only indicator of state. Pair color with text or icon for color-blind accessibility.
- **Don't** design for desktop layout. The 390px phone shell is the only canvas. Content beyond 390px is a centered shell on a `#E8E4DE` outer background — not a reflowing responsive layout.
- **Don't** build anything that looks like a fitness app (Keep, etc.): bright saturated accent stacks, performance scoring, competitive or motivational urgency framing. Heart's users are recovering patients, not athletes.

---
name: Coletty Luminal System
colors:
  surface: '#0d150e'
  surface-dim: '#0d150e'
  surface-bright: '#323c33'
  surface-container-lowest: '#081009'
  surface-container-low: '#151e16'
  surface-container: '#19221a'
  surface-container-high: '#232c24'
  surface-container-highest: '#2e372e'
  on-surface: '#dbe5d9'
  on-surface-variant: '#bacbb9'
  inverse-surface: '#dbe5d9'
  inverse-on-surface: '#29332a'
  outline: '#859585'
  outline-variant: '#3b4a3d'
  surface-tint: '#00e475'
  primary: '#75ff9e'
  on-primary: '#003918'
  primary-container: '#00e676'
  on-primary-container: '#00612e'
  inverse-primary: '#006d35'
  secondary: '#bfc7d8'
  on-secondary: '#29313e'
  secondary-container: '#3f4755'
  on-secondary-container: '#aeb5c6'
  tertiary: '#ffdec4'
  on-tertiary: '#4b2800'
  tertiary-container: '#ffba79'
  on-tertiary-container: '#794810'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62ff96'
  primary-fixed-dim: '#00e475'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#dbe3f4'
  secondary-fixed-dim: '#bfc7d8'
  on-secondary-fixed: '#141c28'
  on-secondary-fixed-variant: '#3f4755'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#fdb878'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3c03'
  background: '#0d150e'
  on-background: '#dbe5d9'
  surface-variant: '#2e372e'
  surface-glass: rgba(255, 255, 255, 0.05)
  surface-border: rgba(255, 255, 255, 0.1)
  status-scheduled: '#FFD600'
  status-enroute: '#00B0FF'
  status-completed: '#00E676'
  text-primary: '#FFFFFF'
  text-secondary: '#94A3B8'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button-text:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-padding: 2rem
  gutter-md: 1.5rem
  stack-gap: 1rem
  section-gap: 3rem
---

## Brand & Style

The design system is built for a high-efficiency reverse logistics dashboard. It communicates reliability, speed, and environmental stewardship through a technical, futuristic lens. The aesthetic is defined by a "Deep Logic" philosophy—where critical data points shine like bioluminescent elements against a vast, dark canvas.

The core style is **Glassmorphism**, utilized strategically to create structural hierarchy without heavy shadows. It leverages semi-transparent layers, backdrop blurs, and high-frequency neon accents to provide a "Mission Control" experience. The interface should feel like a premium, dark-mode software suite tailored for industrial intelligence and sustainability tracking.

## Colors

The palette is anchored by **#0B131F**, a deep, immersive navy that provides the necessary contrast for the neon primary accent. 

- **Primary Accent (#00E676):** Used for critical calls to action, successful status indicators, and branding moments. It represents vitality and the "green" nature of reverse logistics.
- **Glass Surfaces:** Components utilize a semi-transparent white (5% opacity) paired with a 20px-40px backdrop blur to create depth and separation from the base background.
- **Semantic Statuses:** 
    - **Scheduled (Agendada):** Vibrant Amber.
    - **En Route (Em Rota):** Electric Blue.
    - **Completed (Concluída):** Primary Neon Green.

## Typography

This design system uses a triple-font approach to balance personality with functional utility:

1.  **Sora (Headlines/Branding):** Chosen for its geometric, high-tech personality. It is used for page titles, card headers, and primary buttons.
2.  **Inter (Body/Interface):** The workhorse for readability. Used for all descriptive text, metadata values, and general navigation items.
3.  **JetBrains Mono (Technical Labels):** Used for Collection IDs, weights (KG), and status tags to emphasize the data-driven, logistics nature of the product.

Hierarchy is established through weight and color (Pure White for headlines, Slate Gray for body) rather than just size.

## Layout & Spacing

The layout utilizes a **Fixed Sidebar + Fluid Content** model. 

- **Sidebar:** Positioned at the far left, providing constant access to global navigation. It uses a darker, more opaque glass effect to anchor the interface.
- **Main Content:** A fluid grid that stretches to fill the remaining viewport. 
- **The 8px Grid:** All spacing (margins, padding, gaps) follows an 8px incremental scale (8, 16, 24, 32, 48, 64) to maintain mathematical harmony.
- **Responsive Behavior:** On smaller desktop screens, the central content area reduces internal padding. Below 1024px, the sidebar collapses into a thin icon-only bar or a hamburger menu.

## Elevation & Depth

Depth is conveyed through **Translucency and Tinting** rather than traditional drop shadows.

1.  **Level 0 (Base):** Solid `#0B131F`.
2.  **Level 1 (Cards/Sidebar):** `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(20px)`. Elements at this level feature a 1px solid border at `rgba(255, 255, 255, 0.1)` to define edges against the dark background.
3.  **Level 2 (Modals/Side Panels):** `rgba(255, 255, 255, 0.08)` with `backdrop-filter: blur(40px)`. These elements should have a subtle outer "glow" (a shadow with the color of the primary accent at 5% opacity) to indicate focus.
4.  **Action Elements:** Interactive components (buttons) use high saturation and inner glows to appear "powered on."

## Shapes

The design system employs a **Rounded (8px base)** corner language. This softens the technical aesthetic, making the dashboard feel modern and approachable rather than cold or industrial. 

- **Cards & Modals:** Use `rounded-lg` (16px) to create a clear container identity.
- **Buttons & Tags:** Use `rounded-md` (8px) for a crisp, functional feel.
- **Input Fields:** Use `rounded-md` (8px) to maintain consistency with buttons.

## Components

### Action Buttons
- **Primary (+ Criar Nova Coleta):** Solid neon green background with black text for maximum visibility. Includes a subtle box-shadow "glow" of the same color.
- **Secondary (Track Status):** Ghost style with the primary accent border and text.

### Status Tags
- Defined by a pill-shape with a low-opacity background of the status color and a 100% opacity text color. 
- Always uses **JetBrains Mono** in all-caps for a "system-logged" appearance.

### Glassmorphic Cards
- Must include the 1px white-transparent border.
- Layout: ID and Status in the top row, Donor Name in the middle, and Address/Actions in the footer.

### Sidebar Navigation
- Active states are indicated by a vertical neon green bar on the left edge and a subtle green tint to the icon/text.
- Icons should be linear, 24px, with a 2px stroke width.

### Filter Bar
- A unified glass container spanning the top of the content area.
- Dropdowns should have a chevron icon and use the same glass treatment as cards for their expanded states.

### Side-Panel (Metadata)
- Slides in from the right. It features a heavier backdrop blur (40px) to completely separate the detail view from the list behind it.
- **Document Buttons:** Styled with a distinct PDF icon and a "download" affordance, using a secondary glass style.
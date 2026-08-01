# Simulasi & Sandbox Materials — Using v1-DasarListrik as Reference

## Context

The reference project (`v1-DasarListrik`) has **6 rich interactive simulation modules** with dedicated components:

| # | Module | Reference Component | Current v1 Status |
|---|--------|--------------------|--------------------|
| 1 | Ohm's Law Visualizer | `OhmsLawVisualizer.tsx` (animated particles, V/I/R sliders) | ❌ Missing |
| 2 | Circuit Safety (MCB/Fuse) | `CircuitSafetySim.tsx` (appliance load calculator, trip sim) | ❌ Missing |
| 3 | Passive Components (Color Code) | `PassiveGallery.tsx` (4/5-band resistor calculator, visual) | ⚠️ Partial — `ResistorCalculatorWidget` exists but is basic |
| 4 | Active Components (Diode) | `ActiveComponents.tsx` (PN junction, forward/reverse bias) | ❌ Missing |
| 5 | Circuit Sandbox (ReactFlow) | `CircuitSandbox.tsx` (drag-and-drop, circuit evaluation) | ⚠️ Placeholder — `CircuitBuilderCanvas` is empty |
| 6 | Capacitor Dynamics | `CapacitorDynamics.tsx` (RC charging, real-time graphs) | ❌ Missing |

**Current v1 `/simulasi` page** simply shows the basic resistor calculator + an empty circuit canvas side-by-side.

## User Review Required

> [!IMPORTANT]  
> The reference uses **`framer-motion`** and **`@xyflow/react`** (React Flow) which are NOT currently in v1's dependencies. We need to install both.

> [!IMPORTANT]
> The reference uses **Tailwind utility classes directly** (e.g. `bg-slate-900`, `text-blue-400`) without shadcn components. The current v1 project uses **shadcn UI** components. The new simulasi components will use **vanilla Tailwind** for full interactivity control (matching reference style), but keep shadcn in layout/chrome areas. This avoids fighting shadcn's opinionated styling inside physics visualizations.

> [!WARNING]
> The reference's `CircuitSandbox.tsx` is 585 lines with a circuit evaluation engine. We will re-implement this with the same logic but adapted to v1's design tokens (`--trace-teal`, `--bg-base`, etc.) and Indonesian labels.

## Open Questions

> [!IMPORTANT]
> **Language:** The reference is in English. Should all simulation labels, hints, and descriptions be translated to **Bahasa Indonesia** (matching the rest of v1), or kept bilingual?

## Proposed Changes

### Phase 1: Install Dependencies

#### [MODIFY] [package.json](file:///c:/Semester/version%20Skripsi/v1/package.json)
- Add `framer-motion` (for particle animations, spring transitions)
- Add `@xyflow/react` (for Circuit Sandbox drag-and-drop nodes)
- Run `npm install`

---

### Phase 2: Create Interactive Simulation Components

All new components go in `src/components/simulasi/`. We do NOT duplicate the reference — we rewrite each component using v1's design system while preserving the **same physics logic and interaction patterns**.

#### [NEW] [OhmsLawVisualizer.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/simulasi/OhmsLawVisualizer.tsx)
- Voltage slider (1–24V), Resistance slider (1–12Ω)
- Real-time I = V/R calculation
- Animated electron particles whose speed scales with current
- Visual "resistance" narrowing that widens proportionally
- Uses v1 design tokens: `bg-bg-base`, `text-trace-teal`, `font-jetbrains-mono`

#### [NEW] [CircuitSafetySim.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/simulasi/CircuitSafetySim.tsx)
- Appliance selector (LED Bulb 15W, Fan 75W, PC 450W, AC 1500W, Heater 3000W)
- MCB rating picker (2A, 6A, 10A, 16A, 20A)
- 220V system: I = P/V calculation
- Visual trip animation when current > MCB rating
- Status feedback: Safe ✅ / Tripped ⚠️

#### [MODIFY] [ResistorCalculatorWidget.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/ResistorCalculatorWidget.tsx)
- Enhance existing component: add **5-band mode toggle** (4/5 bands)
- Add visual **color guide popup** on hover/click
- Keep existing 4-band functionality, extend with 5-band option
- Improve resistor body SVG to be more visually realistic

#### [NEW] [ActiveComponentsSim.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/simulasi/ActiveComponentsSim.tsx)
- PN Junction Diode visualization
- Forward bias / Reverse bias toggle button
- Animated electrons (blue) and holes (red circles) moving toward/away from junction
- Depletion region width animates (spring) based on bias mode
- Current particles flow in forward bias only
- Explanatory text switches based on mode

#### [NEW] [CircuitSandbox.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/simulasi/CircuitSandbox.tsx)
- Full drag-and-drop circuit builder using `@xyflow/react`
- Component palette: Battery (voltage configurable), Resistor (value configurable), LED
- Custom node types with handles (source/target)
- **Circuit evaluation engine:**
  - BFS loop detection
  - States: `idle`, `short`, `overcurrent`, `underpowered`, `open`, `success`
  - Visual feedback: LED lights up, battery sparks on short circuit, warnings
- Toolbar: Add components, Power On/Off, Reset
- Collapsible results panel with state message + hint
- v1 design tokens applied to all nodes and controls

#### [NEW] [CapacitorDynamicsSim.tsx](file:///c:/Semester/version%20Skripsi/v1/src/components/simulasi/CapacitorDynamicsSim.tsx)
- Capacitance slider (10–1000μF), Resistance slider (1–100kΩ), Battery voltage (1–12V)
- Three switch states: Charge / Neutral / Discharge
- Real-time physics: `Vc(t) = Vb - (Vb-V0)·e^(-t/τ)` for charging, `V0·e^(-t/τ)` for discharging
- Live voltage/current graph rendered via SVG path
- Visual capacitor plates filling animation
- Lightbulb glow intensity proportional to discharge current
- Play/Pause/Reset controls
- τ = RC time constant display

---

### Phase 3: Revamp `/simulasi` Page with Hub Layout

#### [MODIFY] [page.tsx](file:///c:/Semester/version%20Skripsi/v1/src/app/simulasi/page.tsx)
- Transform into a **Simulation Hub** page (inspired by reference's `/simulation` page)
- 6 module cards in a grid, each with icon, title, description, color accent
- Cards link to individual simulation sub-routes

#### [NEW] [layout.tsx](file:///c:/Semester/version%20Skripsi/v1/src/app/simulasi/layout.tsx)
- Simple layout wrapper with back-navigation and section title

#### [NEW] Sub-route pages:
- [NEW] `src/app/simulasi/hukum-ohm/page.tsx` — Mounts `OhmsLawVisualizer`
- [NEW] `src/app/simulasi/keamanan-rangkaian/page.tsx` — Mounts `CircuitSafetySim`
- [NEW] `src/app/simulasi/komponen-pasif/page.tsx` — Mounts enhanced `ResistorCalculatorWidget`
- [NEW] `src/app/simulasi/komponen-aktif/page.tsx` — Mounts `ActiveComponentsSim`
- [NEW] `src/app/simulasi/sandbox/page.tsx` — Mounts `CircuitSandbox`
- [NEW] `src/app/simulasi/kapasitor/page.tsx` — Mounts `CapacitorDynamicsSim`

Each sub-route page has:
- Learning objectives section (Indonesian)
- The interactive simulation component
- A summary/explanation section

---

### Phase 4: CSS Additions for Simulation Animations

#### [MODIFY] [globals.css](file:///c:/Semester/version%20Skripsi/v1/src/app/globals.css)
Add keyframe animations needed by simulation components:
- `@keyframes overheat` — red glow pulse for battery short
- `@keyframes shake` — horizontal shake for danger state
- `@keyframes sparkle` — scaling pulse for lightning bolt
- `@keyframes dim-glow` — soft pulsing for dim LED state
- `@keyframes success-pulse` — green glow for lit LED
- `@keyframes lamp-pop` — brightness flash for burnt LED

---

## Verification Plan

### Automated Tests
```bash
npm run build
```
The build must succeed with zero TypeScript errors and zero missing imports.

### Manual Verification (Senior QC Checklist)
1. **Hub Page** (`/simulasi`): All 6 cards render, links navigate correctly
2. **Ohm's Law**: Sliders change values, particles speed adjusts, I = V/R displays correctly
3. **Circuit Safety**: Selecting appliances updates total load, MCB trips when overloaded, visual feedback works
4. **Passive Components**: Both 4-band and 5-band modes calculate correctly, color selectors work
5. **Active Components**: Forward/reverse bias toggle works, depletion region animates, electrons/holes move
6. **Circuit Sandbox**: Nodes drag correctly, edges connect, Power On evaluates circuit, LED lights up on valid circuit, short circuit warning works
7. **Capacitor Dynamics**: Charge/discharge physics correct, graph plots in real-time, lightbulb glows on discharge
8. **Responsive**: All pages work on mobile and desktop viewports
9. **Design Consistency**: Uses v1 design tokens (trace-teal, bg-base, fonts), dark theme throughout
10. **No Console Errors**: Zero runtime errors in browser console

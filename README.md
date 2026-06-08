# Saytica Eval Console

A next-generation AI model evaluation dashboard built with React + Vite, featuring a Cyber-Aurora design system.

---

## Quick Start (Linux)

### Prerequisites

- Node.js ≥ 18 (`node -v`)
- npm ≥ 9

### 1 — Clone & install

```bash
git clone <your-repo-url>
cd Saytica

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2 — Run the project

```bash
cd server
npm run dev
# This runs BOTH the backend API (http://localhost:3001) 
# and the Vite frontend (http://localhost:5173) simultaneously using concurrently.
```

Open **http://localhost:5173** in your browser.

### Production build

```bash
cd client
npm run build       # outputs to client/dist/
npm run preview     # serve the built bundle locally
```

---

## Project Structure

```
Saytica/
├── client/                  # Vite + React frontend
│   ├── index.html
│   └── src/
│       ├── App.jsx           # Root shell, particle canvas, cursor spotlight
│       ├── index.css         # Full design-system (no Tailwind utilities needed)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ModelTable.jsx
│       │   ├── TaskCard.jsx
│       │   ├── ProgressRing.jsx
│       │   └── Dropdown.jsx
│       ├── pages/
│       │   ├── Leaderboard.jsx
│       │   └── TaskBoard.jsx
│       └── utils/
│           └── api.js        # fetch wrappers for the Express backend
└── server/                  # Express REST API
    ├── index.js
    ├── models.json           # Seed data — model evaluation results
    ├── tasks.json            # Seed data — annotation tasks
    └── routes/
```

---

## Design Decisions & Trade-offs

### 1 — Vanilla CSS design system over utility classes

All visual tokens (`--color-aurora-*`, `--font-display`, shadow scales) live in a single `index.css` using native CSS custom properties and `@theme` (Tailwind v4's token layer). This gives precise control over the layered glassmorphism and animation without fighting utility-class specificity.
**Trade-off:** More verbose CSS, but the design is too custom for utility classes to express cleanly anyway.

### 2 — Canvas particle system in React (not a library)

The constellation particle layer is a hand-rolled `requestAnimationFrame` loop on a `<canvas>` element. This avoids shipping a whole particle library (e.g. tsParticles) for ~80 nodes.
**Trade-off:** More code to maintain, but zero extra bundle weight and full control over look and feel.

### 3 — GSAP for all motion, not CSS transitions alone

GSAP handles the navbar slide-in, card stagger, page transitions, and progress ring count-up. It gives spring-easing and sequencing that CSS `transition` can't express concisely (e.g. animating `strokeDashoffset` and a counter simultaneously).
**Trade-off:** Adds ~35 kB to the bundle, but GSAP is already a project dependency.

### 4 — Inline styles alongside CSS classes

Complex, data-driven styles (provider badge colours, column accent tints, progress widths) are applied as inline `style` props. Static structural styles live in CSS classes. Mixing the two keeps the CSS file readable while avoiding class-name explosion for one-off values.
**Trade-off:** Some inconsistency in where styles live, but it's intentional by layer: *structure → CSS*, *data → inline*.

### 5 — Optimistic UI updates for task advancement

When an annotator clicks Advance, the task status updates in local state immediately, then the API call is made in the background. On failure the state rolls back by re-fetching.
**Trade-off:** UI feels instant, but a network failure causes a visible "snap back". For an internal eval tool this is acceptable.

### 6 — SVG morphing blobs over CSS `border-radius` morphs

The background blobs are SVG `<ellipse>` elements with `<animateTransform>`, rendering in a fixed overlay below the UI. This is GPU-composited and doesn't trigger layout reflow.
**Trade-off:** Slightly more markup than a CSS blob, but compositing behaviour is more predictable across browsers.

### 7 — No state-management library

All state is local React `useState` / `useEffect`. The data graph is shallow: two API endpoints, two pages, no shared mutable state between them.
**Trade-off:** Would need Redux/Zustand if tasks needed to be visible across both pages simultaneously, but for now the simplicity is worth it.

---

## Environment Notes (Linux-specific)

- If port 5173 is occupied: `npm run dev -- --port 5174`
- If port 3001 is occupied, edit `server/index.js` and update `client/src/utils/api.js` to match
- Google Fonts are loaded via CDN — an internet connection is required for the Orbitron / JetBrains Mono typefaces to load; the UI degrades gracefully to system fonts without them

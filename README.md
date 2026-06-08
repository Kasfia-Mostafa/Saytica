# Saytica Eval Console

A next-generation AI model evaluation dashboard built with React + Vite, featuring a Cyber-Aurora design system.

**🚀 Live Demo:** [https://saytica-xbxr.vercel.app/](https://saytica-xbxr.vercel.app/)

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

## Environment Notes (Linux-specific)

- If port 5173 is occupied: `npm run dev -- --port 5174`
- If port 3001 is occupied, edit `server/index.js` and update `client/src/utils/api.js` to match
- Google Fonts are loaded via CDN — an internet connection is required for the Orbitron / JetBrains Mono typefaces to load; the UI degrades gracefully to system fonts without them

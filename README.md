# Filly

> Lightweight, local-first form autofill for Chrome.

Filly stores a single profile in `chrome.storage.local` and fills web forms using deterministic alias-based field matching. No backend, no encryption, no AI, no telemetry.

## Features

- **Profile Management** — Save your personal, contact, education, and work details
- **One-Click Autofill** — Fill forms on any website with a single click
- **Smart Field Matching** — Weighted scoring using name, id, label, placeholder, autocomplete, and more
- **Import/Export** — Backup or transfer your profile as JSON
- **Privacy-First** — Everything stays on your machine. No data ever leaves

## Install

1. Download the latest [release](https://github.com/ragwhoo/Filly-/releases) or build from source
2. Go to `chrome://extensions`
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked** and select the `build/chrome-mv3/` directory

## Development

```bash
npm install
npm run dev    # Development mode with hot reload
npm run build  # Production build
npm run package  # Package as .zip
```

## Tech Stack

- [Plasmo](https://docs.plasmo.com/) — Browser extension framework
- React 18 — UI
- TypeScript 5 — Type safety
- TailwindCSS 3 — Styling
- Chrome Manifest V3

## Project Structure

```
src/
├── popup/          # Popup UI (React)
│   ├── Popup.tsx
│   ├── components/
│   │   ├── ProfileEditor.tsx
│   │   ├── ProfileView.tsx
│   │   └── ActionBar.tsx
│   └── hooks/
│       └── useProfile.ts
├── content/        # Content script
│   ├── index.ts
│   ├── detector.ts
│   ├── matcher.ts
│   └── filler.ts
├── lib/            # Shared pure logic
│   ├── profile.ts
│   ├── fields.ts
│   └── aliases.ts
├── storage/        # chrome.storage.local wrapper
│   └── index.ts
├── types/          # TypeScript interfaces
│   └── index.ts
└── ...config files
```

## How It Works

1. Open the Filly popup and fill in your profile
2. Navigate to any website with a form
3. Click **Fill Current Page**
4. Filly detects form fields, matches them using alias scoring, and fills them

## Field Matching

Filly uses a weighted scoring system:

| Source | Weight |
|---|---|
| `name` attribute | 100 |
| `id` attribute | 80 |
| `autocomplete` attribute | 80 |
| `aria-label` attribute | 60 |
| `placeholder` attribute | 40 |
| `label text` | 30 |
| `data-*` attributes | 20 |

Score threshold: 60. Substring matches receive half weight.

## License

MIT

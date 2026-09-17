# TripGate Admin

The React admin panel for **TripGate**, a travel-management SaaS platform. It is the
internal back-office UI used to manage the platform's tenants, bookings and content.

The interface is built **RTL-first** — the shadcn/ui component library in
`src/components/ui` has been migrated to logical properties (`ps`/`pe`, `start`/`end`)
and `rtl:` variants, and the document is served with `dir="rtl"`.

## Index

- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Setup](#setup)
- [Commands](#commands)
- [Project structure](#project-structure)

## Tech stack

| Concern    | Choice                          |
| ---------- | ------------------------------- |
| Framework  | React 19                        |
| Build tool | Vite 8                          |
| Language   | TypeScript                      |
| Styling    | Tailwind CSS 4                  |
| Components | shadcn/ui on Base UI primitives |
| Icons      | lucide-react                    |
| Charts     | Recharts                        |
| Linting    | Oxlint                          |

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm

## Setup

```bash
git clone <repository-url>
cd admin
npm install
```

Then start the dev server:

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

## Commands

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR                         |
| `npm run build`   | Type-check (`tsc -b`) and build the production bundle to `dist/` |
| `npm run preview` | Serve the built `dist/` bundle locally                     |
| `npm run lint`    | Run Oxlint over the project                                |

To produce and verify a production build:

```bash
npm run build
npm run preview
```

Adding a shadcn component:

```bash
npx shadcn@latest add <component>
```

New components land in `src/components/ui` in LTR form — check them for hardcoded
directional styles (physical `left`/`right`, `translate-x`, directional chevrons)
before using them.

## Project structure

```
src/
├── components/ui/   shadcn/ui components, migrated to RTL
├── hooks/           shared React hooks
├── lib/             utilities and helpers
├── assets/          static assets
├── index.css        Tailwind entry and theme tokens
├── App.tsx          root component
└── main.tsx         application entry point
```

# Task Manager Dashboard

A modern, production-ready task management dashboard built with **Angular 21**. It lets a team create, organize, and track tasks across three workflow columns — *To Do*, *In Progress*, and *Done* — with real-time filtering, analytics charts, and an activity feed.

---

## What it does

You open the app and you see your team's tasks laid out in a Kanban-style board. You can:

- **Create a task** using the "+ New Task" button (navbar or sidebar). Fill in the title, description, priority, due date, and pick who the task belongs to.
- **Edit or delete** any task via its three-dot kebab menu.
- **Filter** tasks by status (tabs), priority (dropdown), or assignee — all filters work together and update the board instantly.
- **Search** tasks by typing in the search bar; the board updates in real time.
- **Monitor progress** via stat cards at the top (total tasks, completed, overdue, in-progress).
- **Visualize data** with two Chart.js charts — a donut chart for tasks by priority and a bar chart for tasks by status.
- **Track history** in the activity feed on the right, which logs every create/update/delete with a human-readable timestamp ("2 minutes ago"). You can clear the feed with one click.

---

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Angular 21 (standalone components, Signals) |
| State management | NgRx (Store + Effects + DevTools) |
| UI components | Angular Material + Bootstrap 5 |
| Charts | Chart.js 4 |
| Mock API | angular-in-memory-web-api (simulates HTTP with 300 ms delay) |
| Styling | SCSS (component-scoped) |
| Testing | Vitest 4 |
| Linting / formatting | ESLint + Prettier + Husky pre-commit hooks |
| i18n | Angular built-in `@angular/localize` (EN + AR) |
| Containerization | Docker + nginx |
| CI/CD | GitHub Actions |

---

## Project architecture

The app follows a **smart container / presentational component** pattern.

```
App (root)
└── LayoutComponent             — shell: navbar + sidebar + router outlet
    ├── NavbarComponent         — search, language switcher, avatar
    ├── SidebarComponent        — navigation links + "New Task" shortcut
    └── DashboardComponent  ← SMART (connects to NgRx store)
        ├── StatCardComponent       — single metric tile
        ├── TaskFilterBarComponent  — status tabs + priority/assignee dropdowns
        ├── TaskBoardComponent      — three-column Kanban grid
        │   └── TaskCardComponent   — individual task card with kebab menu
        ├── TaskFormModalComponent  — create/edit form with validation
        ├── AnalyticsComponent      — Chart.js priority & status charts
        ├── ActivityFeedComponent   — recent events list
        └── ConfirmDialogComponent  — delete confirmation modal
```

**NgRx store** has three feature slices:

- `tasks` — the full task list, filters, loading state, 5-minute TTL cache
- `statistics` — summary metrics shown in the stat cards
- `activity` — a local log of every CRUD event (create, update, delete, status-change)

**Services** sit in `src/app/core/services/`:
- `TaskApiService` — HTTP CRUD using Angular 21's `httpResource` signal for GET + RxJS observables for mutations (bridged to NgRx Effects)
- `UserApiService` — fetches the assignee list
- `MockDbService` — in-memory database that acts as the backend; data lives in `src/assets/data/`

---

## Running locally

### Prerequisites
- Node.js ≥ 22
- npm ≥ 11

```bash
# Install dependencies
npm install

# Start the dev server (English, default)
npm start
# → http://localhost:4200

# Start the dev server in Arabic
npm run start:ar
# → http://localhost:4200 (all UI text in Arabic)
```

---

## Running with Docker

The app ships with a multi-stage Dockerfile (Node builder → nginx runtime) and a docker-compose file.

```bash
# Build and start the container
docker compose up --build

# → http://localhost:4200
```

The nginx config serves the Angular SPA with:
- gzip compression for JS/CSS/fonts
- Long-term immutable cache headers for hashed static assets
- SPA fallback (`try_files`) so deep links work on refresh
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`)

---

## Running tests

```bash
# Run all unit tests once
npm test

# Run with coverage (Vitest)
npm test -- --coverage
```

Tests live alongside their components (`.spec.ts`). Key coverage includes NgRx reducers, selectors, pipes, and component interaction tests.

---

## Building for production

```bash
# Default build (en-US only, no localize flag)
npm run build

# Build ALL locales (en-US + ar) — outputs to dist/task-dashboard/browser/
npm run build:i18n

# Extract i18n messages from templates into src/locale/messages.xlf
npm run extract-i18n
```

The production build tree-shakes, minifies, and applies output hashing — ready to drop behind a CDN.

---

## Internationalization (i18n)

The app uses **Angular's built-in compile-time i18n** via `@angular/localize`.

### How it works

Every visible string in templates is tagged with an `i18n` attribute and a stable ID:

```html
<span i18n="Navbar|Application name@@app.name">Task Manager</span>
```

TypeScript strings (status/priority labels, pipe output) use the `$localize` tagged template:

```typescript
$localize`:task status|todo@@status.todo:To Do`
```

### Adding a new language

1. Run `npm run extract-i18n` — regenerates `src/locale/messages.xlf` with all current strings.
2. Copy `messages.xlf` → `messages.<locale>.xlf` (e.g. `messages.de.xlf`).
3. Fill in `<target>` translations in the new file.
4. Register the locale in `angular.json` under `projects.task-dashboard.i18n.locales`.
5. Run `npm run build:i18n` to generate a locale-specific build.

### Included locales

| Code | Language | File |
|---|---|---|
| `en-US` | English (source) | `src/locale/messages.xlf` |
| `ar` | Arabic | `src/locale/messages.ar.xlf` |

Switch language at runtime by navigating to `/ar/` (Arabic build) or `/en-US/` (English build). A language switcher link is shown in the navbar. The Arabic build sets `lang="ar"` and `dir="rtl"` automatically via Angular's locale handling.

---

## Accessibility (WCAG 2.1 AA)

The app is built with accessibility as a first-class concern:

| Criterion | Implementation |
|---|---|
| **1.3.1 Info & Relationships** | Semantic HTML (`<nav>`, `<main>`, `<aside>`, `<ul role="list">`, `<time>`) |
| **1.4.3 Contrast** | All text meets 4.5:1 contrast ratio against backgrounds |
| **2.1.1 Keyboard** | All interactive elements reachable and operable via keyboard; modals support Escape |
| **2.4.1 Bypass Blocks** | Skip-to-main-content link before the navbar (visible on focus) |
| **2.4.3 Focus Order** | Logical DOM order; modal focus trapped while open |
| **3.1.1 Language** | `<html lang="en">` set; each locale build changes `lang` automatically (`lang="ar"` + `dir="rtl"` for Arabic) |
| **4.1.2 Name, Role, Value** | All buttons have `aria-label`; dropdowns use `role="listbox"` / `role="option"` with `aria-selected`; status filter uses `role="tablist"` / `role="tab"` / `aria-selected`; dialogs use `aria-labelledby` + `aria-describedby`; decorative emojis have `aria-hidden="true"` |
| **Live regions** | Stat card values and column counts use `aria-live="polite"` |

---

## Lighthouse targets

The production build is optimised to score > 90 in all Lighthouse categories:

| Category | Target | Key optimisations |
|---|---|---|
| **Performance** | ≥ 90 | Angular production build (tree-shaking, minification, output hashing), `font-display: swap`, preconnect to Google Fonts |
| **Accessibility** | ≥ 90 | Full WCAG 2.1 AA coverage (see above) |
| **Best Practices** | ≥ 90 | HTTPS in production, security headers via nginx, no deprecated APIs |
| **SEO** | ≥ 90 | `<meta name="description">`, `<html lang>`, meaningful `<title>`, `<meta name="viewport">` |

To measure locally: run `npm run build`, serve `dist/task-dashboard/browser/` with nginx (or `npx serve`), then open Chrome DevTools → Lighthouse.

---

## CI/CD (GitHub Actions)

The pipeline at `.github/workflows/ci.yml` runs on every push and pull request to `main` or `develop`:

```
push/PR to main or develop
│
├── build-and-test     — npm ci → lint → build → unit tests → upload artifact
│
└── (on main only)
    ├── build-i18n     — build all locales (en-US + ar)
    └── docker         — build Docker image (cache via GitHub Actions cache)
```

All three jobs run in parallel after the first succeeds.

---

## Project structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/      cache.interceptor.ts
│   │   ├── services/          task-api, user-api, mock-db, task-modal
│   │   ├── store/             tasks/, statistics/, activity/ (NgRx slices)
│   │   └── types/             task.types, constants, statistic.types, activity.types
│   ├── pages/
│   │   ├── layout/            navbar + sidebar shell
│   │   └── dashboard/         main page + all sub-components
│   └── shared/
│       └── components/        button, navbar, sidebar, skeleton, confirm-dialog
├── assets/data/               tasks.json, users.json, statistics.json (mock data)
└── locale/
    ├── messages.xlf           source strings (en-US)
    └── messages.ar.xlf        Arabic translations
```

---

## Development scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server (English, http://localhost:4200) |
| `npm run start:ar` | Dev server (Arabic) |
| `npm run build` | Production build (en-US) |
| `npm run build:i18n` | Production build — all locales |
| `npm test` | Run unit tests once with Vitest |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format all src files |
| `npm run extract-i18n` | Extract i18n messages → `src/locale/messages.xlf` |
| `docker compose up --build` | Build and run in Docker (port 4200) |

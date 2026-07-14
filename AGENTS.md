# Peerix Talk — Agent Guide

Peer-to-peer WebRTC web video conferencing app (React SPA) using [Peerix](https://github.com/peerix-dev/peerix) for signaling.

## Tech Stack

| Category      | Tools                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Language      | TypeScript 6 (strict)                                                 |
| Framework     | React 19 (`react-jsx`)                                                |
| Build         | Vite 8 + `@vitejs/plugin-react`                                       |
| CSS           | Tailwind CSS v4 (`@tailwindcss/vite`), tw-animate-css                 |
| UI            | shadcn/ui (`radix-mira` preset), Radix UI, CVA                        |
| Icons / Font  | `@hugeicons/react`, Inter Variable (`@fontsource-variable/inter`)     |
| Notifications | sonner                                                                |
| Utils         | clsx + tailwind-merge (`cn()` in `@/lib/utils`)                       |
| i18n          | i18next + react-i18next (browser detection, HTTP backend, eager init) |
| Avatars / QR  | jdenticon, qrcode                                                     |
| WebRTC        | Peerix (`peerix`)                                                     |
| Routing       | Custom hash-based router (`use-router`)                               |

## Architecture

```
src/
├── main.tsx        # entry (ThemeProvider > StorageProvider > RouterProvider > App)
├── app.tsx         # root (RoomProvider > RoomController + Toaster)
├── index.css       # Tailwind v4, oklch theme tokens, base styles
├── components/     # shadcn/ui + custom components
├── hooks/          # custom hooks (router, room, peer, media, chat, …)
├── lib/            # i18n init, helpers, globals
└── views/          # all views
public/             # static assets + i18n locale files
index.html          # HTML template
```

## Design Principles

- **Client-side only** — no backend or SSR.
- **`@/` alias** — all internal imports use `@/` (resolves to `./src/`).
- **shadcn/ui + radix-mira** — Radix UI primitives styled with Tailwind v4 and oklch tokens.
- **CVA variants** — composable variant/size APIs via `class-variance-authority`.
- **System theme default** — `ThemeProvider` defaults to `"system"`; `:root` / `.dark` CSS variables.
- **i18n first** — all user-facing strings through `t()`; new keys go in all locale files.
- **Responsive** — Tailwind-responsive utilities throughout.

## Commands

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Dev server (`http://localhost:5173`) |
| `npm run build`     | Type-check then production build     |
| `npm run preview`   | Preview production build             |
| `npm run typecheck` | `tsc -b --noEmit`                    |
| `npm run test`      | Run Playwright e2e tests             |

## Coding Conventions

- **Unified style** across the project. Less code is better.
- **Single responsibility** — one concern per file.
- **Named exports** — `export function` / `export const`. No `export default`.
- **`@/` imports** — never relative paths.
- **i18n keys** — dot notation: `t("room.microphone.on")`.
- **Async/await** — no raw `.then()` chains.
- **Accessibility** — `aria-label` via `t()` on interactive elements. Icons alone aren't enough.
- **Modern browsers only** — no polyfills or legacy workarounds.
- **Hugeicons reference** — browse names in `node_modules/@hugeicons/core-free-icons/dist/esm/`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

```
<type>[scope]: description
```

Examples: `feat(lobby): add camera preview toggle`, `fix(i18n): add missing German translations`

## Adding UI Components

```bash
npx shadcn@latest add <component-name>
```

Lands in `src/components/ui/`. See `components.json`.

## i18n Workflow

1. Add key to `public/locales/en/translation.json`.
2. Mirror in all other locale files.
3. Use via `const { t } = useTranslation()`, then `t("namespace.key")`.

## UI Verification and Testing

Use browser tools to verify UI in the running app.

### Workflow

1. Start dev server if needed: `npm run dev`
2. Navigate: `navigate_page({type: "url", url: "http://localhost:5173"})`
3. Inspect: `take_snapshot` (preferred over screenshots)
4. Interact: `click`, `fill`, `fill_form`, `type_text`, etc.
5. Verify: another `take_snapshot` or `take_screenshot`
6. Check errors: `list_console_messages({types: ["error"]})`
7. Done: `close_page`

### Reference

| Task              | Tool(s)                                               |
| ----------------- | ----------------------------------------------------- |
| Inspect structure | `take_snapshot`                                       |
| Click             | `click`                                               |
| Type / fill forms | `fill`, `type_text`, `fill_form`                      |
| Search text       | `evaluate_script` (DOM query)                         |
| Run JS in page    | `evaluate_script`                                     |
| Console errors    | `list_console_messages`                               |
| Network requests  | `list_network_requests`, `get_network_request`        |
| Handle dialogs    | `handle_dialog`                                       |
| Wait for content  | `wait_for`                                            |
| Screenshot        | `take_screenshot`                                     |
| Navigate          | `navigate_page`                                       |
| Multi-peer tabs   | `new_page`, `list_pages`, `select_page`, `close_page` |

### Tips

- Check whether the dev server is already running, or start it before using browser tools.
- **Prefer `take_snapshot`** — accessibility tree you can act on directly.
- **Use `evaluate_script`** to query the DOM and inspect React state/hooks when debugging.
- **Always check console errors** after changes.
- **Set `timeout_ms`** on long-running terminal commands.
- **Multi-peer testing** uses `new_page` to open additional tabs, then `select_page` to switch between them.

## Dev Checklist

1. Edit code in `src/views/` or `src/components/`.
2. Add/update i18n keys in all locale files.
3. Run `npm run typecheck`.
4. Run `npm run dev` if needed and verify in browser.
5. Double-check for correctness before declaring done.

## Smoke Test Checklist

Run after significant changes to verify core functionality. Use browser tools to step through:

- **Lobby renders** — logo, app name, room ID, mic/cam buttons, name input, join button
- **Name input** — fills correctly, persists in `localStorage` across navigations
- **Mic toggle** — label flips on/off, state updates, no errors
- **Mic dropdown** — opens to show audio level meter and list of available microphones
- **Cam toggle** — label flips on/off, state updates, no errors
- **Cam dropdown** — opens to show live video preview and list of available cameras
- **Join room** — transitions to Room view, timer starts, media state preserved
- **Room toolbar** — mic/cam toggles, screen share, chat, share room, leave all present
- **Chat panel** — opens with header, empty state, input, send button
- **Send message** — renders with author, timestamp, content; input clears
- **Share dialog** — title, description, QR code, invite link textbox, copy button
- **Copy link** — clipboard contains correct invite URL
- **Close share dialog** — dismisses, returns to room
- **Close chat** — panel hides, video grid visible
- **Leave room** — returns to lobby, name persisted
- **Multi-peer** — two tabs in same room, both peers visible in video grid
- **Cross-peer chat** — send message from Peer 1, verify it appears in Peer 2's chat with correct author and timestamp
- **Theme toggle** — pressing `d` cycles dark ↔ light
- **i18n** — all strings render correctly via `t()` in current language
- **Console errors** — `list_console_messages({types: ["error"]})` returns 0 errors

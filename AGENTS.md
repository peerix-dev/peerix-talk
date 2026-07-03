# Peerix Talk — Agent Guide

Peerix Talk is a peer-to-peer WebRTC web video conferencing application built as a React single-page application. It is designed to integrate with the [Peerix](https://github.com/peerix-dev/peerix) library for signaling and WebRTC management.

## Tech Stack

| Category      | Tools / Libraries                                                              |
| ------------- | ------------------------------------------------------------------------------ |
| Language      | TypeScript 6 (strict)                                                          |
| Framework     | React 19 (`react-jsx`)                                                         |
| Build         | Vite 8 + `@vitejs/plugin-react`                                                |
| CSS           | Tailwind CSS v4 (via `@tailwindcss/vite`), tw-animate-css                      |
| UI Components | shadcn/ui (`radix-mira` preset), Radix UI primitives, class-variance-authority |
| Icons         | `@hugeicons/react` + `@hugeicons/core-free-icons`                              |
| Font          | Inter Variable (`@fontsource-variable/inter`)                                  |
| i18n          | i18next + react-i18next + browser language detection + HTTP backend            |
| Avatars       | jdenticon (deterministic SVG avatars from participant names)                   |
| Type Check    | `tsc --noEmit` (`npm run typecheck`)                                           |

## Architecture Overview

```
src/
├── main.tsx      # entry
├── app.tsx       # app routing
├── index.css     # TailwindCSS v4 imports, theme tokens (oklch), base styles
├── components/   # shadcn/ui primitives and custom UI components
├── lib/          # i18n initialization, helpers, globals
└── views/        # all app views
public/           # static public assets
index.html        # main HTML template
```

## Design Principles

- **Client-side only**: no backend server or build-time SSR; all logic runs in the browser.
- **Path alias `@/*`**: all internal imports use `@/` prefix resolved to `./src/` (Vite `resolve.alias` + tsconfig `paths`).
- **shadcn/ui with radix-mira preset**: UI primitives use Radix UI under the hood, styled via Tailwind CSS v4 and oklch color tokens.
- **CVA-driven variants**: components like Button, Badge, Toggle, Item, and Empty use `class-variance-authority` for composable variant/size APIs.
- **System theme by default**: `ThemeProvider` defaults to `"system"`; CSS variables switch between `:root` (light) and `.dark` (dark).
- **Internationalization first**: all user-facing strings go through `useTranslation()` (`t()`). New strings must be added to all translation files.
- **Responsive layouts**: all UIs use responsive-design patterns using Tailwind CSS utilities.

## Commands

| Script              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start Vite dev server (`localhost:5173`)          |
| `npm run build`     | Type-check (`tsc -b`), then Vite production build |
| `npm run preview`   | Preview production build locally                  |
| `npm run typecheck` | Run TypeScript type check (`tsc -b --noEmit`)     |

## Coding Conventions

- **TypeScript strict mode**: enabled in `tsconfig.app.json`.
- **Named exports preferred**: use `export function` / `export const`. Avoid `export default` in new files.
- **Use `@/` alias imports**: always import via `@/...`, never relative paths.
- **i18n keys are nested**: use dot notation: `t("room.microphone.on")`, `t("lobby.joinRoom")`, etc.
- **Async/await preferred**: avoid raw `.then()` chains.
- **Accessibility**: interactive elements need `aria-label` via `t()`. Icons alone are not enough.
- **Simplicity**: keep code concise and minimal. Simplify where possible, but maintain readability.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[scope]: description
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Examples:

- `feat(lobby): add camera preview toggle`
- `fix(i18n): add missing German translations`
- `refactor(components): extract shared participant hook`
- `chore: update dependencies`

## Adding New UI Components

Add shadcn/ui components with:

```bash
npx shadcn@latest add <component-name>
```

Components land in `src/components/ui/`. See `components.json` for alias configuration.

## Internationalization Workflow

1. Add the key to `public/locales/en/translation.json`.
2. Mirror the key in all other locale files (`public/locales/<locale>/translation.json`).
3. Use in components via `const { t } = useTranslation()`, then call `t("namespace.key")`.
4. i18n initializes eagerly on boot — no lazy namespace loading.

## Quick Development Checklist

1. Edit code in the appropriate `src/views/` or `src/components/` subdirectory.
2. Add/update i18n keys in all locale files for any new user-facing strings.
3. Run `npm run typecheck` to verify TypeScript compiles cleanly.
4. Run `npm run dev` and verify in the browser.
5. Double-check for correctness — no overlooked details or regressions — before declaring done.

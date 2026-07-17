# Peerix Talk

Peer-to-peer WebRTC video conferencing app. No server required — peers connect directly using [Peerix](https://github.com/meefik/peerix) for signaling.

**Live demo** → <https://talk.peerix.dev>

## Features

- **Video calls** — direct peer-to-peer audio/video with screen sharing
- **Chat** — real-time peer-to-peer text messaging between participants
- **Room sharing** — invite links with QR code generation
- **Dark / light theme** — follows system preference or toggle with `d`
- **Internationalization** — English, German, Russian

## Tech Stack

| Layer     | Choices                                                             |
| --------- | ------------------------------------------------------------------- |
| Runtime   | React 19, TypeScript 6 (strict), Vite 8                             |
| Styling   | Tailwind CSS v4, shadcn/ui, Radix UI, oklch theme tokens            |
| Signaling | Peerix (NATS, MQTT, or SSE driver — configurable via `config.json`) |
| i18n      | i18next + react-i18next (browser detection)                         |
| Testing   | Playwright (e2e)                                                    |

## Quick Start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

### Configure Signaling

Edit `public/config.json`. BroadcastChannel is used by default for local testing. For production, set a `driver`:

```json
{
  "driver": {
    "type": "mqtt",
    "server": "wss://broker.emqx.io:8084/mqtt",
    "prefix": "peerix/"
  },
  "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }],
  "iceTransportPolicy": "all"
}
```

Supported drivers (drop-in replacements for the `driver` object):

NATS driver:

```json
{
  "type": "nats",
  "servers": ["wss://demo.nats.io:8443"],
  "prefix": "peerix."
}
```

SSE driver ([Mercure](https://mercure.rocks/)):

```json
{
  "type": "sse",
  "url": "http://localhost:8080/.well-known/mercure",
  "publisherJwtKey": "eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdLCJzdWJzY3JpYmUiOlsiKiJdfX0.bVXdlWXwfw9ySx7-iV5OpUSHo34RkjUdVzDLBcc6l_g"
}
```

## Commands

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Development server             |
| `npm run build`     | Type-check + production build  |
| `npm run typecheck` | Run type-check only            |
| `npm run preview`   | Serve production build locally |
| `npm run test`      | Run Playwright e2e tests       |

## Architecture

```
src/
├── main.tsx            # Entry: ThemeProvider → StorageProvider → RouterProvider → App
├── app.tsx             # Root: RoomProvider → RoomController + Toaster
├── index.css           # Tailwind v4 + oklch theme tokens
├── components/         # shadcn/ui + custom components
├── hooks/              # Router, room, peer, media, chat, storage
├── lib/                # Config, i18n, helpers, types
└── views/
    ├── lobby/          # Pre-join screen (name, mic/cam toggles, join)
    └── room/           # Active call (toolbar, video grid, chat)
```

Client-side only — no backend, no SSR. All state is managed in-memory with `localStorage` for persistence across navigations.

## License

[MIT](LICENSE) — Anton Skshidlevsky

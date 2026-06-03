# Beer Cellar — Mobile App

![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-3178C6?logo=typescript)
![iOS](https://img.shields.io/badge/iOS-supported-000000?logo=apple)
![Android](https://img.shields.io/badge/Android-supported-3DDC84?logo=android)
![License](https://img.shields.io/badge/license-MIT-green)

A personal beer collection manager for **iOS and Android**. Track beers you own or have consumed, log tasting notes, manage purchase details, and receive push notifications for consumption reminders.

This is the React Native / Expo mobile client for the Beer Cellar platform. It connects to the [beer-cellar-backend](https://github.com/luizgdona/beer-cellar-backend) REST API.

---

## Built With

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo (Managed Workflow) | 52 |
| UI Library | React Native | 0.76 |
| Language | TypeScript (strict) | 5 |
| Routing | Expo Router (file-based, typed) | 4 |
| State management | Zustand | 5 |
| HTTP Client | Axios | 1.17+ |
| Token storage | Expo SecureStore | — |
| Push notifications | expo-notifications | — |
| Media picker | expo-image-picker | — |
| Icons | Lucide React Native | — |
| Renderer | New Architecture (Fabric + JSI) | — |
| Testing | Jest + Testing Library React Native | 29 |

---

## Architecture

```
beer-cellar-mobile/
├── app/                  # Expo Router pages (file-based routing)
│   ├── _layout.tsx       # Root layout — providers, fonts, navigation shell
│   ├── index.tsx         # Entry route (redirects based on auth state)
│   ├── (auth)/           # Unauthenticated routes: login, register
│   └── (app)/            # Authenticated routes: dashboard, beer detail
├── components/           # Reusable UI components
│   ├── BeerCard.tsx      # Display-only card; emits events upward
│   ├── BeerForm.tsx      # Shared create/edit form
│   ├── Header.tsx        # Navigation bar with branding
│   └── Statistics.tsx    # Aggregate stats display
├── contexts/             # React Contexts
│   ├── AuthContext.tsx   # Auth state, login/logout, token refresh
│   └── LanguageContext.tsx # Multi-language string lookup
├── lib/                  # Shared utilities
│   ├── api-client.ts     # Axios instance with Bearer token interceptor
│   ├── beerStore.ts      # Zustand store for beer collection state
│   └── tokens.ts         # SecureStore helpers for token persistence
├── src/                  # Additional modules (screens, hooks, theme, types)
├── assets/               # Images, fonts, icons
├── __tests__/            # Jest test suites
├── app.json              # Expo configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- Expo Go app (for running on a physical device)
- For iOS builds: macOS with Xcode and iOS Simulator
- For Android builds: Android Studio with a configured AVD
- A running instance of the [beer-cellar-backend](https://github.com/luizgdona/beer-cellar-backend)

### Clone and install

```bash
git clone https://github.com/luizgdona/beer-cellar-mobile.git
cd beer-cellar-mobile
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to your backend URL:

```
EXPO_PUBLIC_API_URL=http://<your-backend-host>:<port>/api/v1
```

> Variables prefixed with `EXPO_PUBLIC_` are embedded into the app bundle at build time. Never store secrets with this prefix — they are visible in the compiled output.

### Run on iOS Simulator

```bash
npx expo start --ios
```

### Run on Android Emulator

```bash
npx expo start --android
```

### Run in Expo Go (physical device)

```bash
npx expo start
```

Scan the QR code with the Expo Go app.

---

## Building for Production

Builds are managed by [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npm install -g eas-cli
eas login
```

| Platform | Command |
|---|---|
| iOS | `npx eas build --platform ios` |
| Android | `npx eas build --platform android` |
| Both | `npx eas build --platform all` |

Artifacts are available in the [Expo dashboard](https://expo.dev/) and can be submitted to the App Store and Google Play via `eas submit`.

---

## Running Tests

```bash
npm test
```

Runs Jest with the React Native Testing Library preset. Tests live in `__tests__/`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | Base URL for the Beer Cellar backend API (e.g. `http://localhost:3001/api/v1`) |

---

## Key Design Decisions

**Expo Managed Workflow** — Avoids maintaining native iOS/Android project files. Enables over-the-air (OTA) updates via EAS Update without a full App Store release cycle.

**Expo Router** — File-based routing mirrors Next.js conventions used in the web frontend, reducing context-switching. Typed routes (`experiments.typedRoutes: true`) catch navigation errors at compile time.

**Expo SecureStore for token storage** — Auth tokens (access + refresh) are stored in `expo-secure-store`, which uses the iOS Keychain and Android Keystore under the hood. Components access auth state only via `AuthContext` — never by reading storage directly.

**Axios with interceptor** — The API client (`lib/api-client.ts`) attaches the Bearer token to every request via a request interceptor and handles 401 responses for token refresh. Auth logic stays out of individual screens.

**New Architecture enabled** — `newArchEnabled: true` in `app.json` activates the Fabric renderer and JavaScript Interface (JSI), providing better performance for animations and bridge-free native module calls.

**Zustand for state** — Chosen over Redux for its minimal API surface and zero boilerplate. The beer collection store handles loading, caching, and mutation of beer data with straightforward actions.

**Portrait-only orientation** — Designed for single-hand mobile use. Locking to portrait avoids layout complexity and ensures a consistent experience across devices.

---

## Connecting to the Backend

Set `EXPO_PUBLIC_API_URL` to the URL of your backend instance. The backend exposes a REST API at `/api/v1` with JWT-based authentication (access token: 15 min, refresh token: 7 days).

See [beer-cellar-backend](https://github.com/luizgdona/beer-cellar-backend) for full API documentation and setup instructions.

---

## License

MIT

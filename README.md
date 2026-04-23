# Beer Cellar — Mobile App

A personal beer collection manager for iOS and Android. Track beers you own or have consumed, log tasting notes, manage purchase details, and receive consumption reminders — all from your phone.

This is the React Native mobile client for the Beer Cellar platform. It connects to the Beer Cellar backend via a REST API.

---

## Tech Stack

| Concern | Technology | Rationale |
|---|---|---|
| Framework | React Native + Expo (Managed Workflow) | Avoids native code complexity; OTA updates via EAS |
| Language | TypeScript (strict) | End-to-end type safety, consistent with backend and web |
| Navigation | Expo Router (file-based) | Familiar file-system conventions; typed routes |
| State management | Zustand | Lightweight, minimal boilerplate compared to Redux |
| HTTP client | Axios | Same pattern as the web frontend; interceptor attaches Bearer token automatically |
| UI primitives | expo-linear-gradient, expo-blur, react-native-svg, lucide-react-native | Rich visuals without heavy dependencies |
| Fonts | @expo-google-fonts/dm-sans, @expo-google-fonts/playfair-display | Matches the Beer Cellar brand typography |
| Token storage | @react-native-async-storage/async-storage | Standard React Native pattern for persistent auth tokens |
| Media | expo-image-picker | Photo library and camera access with declarative permissions |
| Push notifications | expo-notifications | Consumption reminders delivered natively |
| Renderer | New Architecture (`newArchEnabled: true`) | Fabric renderer + JSI for improved performance |
| Testing | Jest + Testing Library (React Native) | Unit and component tests |
| Orientation | Portrait only | Designed for single-hand mobile use |
| Bundle IDs | `com.beercellar.app` (iOS + Android) | Unified identifier across platforms |

---

## Architecture

```
beer-cellar-mobile/
├── app/                  # Expo Router pages (file-based routing)
│   ├── _layout.tsx       # Root layout — providers, fonts, navigation shell
│   ├── index.tsx         # Entry route (redirects based on auth state)
│   ├── (auth)/           # Unauthenticated routes (login, register)
│   └── (app)/            # Authenticated routes (dashboard, beer detail, etc.)
├── components/           # Reusable UI components
│   ├── BeerCard.tsx      # Display-only card; emits events upward
│   ├── BeerForm.tsx      # Shared create/edit form
│   ├── Header.tsx        # Navigation bar with branding
│   └── Statistics.tsx    # Aggregate stats display
├── contexts/             # React contexts
│   ├── AuthContext       # Auth state, login/logout, token refresh
│   └── LanguageContext   # Multi-language string lookup
├── lib/                  # Shared utilities
│   ├── api-client.ts     # Axios instance with Bearer token interceptor
│   ├── beerStore.ts      # Zustand store for beer collection state
│   └── tokens.ts         # AsyncStorage helpers for token persistence
├── src/                  # Additional source modules
├── assets/               # Images, fonts, icons
├── __tests__/            # Jest test suites
├── app.json              # Expo configuration
├── babel.config.js       # Babel config (Expo preset)
└── tsconfig.json         # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- For iOS: macOS with Xcode and iOS Simulator installed
- For Android: Android Studio with an AVD (Android Virtual Device) configured
- A running instance of the Beer Cellar backend

### Clone and install

```bash
git clone https://github.com/luizgdona/beer-cellar-mobile.git
cd beer-cellar-mobile
npm install
```

### Configure environment

Create a `.env` file in the project root:

```
EXPO_PUBLIC_API_URL=http://<your-backend-host>:<port>/api/v1
```

> Expo exposes variables prefixed with `EXPO_PUBLIC_` to the app bundle. Never store secrets with this prefix — they are visible in the compiled bundle.

### Run on iOS

```bash
npx expo start --ios
```

### Run on Android

```bash
npx expo start --android
```

### Run in Expo Go (physical device)

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your device.

---

## Building for Production

Builds are managed by [EAS Build](https://docs.expo.dev/build/introduction/). Install the EAS CLI first:

```bash
npm install -g eas-cli
eas login
```

### iOS

```bash
npx eas build --platform ios
```

### Android

```bash
npx eas build --platform android
```

### Both platforms

```bash
npx eas build --platform all
```

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

All client-side variables must use the `EXPO_PUBLIC_` prefix — this is Expo's convention for embedding values into the app bundle at build time. Do not use this prefix for secrets; they will be visible in the compiled output.

---

## Key Design Decisions

**Expo Managed Workflow** — The app uses Expo's managed workflow to avoid maintaining native iOS/Android project files. This enables over-the-air (OTA) updates via EAS Update without a full App Store release cycle.

**Expo Router** — File-based routing mirrors Next.js conventions used in the web frontend, reducing context-switching for developers working across both clients. Typed routes (`experiments.typedRoutes: true`) catch navigation errors at compile time.

**Zustand for state** — Chosen over Redux for its minimal API surface and zero boilerplate. The beer collection store (`lib/beerStore.ts`) handles loading, caching, and mutation of beer data with straightforward actions.

**AsyncStorage for token persistence** — Auth tokens (access + refresh) are stored in AsyncStorage and managed exclusively through `lib/tokens.ts`. Components access auth state only via `AuthContext` — never by reading storage directly.

**Axios with interceptor** — The API client (`lib/api-client.ts`) attaches the Bearer token to every request via a request interceptor and handles 401 responses for token refresh. This keeps auth logic out of individual screens.

**New Architecture enabled** — `newArchEnabled: true` in `app.json` activates the Fabric renderer and JavaScript Interface (JSI), providing better performance for animations and bridge-free native module calls.

**Portrait-only orientation** — The UI is designed for single-hand mobile use. Locking to portrait avoids layout complexity and ensures a consistent experience across devices.

---

## Connection to Backend

This app requires the Beer Cellar backend to be running and reachable at the URL set in `EXPO_PUBLIC_API_URL`. The backend exposes a REST API at `/api/v1` with JWT-based authentication (access token: 15 min, refresh token: 7 days).

Set `EXPO_PUBLIC_API_URL` to point to your backend instance before starting the app or building for production.

---

## License

MIT

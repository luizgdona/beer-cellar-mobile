# The Beer Cellar - Mobile App

React Native mobile application for managing your beer collection.

## Setup

```bash
npm install
```

## Running the App

**iOS:**

```bash
npm run ios
```

**Android:**

```bash
npm run android
```

**Web:**

```bash
npm run web
```

## Features

- User authentication (register, login, logout)
- View all beers in your collection
- Add new beers with detailed information
- Mark beers as consumed
- Search and filter beers
- View beer statistics and analytics
- Profile management
- **Error Tracking & Persistence** - Automatic error logging and analytics
  (see [ERROR_PERSISTENCE.md](ERROR_PERSISTENCE.md))

## Environment Variables

Copy `.env.example` to `.env` and update with your API URL:

```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL/api/v1
```

Security note:

- Commit only `.env.example`.
- Never commit `.env` with real secrets.

## Project Structure

```text
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── contexts/         # React contexts (Auth)
│   ├── stores/           # Zustand stores (Beer)
│   ├── lib/              # Utilities and API client
│   └── App.tsx           # Main app entry
├── app.json              # Expo configuration
└── package.json
```

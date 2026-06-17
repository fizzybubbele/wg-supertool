# WG-SuperTool (Haushaltsplanner)

WG-Organisations-App: Finanzen, Putzplan, Organisation und Vorrat – gebaut mit Expo, Supabase und Cursor Build-Loop.

## Voraussetzungen

- Node.js 18+
- Docker Desktop (für lokales Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Setup

```bash
# 1. Abhängigkeiten
npm install

# 2. Supabase lokal starten (Docker muss laufen)
supabase start

# 3. Env-Variablen (Keys aus `supabase status`)
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY eintragen

# 4. App starten
npx expo start
```

## Cursor Build-Loop

Cursor lädt `.cursor/rules/project-context.mdc` automatisch bei jedem Chat.

Für jedes neue Feature in dieser Reihenfolge:

```
@loop-plan      → Ziel + Plan festlegen (noch kein Code)
@loop-work      → Plan abarbeiten, inkl. Tests
@loop-review    → Selbst-Review, Schwachstellen fixen
@loop-compound  → Learnings in LEARNINGS.md festhalten
```

## Tech-Stack

- **Frontend:** React Native (Expo), TypeScript strict, Expo Router, NativeWind
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage) – lokal via CLI
- **State:** Zustand (Client), React Query (Server)

## Projektstruktur

```
app/           Expo Router Pages
features/      Feature-Module
components/    Shared UI
lib/           Supabase-Client, Utils
supabase/      Migrationen, Edge Functions
docs/          Feature-Specs
```

---
trigger: always_on
---

# Project Overview

You are working on a React Native application built with Expo (SDK 55) and Expo Router. The project is named "3c" and uses modern React Native practices.

## Core Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript (Strict Mode)
- **State Management**: Zustand (Global), React Context (Providers)
- **Data Fetching**: `@tanstack/react-query` + `axios`
- **Forms & Validation**: `react-hook-form` + `zod` (`@hookform/resolvers`)
- **Storage**: `@react-native-async-storage/async-storage` and `expo-secure-store`
- **i18n & RTL**: Built-in support for Right-To-Left layouts and dynamic language switching (`i18next`, `react-i18next`).

## File Structure & Routing

- `app/`: Contains all Expo Router screens and layouts. Uses groups like `(app)` and `(auth)`.
- `components/`: Reusable UI components organized by domain (`auth`, `chat`, `profile`, `ui`, `home`).
- `hooks/`: Custom React hooks (e.g., `useDebounce`, `useTicketChat`).
- `services/`: API abstractions and business logic (`services/api/`, `services/auth/`).
- `providers/`: Context providers that wrap the application root.
- `contexts/`: React Contexts (e.g., `language-context`).
- `constants/`: Theme tokens, colors, and layout configurations.
- `i18n/`: Internationalization configurations and translation files.

## Coding Conventions & Rules

### 1. TypeScript & Code Style

- Always use **TypeScript** and maintain strict typing. Avoid `any`.
- Prefer functional components and React Hooks.
- Use explicit return types for critical functions.

### 2. UI & Styling

- Avoid inline styles where possible; use `StyleSheet.create`.
- **RTL & Typography**: The app strongly relies on RTL support and dynamic fonts based on the active language.
    - **CRITICAL**: Use the custom `<ThemedText>` component instead of the default React Native `<Text>`.
    - `<ThemedText>` automatically handles font families (`Tajawal` for Arabic, `Poppins` for English) and scales font sizes responsively using `useWindowDimensions`.
- Layouts should be responsive. Use flexbox heavily.

### 3. API & Data Fetching

- Do not use `fetch` directly. All API calls must go through the pre-configured `axios` instances located in the `services/` directory.
- Use **React Query** (`useQuery`, `useMutation`) for data fetching, caching, and state synchronization.
- API endpoints should be defined in `services/api/` and utilized within custom hooks or components via React Query.

### 4. Forms & Validation

- Use **React Hook Form** for managing form state to prevent unnecessary re-renders.
- Use **Zod** schemas for validating form inputs and API payloads. Integrate them using the `@hookform/resolvers/zod` package.

### 5. Authentication & Storage

- Authentication state is managed via tokens.
- Tokens should be accessed and mutated using the `tokenService` (which abstracts `expo-secure-store`).
- For non-sensitive local storage (preferences, flags), use `@react-native-async-storage/async-storage`.

### 6. File Naming Conventions

- React components and screens: PascalCase (e.g., `ScreenWrapper.tsx`) or kebab-case depending on existing folder patterns (e.g., `custom-header.tsx`, `themed-text.tsx`). Follow the adjacent files' casing.
- Hooks: camelCase starting with "use" (e.g., `useGroupChats.ts`).
- Services & Utils: camelCase (e.g., `tokenService.ts`).

## Agent Instructions

When proposing code modifications:

1. Prioritize editing existing files over creating new duplicate utilities.
2. If changing routing logic, ensure compatibility with Expo Router's file-based system.
3. If writing UI, immediately import and use `<ThemedText>` from `@/components/themed-text`.
4. Ensure new packages are installed via `npx expo install` to ensure SDK compatibility.

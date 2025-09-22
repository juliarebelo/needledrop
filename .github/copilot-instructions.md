# Copilot Instructions for AI Agents

## Project Overview
- This is an Expo React Native project using file-based routing (see `app/`).
- The main app code lives in `app/`. The `app-example/` folder contains starter/example code and is not part of the main app.
- Components are organized under `app-example/components/` and `app-example/components/ui/` for reusable UI elements.
- The project uses TypeScript (see `tsconfig.json`).

## Key Workflows
- **Install dependencies:** `npm install`
- **Start development server:** `npx expo start`
- **Reset to a fresh project:** `npm run reset-project` (moves starter code to `app-example/` and creates a blank `app/`)

## Routing & Structure
- Uses [Expo Router](https://docs.expo.dev/router/introduction) for file-based navigation. Each file in `app/` (and subfolders) is a route.
- `_layout.tsx` files define layout and navigation structure for their folder.
- Example: `app/index.tsx` is the main screen; `app/login.tsx` is the login screen.

## Patterns & Conventions
- Place new screens in `app/` as `.tsx` files. Use subfolders for nested routes.
- Use functional components and React hooks (see `app-example/hooks/`).
- Theming and color scheme logic is in `app-example/constants/theme.ts` and `app-example/hooks/use-theme-color.ts`.
- Reusable UI components should go in `app-example/components/ui/`.

## External Integrations
- Uses Expo and React Native libraries. See `package.json` for dependencies.
- Images and static assets are in `assets/images/`.

## Examples
- For a new screen: create `app/your-screen.tsx` and add your component.
- For a new tab: add a file in `app/(tabs)/` and update `app/(tabs)/_layout.tsx` if needed.

## Additional Notes
- Do not edit files in `app-example/` unless updating starter code.
- Follow the structure and patterns in `app/` for new features.
- For theming, use the hooks and constants provided in `app-example/`.

Refer to the [README.md](../README.md) for more details on setup and Expo resources.

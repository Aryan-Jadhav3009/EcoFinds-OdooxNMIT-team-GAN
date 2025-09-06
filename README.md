# EcoFinds — Community Marketplace for Sustainable Finds

Judges Quickstart (no accounts needed)
- Fastest path: Hosted backend is already configured. You do NOT need a Convex account.
- Steps:
  1) Node 18+ (20+ recommended) and pnpm installed (run: corepack enable if needed)
  2) pnpm install
  3) pnpm dev
  4) Open the printed local URL
- You can browse, search, view product pages, and the UI/animations will all work out of the box.
- Creating/editing listings requires auth. If you want to test that locally, use the "Full Local Mode" below.

Two Ways to Run
- Quick Run (Hosted backend)
  - No Convex account required.
  - Uses our hosted Convex deployment that is already wired via VITE_CONVEX_URL.
  - Commands:
    - pnpm install
    - pnpm dev
  - Open the printed URL. You're done.
- Full Local Mode (Optional: to test seller flows with OTP in terminal)
  - Requires a free Convex account (only if you want OTP to print to your terminal and run everything 100% locally).
  - In one terminal: npx convex dev
  - In another: pnpm dev
  - Optional seed (adds demo data): npx convex run seed:seedData
  - Auth note: In local mode, OTP codes are printed in the convex dev terminal for easy sign-in during judging.

Troubleshooting
- pnpm not found: run corepack enable, then pnpm install again.
- Port busy: stop other dev servers or change the port when prompted.
- If you only need to browse and evaluate UX, use Quick Run. If you want to test creating/editing listings with OTP, use Full Local Mode.


Discover, sell, and give items a second life. EcoFinds is a modern, real-time marketplace with a beautiful glassmorphism UI, authentication, image uploads, and a delightful browsing experience.

## ✨ Features
- Real-time data and reactive UI
- Smooth auth flow with OTP
- Polished, cohesive design and animations
- Image uploads to backend storage
- Clear DX and easy local setup (no env needed)
- Clean architecture and strong code hygiene
- OTP based authentication

---

## 🚀 Features
- Browse products with search, categories, and sorting
- Product pages with seller info and location
- Add-to-cart (client-side, persisted locally)
- Auth via email OTP
- Create and edit listings with image uploads
- Dashboard for managing your listings and recent orders
- Smooth animations and responsive layout

---

## 🧰 Tech Stack
- Frontend: React + Vite + React Router + Tailwind + shadcn/ui + Framer Motion
- Backend: Convex (DB, real-time queries, file storage, functions)
- Auth: convex-auth-otp
- Notifications: Sonner

---

## 📦 Project Structure

All relevant files live in the 'src' directory.

Use pnpm for the package manager.

## Setup

This project is set up already and running on a cloud environment, as well as a convex development in the sandbox.

## Environment Variables

The project is set up with project specific CONVEX_DEPLOYMENT and VITE_CONVEX_URL environment variables on the client side.

The convex server has a separate set of environment variables that are accessible by the convex backend.

Currently, these variables include auth-specific keys: JWKS, JWT_PRIVATE_KEY, and SITE_URL.

## Environment Setup for Judges

This project requires minimal configuration to run. In most cases, you do not need to set any environment variables for judging or local preview.

Required (client):
- VITE_CONVEX_URL
  - What it is: The URL for the Convex backend.
  - Default/fallback: The app already uses a baked-in fallback URL, so you can leave this unset for judging.
  - How it's used: src/main.tsx reads it via import.meta.env.VITE_CONVEX_URL; if not set, it falls back to https://harmless-tapir-303.convex.cloud.

Optional (Convex / auth provider):
- CONVEX_SITE_URL
  - What it is: Used by the Convex auth configuration.
  - When needed: Only if you're deploying your own Convex instance and configuring providers. For local judging/preview, you do not need to set this.

No other secrets are required to run or evaluate this project locally.

Quick start:
1) Install deps: pnpm install
2) Dev server: pnpm dev
3) Open: http://localhost:5173

# Using Authentication (Important!)

You must follow these conventions when using authentication.

## Auth is already set up.

All convex authentication functions are already set up. The auth currently uses email OTP and anonymous users, but can support more.

The email OTP configuration is defined in `src/convex/auth/emailOtp.ts`. DO NOT MODIFY THIS FILE.

Also, DO NOT MODIFY THESE AUTH FILES: `src/convex/auth.config.ts` and `src/convex/auth.ts`.

## Using Convex Auth on the backend

On the `src/convex/users.ts` file, you can use the `getCurrentUser` function to get the current user's data.

## Using Convex Auth on the frontend

The `/auth` page is already set up to use auth. Navigate to `/auth` for all log in / sign up sequences.

You MUST use this hook to get user data. Never do this yourself without the hook:
```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```


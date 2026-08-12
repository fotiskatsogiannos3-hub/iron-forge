# Iron Forge Frontend

React + TypeScript (Vite) frontend for the Iron Forge gym membership management platform.
Talks to the Spring Boot backend over REST, with JWT-based auth and role-aware routing
(ADMIN vs TRAINER).

## Stack

- React 18 + TypeScript
- Vite
- React Router
- Axios

## Prerequisites

- Node.js 18+
- The backend running locally (default `http://localhost:8080`). See the root README for
  how to bring up MySQL via Docker and run the Spring Boot app.

## Local development

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend runs elsewhere
npm run dev
```

The app runs at `http://localhost:5173`. The backend's `allowed.origins` config already
includes this by default, so no CORS setup is needed.

Log in with the bootstrap admin account seeded by the backend's Flyway migration:

- **Username:** `admin`
- **Password:** `admin123`

## Tests

```bash
npm test
```

Runs the automated test suite (Vitest + React Testing Library + MSW). The backend is
mocked at the HTTP layer with fixtures that mirror the real DTOs and business rules.
Covers login, member list/search/create, new subscription rules, staff role lock,
and route guards.

## Build

```bash
npm run build
```

Type-checks the project and outputs a production build to `dist/`.

## Preview a production build

```bash
npm run preview
```

## Deploying alongside the backend (Docker)

Build the static assets and serve them with any static file server / reverse proxy (nginx,
Caddy, etc.), pointed at the backend's API. Example `Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Set `VITE_API_BASE_URL` at build time (it's inlined into the bundle by Vite) to point at
wherever the backend is reachable from the browser.

## UI notes

A few screens differ from the original Figma mockups to match the backend API:

- Login uses username, not email.
- Member active/inactive is derived from subscription status (no status field on Member).
- New subscription includes payment method; start date is today and read-only.
- Staff passwords are set only at creation; new staff are always Trainer.
- Dates use a DD/MM/YYYY text input instead of the native date picker.
- Subscription list search/filter is client-side for now.

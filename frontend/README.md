# Iron Forge — Frontend

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
- The backend running locally (default `http://localhost:8080`) — see the backend repo's
  own README for how to bring up MySQL via Docker and run the Spring Boot app.

## Local development

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend runs elsewhere
npm run dev
```

The app runs at `http://localhost:5173` — the backend's `allowed.origins` config already
includes this by default, so no CORS setup is needed.

Log in with the bootstrap admin account seeded by the backend's Flyway migration:

- **Username:** `admin`
- **Password:** `admin123`

## Tests

```bash
npm test
```

Runs the automated test suite (Vitest + React Testing Library + MSW). The backend is
mocked at the HTTP layer with fixtures that mirror the real DTOs and business rules, so
these tests exercise the actual frontend code — routing, forms, error handling — without
needing the real backend or a database running. Covers:

- Login: correct credentials, wrong password (401), and backend-unreachable (network
  error) all produce distinct, correct messages
- Member List: loads, search filtering, member creation + confirmation toast, the
  DD/MM/YYYY date input
- New Subscription: active plans populate the dropdown, the "one active subscription per
  member" rule is enforced and surfaces an error, successful creation
- Staff role lock: creating a staff user never offers an Admin option; editing shows the
  role as read-only; no password field on edit
- Route guards: a Trainer is redirected away from admin-only pages; an Admin can reach
  them; an unauthenticated visitor is sent to `/login`

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

## Notes on a few adaptations from the original Figma mockups

The UI was designed in Figma before the backend's exact API contract was finalized. A
handful of screens were adjusted to match what the real backend actually supports:

- **Login** uses **username**, not email — the backend's `LoginRequestDTO` takes
  `username`/`password`.
- **Member "Active/Inactive" status** is derived from whether the member currently holds
  a non-expired subscription, since the `Member` entity itself has no status field beyond
  soft-delete (and the API never returns soft-deleted members anyway).
- **New Subscription** includes a **Payment Method** field (Cash / Card / Bank transfer),
  required by `SubscriptionInsertDTO` but not present in the original mockup. The **Start
  Date** is always today (the backend doesn't accept a custom start date) and is shown
  read-only; **End Date** is still auto-calculated from the plan's duration.
- **Editing a staff user** has no password field — `StaffUserUpdateDTO` only supports
  changing email and role. Passwords are only set at creation time.
- **Staff roles are locked in the UI**: Iron Forge has exactly one Admin account. New
  staff created from "New Staff User" are always Trainer, and the Role field is read-only
  when editing — there's no click path in the app that promotes/demotes an account. (This
  is enforced in the UI only; the backend's `StaffUserInsertDTO.roleName` still technically
  accepts `"ADMIN"` if called directly, e.g. via Postman with a valid admin token. Locking
  that down server-side would mean rejecting `roleName == "ADMIN"` in
  `StaffUserServiceImpl.createStaffUser`.)
- **Date of Birth** uses a lightweight custom `DD/MM/YYYY` text input instead of the
  native `<input type="date">` — matches the Figma spec's plain text-field date inputs and
  avoids the native browser calendar popup, which is noticeably slower to interact with.
- **Search/filtering on the Subscriptions list** is done client-side (the backend doesn't
  yet expose `search`/`status` query params on `GET /api/subscriptions`), same for the
  dashboard's "active subscriptions" and "recent signups" figures. Fine at the dataset
  size this project targets; would want real query params / aggregate endpoints for a
  larger deployment.

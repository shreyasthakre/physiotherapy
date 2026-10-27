# The Physiotherapy Clinic — Clinic Platform

A full-stack physiotherapy clinic website with a public marketing site, online
appointment booking, and a role-based patient portal.

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Node.js + Express (REST API, ES modules)
- **Database:** PostgreSQL
- **Auth:** JWT (patients & staff), role-based access control

---

## ✨ Features

| Area | Highlights |
|---|---|
| **Home** | Hero with branding, CTAs (Book Appointment / Contact), stats, features, services preview, testimonials, newsletter |
| **Services** | Listing + detail pages (sports injury, post-surgery rehab, chronic pain, neuro rehab) |
| **Booking** | Online scheduler with day/time picker, conflict checking, email + SMS confirmation & reminders |
| **Patient Portal** | Secure login; patients view appointments, prescriptions, exercise plans, progress reports |
| **Staff Dashboards** | Physiotherapist: manage schedule, patients & records. Admin: users, appointments, messages |
| **Blog / Resources** | Articles, recovery guides, embedded exercise videos |
| **Testimonials** | Auto-rotating, accessible carousel |
| **Contact** | Google Maps embed, contact form, phone/email |
| **Extras** | SEO meta + JSON-LD structured data, Google Analytics 4, Mailchimp newsletter, rate limiting, error-handling middleware, env-based config |

### Role-based access

- **Admin** — manage services, testimonials, view all users/appointments/messages, change roles.
- **Physiotherapist** — view assigned appointments, manage patients & clinical records, author blog posts.
- **Patient** — book/cancel appointments, view own records.

---

## Run on localhost

Open the site in your browser at **http://localhost:5173**. The API runs at **http://localhost:4000**.

You need **Node.js 18 or newer**. Check with:

```powershell
node -v
```

### First time

Open PowerShell in this project folder (`c:\Users\shreyath\Physiotherapy`) and run:

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Skip the `Copy-Item` lines if those `.env` files already exist. The default database is built in (`DB_DRIVER=pglite` in `backend\.env`). You do not need to install PostgreSQL. The first start creates the tables and demo accounts automatically.

### Every time you want to use the app

```powershell
npm run dev
```

Leave that window open. When you see the frontend ready and the API listening, open:

- Site: http://localhost:5173
- API: http://localhost:4000/api

Stop the app with `Ctrl+C` in that same window.

### Sign in

| Role | Email | Password |
|---|---|---|
| Admin | `admin@physioclinic.example` | `Admin@12345` |
| Physiotherapist | `physio@physioclinic.example` | `Physio@12345` |
| Patient | `patient@physioclinic.example` | `Patient@12345` |

The login page can fill these in for you.

### WhatsApp, SMS, and calls

With Twilio left blank in `backend\.env`, sending an update only writes a line in the server window and in the in-app notification log. Nothing is delivered to a phone. That is demo mode.

### If it does not start

- **Port already in use:** another copy is still running. Close the old PowerShell window, or end the Node process using port `5173` or `4000`, then run `npm run dev` again.
- **`npm` is not recognized:** install Node.js from https://nodejs.org and open a new PowerShell window.
- **Blank page or API errors:** wait until the backend prints `listening on http://localhost:4000`, then refresh the browser.

---

## 📁 Project structure

```
Physiotherapy/
├── package.json            # npm workspaces + root scripts
├── backend/
│   ├── .env.example
│   └── src/
│       ├── index.js        # server entry (graceful shutdown, reminder job)
│       ├── app.js          # express app (helmet, cors, compression, routes)
│       ├── config/         # env-based configuration
│       ├── db/             # pool, schema.sql, migrate, seed
│       ├── middleware/     # auth, validate, rate-limit, error handler
│       ├── models/         # SQL data-access layer
│       ├── controllers/    # request handlers
│       ├── routes/         # REST route definitions
│       ├── validators/     # Zod schemas
│       ├── jobs/           # appointment reminder scheduler
│       └── utils/          # jwt, password, notifications, mailchimp, logger
└── frontend/
    ├── .env.example
    └── src/
        ├── main.jsx, App.jsx
        ├── components/     # Navbar, Footer, SEO, carousel, cards, icons…
        ├── context/        # AuthContext (JWT)
        ├── lib/            # api client, analytics, data hook
        └── pages/          # Home, Services, Booking, Blog, Portal…
```

---

## 🚀 Getting started

### Prerequisites

- Node.js **18+** (tested on Node 24)
- A database — **choose one**:
  - **Nothing to install (default):** the app ships with an embedded, in-process
    Postgres (**PGlite**) enabled via `DB_DRIVER=pglite`. Data persists to
    `backend/.pgdata`. Ideal for local development.
  - **External PostgreSQL 13+:** set `DB_DRIVER=pg` and configure `DATABASE_URL`
    (or the `PG*` vars) for staging/production.

### 1. Install dependencies

From the repository root (uses npm workspaces):

```bash
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and set at minimum:

- `DATABASE_URL` (or the `PG*` parts) pointing at your PostgreSQL instance
- `JWT_SECRET` to a long random string

SMTP / SMS / Mailchimp / Google Analytics are all **optional** — when their
credentials are blank the app degrades gracefully (emails/SMS are logged to the
console, newsletter signups are stored locally).

### 3. Create the database & schema

**Embedded PGlite (default):** nothing to create. On first boot the server
auto-applies the schema and seeds demo data into `backend/.pgdata`. You can also
run the scripts manually (with the dev server stopped, since PGlite is
single-connection):

```bash
npm run db:migrate          # applies schema
npm run db:seed             # inserts demo content + accounts
```

**External PostgreSQL** (`DB_DRIVER=pg`): create the database once, then run the
scripts:

```bash
createdb physiotherapy      # or: psql -c "CREATE DATABASE physiotherapy;"
npm run db:migrate          # creates tables, types, indexes, triggers
npm run db:seed             # inserts services, testimonials, blog posts, demo users
```

### 4. Run the app (dev)

```bash
npm run dev                 # runs backend (:4000) + frontend (:5173) together
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api
- The Vite dev server proxies `/api` to the backend automatically.

Run them separately if you prefer:

```bash
npm run dev:backend
npm run dev:frontend
```

### 5. Build for production (one process)

The API can serve the built website from `frontend/dist`, so clients only need
one URL (the same origin as `/api`).

```bash
npm run build               # writes frontend/dist
NODE_ENV=production npm start
```

Open http://localhost:4000 — the public site, `/admin`, and `/api` all come
from Express. Health check: `GET /health`.

---

## ☁️ Deploy on Amazon AWS (client preview)

Recommended shape: **one Node service + Amazon RDS (PostgreSQL)**.

Do **not** use the local PGlite file (`DB_DRIVER=pglite`) on AWS. Container
disks are wiped on every deploy. Use **RDS PostgreSQL**.

Set these environment variables on AWS:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (App Runner / ECS) — Elastic Beanstalk sets this for you |
| `DB_DRIVER` | `pg` |
| `DATABASE_URL` | RDS connection string |
| `PGSSL` | `true` |
| `JWT_SECRET` | a long random string |
| `CORS_ORIGIN` | the public `https://…` URL of this app |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | change before going live |

After the database exists, run **once**:

```bash
npm run db:migrate
npm run db:seed
```

(On App Runner / ECS: a one-off task or `aws ecs execute-command`. On Elastic
Beanstalk: **EB CLI** `eb ssh` then the same commands from the app directory.)

### Option A — AWS App Runner (easiest Docker)

1. Push this repo to GitHub (or Amazon ECR after `docker build`).
2. AWS Console → **App Runner** → Create service → **Source = Docker**.
3. Health check path: `/health`.
4. Attach RDS (same VPC if you use VPC connector) and paste `DATABASE_URL`.
5. Client URL: the App Runner default `https://….awsapprunner.com`.

Build locally to test the image:

```bash
docker build -t physio-clinic .
docker run --rm -p 4000:4000 --env-file backend/.env physio-clinic
```

### Option B — Elastic Beanstalk (Node.js, no Docker)

1. Console → **Elastic Beanstalk** → Create application → Platform **Node.js 20**.
2. Upload a zip of this repo (or connect GitHub). `Procfile` starts the API;
   `.ebextensions` builds `frontend/dist` on deploy.
3. Add an **RDS PostgreSQL** instance (or a separate RDS) and the env vars above.
4. Set `NPM_USE_PRODUCTION=false` so Vite is installed for the frontend build
   (already in `.ebextensions/00_options.config`).
5. Client URL: `http://….elasticbeanstalk.com` (add a custom domain + HTTPS later).

### Option C — ECS Fargate + Application Load Balancer (production)

1. Create **RDS PostgreSQL**.
2. Push the Docker image to **Amazon ECR**.
3. Run a Fargate service behind an ALB. Target group health check: `/health`.
4. Task env vars as in the table. Give the task security-group access to RDS.

### Option D — Lightsail / EC2

Install Node 20, clone the repo, `npm install`, set `backend/.env` (`DB_DRIVER=pg`
pointing at RDS or a local Postgres), then:

```bash
npm run start:prod
```

Put **nginx** in front with HTTPS (Let’s Encrypt) and proxy to port 4000.

---

## 👤 Demo accounts (after `npm run db:seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@physioclinic.example` | `Admin@12345` |
| Physiotherapist | `physio@physioclinic.example` | `Physio@12345` |
| Patient | `patient@physioclinic.example` | `Patient@12345` |

The login page has one-click buttons to fill these in.

---

## 🔌 API overview

Base URL: `/api`

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | public (creates patient) |
| POST | `/auth/login` | public |
| GET | `/auth/me` | authenticated |

### Services
| Method | Endpoint | Access |
|---|---|---|
| GET | `/services` | public |
| GET | `/services/:slug` | public |
| POST | `/services` | admin |
| PATCH | `/services/:id` | admin |
| DELETE | `/services/:id` | admin |

### Appointments
| Method | Endpoint | Access |
|---|---|---|
| GET | `/appointments` | authenticated (scoped by role) |
| POST | `/appointments` | authenticated |
| GET | `/appointments/:id` | owner / staff |
| PATCH | `/appointments/:id` | owner (cancel) / staff |

### Patients & records
| Method | Endpoint | Access |
|---|---|---|
| GET | `/patients` | admin, physiotherapist |
| GET | `/patients/me/records` | patient |
| GET | `/patients/:id/records` | admin, physiotherapist |
| POST | `/patients/:id/records` | admin, physiotherapist |
| DELETE | `/records/:id` | admin, physiotherapist |

### Blog / Testimonials / Contact / Newsletter / Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/blog`, `/blog/:slug` | public |
| POST/PATCH/DELETE | `/blog…` | admin, physiotherapist |
| GET | `/testimonials` | public |
| POST/DELETE | `/testimonials…` | admin |
| POST | `/contact` | public |
| GET | `/contact` | admin |
| POST | `/newsletter` | public |
| GET | `/admin/users` | admin |
| PATCH | `/admin/users/:id/role` | admin |

---

## 🗄️ Database schema

Core tables: `users`, `services`, `appointments`, `patient_records`,
`blog_posts`, `testimonials`, `contact_messages`, `newsletter_subscribers`.
Enum types back roles, appointment status, and record types. `updated_at`
columns are maintained by triggers. See
[`backend/src/db/schema.sql`](backend/src/db/schema.sql).

---

## ♿ Accessibility & SEO

- Semantic landmarks, skip-to-content link, keyboard-friendly nav & carousel,
  visible focus rings, `aria-*` on interactive controls, labelled form fields.
- Per-page `<title>`, meta description, canonical, Open Graph & Twitter cards
  via `react-helmet-async`, plus JSON-LD structured data (`MedicalClinic`,
  `MedicalTherapy`, `Article`). `robots.txt` included.

---

## 🔐 Security notes

- Passwords hashed with bcrypt; JWTs signed with `JWT_SECRET`.
- `helmet` security headers, CORS allow-list, request rate limiting.
- Input validated with Zod; central error handler maps PG errors to safe responses.
- **Change `JWT_SECRET` and all seed passwords before deploying.**

---

## 🧰 Configuration reference

See `backend/.env.example` and `frontend/.env.example` for the full list of
environment variables (server, database, JWT, SMTP, SMS, Mailchimp, Google
Analytics, and seed admin credentials).

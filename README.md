# HydroSphere — Green Hydrogen Marketplace (MERN MVP)

Buyers and sellers connect through hydrogen listings: JWT auth, role-based dashboards, filters, bookmarks, and listing details.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose  
- **Auth:** bcrypt password hashing, JWT Bearer tokens  

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017/...`) or MongoDB Atlas URI

---

## Quick start (frontend ↔ backend connected)

From the **repository root** (folder that contains `backend/` and `frontend/`):

1. Create **`backend/.env`** (copy from `backend/.env.example`) with `MONGODB_URI` and `JWT_SECRET`.
2. Install everything and start **API + Vite together**:

```bash
npm run setup
cd backend && npm run seed && cd ..
npm run dev
```

- **API:** `http://localhost:<PORT>` (default `5000`, from `backend/.env`)
- **App:** `http://localhost:5173` — the UI calls **`/api/...`**; Vite **proxies** those requests to Express (reads `PORT` from `backend/.env`).

`npm run preview` (after `npm run build` in `frontend/`) also proxies `/api` the same way, as long as the backend is running.

**Production:** build the frontend with `VITE_API_URL` set to your public API URL, and set **`FRONTEND_URL`** on the server (see `backend/.env.example`).

---

## Step-by-step setup

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` from the example (Windows: `copy .env.example .env` — macOS/Linux: `cp .env.example .env`).

Required variables:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/hydrosphere`
- `JWT_SECRET` — long random string for signing tokens
- `PORT` — optional, default `5000`

The API loads **`backend/.env` by file path**, so variables work even if you start Node from a different working directory.

**Seed sample data (optional but recommended):**

```bash
npm run seed
```

This **clears** all `users`, `listings`, and `savedlistings` in that database, then inserts:

| Email | Password | Role |
|--------|----------|------|
| `buyer@hydrosphere.demo` | `password123` | buyer |
| `seller@hydrosphere.demo` | `password123` | seller |

Three listings are created; the buyer has the first listing saved.

**Start the API:**

```bash
npm run dev
```

API base: **http://localhost:5000**

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**. During dev, Vite proxies `/api` to **`http://127.0.0.1:<PORT>`**, where `<PORT>` is read from **`backend/.env`** (same as the Express server). Optional override: `VITE_API_PROXY` in `frontend/.env` (see `frontend/.env.example`).

For production builds, set `VITE_API_URL` to your API origin before `npm run build`.

---

## Project layout

```
package.json         # optional: npm run dev — starts backend + frontend
backend/
├── config/          # db.js, env.js — Mongo + dotenv path
├── models/          # User, Listing, SavedListing
├── routes/
├── controllers/
├── middleware/
├── scripts/         # seed.js
└── server.js

frontend/
└── src/
    ├── components/  # Navbar, ListingCard, FilterBar, Form, Loader, …
    ├── pages/
    ├── services/
    ├── context/
    ├── hooks/
    └── App.jsx
```

---

## REST API summary

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/register` | No | Body: `name`, `email`, `password`, `role` (`buyer` \| `seller`) |
| POST | `/api/auth/login` | No | Body: `email`, `password` |
| GET | `/api/listings` | No | Query: `q`, `location`, `hydrogenType`, `minPrice`, `maxPrice`, `seller` |
| GET | `/api/listings/:id` | Optional | With `Authorization: Bearer <jwt>`, response includes `saved: boolean` |
| POST | `/api/listings` | JWT, seller | Create listing |
| PUT | `/api/listings/:id` | JWT, seller (owner) | Update |
| DELETE | `/api/listings/:id` | JWT, seller (owner) | Deletes listing + related saves |
| GET | `/api/saved` | JWT | Saved listings (populated) |
| POST | `/api/saved` | JWT | Body: `{ "listingId": "<mongoId>" }` |
| DELETE | `/api/saved/:listingId` | JWT | Remove bookmark |

---

## Sample API testing (curl)

Replace `TOKEN` with a JWT from login/register.

**Health**

```bash
curl -s http://localhost:5000/api/health
```

**Register**

```bash
curl -s -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"secret12\",\"role\":\"buyer\"}"
```

(On macOS/Linux use single quotes around the JSON and `\` for line continuation as needed.)

**Login**

```bash
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"seller@hydrosphere.demo\",\"password\":\"password123\"}"
```

**List listings (filter)**

```bash
curl -s "http://localhost:5000/api/listings?hydrogenType=Green&minPrice=1&maxPrice=10"
```

**Create listing (seller)**

```bash
curl -s -X POST http://localhost:5000/api/listings ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"companyName\":\"Acme H2\",\"hydrogenType\":\"Green\",\"price\":5.5,\"quantity\":100,\"location\":\"Berlin\",\"description\":\"Certified green hydrogen, weekly delivery.\"}"
```

**Save listing**

```bash
curl -s -X POST http://localhost:5000/api/saved ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"listingId\":\"LISTING_MONGO_ID\"}"
```

**Get saved listings**

```bash
curl -s http://localhost:5000/api/saved -H "Authorization: Bearer TOKEN"
```

**Postman:** import the same URLs; for protected routes add header `Authorization` = `Bearer <token>`.

---

## Product rules implemented

- No AI, payments, or chat  
- Seller dashboard: own listings, edit/delete  
- Buyer dashboard: **saved listings only** (save from listing detail)  
- Listing cards on home: company, type, price, location  
- Detail page: full fields including description, quantity, `createdAt`  

---

## English / हिंदी

**English:** Follow the steps above: configure `.env`, run `npm run seed` once, start backend then frontend, log in with the demo accounts to try buyer vs seller flows.

**हिंदी:** पहले `backend` में `.env` बनाएँ, `npm run seed` से डेमो यूज़र और लिस्टिंग भरें, फिर `npm run dev` से API और फ्रंटएंड चलाएँ। खरीदार डैशबोर्ड पर केवल **सेव** की गई लिस्टिंग दिखेंगी; विक्रेता अपनी लिस्टिंग मैनेज कर सकता है।

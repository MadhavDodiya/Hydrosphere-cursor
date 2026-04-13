# Hydrosphere

## Overview / Abstract
Hydrosphere is a marketplace platform connecting buyers and sellers of hydrogen/industrial resources. It provides role-based experiences for discovery, listing management, and inquiry-driven lead generation.

## Problem Statement
Procurement and lead generation for hydrogen/industrial resources is often fragmented across unstructured directories, calls, and emails. This makes it difficult to discover suppliers, compare offerings, and track inquiries end-to-end.

## Solution
Hydrosphere centralizes listings and inquiries in a single platform with JWT authentication, buyer/seller roles, listing CRUD, and a lead (inquiry) system - plus quick contact options via WhatsApp and Email.

## Features

### Core Features
- Authentication (JWT)
- Buyer & Seller roles
- Listings (CRUD)

### Advanced Features
- Inquiry / Lead system
- Seller dashboard
- Contact options (WhatsApp, Email)

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (MongoDB + Mongoose)
- **Authentication:** JWT, bcrypt password hashing

## System Architecture
Hydrosphere follows a standard MERN flow:
- **Frontend (React + Vite)** calls REST APIs under `/api` and renders role-based UI for buyers and sellers.
- **Backend (Express)** validates JWT tokens (Bearer auth), enforces role rules, and applies business logic.
- **Database (MongoDB Atlas)** stores users, listings, saved listings (bookmarks), and inquiries (leads).

```
Browser (React/Vite)
  -> HTTP requests to /api (Axios)
     -> Express routes + middleware (JWT + roles)
        -> MongoDB Atlas (Mongoose models)
```

Local dev uses a **Vite proxy**: the frontend calls `/api/...` and Vite forwards requests to the Express server using `PORT` from `backend/.env` (optional override via `VITE_API_PROXY` in `frontend/.env`).

## Database Design
Hydrosphere uses MongoDB collections via Mongoose.

### Users collection (`users`)
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required; stored as bcrypt hash)
- `role` (String, required; `buyer` | `seller`)
- `companyName` (String, optional)
- `phone` (String, optional)
- `isVerified` (Boolean, default: `false`)
- `createdAt`, `updatedAt` (timestamps)

### Listings collection (`listings`)
- `seller` (ObjectId -> `users`, required)
- `companyName` (String, required)
- `hydrogenType` (String, required; `Green` | `Blue` | `Grey`)
- `price` (Number, required)
- `quantity` (Number, required)
- `location` (String, required)
- `description` (String)
- `createdAt`, `updatedAt` (timestamps)

### Inquiries collection (`inquiries`)
- `buyerId` (ObjectId -> `users`, required)
- `sellerId` (ObjectId -> `users`, required)
- `listingId` (ObjectId -> `listings`, required)
- `name` (String, required)
- `email` (String, required)
- `phone` (String, required)
- `message` (String, required)
- `createdAt`, `updatedAt` (timestamps)

## Installation & Setup

### Clone repository
```bash
git clone https://github.com/MadhavDodiya/Hydrosphere-cursor.git
cd Hydrosphere-cursor
```

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017/...`) or MongoDB Atlas URI

---

### Quick start (frontend <-> backend connected)

From the **repository root** (folder that contains `backend/` and `frontend/`):

1. Create **`backend/.env`** (copy from `backend/.env.example`) with `MONGODB_URI` and `JWT_SECRET`.
2. Install everything and start **API + Vite together**:

```bash
npm run setup
cd backend && npm run seed && cd ..
npm run dev
```

- **API:** `http://localhost:<PORT>` (default `5000`, from `backend/.env`)
- **App:** `http://localhost:5173` - the UI calls **`/api/...`**; Vite **proxies** those requests to Express (reads `PORT` from `backend/.env`).

`npm run preview` (after `npm run build` in `frontend/`) also proxies `/api` the same way, as long as the backend is running.

**Production:** build the frontend with `VITE_API_URL` set to your public API URL, and set **`FRONTEND_URL`** on the server (see `backend/.env.example`).

---

### Step-by-step setup

#### Backend

```bash
cd backend
npm install
```

Create `.env` from the example (Windows: `copy .env.example .env` - macOS/Linux: `cp .env.example .env`).

Required variables:

- `MONGODB_URI` - e.g. `mongodb://127.0.0.1:27017/hydrosphere`
- `JWT_SECRET` - long random string for signing tokens
- `PORT` - optional, default `5000`

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

#### Frontend

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
package.json         # optional: npm run dev - starts backend + frontend
backend/
|-- config/          # db.js, env.js - Mongo + dotenv path
|-- models/          # User, Listing, SavedListing
|-- routes/
|-- controllers/
|-- middleware/
|-- scripts/         # seed.js
`-- server.js

frontend/
`-- src/
    |-- components/  # Navbar, ListingCard, FilterBar, Form, Loader, ...
    |-- pages/
    |-- services/
    |-- context/
    |-- hooks/
    `-- App.jsx
```

---

## API Endpoints (Important)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/register` | No | Body: `name`, `email`, `password`, `role` (`buyer` \| `seller`) |
| POST | `/api/auth/login` | No | Body: `email`, `password` |
| GET | `/api/users/me` | JWT | Get current user profile |
| PUT | `/api/users/me` | JWT | Update profile fields |
| GET | `/api/listings` | No | Query: `q`, `location`, `hydrogenType`, `minPrice`, `maxPrice`, `seller` |
| GET | `/api/listings/:id` | Optional | With `Authorization: Bearer <jwt>`, response includes `saved: boolean` |
| POST | `/api/listings` | JWT, seller | Create listing |
| PUT | `/api/listings/:id` | JWT, seller (owner) | Update |
| DELETE | `/api/listings/:id` | JWT, seller (owner) | Deletes listing + related saves |
| POST | `/api/inquiries` | JWT | Create inquiry (lead) for a listing |
| GET | `/api/inquiries/seller` | JWT, seller | Inquiries received for seller listings |
| GET | `/api/inquiries/buyer` | JWT, buyer | Inquiries sent by buyer |
| GET | `/api/saved` | JWT | Saved listings (populated) |
| POST | `/api/saved` | JWT | Body: `{ "listingId": "<mongoId>" }` |
| DELETE | `/api/saved/:listingId` | JWT | Remove bookmark |
| GET | `/api/health` | No | Health check |

## Usage / Workflow
1. **Register/Login:** create an account as a buyer or seller and log in.
2. **Seller:** create a listing from the dashboard (company, type, price, quantity, location, description).
3. **Buyer:** browse listings, open a listing detail page, and send an inquiry (lead).
4. **Seller:** view received inquiries in the dashboard and follow up via WhatsApp/Email.

## Screenshots
> Add screenshots to `screenshots/` and update the links below.

- Login / Register: `screenshots/auth.png`
- Listings: `screenshots/listings.png`
- Listing detail: `screenshots/listing-detail.png`
- Seller dashboard: `screenshots/seller-dashboard.png`
- Inquiries: `screenshots/inquiries.png`

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

## Advantages
- Centralized discovery for hydrogen listings and suppliers
- Role-based buyer/seller workflows for clarity and security
- Inquiry-driven lead generation with dashboard visibility
- Simple MERN architecture that scales from MVP to production

## Limitations
- No built-in payments/escrow workflow (discovery + lead generation focus)
- Verification/moderation is basic unless extended
- No real-time chat/notifications by default

## Future Scope
- Admin panel (verification, moderation, reporting)
- Advanced search and ranking (facets, geo-based discovery)
- Notifications (email/WhatsApp/SMS, in-app alerts)
- Analytics for sellers (views, inquiries, conversion)
- File uploads (certificates, specs, compliance docs)

## Conclusion
Hydrosphere provides a clean marketplace experience for hydrogen/industrial resources by combining listings, role-based access, and an inquiry (lead) system in a modern MERN stack.

## Author
- Name: Madhav Dodiya
- GitHub: [MadhavDodiya](https://github.com/MadhavDodiya)

---

## Product rules implemented

- No AI, payments, or chat  
- Seller dashboard: own listings, edit/delete  
- Buyer dashboard: **saved listings only** (save from listing detail)  
- Listing cards on home: company, type, price, location  
- Detail page: full fields including description, quantity, `createdAt`  

---

## Notes
- Configure `backend/.env` from `backend/.env.example` before starting.
- Run `npm run seed` once to load demo accounts and sample listings (optional).

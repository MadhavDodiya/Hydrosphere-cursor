# HydroSphere

## Overview
HydroSphere is a MERN B2B marketplace connecting buyers and sellers of hydrogen supply. It supports listings, saved/favorites, inquiry-based lead generation, supplier dashboards, admin moderation, and subscription monetization for suppliers.

## Key Features
- Auth: JWT (Bearer) with role-based access control (buyer/seller/admin)
- Marketplace: search + filters + sorting + pagination
- Seller: listing CRUD, "My Listings", leads dashboard, lead status (new/contacted/closed)
- Buyer: saved listings, inquiry threads, inquiry dashboard
- SaaS: plan-based limits (listings + monthly leads) with Stripe subscriptions
- Realtime (optional): Socket.IO updates for inquiry creation/replies

## Tech Stack
- Frontend: React (Vite), Axios, React Router, Bootstrap + Tailwind utilities
- Backend: Node.js, Express, Mongoose
- Security: helmet, express-rate-limit, request validation (Zod), input sanitization (express-mongo-sanitize)
- Billing: Stripe Subscriptions
- Realtime: Socket.IO (optional)

## Project Structure
backend/
- middleware/ (auth, role, validate, upload)
- controllers/
- models/
- routes/
- utils/

frontend/
- api/ (axiosInstance, socket)
- services/
- components/
- pages/
- hooks/

## Local Setup
Prereqs:
- Node.js 18+
- MongoDB (local) or MongoDB Atlas

1) Configure backend env
`backend/.env` (copy `backend/.env.example`)

2) Install dependencies
`npm run setup`

3) (Optional) Seed sample data
`cd backend && npm run seed`

4) Start dev
`npm run dev`

Local dev uses a Vite proxy: the frontend calls `/api/*` and Vite forwards to the Express server using `PORT` from `backend/.env`.

## SaaS Plans (Supplier Monetization)
Supplier accounts have plan-based limits enforced by the API:
- `free`: limited listings + limited leads/month
- `pro_supplier`: higher listings + unlimited leads
- `enterprise`: unlimited listings + unlimited leads

Enforcement points:
- Listing creation blocks when the seller listing limit is reached.
- Inquiry creation blocks when the target seller's monthly lead cap is reached.

## Stripe Setup (Subscriptions)
1) Create 2 recurring prices in Stripe:
- Pro Supplier
- Enterprise

2) Set these in `backend/.env`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_SUPPLIER`
- `STRIPE_PRICE_ENTERPRISE`

3) Configure Stripe webhook endpoint:
- `POST /api/billing/webhook`

4) In the app (seller):
- Dashboard -> Billing -> Upgrade / Manage Billing

## Realtime (Socket.IO)
The API exposes Socket.IO on the same server port. Frontend connects using the stored JWT and receives:
- `inquiry:created` (seller notifications)
- `inquiry:updated` (replies/status changes)

Frontend env (optional):
- `frontend/.env`: `VITE_SOCKET_URL` (defaults to `VITE_API_URL`, then `http://localhost:5000`)

## API Endpoints (Core)
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Users:
- `GET /api/users/me` (JWT)
- `PUT /api/users/me` (JWT)

Listings:
- `GET /api/listings?page=1&limit=12` (public, approved only)
- `GET /api/listings/:id` (optional JWT to enrich saved status)
- `GET /api/listings/my-listings?page=1&limit=25` (seller only, all statuses)
- `POST /api/listings` (seller only)
- `PUT /api/listings/:id` (seller only, owner)
- `DELETE /api/listings/:id` (seller only, owner)

Saved (Favorites):
- `GET /api/saved` (JWT)
- `POST /api/saved` (JWT)
- `DELETE /api/saved/:listingId` (JWT)

Inquiries (Leads):
- `POST /api/inquiries` (buyer only, duplicate-protected)
- `GET /api/inquiries/received?page=1&limit=25` (seller only, populates `listingId` + `buyerId`)
- `GET /api/inquiries/buyer?page=1&limit=25` (buyer only)
- `POST /api/inquiries/:id/reply` (buyer/seller, ownership enforced)
- `PUT /api/inquiries/:id/status` (seller only)

Billing (Stripe):
- `GET /api/billing/plans`
- `GET /api/billing/me` (JWT)
- `POST /api/billing/checkout` (seller only)
- `POST /api/billing/portal` (seller only)
- `POST /api/billing/webhook` (Stripe)

Admin:
- `GET /api/admin/*` (admin only; users/listings/inquiries/contacts moderation)

Health:
- `GET /api/health`

## Production Notes
- Set `NODE_ENV=production` and `FRONTEND_URL` (comma-separated allowlist) in `backend/.env`.
- Use HTTPS in production (Stripe + secure cookies/origins).
- Run MongoDB with proper indexes (inquiries enforce unique `{ listingId, buyerId }`).


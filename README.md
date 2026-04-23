# HydroSphere

## Overview
HydroSphere is a modern MERN-stack B2B SaaS marketplace connecting buyers and sellers of hydrogen supply. It supports robust product listings, saved/favorites features, inquiry-based lead generation, role-based dashboards, admin moderation, and subscription monetization for suppliers.

## Key Features
- **Auth & Security**: JWT (Bearer + HTTP-only cookies via `withCredentials`), role-based access control (Buyer/Seller/Admin), and Helmet/Rate-Limiting/CORS middleware.
- **Marketplace**: Search, filters, sorting, pagination, and detailed responsive listing pages.
- **Seller Workflows**: Listing CRUD, "My Listings" management, leads dashboard, supplier approval systems (pending/approved statuses), and listing status tracking.
- **Buyer Workflows**: Saved listings (favorites), inquiry threads, and a dedicated buyer dashboard.
- **Admin Moderation**: Comprehensive admin dashboard for managing users, promoting roles, moderating listings, and handling system inquiries.
- **SaaS Monetization**: Plan-based limits (listings + monthly leads) utilizing Stripe Subscriptions.
- **Media & Communications**: Cloudinary integration for secure image uploads and SMTP-based email notifications for contact forms.
- **Realtime (Optional)**: Socket.IO updates for inquiry creation and replies.

## Tech Stack
- **Frontend**: React 19 (Vite), Axios, React Router, Bootstrap + Tailwind utilities.
- **Backend**: Node.js, Express, Mongoose.
- **Security**: Helmet, express-rate-limit, request validation (Zod), input sanitization (express-mongo-sanitize), secure CORS.
- **Billing**: Stripe Subscriptions.
- **Media/Emails**: Cloudinary (Image Hosting), Nodemailer (SMTP).
- **Realtime**: Socket.IO (optional).

## Project Structure
backend/
- middleware/ (auth, role, validate, upload, security)
- controllers/
- models/
- routes/
- utils/ (email, emailTemplates)

frontend/
- api/ (axiosInstance, socket)
- services/
- components/ (UI, Dashboard, Forms)
- pages/
- hooks/

## Local Setup
Prerequisites:
- Node.js 18+
- MongoDB (local) or MongoDB Atlas

1) Configure backend env
`backend/.env` (copy `backend/.env.example`)

2) Install dependencies
`npm run setup`

3) (Optional) Seed sample data
`cd backend && npm run seed`

4) Start dev servers
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

## 3rd-Party Service Setup

### 1) Stripe (Subscriptions)
Set these in `backend/.env`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_SUPPLIER`
- `STRIPE_PRICE_ENTERPRISE`

Configure Stripe webhook endpoint: `POST /api/billing/webhook`.

### 2) Cloudinary (Image Uploads)
Used for listing images and avatars. Set in `backend/.env`:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3) Email / SMTP (Contact Forms)
Used for automated email notifications. Set in `backend/.env`:
- `EMAIL_SERVICE` (e.g., `gmail`)
- `SMTP_USER`
- `SMTP_PASS` (App password if using Gmail)

## API Endpoints (Core)
Auth & Users:
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/users/me`, `PUT /api/users/me`

Listings:
- `GET /api/listings` (Public, approved only)
- `GET /api/listings/:id`
- `GET /api/listings/my-listings` (Seller only)
- `POST /api/listings`, `PUT /api/listings/:id`, `DELETE /api/listings/:id` (Seller only)

Saved (Favorites):
- `GET /api/saved`, `POST /api/saved`, `DELETE /api/saved/:listingId`

Inquiries (Leads):
- `POST /api/inquiries` (Buyer only)
- `GET /api/inquiries/received` (Seller only)
- `GET /api/inquiries/buyer` (Buyer only)
- `POST /api/inquiries/:id/reply`, `PUT /api/inquiries/:id/status`

Billing (Stripe):
- `GET /api/billing/plans`, `GET /api/billing/me`
- `POST /api/billing/checkout`, `POST /api/billing/portal`, `POST /api/billing/webhook`

Admin:
- `GET /api/admin/*` (Users/listings/inquiries/contacts moderation, User promotion)

## Production Notes
- Set `NODE_ENV=production` and `FRONTEND_URL` (comma-separated allowlist) in `backend/.env`.
- Use HTTPS in production (Stripe + secure cookies/origins).
- Run MongoDB with proper indexes (inquiries enforce unique `{ listingId, buyerId }`).


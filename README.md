# HydroSphere

## Overview
HydroSphere is a modern MERN-stack B2B SaaS marketplace connecting buyers and suppliers of hydrogen supply. It supports robust product listings, saved/favorites features, inquiry-based lead generation, role-based dashboards, admin moderation, and subscription monetization for suppliers.

## Key Features
- **Auth & Security**: JWT (Bearer + HTTP-only cookies via `withCredentials`), role-based access control (Buyer/Supplier/Admin), and Helmet/Rate-Limiting/CORS middleware.
- **Marketplace**: Search, filters, sorting, pagination, and detailed responsive listing pages.
- **Supplier Workflows**: Listing CRUD, "My Listings" management, leads dashboard, supplier approval systems (pending/approved statuses), and listing status tracking.
- **Buyer Workflows**: Saved listings (favorites), inquiry threads, and a dedicated buyer dashboard.
- **Admin Moderation**: Comprehensive admin dashboard for managing users, promoting roles, moderating listings, and handling system inquiries.
- **SaaS Monetization**: Plan-based limits (listings + monthly leads) utilizing Stripe Payments with 18% GST logic.
- **Media & Communications**: Cloudinary integration for secure image uploads and SMTP-based email notifications.
- **Realtime**: Socket.IO updates for inquiry creation and replies.

## Tech Stack
- **Frontend**: React 19 (Vite), Axios, React Router, Bootstrap + Tailwind utilities.
- **Backend**: Node.js, Express, Mongoose.
- **Security**: Helmet, express-rate-limit, request validation (Zod), input sanitization (express-mongo-sanitize), secure CORS.
- **Billing**: Stripe (with GST calculation).
- **Media/Emails**: Cloudinary (Image Hosting), Nodemailer (SMTP).
- **Realtime**: Socket.IO.

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
- `Basic`: ₹1180 (₹1000 + 18% GST)
- `Pro`: ₹5900 (₹5000 + 18% GST)
- `Enterprise`: ₹17700 (₹15000 + 18% GST)

Enforcement points:
- Listing creation blocks when the supplier listing limit is reached.
- Inquiry creation blocks when the target supplier's monthly lead cap is reached.

## 3rd-Party Service Setup

### 1) Stripe (Payments & Billing)
The platform uses Stripe for supplier subscriptions.
Set these in `backend/.env`:
- `STRIPE_SECRET_KEY`: Your Stripe Secret Key.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe Webhook Signing Secret.

**How it works:**
1. **Session Creation**: Frontend calls `POST /api/billing/create-checkout-session` with a `planId`. The backend creates a Stripe Checkout Session and returns the `url`.
2. **Checkout**: The user is redirected to Stripe's hosted checkout page.
3. **Webhook**: Upon success, Stripe sends a `checkout.session.completed` event to `/api/billing/webhook`. The backend verifies the signature and upgrades the user's plan.

### 2) Cloudinary (Media Hosting)
Used for listing images and user profile pictures. Set in `backend/.env`:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3) Email / SMTP (Notifications)
Standard SMTP configuration for inquiries and auth emails. Set in `backend/.env`:
- `EMAIL_SERVICE`: e.g., `gmail`
- `SMTP_USER`: Your email address
- `SMTP_PASS`: Your App Password (required for Gmail)

---

## API Endpoints (Core)
Auth & Users:
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/users/me`, `PUT /api/users/me`

Listings:
- `GET /api/listings` (Public, approved only)
- `GET /api/listings/:id`
- `GET /api/listings/my-listings` (Supplier only)
- `POST /api/listings`, `PUT /api/listings/:id`, `DELETE /api/listings/:id` (Supplier only)

Saved (Favorites):
- `GET /api/saved`, `POST /api/saved`, `DELETE /api/saved/:listingId`

Inquiries (Leads):
- `POST /api/inquiries` (Buyer only)
- `GET /api/inquiries/supplier` (Supplier only)
- `GET /api/inquiries/buyer` (Buyer only)
- `POST /api/inquiries/:id/reply`, `PUT /api/inquiries/:id/status`

Billing (Stripe):
- `GET /api/billing/plans`: Returns available plans and prices (with GST)
- `GET /api/billing/me`: Returns current subscription status
- `POST /api/billing/create-checkout-session`: Generates a Stripe Checkout Session

Admin:
- `GET /api/admin/stats`: Platform overview
- `GET /api/admin/users`: User management
- `PUT /api/admin/users/:id/approve`: Approve supplier
- `PUT /api/admin/users/:id/verify`: Grant Verified Badge
- `GET /api/admin/listings`: Listing moderation

## Production Deployment
For detailed instructions on moving to a live environment (Atlas, Cloudinary, Stripe Live, SSL/TLS), please refer to our **[Production Checklist](./PRODUCTION_CHECKLIST.md)**.

### Core Production Requirements:
- Set `NODE_ENV=production` to enable secure cookie handling and strict CORS.
- Configure `FRONTEND_URL` in `backend/.env` with your actual domain (e.g., `https://yourdomain.com`).
- Use HTTPS for both frontend and backend to ensure JWT security and Stripe compliance.
- Run MongoDB with proper indexes; ensure Atlas Network Access allows your production server IP.

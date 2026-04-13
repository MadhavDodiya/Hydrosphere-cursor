# Hydrosphere

## Overview / Abstract
Hydrosphere is a professional B2B marketplace platform connecting buyers and sellers of hydrogen and industrial resources. It provides a cinematically designed, role-based experience for product discovery, listing management, and inquiry-driven lead generation.

## Problem Statement
Procurement and lead generation for hydrogen/industrial resources is often fragmented across unstructured directories, calls, and emails. This makes it difficult to discover suppliers, compare offerings, and track inquiries end-to-end.

## Solution
Hydrosphere centralizes listings and inquiries in a single platform with JWT authentication, three distinct roles (Admin, Buyer, Seller), safe listing management, and a robust lead (inquiry) system—plus premium dashboards for real-time monitoring.

## Features

### Core Features
- **Secure Authentication**: JWT-based login and registration with bcrypt hashing.
- **Role-Based Experience**: Tailored interfaces for Buyers, Sellers, and Platform Admins.
- **Marketplace Discovery**: Advanced filtering by hydrogen type, price range, and location.
- **Listings Management**: Full CRUD for sellers (create, read, update, delete) with admin moderation.

### Advanced Features
- **Admin Panel**: Comprehensive oversight with user management, listing verification, inquiry monitoring, and platform-wide analytics.
- **Inquiry / Lead System**: Direct communication channel between buyers and sellers with persistent storage.
- **Seller Dashboard**: Real-time sales stats (Total Leads, Active Listings, New Leads Today) and inquiry management.
- **Persistent Bookmarks**: Buyers can save listings to their collection for later review.
- **Contact Integration**: Public contact form with admin response tracking.

## Tech Stack
- **Frontend:** React (Vite 6), Vanilla CSS (Modern UI/UX), Axios, React Router 7
- **Backend:** Node.js, Express 4
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs

## System Architecture
Hydrosphere follows a standard MERN flow:
- **Frontend (React + Vite)** calls REST APIs under `/api` and renders role-based UI.
- **Backend (Express)** validates JWT tokens (Bearer auth), enforces role rules, and applies business logic.
- **Database (MongoDB Atlas)** stores users, listings, saved listings (bookmarks), inquiries (leads), and contact messages.

```
Browser (React/Vite)
  -> HTTP requests to /api (Axios)
     -> Express routes + middleware (JWT + roles)
        -> MongoDB Atlas (Mongoose models)
```

Local dev uses a **Vite proxy**: the frontend calls `/api/...` and Vite forwards requests to the Express server using `PORT` from `backend/.env`.

## Database Design
Hydrosphere uses MongoDB collections via Mongoose.

### Users collection (`users`)
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required; stored as bcrypt hash)
- `role` (String, required; `buyer` | `seller` | `admin`)
- `companyName` (String, optional)
- `phone` (String, optional)
- `isVerified` (Boolean, default: `false`)
- `isSuspended` (Boolean, default: `false`)

### Listings collection (`listings`)
- `seller` (ObjectId -> `users`, required)
- `companyName` (String, required)
- `hydrogenType` (String, enum: `Green` | `Blue` | `Grey`)
- `price` (Number, required)
- `quantity` (Number, required)
- `location` (String, required)
- `description` (String, required)
- `status` (String, enum: `pending` | `approved` | `rejected`)
- `isFeatured` (Boolean, default: `false`)

### Inquiries collection (`inquiries`)
- `buyerId` (ObjectId -> `users`, required)
- `sellerId` (ObjectId -> `users`, required)
- `listingId` (ObjectId -> `listings`, required)
- `name`, `email`, `phone`, `message` (Strings)
- `isFlagged` (Boolean, for admin monitoring)

### Contacts collection (`contacts`)
- `name`, `email`, `phone`, `subject`, `message` (Strings)
- `isResponded` (Boolean, default: `false`)

## Installation & Setup

### Clone repository
```bash
git clone https://github.com/MadhavDodiya/Hydrosphere-cursor.git
cd Hydrosphere-cursor
```

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### Quick Start
1. Create **`backend/.env`** (copy from `backend/.env.example`).
2. Install dependencies & Seed data:
```bash
npm run setup
cd backend && npm run seed && cd ..
```
3. Create an Admin account (optional):
```bash
node backend/scripts/makeAdmin.js your-email@example.com
```
4. Start development:
```bash
npm run dev
```

## API Endpoints

### Auth & Users
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/me` (JWT)

### Marketplace
- `GET /api/listings` (Public, only Approved)
- `GET /api/listings/:id` (Optional JWT for saved status)
- `POST /api/listings` (Seller only)
- `PUT /api/listings/:id` (Seller only, Owner)
- `DELETE /api/listings/:id` (Seller only, Owner)

### Leads & Inquiries
- `POST /api/inquiries` (Buyer only)
- `GET /api/inquiries/seller` (Seller only)
- `GET /api/inquiries/buyer` (Buyer only)

### Admin Panel
- `GET /api/admin/stats` (Admin only)
- `GET /api/admin/users?role=...&q=...` (Admin only)
- `PUT /api/admin/users/:id/verify` (Verify seller)
- `PUT /api/admin/listings/:id/approve` (Approve listing)
- `GET /api/admin/contacts` (View platform messages)

### Seller Features
- `GET /api/seller/stats` (Seller only)

## Usage / Workflow
1. **Explore**: Browse listings with the "Cinematic" UI without logging in.
2. **Engage**: Register as a **Buyer** to "Save" listings or send direct Inquiries ("Request Quote").
3. **Sell**: Register as a **Seller**, create listings, and wait for Admin verification/approval.
4. **Manage**: Use the **Admin Panel** to moderate content, verify sellers, and analyze growth.

## Advantages
- **Security**: Strict role-based access control (RBAC).
- **Design**: Premium "WOW" aesthetics with modern CSS (glassmorphism, animations).
- **Control**: Admin oversight prevents spam and ensures quality listings.
- **Insights**: Dashboard analytics for both Sellers and Admins.

## Future Scope
- **Instant Chat**: Real-time WebSocket-based communication between users.
- **Escrow Integration**: Milestone-based payment processing for large industrial orders.
- **Advanced Analytics**: Deeper conversion tracking and market share heatmaps.
- **File Management**: S3 integration for certificates and technical specification docs.

## Author
- Name: Madhav Dodiya
- GitHub: [MadhavDodiya](https://github.com/MadhavDodiya)

---
*Developed with ❤️ as a modern B2B solution for the Green Hydrogen Economy.*

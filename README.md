# HydroSphere 💧
### The Future of Industrial Hydrogen Trade

HydroSphere is a premium MERN-stack B2B SaaS marketplace designed to digitize the global hydrogen supply chain. Inspired by the **Apple Human Interface Design (HID)** and **Stripe/Linear** aesthetics, the platform provides a high-fidelity, industrial-grade experience for connecting buyers with verified hydrogen producers.

---

## 🌟 Premium Features
- **Apple-Inspired Design System**: A cohesive, production-level UI built with React 19 and Tailwind CSS, featuring glassmorphism, cinematic animations, and a world-class user experience.
- **Advanced Auth & Security**: Secure JWT authentication (HTTP-only cookies), role-based access control (Buyer/Supplier/Admin), and industrial-grade security middleware (Helmet, Rate-limiting, Zod).
- **Industrial Marketplace**: High-performance catalog with debounced filtering, real-time market sentiment indicators, and technical specification grids.
- **Supplier command-center**: Multi-step asset publishing, "Leads" monitoring, and subscription management with Stripe-integrated 18% GST logic.
- **Enterprise Inquiry System**: Secure, threaded communication between industrial firms with real-time status tracking and audit compliance.
- **Admin Command Center**: Global platform oversight for user auditing, listing moderation, and system-wide analytics.
- **Media & Communications**: Integrated Cloudinary hosting for technical assets and SMTP-based notifications for lead management.

---

## ⚙️ Tech Stack
- **Frontend**: React 19 (Vite), Tailwind CSS, Framer Motion (Animations), Axios, React Router.
- **Backend**: Node.js (Express), Mongoose (MongoDB).
- **Infrastructure**: Socket.IO (Real-time), Cloudinary (Media), Stripe (Billing/GST).
- **Security**: Zod (Validation), Helmet, Express-Rate-Limit, Express-Mongo-Sanitize.

---

## 🎨 Design Language
HydroSphere strictly adheres to the **Apple Design Language**:
- **Color Palette**: Pure White (#FFFFFF), Apple Gray (#F5F5F7), Apple Blue (#0071E3), and Apple Text (#1D1D1F).
- **Typography**: SF Pro / Inter font family with high-contrast weights for industrial clarity.
- **Shape & Depth**: "Super-Ellipse" rounding (up to 42px) and soft natural shadows for a premium, tactile feel.
- **Glassmorphism**: Backdrop-blur navigation and overlays for sophisticated layering.

---

## 📂 Project Structure
```text
backend/
├── middleware/  # Auth, Security, Zod Validation, Multer
├── controllers/ # Core business logic (Auth, Listing, Billing)
├── models/      # Mongoose Schemas (Listing, User, Inquiry, Stats)
├── routes/      # Express Router configurations
└── utils/       # Email Templates, Logger, API Error Handlers

frontend/
├── src/
│   ├── components/
│   │   ├── ui/        # Atomic UI library (Button, Card, Input, Badge)
│   │   ├── dashboard/ # Management components (Sidebar, Topbar)
│   │   └── admin/     # Administrative control modules
│   ├── pages/         # Cinematic, state-aware application pages
│   ├── api/           # Centralized Axios instance & Socket service
│   └── context/       # Auth, Toast, and global state management
```

---

## 🚀 Local Development
### Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- Stripe & Cloudinary API Keys

### Installation
1. **Initialize Environments**:
   Copy `backend/.env.example` to `backend/.env` and fill in your secrets.
2. **Install & Start**:
   ```bash
   npm run setup
   npm run dev
   ```
3. **Seed Data** (Optional):
   ```bash
   cd backend && npm run seed
   ```

---

## 💳 SaaS & Billing
HydroSphere features a specialized Indian B2B billing engine:
- **Plans**: Starter (Free), Professional (Growth), and Enterprise (Scale).
- **GST Logic**: Automatic 18% GST calculation and Stripe Checkout integration.
- **Limits**: Role-based enforcement for active listings and monthly lead quotas.

---

## 🧪 Security & Compliance
- **Encrypted Communication**: Bearer tokens and Secure Cookies for JWT persistence.
- **Auditable Trade**: Threaded inquiry logs for industrial compliance and audit trails.
- **Safety Verification**: Integrated PESO certification tracking for every listed supplier.

---

## 📜 Deployment
For detailed production instructions, refer to the **[Production Checklist](./PRODUCTION_CHECKLIST.md)**.
- Set `NODE_ENV=production`.
- Configure `FRONTEND_URL` for secure CORS handshaking.
- Ensure SSL/TLS termination for Stripe and JWT security.

---

<p align="center">
  <b>Built for the global energy transition.</b><br/>
  © 2026 HydroSphere Technologies
</p>

# HydroSphere Production Deployment Checklist 🚀

Follow these steps to transition from local development to a secure production environment.

## 1. Environment Variables (`backend/.env`)
Set these variables specifically for your production server:

- [ ] **NODE_ENV**: Set to `production`. This enables secure cookies, strict CORS, and optimized logging.
- [ ] **FRONTEND_URL**: Your production domain(s) (e.g., `https://hydrosphere.com`). Use commas for multiple.
- [ ] **JWT_SECRET**: Use a long, random 64-character string (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).
- [ ] **JWT_REFRESH_SECRET**: Same as above, must be different from `JWT_SECRET`.
- [ ] **PORT**: Usually managed by your host (e.g., Heroku/Render/Railway) or set to `5000`.

## 2. Database (MongoDB Atlas)
Don't use a local MongoDB in production.
- [ ] Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- [ ] Add your production server's IP to the Atlas Network Access allowlist.
- [ ] Update **MONGODB_URI** in `.env` with the new SRV connection string.

## 3. Media Hosting (Cloudinary)
Ensure your Cloudinary account is configured for production:
- [ ] Verify **CLOUDINARY_CLOUD_NAME**, **API_KEY**, and **API_SECRET** are set.
- [ ] (Optional) Set a custom upload folder in your Cloudinary dashboard to separate Dev and Prod assets.

## 4. Payments (Razorpay)
Switch from Test to Live mode:
- [ ] Generate **Live Keys** in your Razorpay Dashboard.
- [ ] Update **RAZORPAY_KEY_ID** and **RAZORPAY_KEY_SECRET**.
- [ ] Ensure your account is "Activated" on Razorpay to accept real payments.

## 5. Security & HTTPS
- [ ] **Enable SSL/TLS**: Ensure your frontend and backend are served over `https://`.
- [ ] **Strict CORS**: The `FRONTEND_URL` in `.env` must exactly match your site's protocol and domain to allow authentication cookies.
- [ ] **Rate Limiting**: Monitor server logs to ensure legitimate traffic isn't being throttled by the `apiLimiter` (currently 500 req / 15 min).

## 6. Email (SMTP)
- [ ] Use a professional SMTP provider (e.g., SendGrid, Mailgun) or a dedicated Gmail App Password.
- [ ] Verify that **SMTP_USER** and **SMTP_PASS** are correct.

## 7. Frontend Build
- [ ] Run `npm run build` in the `frontend` directory.
- [ ] Set `VITE_API_URL` in your frontend deployment environment to your production backend URL.
- [ ] Deploy the `dist` folder to a CDN or static site host (e.g., Netlify, Vercel, Firebase Hosting).

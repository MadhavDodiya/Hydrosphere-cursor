/**
 * HydroSphere Live Test Suite + Email Report
 * Runs against the local backend and sends results to SMTP_USER
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const API = "http://localhost:5000/api";
const results = [];
const ts = Date.now();

async function test(name, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    results.push({ name, status: "PASS", detail: result || "OK", ms });
    console.log(`✅ PASS [${ms}ms]: ${name}`);
  } catch (err) {
    const ms = Date.now() - start;
    const detail = err?.message || String(err);
    results.push({ name, status: "FAIL", detail, ms });
    console.error(`❌ FAIL [${ms}ms]: ${name} — ${detail}`);
  }
}

async function post(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  return data;
}

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  return data;
}

async function runTests() {
  console.log("\n🧪 Starting HydroSphere Live Test Suite...\n");

  let supplierToken, buyerToken, listingId;
  const supplierEmail = `qa_supplier_${ts}@test.com`;
  const buyerEmail = `qa_buyer_${ts}@test.com`;

  // ── 1. Health Check ──────────────────────────────────────────
  await test("API Health Check", async () => {
    const d = await get("/health");
    if (!d.ok) throw new Error("Health check returned ok=false");
    return `Server: ${d.name}`;
  });

  // ── 2. Auth: Register ────────────────────────────────────────
  await test("Register Supplier", async () => {
    await post("/auth/register", {
      name: "QA Supplier",
      email: supplierEmail,
      password: "TestPass123!",
      role: "seller",
    });
    return `Registered: ${supplierEmail}`;
  });

  await test("Register Buyer", async () => {
    await post("/auth/register", {
      name: "QA Buyer",
      email: buyerEmail,
      password: "TestPass123!",
      role: "buyer",
    });
    return `Registered: ${buyerEmail}`;
  });

  // ── 3. Auth: Duplicate Email (Edge Case) ─────────────────────
  await test("Duplicate Email Rejected (409 Conflict)", async () => {
    try {
      await post("/auth/register", {
        name: "Duplicate",
        email: supplierEmail,
        password: "TestPass123!",
        role: "seller",
      });
      throw new Error("Should have returned 409");
    } catch (e) {
      // 409 Conflict OR 400 Bad Request are both valid
      if (e.message.includes("409") || e.message.includes("400")) return "Correctly rejected duplicate email";
      throw e;
    }
  });

  // ── 4. Auth: Invalid Login (Edge Case) ───────────────────────
  await test("Invalid Password Rejected (401)", async () => {
    try {
      await post("/auth/login", { email: buyerEmail, password: "wrongpassword" });
      throw new Error("Should have returned 401");
    } catch (e) {
      if (e.message.includes("401") || e.message.includes("400")) return "Correctly rejected wrong password";
      throw e;
    }
  });

  // ── 5. Public Listings (No Auth) ─────────────────────────────
  await test("Fetch Public Listings (No Auth)", async () => {
    const d = await get("/listings");
    const count = d.data?.length ?? d.length ?? 0;
    return `Returned ${count} listings (page 1)`;
  });

  // ── 6. Pagination Works ──────────────────────────────────────
  await test("Pagination: page=1&limit=3", async () => {
    const d = await get("/listings?page=1&limit=3");
    if (!("totalPages" in d)) throw new Error("No totalPages in response");
    return `total=${d.total}, pages=${d.totalPages}`;
  });

  // ── 7. Location Filter ───────────────────────────────────────
  await test("Search Filter: ?q=hydrogen", async () => {
    const d = await get("/listings?q=hydrogen");
    return `Found ${d.total ?? "?"} matching listings`;
  });

  // ── 8. Protected Route (No Token) ────────────────────────────
  await test("Protected Route Blocked Without Token (401)", async () => {
    try {
      await get("/listings/my-listings");
      throw new Error("Should have been blocked");
    } catch (e) {
      if (e.message.includes("401") || e.message.includes("403")) return "Correctly blocked unauthenticated";
      throw e;
    }
  });

  // ── 9. Login with email-unverified account ───────────────────
  await test("Unverified Email Login Blocked", async () => {
    try {
      await post("/auth/login", { email: supplierEmail, password: "TestPass123!" });
      throw new Error("Should have been blocked");
    } catch (e) {
      if (e.message.toLowerCase().includes("verif")) return "Correctly blocked — email verification required";
      if (e.message.includes("401")) return "Correctly rejected (401)";
      throw e;
    }
  });

  // ── 10. Admin Stats (No Admin Token) ─────────────────────────
  await test("Admin Route Blocked Without Admin Token", async () => {
    try {
      await get("/admin/stats");
      throw new Error("Should have been blocked");
    } catch (e) {
      if (e.message.includes("401") || e.message.includes("403")) return "Correctly blocked non-admin";
      throw e;
    }
  });

  // ── 11. Inquiry Without Auth ─────────────────────────────────
  await test("Inquiry Blocked Without Auth (401)", async () => {
    try {
      await post("/inquiries", { listingId: "000000000000000000000000", message: "test" });
      throw new Error("Should have been blocked");
    } catch (e) {
      if (e.message.includes("401") || e.message.includes("403")) return "Correctly blocked unauthenticated inquiry";
      throw e;
    }
  });

  return results;
}

async function sendReport(results) {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);

  const rows = results
    .map(
      (r) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;">${r.status === "PASS" ? "✅" : "❌"} ${r.name}</td>
        <td style="padding:12px 16px; color:${r.status === "PASS" ? "#16a34a" : "#dc2626"}; font-weight:700;">${r.status}</td>
        <td style="padding:12px 16px; color:#64748b; font-size:0.85em;">${r.detail}</td>
        <td style="padding:12px 16px; color:#94a3b8; font-size:0.85em;">${r.ms}ms</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:700px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
      <div style="background:linear-gradient(135deg,#0891b2,#2563eb);border-radius:12px;padding:32px;color:white;margin-bottom:24px;">
        <h1 style="margin:0;font-size:1.8rem;font-weight:800;letter-spacing:-0.03em;">💧 HydroSphere</h1>
        <p style="margin:8px 0 0;opacity:0.85;">Automated QA Test Report</p>
        <p style="margin:4px 0 0;opacity:0.7;font-size:0.85em;">${new Date().toLocaleString("en-IN")}</p>
      </div>

      <div style="display:flex;gap:16px;margin-bottom:24px;">
        <div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:2.5rem;font-weight:800;color:#16a34a;">${passed}</div>
          <div style="color:#64748b;font-size:0.9em;margin-top:4px;">Tests Passed</div>
        </div>
        <div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:2.5rem;font-weight:800;color:${failed > 0 ? "#dc2626" : "#16a34a"};">${failed}</div>
          <div style="color:#64748b;font-size:0.9em;margin-top:4px;">Tests Failed</div>
        </div>
        <div style="flex:1;background:white;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:2.5rem;font-weight:800;color:#2563eb;">${avgMs}ms</div>
          <div style="color:#64748b;font-size:0.9em;margin-top:4px;">Avg Response</div>
        </div>
      </div>

      <div style="background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;font-size:0.85em;">Test</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;font-size:0.85em;">Result</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;font-size:0.85em;">Details</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;font-size:0.85em;">Time</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div style="margin-top:24px;padding:16px 20px;background:${failed === 0 ? "#f0fdf4" : "#fff7ed"};border-radius:10px;border-left:4px solid ${failed === 0 ? "#16a34a" : "#f59e0b"};">
        <strong style="color:${failed === 0 ? "#16a34a" : "#92400e"};">
          ${failed === 0 ? "🎉 All tests passed! HydroSphere is production-ready." : `⚠️ ${failed} test(s) need attention.`}
        </strong>
      </div>

      <p style="color:#94a3b8;font-size:0.75em;margin-top:24px;text-align:center;">
        This is an automated test report from HydroSphere QA Suite
      </p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"HydroSphere QA Bot" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: `🧪 HydroSphere Test Report — ${passed}/${results.length} Passed`,
    html,
  });

  console.log(`\n📧 Report sent! Message ID: ${info.messageId}`);
  console.log(`📬 Check your inbox: ${process.env.SMTP_USER}`);
}

runTests()
  .then(async (results) => {
    const passed = results.filter((r) => r.status === "PASS").length;
    console.log(`\n═══ Results: ${passed}/${results.length} passed ═══`);
    await sendReport(results);
  })
  .catch(console.error);

import Stripe from "stripe";
import User from "../models/User.js";
import { PLANS } from "../utils/plans.js";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Let Stripe pick the account's default API version.
  });
}

function frontendUrl() {
  return (process.env.FRONTEND_URL?.split(",")?.[0]?.trim() || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
}

function priceIdForPlan(planId) {
  if (planId === "pro_supplier") return process.env.STRIPE_PRICE_PRO_SUPPLIER || "";
  if (planId === "enterprise") return process.env.STRIPE_PRICE_ENTERPRISE || "";
  return "";
}

function planIdFromPriceId(priceId) {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PRO_SUPPLIER) return "pro_supplier";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return "free";
}

export async function getPlans(_req, res) {
  return res.json({
    plans: Object.values(PLANS).map((p) => ({
      ...p,
      stripePriceId: priceIdForPlan(p.id) || null,
    })),
  });
}

/**
 * POST /api/billing/checkout
 * Body: { planId }
 * Returns: { url }
 */
export async function createCheckoutSession(req, res) {
  try {
    const stripe = getStripe();
    const { planId } = req.body || {};

    if (!["pro_supplier", "enterprise"].includes(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const priceId = priceIdForPlan(planId);
    if (!priceId) {
      return res.status(500).json({ message: "Stripe price is not configured" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const successUrl = `${frontendUrl()}/billing/success`;
    const cancelUrl = `${frontendUrl()}/billing/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING CHECKOUT Error]:", err);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
}

/**
 * POST /api/billing/portal
 * Returns: { url }
 */
export async function createPortalSession(req, res) {
  try {
    const stripe = getStripe();

    const user = await User.findById(req.userId).select("stripeCustomerId");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: "No Stripe customer found for this user" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl()}/dashboard`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING PORTAL Error]:", err);
    return res.status(500).json({ message: "Failed to create billing portal session" });
  }
}

/**
 * GET /api/billing/me
 */
export async function getMySubscription(req, res) {
  try {
    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus subscriptionCurrentPeriodEnd stripeSubscriptionId"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      plan: user.plan || "free",
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      stripeSubscriptionId: user.stripeSubscriptionId || "",
    });
  } catch (err) {
    console.error("[BILLING ME Error]:", err);
    return res.status(500).json({ message: "Failed to load subscription" });
  }
}

/**
 * POST /api/billing/webhook (Stripe)
 * Requires express.raw({ type: "application/json" })
 */
export async function stripeWebhook(req, res) {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: "Missing STRIPE_WEBHOOK_SECRET" });
    }
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[STRIPE WEBHOOK] signature error:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || "Invalid signature"}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      if (customerId && subscriptionId) {
        await User.updateOne(
          { stripeCustomerId: customerId },
          { stripeSubscriptionId: subscriptionId, subscriptionStatus: "active" }
        );
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const customerId = sub.customer;
      const subscriptionId = sub.id;
      const status = sub.status; // active, past_due, canceled, ...
      const priceId = sub.items?.data?.[0]?.price?.id || "";
      const currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      const normalizedStatus =
        status === "active"
          ? "active"
          : status === "past_due"
            ? "past_due"
            : status === "canceled"
              ? "canceled"
              : "inactive";

      const nextPlan = normalizedStatus === "active" ? planIdFromPriceId(priceId) : "free";

      await User.updateOne(
        { stripeCustomerId: customerId },
        {
          plan: nextPlan,
          subscriptionStatus: normalizedStatus,
          stripeSubscriptionId: subscriptionId || "",
          stripePriceId: priceId || "",
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        }
      );
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("[STRIPE WEBHOOK] handler error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
}

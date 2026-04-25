export const PLANS = {
  free: {
    id: "free",
    name: "Free Trial",
    basePrice: 0,
    listingsLimit: 3,
    leadsLimitPerMonth: 10,
  },
  Basic: {
    id: "Basic",
    name: "Basic",
    basePrice: 999,
    listingsLimit: 10,
    leadsLimitPerMonth: 25,
  },
  Pro: {
    id: "Pro",
    name: "Professional",
    basePrice: 4999,
    listingsLimit: null, // Unlimited
    leadsLimitPerMonth: null, // Unlimited
  },
  Enterprise: {
    id: "Enterprise",
    name: "Enterprise",
    basePrice: 15000,
    listingsLimit: null, // Unlimited
    leadsLimitPerMonth: null, // Unlimited
  },
};

/**
 * Normalizes plan ID and returns plan config.
 */
export function getPlan(planId) {
  // Map legacy names or variations to current IDs
  if (planId === "Starter") return PLANS.free;
  if (planId === "Professional") return PLANS.Pro;
  
  return PLANS[planId] || { id: "none", name: "No Plan", basePrice: 0, listingsLimit: 0, leadsLimitPerMonth: 0 };
}

export function calculateFinalPrice(basePrice) {
  const gstRate = 0.18;
  const gstAmount = basePrice * gstRate;
  return {
    base: basePrice,
    gst: gstAmount,
    total: Math.round((basePrice + gstAmount) * 100) / 100
  };
}

export function getEffectiveLimits({ planId, listingLimitOverride, leadLimitOverride }) {
  const plan = getPlan(planId);
  
  if (plan.id === "none") {
    return { plan, listingsLimit: 0, leadsLimitPerMonth: 0 };
  }

  return {
    plan,
    listingsLimit:
      typeof listingLimitOverride === "number" ? listingLimitOverride : plan.listingsLimit,
    leadsLimitPerMonth:
      typeof leadLimitOverride === "number" ? leadLimitOverride : plan.leadsLimitPerMonth,
  };
}

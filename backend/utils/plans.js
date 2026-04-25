export const PLANS = {
  Basic: {
    id: "Basic",
    name: "Basic",
    basePrice: 1000, // Monthly base price in INR
    listingsLimit: 10,
    leadsLimitPerMonth: 20,
  },
  Pro: {
    id: "Pro",
    name: "Pro",
    basePrice: 5000,
    listingsLimit: 50,
    leadsLimitPerMonth: null, // unlimited
  },
  Enterprise: {
    id: "Enterprise",
    name: "Enterprise",
    basePrice: 15000,
    listingsLimit: null, // unlimited
    leadsLimitPerMonth: null, // unlimited
  },
};

export function getPlan(planId) {
  return PLANS[planId] || { id: "none", name: "No Plan", basePrice: 0 };
}

export function getEffectiveLimits({ planId, listingLimitOverride, leadLimitOverride }) {
  const plan = getPlan(planId);
  return {
    plan,
    listingsLimit:
      typeof listingLimitOverride === "number" ? listingLimitOverride : (plan.listingsLimit || 0),
    leadsLimitPerMonth:
      typeof leadLimitOverride === "number" ? leadLimitOverride : (plan.leadsLimitPerMonth || 0),
  };
}

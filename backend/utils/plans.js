export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    listingsLimit: 3,
    leadsLimitPerMonth: 10,
  },
  pro_supplier: {
    id: "pro_supplier",
    name: "Pro Supplier",
    listingsLimit: 50,
    leadsLimitPerMonth: null, // unlimited
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    listingsLimit: null, // unlimited
    leadsLimitPerMonth: null, // unlimited
  },
};

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}


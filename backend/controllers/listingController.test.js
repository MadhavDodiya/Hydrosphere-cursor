import { test, describe, beforeEach, mock } from "node:test";
import assert from "node:assert";

// We'll try to just override `import()` by setting up module mocks differently
// Or we could use proxyquire/esmock if installed, but let's stick to module.mock.
// It seems `default` export is tricky with `mock.module`. Let's try passing it directly to namedExports, or maybe the syntax is slightly different.

const mockListingCountDocuments = mock.fn();
const mockListingCreate = mock.fn();

mock.module("../models/Listing.js", {
  defaultExport: {
    countDocuments: mockListingCountDocuments,
    create: mockListingCreate,
  },
  namedExports: {
    HYDROGEN_TYPES: ["Green Hydrogen", "Blue Hydrogen", "Grey Hydrogen"],
  }
});

const mockGetEffectiveLimits = mock.fn();
mock.module("../utils/plans.js", {
  namedExports: {
    getEffectiveLimits: mockGetEffectiveLimits,
  }
});

const mockClearCache = mock.fn();
mock.module("../utils/cache.js", {
  namedExports: {
    clearCache: mockClearCache,
    getCache: mock.fn(),
    setCache: mock.fn(),
  }
});

const mockTrackEvent = mock.fn();
mock.module("../services/analyticsService.js", {
  namedExports: {
    trackEvent: mockTrackEvent,
    ANALYTICS_EVENTS: { LISTING_CREATED: "LISTING_CREATED" },
  }
});

const { createListing } = await import("./listingController.js");

describe("createListing", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      userId: "test-user-id",
      role: "supplier",
      isApproved: true,
      subscriptionStatus: "active",
      plan: "Basic",
    };
    res = {
      status: mock.fn((code) => {
        res.statusCode = code;
        return res;
      }),
      json: mock.fn((data) => {
        res.body = data;
        return res;
      }),
    };

    mockListingCountDocuments.mock.resetCalls();
    mockListingCountDocuments.mock.mockImplementation(() => Promise.resolve(0));

    mockListingCreate.mock.resetCalls();
    mockListingCreate.mock.mockImplementation((data) => Promise.resolve({ _id: "listing-id", ...data }));

    mockGetEffectiveLimits.mock.resetCalls();
    mockGetEffectiveLimits.mock.mockImplementation(() => ({
      plan: { name: "Basic" },
      listingsLimit: 10,
    }));

    mockClearCache.mock.resetCalls();
    mockTrackEvent.mock.resetCalls();
  });

  test("should return 400 if required fields are missing", async () => {
    req.body = { title: "Test" };
    await createListing(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, { success: false, message: "All required fields must be provided" });
  });

  test("should return 403 if supplier is pending admin approval", async () => {
    req.body = {
      title: "Test",
      hydrogenType: "Green Hydrogen",
      price: 10,
      quantity: 100,
      location: "NY",
      description: "Test desc",
    };
    req.isApproved = false;

    await createListing(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, { success: false, message: "Your supplier account is pending admin approval." });
  });

  test("should return 403 if supplier does not have an active subscription", async () => {
    req.body = {
      title: "Test",
      hydrogenType: "Green Hydrogen",
      price: 10,
      quantity: 100,
      location: "NY",
      description: "Test desc",
    };
    req.subscriptionStatus = "expired";

    await createListing(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, { success: false, message: "An active subscription is required to post listings." });
  });

  test("should return 402 if listing limit is reached", async () => {
    req.body = {
      title: "Test",
      hydrogenType: "Green Hydrogen",
      price: 10,
      quantity: 100,
      location: "NY",
      description: "Test desc",
    };

    mockGetEffectiveLimits.mock.mockImplementation(() => ({
      plan: { name: "Basic" },
      listingsLimit: 10,
    }));
    mockListingCountDocuments.mock.mockImplementation(() => Promise.resolve(10));

    await createListing(req, res);

    assert.strictEqual(res.statusCode, 402);
    assert.deepStrictEqual(res.body, {
      success: false,
      message: "Listing limit reached for Basic plan. Please upgrade for more.",
    });
  });

  test("should return 500 if an internal error occurs", async () => {
    req.body = {
      title: "Test",
      hydrogenType: "Green Hydrogen",
      price: 10,
      quantity: 100,
      location: "NY",
      description: "Test desc",
    };

    mockListingCreate.mock.mockImplementation(() => Promise.reject(new Error("DB Error")));

    await createListing(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.body, { success: false, message: "Failed to create listing" });
  });

  test("should return 201 and create listing on success", async () => {
    req.body = {
      title: "Test",
      hydrogenType: "Green Hydrogen",
      price: 10,
      quantity: 100,
      location: "NY",
      description: "Test desc",
    };

    await createListing(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Listing created successfully");

    assert.strictEqual(mockListingCreate.mock.callCount(), 1);
    assert.strictEqual(mockClearCache.mock.callCount(), 1);
    assert.strictEqual(mockTrackEvent.mock.callCount(), 1);
  });
});

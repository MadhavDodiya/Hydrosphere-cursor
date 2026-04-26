import { test, describe, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { createInquiry } from "./inquiryController.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Inquiry from "../models/Inquiry.js";
import * as plans from "../utils/plans.js";

describe("Inquiry Controller - createInquiry Error Handling", () => {
  let req, res;
  let jsonMock, statusMock;

  beforeEach(() => {
    jsonMock = mock.fn((data) => data);
    statusMock = mock.fn((code) => ({ json: jsonMock }));

    req = {
      body: {
        listingId: new mongoose.Types.ObjectId().toString(),
        name: "Test Buyer",
        email: "buyer@example.com",
        message: "I am interested",
      },
      userId: new mongoose.Types.ObjectId().toString(),
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Global mocks
    mock.method(Listing, "findById");
    mock.method(User, "findById");
    mock.method(Inquiry, "countDocuments");
    mock.method(Inquiry, "findOne");
    mock.method(Inquiry, "create");

  });

  afterEach(() => {
    mock.restoreAll();
  });

  test("Missing listingId returns 400", async () => {
    req.body.listingId = undefined;
    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 400);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "Valid Listing ID is required",
    });
  });

  test("Invalid listingId returns 400", async () => {
    req.body.listingId = "invalid-id";
    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 400);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "Valid Listing ID is required",
    });
  });

  test("Listing not found returns 404", async () => {
    Listing.findById.mock.mockImplementation(() => null);

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 404);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "Listing not found",
    });
  });

  test("Self-inquiry prevention returns 400", async () => {
    Listing.findById.mock.mockImplementation(() => ({
      supplier: req.userId,
    }));

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 400);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "You cannot inquire on your own listing",
    });
  });

  test("Supplier not found returns 404", async () => {
    Listing.findById.mock.mockImplementation(() => ({
      supplier: new mongoose.Types.ObjectId().toString(),
    }));
    User.findById.mock.mockImplementation(() => ({
      select: () => null,
    }));

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 404);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "Supplier not found",
    });
  });

  test("Supplier not accepting inquiries returns 403", async () => {
    Listing.findById.mock.mockImplementation(() => ({
      supplier: new mongoose.Types.ObjectId().toString(),
    }));
    User.findById.mock.mockImplementation(() => ({
      select: () => ({
        subscriptionStatus: "inactive",
      }),
    }));

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 403);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "This supplier is currently not accepting inquiries.",
    });
  });

  test("Supplier monthly lead limit reached returns 402", async () => {
    Listing.findById.mock.mockImplementation(() => ({
      supplier: new mongoose.Types.ObjectId().toString(),
    }));
    User.findById.mock.mockImplementation(() => ({
      select: () => ({
        subscriptionStatus: "active",
        plan: "free",
      }),
    }));
    Inquiry.countDocuments.mock.mockImplementation(() => 10); // Matches default mock limit

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 402);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "This supplier has reached their monthly lead limit for the Free Trial plan.",
    });
  });

  test("Duplicate inquiry returns 400", async () => {
    Listing.findById.mock.mockImplementation(() => ({
      supplier: new mongoose.Types.ObjectId().toString(),
    }));
    User.findById.mock.mockImplementation(() => ({
      select: () => ({
        subscriptionStatus: "active",
        plan: "free",
      }),
    }));
    Inquiry.countDocuments.mock.mockImplementation(() => 5); // Below limit
    Inquiry.findOne.mock.mockImplementation(() => ({ _id: "existing" }));

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 400);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "You have already sent an inquiry for this listing.",
    });
  });

  test("Internal server error returns 500", async () => {
    Listing.findById.mock.mockImplementation(() => {
      throw new Error("DB failure");
    });

    const originalConsoleError = console.error;
    console.error = mock.fn(); // Suppress log

    await createInquiry(req, res);

    assert.strictEqual(statusMock.mock.calls[0].arguments[0], 500);
    assert.deepStrictEqual(jsonMock.mock.calls[0].arguments[0], {
      success: false,
      message: "Failed to send inquiry",
    });

    console.error = originalConsoleError;
  });
});

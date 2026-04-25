/**
 * Seed script: demo users, listings, and one saved bookmark.
 */
import "../config/env.js";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import SavedListing from "../models/SavedListing.js";

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await connectDatabase(process.env.MONGODB_URI);

  await SavedListing.deleteMany({});
  await Listing.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  const buyer = await User.create({
    name: "Alex Buyer",
    email: "buyer@hydrosphere.demo",
    password: passwordHash,
    role: "buyer",
    emailVerified: true,
  });

  const supplier = await User.create({
    name: "Sam Supplier",
    email: "supplier@hydrosphere.demo",
    password: passwordHash,
    role: "supplier",
    emailVerified: true,
    isApproved: true,
    isVerified: true,
    plan: "Basic",
    subscriptionStatus: "active",
  });

  const listings = await Listing.insertMany([
    {
      supplier: supplier._id,
      title: "Nordic Green H2 AS",
      companyName: "Nordic Green H2 AS",
      hydrogenType: "Green",
      price: 4.25,
      quantity: 1200,
      location: "Oslo, Norway",
      purity: 99.9,
      description:
        "Electrolysis-based green hydrogen from wind. ISO-certified, weekly delivery slots available for industrial buyers.",
      status: "approved",
    },
    {
      supplier: supplier._id,
      title: "Gulf Coast Hydrogen Co.",
      companyName: "Gulf Coast Hydrogen Co.",
      hydrogenType: "Blue",
      price: 3.1,
      quantity: 5000,
      location: "Houston, TX, USA",
      purity: 99.5,
      description:
        "Blue hydrogen with carbon capture. Suitable for refineries and ammonia plants. FOB pricing.",
      status: "approved",
    },
  ]);

  await SavedListing.create({
    user: buyer._id,
    listing: listings[0]._id,
  });

  console.log("\nHydroSphere seed complete.");
  console.log("  buyer@hydrosphere.demo  / password123  (role: buyer)");
  console.log("  supplier@hydrosphere.demo / password123  (role: supplier)");
  console.log(`  Created ${listings.length} listings; buyer saved the first one.\n`);

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

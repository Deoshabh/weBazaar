/**
 * CMS Pages Seed Script
 * Creates default content pages: About, FAQ, Shipping, Returns, Privacy, Terms
 *
 * Usage: node seed/cms-pages.seed.js
 * Requires MONGO_URI env var (reads from .env automatically)
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const ContentPage = require("../models/ContentPage");
const User = require("../models/User");

const DEFAULT_PAGES = [
  {
    title: "About Us",
    slug: "about",
    path: "/about",
    category: "page",
    metaTitle: "About weBazaar — Our Story, Mission & Craftsmanship",
    metaDescription:
      "Learn about weBazaar's journey to create premium, cruelty-free shoes. Discover our values, craftsmanship, and commitment to sustainable fashion.",
    metaKeywords: ["about weBazaar", "vegan shoe brand India", "cruelty-free fashion"],
    blocks: [
      {
        type: "hero",
        position: 0,
        config: {
          title: "About weBazaar",
          subtitle: "Conscious style, delivered.",
          backgroundType: "color",
          backgroundColor: "#f9f5f0",
        },
      },
      {
        type: "text",
        position: 1,
        config: {
          content:
            "<h2>Our Story</h2><p>weBazaar was born from a simple belief: that great style shouldn't come at the cost of our planet or its inhabitants. We craft premium leather and vegan shoes that look incredible, feel amazing, and tread lightly on the Earth.</p><h2>Our Mission</h2><p>We're on a mission to prove that ethical fashion can be luxurious. Every pair of weBazaar shoes is thoughtfully designed using sustainable materials and responsible manufacturing practices.</p><h2>Craftsmanship</h2><p>Each shoe is handcrafted by skilled artisans who share our passion for quality. From selecting the finest vegan leathers to perfecting every stitch, we pour care into every detail.</p>",
        },
      },
    ],
  },
  {
    title: "Frequently Asked Questions",
    slug: "faq",
    path: "/faq",
    category: "faq",
    metaTitle: "Frequently Asked Questions — weBazaar Help Center",
    metaDescription:
      "Find answers to common questions about weBazaar's vegan leather shoes, shipping, returns, sizing, and more.",
    metaKeywords: ["weBazaar FAQ", "shoe sizing guide", "vegan shoe care"],
    blocks: [
      {
        type: "heading",
        position: 0,
        config: {
          text: "Frequently Asked Questions",
          level: "h1",
          alignment: "center",
        },
      },
      {
        type: "accordion",
        position: 1,
        config: {
          items: [
            {
              title: "What materials do you use?",
              content:
                "We use premium vegan leather, organic cotton linings, and recycled rubber soles. All materials are cruelty-free and sustainably sourced.",
            },
            {
              title: "How do I find my size?",
              content:
                "Check our size guide on each product page. We recommend measuring your foot in the evening when feet are slightly larger. If you're between sizes, go up half a size.",
            },
            {
              title: "Do you ship internationally?",
              content:
                "Currently we ship across India with free shipping on orders above ₹1,999. International shipping is coming soon!",
            },
            {
              title: "What is your return policy?",
              content:
                "We offer a 30-day return policy for unworn shoes in original packaging. Visit our Returns page for complete details.",
            },
            {
              title: "How do I care for vegan leather shoes?",
              content:
                "Wipe with a damp cloth to clean. Avoid prolonged exposure to direct sunlight. Use a vegan leather conditioner periodically to maintain suppleness.",
            },
            {
              title: "Are your shoes really vegan?",
              content:
                "Yes! Our shoes contain zero animal-derived materials. We use high-quality plant-based and synthetic alternatives that match or exceed the quality of traditional leather.",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Shipping Policy",
    slug: "shipping",
    path: "/shipping",
    category: "policy",
    metaTitle: "Shipping Policy — Free & Fast Delivery | weBazaar",
    metaDescription:
      "Learn about weBazaar's shipping options, delivery times, and free shipping offers across India.",
    metaKeywords: ["weBazaar shipping", "free delivery India", "shipping policy"],
    blocks: [
      {
        type: "heading",
        position: 0,
        config: {
          text: "Shipping Policy",
          level: "h1",
          alignment: "center",
        },
      },
      {
        type: "text",
        position: 1,
        config: {
          content:
            "<h2>Delivery Times</h2><p>We aim to deliver your order within 5-7 business days across India. Metro cities typically receive orders within 3-5 business days.</p><h2>Free Shipping</h2><p>Enjoy free standard shipping on all orders above ₹1,999. Orders below this amount have a flat shipping fee of ₹99.</p><h2>Order Tracking</h2><p>Once your order ships, you'll receive a tracking number via email and SMS. You can track your order status anytime from your account dashboard.</p><h2>Shipping Partners</h2><p>We partner with trusted logistics providers to ensure your shoes arrive safely and on time.</p>",
        },
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    slug: "returns",
    path: "/returns",
    category: "policy",
    metaTitle: "Returns & Exchange Policy | weBazaar",
    metaDescription:
      "Easy returns and exchanges at weBazaar. Read our hassle-free return policy for vegan leather shoes.",
    metaKeywords: ["weBazaar returns", "shoe exchange policy", "refund policy"],
    blocks: [
      {
        type: "heading",
        position: 0,
        config: {
          text: "Returns & Exchanges",
          level: "h1",
          alignment: "center",
        },
      },
      {
        type: "text",
        position: 1,
        config: {
          content:
            "<h2>30-Day Return Policy</h2><p>Not happy with your purchase? No worries! We accept returns within 30 days of delivery for a full refund.</p><h2>Conditions</h2><ul><li>Shoes must be unworn and in original condition</li><li>Original packaging and tags must be intact</li><li>Returns must be initiated through your account or by contacting support</li></ul><h2>Exchanges</h2><p>Need a different size? We offer free exchanges within 30 days. Simply initiate an exchange from your account.</p><h2>Refund Process</h2><p>Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.</p>",
        },
      },
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy",
    path: "/privacy",
    category: "policy",
    metaTitle: "Privacy Policy | weBazaar",
    metaDescription:
      "Read weBazaar's privacy policy. Learn how we protect your personal information and ensure secure shopping.",
    metaKeywords: ["weBazaar privacy", "data protection", "privacy policy India"],
    blocks: [
      {
        type: "heading",
        position: 0,
        config: {
          text: "Privacy Policy",
          level: "h1",
          alignment: "center",
        },
      },
      {
        type: "text",
        position: 1,
        config: {
          content:
            "<h2>Information We Collect</h2><p>We collect information you provide when creating an account, placing an order, or contacting us. This includes your name, email, phone number, and shipping address.</p><h2>How We Use Your Information</h2><p>Your information is used to process orders, provide customer support, send order updates, and improve our services. We never sell your personal data to third parties.</p><h2>Data Security</h2><p>We use industry-standard encryption and security measures to protect your personal information. All payments are processed through secure payment gateways.</p><h2>Cookies</h2><p>We use cookies to improve your browsing experience and remember your preferences. You can manage cookie settings in your browser.</p><h2>Contact</h2><p>For privacy-related questions, contact us at support@webazaar.in</p>",
        },
      },
    ],
  },
  {
    title: "Terms & Conditions",
    slug: "terms",
    path: "/terms",
    category: "policy",
    metaTitle: "Terms & Conditions | weBazaar",
    metaDescription:
      "Read weBazaar's terms and conditions for using our website and purchasing vegan leather shoes.",
    metaKeywords: ["weBazaar terms", "terms of service", "terms and conditions"],
    blocks: [
      {
        type: "heading",
        position: 0,
        config: {
          text: "Terms & Conditions",
          level: "h1",
          alignment: "center",
        },
      },
      {
        type: "text",
        position: 1,
        config: {
          content:
            "<h2>General</h2><p>By using the weBazaar website, you agree to these terms and conditions. Please read them carefully before making a purchase.</p><h2>Products</h2><p>We strive to display accurate product images and descriptions. However, actual colors may vary slightly due to screen settings. All prices are in INR and include applicable taxes.</p><h2>Orders</h2><p>An order is confirmed once payment is received. We reserve the right to cancel orders due to stock unavailability, in which case a full refund will be issued.</p><h2>Intellectual Property</h2><p>All content on this website, including images, text, logos, and design, is the property of weBazaar and protected by copyright laws.</p><h2>Limitation of Liability</h2><p>weBazaar is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</p><h2>Governing Law</h2><p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.</p>",
        },
      },
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI not set. Create a .env file or set it as an environment variable.");
    process.exit(1);
  }

  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected\n");

  // Find an admin user to use as createdBy
  let adminUser = await User.findOne({ role: "admin" }).select("_id").lean();

  if (!adminUser) {
    console.log("⚠️  No admin user found. Creating a system placeholder...");
    // Use a fixed ObjectId as system user if no admin exists
    adminUser = { _id: new mongoose.Types.ObjectId("000000000000000000000001") };
  }

  console.log(`👤 Using admin user: ${adminUser._id}\n`);

  let created = 0;
  let skipped = 0;

  for (const pageData of DEFAULT_PAGES) {
    const existing = await ContentPage.findOne({ slug: pageData.slug });
    if (existing) {
      console.log(`⏭️  "${pageData.title}" already exists (slug: ${pageData.slug}) — skipping`);
      skipped++;
      continue;
    }

    try {
      await ContentPage.create({
        ...pageData,
        status: "published",
        version: 1,
        publishedVersion: 1,
        lastPublishedAt: new Date(),
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      });
      console.log(`✅ Created: "${pageData.title}" → ${pageData.path}`);
      created++;
    } catch (err) {
      console.error(`❌ Failed to create "${pageData.title}":`, err.message);
    }
  }

  console.log(`\n📊 Done! Created: ${created}, Skipped: ${skipped}`);
  console.log("🔗 Pages should now appear in Admin Panel → CMS → Pages");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

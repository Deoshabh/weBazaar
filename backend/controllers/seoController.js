const SeoSetting = require("../models/SeoSetting");

// Default SEO values for all pages
const SEO_DEFAULTS = {
  home: {
    page_label: "Home Page",
    meta_title: "weBazaar — Premium Vegan Leather Shoes | Shop Online India",
    meta_description:
      "Shop handcrafted vegan leather shoes at weBazaar. Cruelty-free, sustainable, and stylish footwear for men and women. Free shipping across India.",
    meta_keywords: [
      "vegan shoes",
      "vegan leather",
      "cruelty-free footwear",
      "sustainable shoes",
      "online shoe store India",
      "weBazaar",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  products: {
    page_label: "All Products",
    meta_title: "Shop All Shoes — Vegan Leather Collection | weBazaar",
    meta_description:
      "Browse our full range of premium vegan leather shoes. Oxfords, sneakers, loafers, boots and more — ethically made and delivered across India.",
    meta_keywords: [
      "buy vegan shoes online",
      "vegan leather collection",
      "shop shoes India",
      "cruelty-free shoes",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  about: {
    page_label: "About Us",
    meta_title: "About weBazaar — Our Story, Mission & Craftsmanship",
    meta_description:
      "Learn about weBazaar's journey to create premium, cruelty-free shoes. Discover our values, craftsmanship, and commitment to sustainable fashion.",
    meta_keywords: [
      "about weBazaar",
      "vegan shoe brand India",
      "cruelty-free fashion",
      "sustainable footwear brand",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  contact: {
    page_label: "Contact Us",
    meta_title: "Contact weBazaar — Get in Touch With Us",
    meta_description:
      "Have questions? Contact weBazaar for support, feedback or wholesale inquiries. We're happy to help you find the perfect pair of vegan shoes.",
    meta_keywords: [
      "contact weBazaar",
      "customer support",
      "shoe store contact",
      "vegan shoes help",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  faq: {
    page_label: "FAQ",
    meta_title: "Frequently Asked Questions — weBazaar Help Center",
    meta_description:
      "Find answers to common questions about weBazaar's vegan leather shoes, shipping, returns, sizing, and more.",
    meta_keywords: [
      "weBazaar FAQ",
      "shoe sizing guide",
      "vegan shoe care",
      "shipping policy",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  shipping: {
    page_label: "Shipping Policy",
    meta_title: "Shipping Policy — Free & Fast Delivery | weBazaar",
    meta_description:
      "Learn about weBazaar's shipping options, delivery times, and free shipping offers across India. We ensure your shoes arrive safely.",
    meta_keywords: [
      "weBazaar shipping",
      "free delivery India",
      "shoe delivery",
      "shipping policy",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  returns: {
    page_label: "Returns & Exchanges",
    meta_title: "Returns & Exchange Policy | weBazaar",
    meta_description:
      "Easy returns and exchanges at weBazaar. Read our hassle-free return policy for vegan leather shoes.",
    meta_keywords: [
      "weBazaar returns",
      "shoe exchange policy",
      "return shoes online",
      "refund policy",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  privacy: {
    page_label: "Privacy Policy",
    meta_title: "Privacy Policy | weBazaar",
    meta_description:
      "Read weBazaar's privacy policy. Learn how we protect your personal information and ensure secure shopping.",
    meta_keywords: [
      "weBazaar privacy",
      "data protection",
      "privacy policy India",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  terms: {
    page_label: "Terms & Conditions",
    meta_title: "Terms & Conditions | weBazaar",
    meta_description:
      "Read weBazaar's terms and conditions for using our website and purchasing vegan leather shoes.",
    meta_keywords: [
      "weBazaar terms",
      "terms of service",
      "terms and conditions",
    ],
    og_type: "website",
    robots: "index, follow",
  },
  login: {
    page_label: "Login",
    meta_title: "Login to Your Account | weBazaar",
    meta_description:
      "Sign in to your weBazaar account to track orders, manage your wishlist, and shop faster.",
    meta_keywords: [
      "weBazaar login",
      "sign in",
      "customer account",
    ],
    og_type: "website",
    robots: "noindex, follow",
  },
  register: {
    page_label: "Register",
    meta_title: "Create an Account | weBazaar",
    meta_description:
      "Join weBazaar to enjoy exclusive offers, order tracking, and a seamless shopping experience for vegan leather shoes.",
    meta_keywords: [
      "weBazaar register",
      "create account",
      "sign up",
    ],
    og_type: "website",
    robots: "noindex, follow",
  },
  categories: {
    page_label: "Categories",
    meta_title: "Shop by Category — Vegan Leather Shoes | weBazaar",
    meta_description:
      "Browse weBazaar shoes by category. Find the perfect pair of vegan leather oxfords, sneakers, loafers, boots and more.",
    meta_keywords: [
      "shoe categories",
      "vegan shoe types",
      "oxford shoes",
      "sneakers",
      "loafers",
      "boots",
    ],
    og_type: "website",
    robots: "index, follow",
  },
};

/**
 * Get all SEO settings
 */
exports.getAllSeoSettings = async (req, res) => {
  try {
    const settings = await SeoSetting.find().sort({ page_key: 1 }).lean();

    // Merge with defaults for any pages not yet in DB
    const allPageKeys = Object.keys(SEO_DEFAULTS);
    const existingKeys = settings.map((s) => s.page_key);
    const merged = [...settings];

    for (const key of allPageKeys) {
      if (!existingKeys.includes(key)) {
        merged.push({
          page_key: key,
          page_label: SEO_DEFAULTS[key].page_label,
          meta_title: SEO_DEFAULTS[key].meta_title,
          meta_description: SEO_DEFAULTS[key].meta_description,
          meta_keywords: SEO_DEFAULTS[key].meta_keywords || [],
          og_title: "",
          og_description: "",
          og_image: "",
          og_type: SEO_DEFAULTS[key].og_type || "website",
          twitter_title: "",
          twitter_description: "",
          twitter_image: "",
          canonical_url: "",
          robots: SEO_DEFAULTS[key].robots || "index, follow",
          schema_json: null,
          is_active: true,
          is_default: true,
          history: [],
        });
      }
    }

    merged.sort((a, b) => a.page_key.localeCompare(b.page_key));

    res.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch SEO settings" });
  }
};

/**
 * Get SEO setting by page key (public)
 */
exports.getSeoByPageKey = async (req, res) => {
  try {
    const { pageKey } = req.params;
    let setting = await SeoSetting.findOne({ page_key: pageKey }).lean();

    if (!setting && SEO_DEFAULTS[pageKey]) {
      // Return default if not customized
      setting = {
        page_key: pageKey,
        page_label: SEO_DEFAULTS[pageKey].page_label,
        meta_title: SEO_DEFAULTS[pageKey].meta_title,
        meta_description: SEO_DEFAULTS[pageKey].meta_description,
        meta_keywords: SEO_DEFAULTS[pageKey].meta_keywords || [],
        og_title: "",
        og_description: "",
        og_image: "",
        og_type: SEO_DEFAULTS[pageKey].og_type || "website",
        twitter_title: "",
        twitter_description: "",
        twitter_image: "",
        canonical_url: "",
        robots: SEO_DEFAULTS[pageKey].robots || "index, follow",
        schema_json: null,
        is_active: true,
        is_default: true,
      };
    }

    if (!setting) {
      return res.status(404).json({ success: false, message: "SEO setting not found" });
    }

    res.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error fetching SEO setting:", error);
    res.status(500).json({ success: false, message: "Failed to fetch SEO setting" });
  }
};

/**
 * Upsert SEO setting (create or update)
 */
exports.upsertSeoSetting = async (req, res) => {
  try {
    const { pageKey } = req.params;
    const {
      page_label,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      og_type,
      twitter_title,
      twitter_description,
      twitter_image,
      canonical_url,
      robots,
      schema_json,
      is_active,
    } = req.body;

    let setting = await SeoSetting.findOne({ page_key: pageKey });

    if (setting) {
      // Push current state to history before updating
      setting.history.push({
        meta_title: setting.meta_title,
        meta_description: setting.meta_description,
        meta_keywords: setting.meta_keywords,
        og_title: setting.og_title,
        og_description: setting.og_description,
        og_image: setting.og_image,
        twitter_title: setting.twitter_title,
        twitter_description: setting.twitter_description,
        twitter_image: setting.twitter_image,
        canonical_url: setting.canonical_url,
        robots: setting.robots,
        schema_json: setting.schema_json,
        changed_by: req.user?._id,
        changed_at: new Date(),
      });

      // Update fields
      if (page_label !== undefined) setting.page_label = page_label;
      if (meta_title !== undefined) setting.meta_title = meta_title;
      if (meta_description !== undefined) setting.meta_description = meta_description;
      if (meta_keywords !== undefined) setting.meta_keywords = meta_keywords;
      if (og_title !== undefined) setting.og_title = og_title;
      if (og_description !== undefined) setting.og_description = og_description;
      if (og_image !== undefined) setting.og_image = og_image;
      if (og_type !== undefined) setting.og_type = og_type;
      if (twitter_title !== undefined) setting.twitter_title = twitter_title;
      if (twitter_description !== undefined) setting.twitter_description = twitter_description;
      if (twitter_image !== undefined) setting.twitter_image = twitter_image;
      if (canonical_url !== undefined) setting.canonical_url = canonical_url;
      if (robots !== undefined) setting.robots = robots;
      if (schema_json !== undefined) setting.schema_json = schema_json;
      if (is_active !== undefined) setting.is_active = is_active;

      await setting.save();
    } else {
      // Create new
      setting = await SeoSetting.create({
        page_key: pageKey,
        page_label: page_label || SEO_DEFAULTS[pageKey]?.page_label || pageKey,
        meta_title: meta_title || SEO_DEFAULTS[pageKey]?.meta_title || "",
        meta_description: meta_description || SEO_DEFAULTS[pageKey]?.meta_description || "",
        meta_keywords: meta_keywords || SEO_DEFAULTS[pageKey]?.meta_keywords || [],
        og_title: og_title || "",
        og_description: og_description || "",
        og_image: og_image || "",
        og_type: og_type || SEO_DEFAULTS[pageKey]?.og_type || "website",
        twitter_title: twitter_title || "",
        twitter_description: twitter_description || "",
        twitter_image: twitter_image || "",
        canonical_url: canonical_url || "",
        robots: robots || SEO_DEFAULTS[pageKey]?.robots || "index, follow",
        schema_json: schema_json || null,
        is_active: is_active !== undefined ? is_active : true,
      });
    }

    res.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error upserting SEO setting:", error);
    res.status(500).json({ success: false, message: "Failed to save SEO setting" });
  }
};

/**
 * Delete SEO setting (revert to default)
 */
exports.deleteSeoSetting = async (req, res) => {
  try {
    const { pageKey } = req.params;
    await SeoSetting.deleteOne({ page_key: pageKey });
    res.json({ success: true, message: "SEO setting deleted, defaults will be used" });
  } catch (error) {
    console.error("Error deleting SEO setting:", error);
    res.status(500).json({ success: false, message: "Failed to delete SEO setting" });
  }
};

/**
 * Reset a page's SEO to defaults
 */
exports.resetToDefault = async (req, res) => {
  try {
    const { pageKey } = req.params;
    const defaults = SEO_DEFAULTS[pageKey];

    if (!defaults) {
      return res.status(404).json({ success: false, message: "No defaults found for this page" });
    }

    let setting = await SeoSetting.findOne({ page_key: pageKey });
    if (setting) {
      // Push current to history
      setting.history.push({
        meta_title: setting.meta_title,
        meta_description: setting.meta_description,
        meta_keywords: setting.meta_keywords,
        og_title: setting.og_title,
        og_description: setting.og_description,
        og_image: setting.og_image,
        twitter_title: setting.twitter_title,
        twitter_description: setting.twitter_description,
        twitter_image: setting.twitter_image,
        canonical_url: setting.canonical_url,
        robots: setting.robots,
        schema_json: setting.schema_json,
        changed_by: req.user?._id,
        changed_at: new Date(),
      });

      setting.meta_title = defaults.meta_title;
      setting.meta_description = defaults.meta_description;
      setting.meta_keywords = defaults.meta_keywords || [];
      setting.og_title = "";
      setting.og_description = "";
      setting.og_image = "";
      setting.og_type = defaults.og_type || "website";
      setting.twitter_title = "";
      setting.twitter_description = "";
      setting.twitter_image = "";
      setting.canonical_url = "";
      setting.robots = defaults.robots || "index, follow";
      setting.schema_json = null;
      await setting.save();
    }

    res.json({ success: true, message: "Reset to defaults", data: defaults });
  } catch (error) {
    console.error("Error resetting SEO setting:", error);
    res.status(500).json({ success: false, message: "Failed to reset SEO setting" });
  }
};

/**
 * Bulk copy SEO fields from one page to another
 */
exports.bulkCopy = async (req, res) => {
  try {
    const { sourcePageKey, targetPageKeys } = req.body;

    if (!sourcePageKey || !targetPageKeys || !Array.isArray(targetPageKeys)) {
      return res.status(400).json({ success: false, message: "sourcePageKey and targetPageKeys[] required" });
    }

    let source = await SeoSetting.findOne({ page_key: sourcePageKey }).lean();
    if (!source && SEO_DEFAULTS[sourcePageKey]) {
      source = SEO_DEFAULTS[sourcePageKey];
    }

    if (!source) {
      return res.status(404).json({ success: false, message: "Source page not found" });
    }

    const results = [];
    for (const targetKey of targetPageKeys) {
      let target = await SeoSetting.findOne({ page_key: targetKey });
      if (target) {
        target.history.push({
          meta_title: target.meta_title,
          meta_description: target.meta_description,
          meta_keywords: target.meta_keywords,
          og_title: target.og_title,
          og_description: target.og_description,
          og_image: target.og_image,
          twitter_title: target.twitter_title,
          twitter_description: target.twitter_description,
          twitter_image: target.twitter_image,
          canonical_url: target.canonical_url,
          robots: target.robots,
          schema_json: target.schema_json,
          changed_by: req.user?._id,
          changed_at: new Date(),
        });

        target.og_image = source.og_image || target.og_image;
        target.twitter_image = source.twitter_image || target.twitter_image;
        target.robots = source.robots || target.robots;
        target.og_type = source.og_type || target.og_type;
        await target.save();
        results.push({ page_key: targetKey, status: "updated" });
      } else {
        await SeoSetting.create({
          page_key: targetKey,
          page_label: SEO_DEFAULTS[targetKey]?.page_label || targetKey,
          meta_title: SEO_DEFAULTS[targetKey]?.meta_title || source.meta_title || "",
          meta_description: SEO_DEFAULTS[targetKey]?.meta_description || source.meta_description || "",
          meta_keywords: SEO_DEFAULTS[targetKey]?.meta_keywords || source.meta_keywords || [],
          og_image: source.og_image || "",
          twitter_image: source.twitter_image || "",
          robots: source.robots || "index, follow",
          og_type: source.og_type || "website",
          is_active: true,
        });
        results.push({ page_key: targetKey, status: "created" });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error bulk copying SEO:", error);
    res.status(500).json({ success: false, message: "Failed to bulk copy" });
  }
};

/**
 * Get change history for a page
 */
exports.getHistory = async (req, res) => {
  try {
    const { pageKey } = req.params;
    const setting = await SeoSetting.findOne({ page_key: pageKey })
      .populate("history.changed_by", "name email")
      .lean();

    if (!setting) {
      return res.json({ success: true, data: [] });
    }

    const history = (setting.history || []).reverse();
    res.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching SEO history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

/**
 * Get all defaults (for reference)
 */
exports.getDefaults = async (req, res) => {
  try {
    res.json({ success: true, data: SEO_DEFAULTS });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch defaults" });
  }
};

const Product = require("../models/Product");

// GET /api/v1/products
exports.getAllProducts = async (req, res) => {
  try {
    const { featured, category, search } = req.query;

    const query = { isActive: true };

    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Filter by featured if requested
    if (featured === "true") {
      query.featured = true;
    }

    // Filter by category if provided
    if (category) {
      query.category = category.toLowerCase();
    }

    console.log("📦 Fetching products with query:", query);
    const products = await Product.find(query).sort({ createdAt: -1 });
    console.log(`✅ Found ${products.length} products`);

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/v1/products/search
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ],
    })
      .limit(20)
      .select("name slug image price category brand")
      .sort({ featured: -1, createdAt: -1 });

    console.log(`🔍 Search for "${q}": found ${products.length} results`);

    res.json(products);
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/v1/products/:slug
exports.getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// GET /api/v1/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

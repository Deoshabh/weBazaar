const Product = require("../models/Product");

// GET /api/v1/products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      featured,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      order,
      brand,
      material,
    } = req.query;

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

    // Filter by brand if provided
    if (brand) {
      query.brand = new RegExp(`^${brand}$`, "i"); // Case-insensitive exact match
    }

    // Filter by material if provided
    if (material) {
      query.materialAndCare = new RegExp(material, "i"); // Case-insensitive contains
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    console.log("📦 Fetching products with query:", query);

    // Build sort options
    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === "asc" ? 1 : -1;
      sortOptions[sortBy] = sortOrder;
    } else {
      // Default sort
      sortOptions = { createdAt: -1 };
    }

    console.log("📊 Sorting by:", sortOptions);

    const products = await Product.find(query).sort(sortOptions);
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

// GET /api/v1/products/brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand", {
      isActive: true,
      brand: { $exists: true, $ne: "" },
    });
    // Sort brands alphabetically
    const sortedBrands = brands.filter(Boolean).sort();
    res.json(sortedBrands);
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/v1/products/materials
exports.getMaterials = async (req, res) => {
  try {
    // Get all products with materialAndCare field
    const products = await Product.find(
      {
        isActive: true,
        materialAndCare: { $exists: true, $ne: "" },
      },
      { materialAndCare: 1 },
    );

    // Extract unique materials from the text
    const materialsSet = new Set();
    const commonMaterials = [
      "leather",
      "suede",
      "canvas",
      "mesh",
      "synthetic",
      "rubber",
      "textile",
      "cotton",
      "polyester",
      "nylon",
    ];

    products.forEach((product) => {
      const text = product.materialAndCare.toLowerCase();
      commonMaterials.forEach((material) => {
        if (text.includes(material)) {
          materialsSet.add(
            material.charAt(0).toUpperCase() + material.slice(1),
          );
        }
      });
    });

    const materials = Array.from(materialsSet).sort();
    res.json(materials);
  } catch (error) {
    console.error("Get materials error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/v1/products/price-range
exports.getPriceRange = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    if (result.length > 0) {
      res.json({
        min: Math.floor(result[0].minPrice),
        max: Math.ceil(result[0].maxPrice),
      });
    } else {
      res.json({ min: 0, max: 100000 });
    }
  } catch (error) {
    console.error("Get price range error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

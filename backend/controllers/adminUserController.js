const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Map users to include isActive for frontend compatibility
    const usersWithStatus = users.map((user) => ({
      ...user.toObject(),
      isActive: !user.isBlocked,
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user role
// @route   PATCH /api/v1/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Block/Unblock user
// @route   PATCH /api/v1/admin/users/:id/toggle-block
// @access  Private/Admin
exports.toggleUserBlock = async (req, res) => {
  try {
    console.log("Toggle block request:", {
      userId: req.params.id,
      requesterId: req.user?._id,
      requesterRole: req.user?.role,
    });

    const user = await User.findById(req.params.id);

    if (!user) {
      console.log("User not found:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      console.log("Admin attempted to block themselves");
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    // Toggle blocked status
    user.isBlocked = !user.isBlocked;
    await user.save();

    console.log("User block status toggled:", {
      userId: user._id,
      isBlocked: user.isBlocked,
    });

    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        isActive: !user.isBlocked, // For frontend compatibility
      },
    });
  } catch (error) {
    console.error("Toggle user block error:", error);
    console.error("Error stack:", error.stack);
    console.error("Request params:", req.params);
    console.error("Request user:", req.user?._id);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const User = require("../Models/user_model");

// Get current logged-in user
const getCurrentUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user }); // Passport sets req.user
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
};

// GET Request to get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { checkProfileBadges } = require("./badge_utils");
// PUT Request to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, socialLinks, currentCourses, completedCourses } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = socialLinks;
    if (currentCourses) user.currentCourses = currentCourses;
    if (completedCourses) user.completedCourses = completedCourses;

    await user.save();
    // Check for profile completion badge
    await checkProfileBadges(user._id);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET Request to get all users (optional - for community features)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName lastName email photo bio")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Request to get a user's badges
const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.badges || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET Request to search users by name
const searchUsersByName = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query required" });
    }
    // Search by first, last, full name, or email (case-insensitive, partial)
    const regex = new RegExp(q, "i");
    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: q, options: "i" } } }
      ]
    }).select("firstName lastName email photo bio");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserBadges,
  searchUsersByName,
};

const User = require("../Models/user_model");

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

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};

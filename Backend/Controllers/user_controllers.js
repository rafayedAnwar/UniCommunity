const User = require("../Models/user_model");
const Course = require("../Models/course_model");
const { checkProfileBadges } = require("./badge_utils");

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

// Add any courses from the user's completed list into the global course catalog
async function syncCompletedCourses(completedCourses = []) {
  if (!Array.isArray(completedCourses) || completedCourses.length === 0) return;

  for (const course of completedCourses) {
    const code = course?.code?.trim()?.toUpperCase();
    const name = course?.name?.trim();
    if (!code || !name) continue;

    await Course.findOneAndUpdate(
      { course_code: code },
      {
        $setOnInsert: {
          course_code: code,
          course_name: name,
          course_description: "Added from user profile completed courses",
          course_prerequisites: [],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

// PUT Request to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, socialLinks, currentCourses, completedCourses } = req.body;

    if (Array.isArray(completedCourses)) {
      const invalid = completedCourses.find(
        (c) =>
          c &&
          (!Number.isFinite(Number(c.cgpa)) ||
            Number(c.cgpa) < 0 ||
            Number(c.cgpa) > 4 ||
            !Number.isFinite(Number(c.credits)) ||
            Number(c.credits) <= 0)
      );
      if (invalid) {
        return res
          .status(400)
          .json({
            error:
              "Completed courses must include valid cgpa (0-4) and credits (>0).",
          });
      }
    }

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
    // Sync completed courses to the global course catalog so they become selectable elsewhere
    await syncCompletedCourses(user.completedCourses);
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
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: q,
              options: "i",
            },
          },
        },
      ],
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

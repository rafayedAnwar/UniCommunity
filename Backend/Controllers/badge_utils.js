// Utility to check and award badges to users
const User = require("../Models/user_model");
const BADGES = require("../Models/badges");

// Helper: check if user already has badge
function hasBadge(user, badgeId) {
  return user.badges.some(b => b.badgeId === badgeId);
}

// Award badge if not already earned
async function awardBadge(userId, badgeId) {
  const user = await User.findById(userId);
  if (!user) return false;
  if (hasBadge(user, badgeId)) return false;
  user.badges.push({ badgeId });
  await user.save();
  return true;
}

// Check and award badges for profile completion
async function checkProfileBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  // Who Am I? badge: bio, photo, at least one social link
  const hasBio = user.bio && user.bio.trim().length > 0;
  const hasPhoto = user.photo && user.photo.trim().length > 0;
  const social = user.socialLinks || {};
  const hasSocial = social.linkedIn || social.github || social.portfolio;
  if (hasBio && hasPhoto && hasSocial) {
    await awardBadge(userId, "whoami");
  }
}

// Check and award badge for first login (The Initiate)
async function checkSignupBadge(userId) {
  await awardBadge(userId, "initiate");
}

// Award Hello World badge for first interaction (forum post, resource upload, discussion post)
async function checkHelloWorldBadge(userId) {
  await awardBadge(userId, "hello_world");
}

module.exports = {
  awardBadge,
  checkProfileBadges,
  checkSignupBadge,
  checkHelloWorldBadge,
};

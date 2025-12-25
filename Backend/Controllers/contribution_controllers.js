const UserContribution = require("../Models/contribution_model");

const ensureUserContribution = async (userId) => {
  return await UserContribution.findOneAndUpdate(
    { userId }, { $setOnInsert: {discussion_thread: 0, discussion_comment: 0, review: 0,},}, { new: true, upsert: true }
  );
};

const incDiscussionThread = async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureUserContribution(userId);
    const updated = await UserContribution.findOneAndUpdate({ userId }, { $inc: { discussion_thread: 1 } }, { new: true });
    res.status(200).json(updated);
  } catch (error) {res.status(500).json({ error: error.message });}
};

const incDiscussionComment = async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureUserContribution(userId);
    const updated = await UserContribution.findOneAndUpdate({ userId }, { $inc: { discussion_comment: 1 } }, { new: true });
    res.status(200).json(updated);
  } catch (error) {res.status(500).json({ error: error.message });}
};

const incReview = async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureUserContribution(userId);
    const updated = await UserContribution.findOneAndUpdate({ userId },{ $inc: { review: 1 } },{ new: true });
    res.status(200).json(updated);
  } catch (error) {res.status(500).json({ error: error.message });}
};

const getTopThree = async (req, res) => {
  try {
    const topContributors = await UserContribution.aggregate([
      {$addFields: {totalScore: {$add: ["$discussion_thread",{ $multiply: ["$review", 2]},{ $multiply: ["$discussion_comment", 1.5] }]}}},
      {$sort: { totalScore: -1 }},
      {$limit: 3},
      {$project: { _id: 0, userId: 1, discussion_thread: 1, discussion_comment: 1, review: 1, score: 1}}
    ]);
    res.status(200).json(topContributors);
  } catch (error) {res.status(500).json({ error: error.message });}
};

module.exports = {incDiscussionComment, incDiscussionThread, incReview, getTopThree}
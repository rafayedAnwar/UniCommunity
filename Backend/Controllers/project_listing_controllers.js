const ProjectListing = require("../Models/project_listing_model");
const User = require("../Models/user_model");

// Helpers for Trello
async function createTrelloBoard(name, members) {
  const key = process.env.TRELLO_KEY;
  const token = process.env.TRELLO_TOKEN;
  const orgId = process.env.TRELLO_ORG_ID; // Workspace is required by Trello for board creation in many accounts
  if (!key || !token) {
    throw new Error("Trello API not configured (TRELLO_KEY/TRELLO_TOKEN missing)");
  }

  const params = new URLSearchParams({
    name,
    defaultLists: "true",
    key,
    token,
  });
  if (orgId) params.append("idOrganization", orgId);

  const boardRes = await fetch(`https://api.trello.com/1/boards?${params.toString()}`, {
    method: "POST",
  });
  if (!boardRes.ok) {
    const text = await boardRes.text();
    throw new Error(`Failed to create Trello board: ${text}`);
  }
  const board = await boardRes.json();

  // Invite members by email (best effort)
  for (const m of members) {
    if (!m.email) continue;
    try {
      await fetch(
        `https://api.trello.com/1/boards/${board.id}/members?email=${encodeURIComponent(
          m.email
        )}&type=normal&key=${key}&token=${token}`,
        { method: "PUT" }
      );
    } catch (err) {
      // ignore invite failures
      console.error("Trello invite failed for", m.email);
    }
  }

  return { boardId: board.id, boardUrl: board.url };
}

const createListing = async (req, res) => {
  try {
    const { projectName, courseCodes, skills, description } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!projectName || !description) {
      return res
        .status(400)
        .json({ error: "projectName and description required" });
    }

    const rawCourses = courseCodes;
    const parsedCourses = Array.isArray(rawCourses)
      ? rawCourses.map((c) => c.trim().toUpperCase()).filter(Boolean)
      : rawCourses
      ? rawCourses.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
      : [];
    if (parsedCourses.length === 0) {
      return res.status(400).json({ error: "At least one course is required" });
    }

    const listing = await ProjectListing.create({
      projectName: projectName.trim(),
      courseCodes: parsedCourses,
      skills: Array.isArray(skills)
        ? skills
        : skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      description,
      creatorId: user._id,
      creatorName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      members: [
        { userId: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email },
      ],
    });
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listListings = async (req, res) => {
  try {
    const { course, skills, q } = req.query;
    const query = {};
    if (course) {
      const courses = course
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      if (courses.length > 0) query.courseCodes = { $in: courses };
    }
    if (skills) {
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillList.length > 0) {
        query.skills = { $in: skillList };
      }
    }
    if (q && q.trim().length > 0) {
      const regex = new RegExp(q.trim(), "i");
      query.$or = [{ projectName: regex }, { creatorName: regex }];
    }
    const listings = await ProjectListing.find(query).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const joinListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const listing = await ProjectListing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const already = listing.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );
    if (already) return res.status(200).json(listing);

    listing.members.push({
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });
    await listing.save();
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createTrelloForListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const listing = await ProjectListing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.creatorId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Only the creator can create Trello board" });
    }
    if (listing.trelloBoardUrl) return res.status(200).json(listing);

    const memberDetails = await User.find({
      _id: { $in: listing.members.map((m) => m.userId) },
    }).select("email firstName lastName");
    const members = memberDetails.map((m) => ({
      email: m.email,
      name: `${m.firstName} ${m.lastName}`,
    }));
    const { boardId, boardUrl } = await createTrelloBoard(
      `Project - ${listing.projectName}`,
      members
    );
    listing.trelloBoardId = boardId;
    listing.trelloBoardUrl = boardUrl;
    await listing.save();
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createListing,
  listListings,
  joinListing,
  createTrelloForListing,
};

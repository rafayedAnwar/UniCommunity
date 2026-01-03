const Forum = require("../Models/forum_model");
const User = require("../Models/user_model");

// GET Request to get all forums
const getAllForums = async (req, res) => {
  try {
    const forums = await Forum.find({})
      .select("courseCode courseName description members resources")
      .sort({ courseCode: 1 });

    res.status(200).json(forums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Request to get forum by course code
const getForumByCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const forum = await Forum.findOne({ courseCode }).populate(
      "members",
      "firstName lastName email photo"
    );

    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    res.status(200).json(forum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { checkHelloWorldBadge } = require("./badge_utils");
// POST Request to create a new forum
const createForum = async (req, res) => {
  try {
    const { courseCode, courseName, description, userId } = req.body;

    // Check if forum already exists
    const existingForum = await Forum.findOne({ courseCode });
    if (existingForum) {
      return res
        .status(400)
        .json({ error: "Forum already exists for this course" });
    }

    const forum = await Forum.create({
      courseCode,
      courseName,
      description: description || "",
      members: [userId],
    });

    // Award Hello World badge for forum creation
    if (userId) await checkHelloWorldBadge(userId);

    res.status(201).json(forum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST Request to join a forum
const joinForum = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { userId } = req.body;

    const forum = await Forum.findOne({ courseCode });
    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    // Check if user is already a member
    if (forum.members.includes(userId)) {
      return res.status(400).json({ error: "Already a member of this forum" });
    }

    forum.members.push(userId);
    await forum.save();

    res.status(200).json(forum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST Request to upload a resource
const uploadResource = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const {
      title,
      description,
      fileUrl,
      fileType,
      fileName,
      fileData,
      fileSize,
      userId,
      uploaderName,
    } = req.body;

    const forum = await Forum.findOne({ courseCode });
    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    // Check if user is a member
    if (!forum.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Must be a forum member to upload resources" });
    }

    // Validate that either fileUrl or fileData is provided
    if (!fileUrl && !fileData) {
      return res
        .status(400)
        .json({ error: "Either file URL or file data must be provided" });
    }

    // Validate required fields
    if (!title || !description || !fileType) {
      return res
        .status(400)
        .json({ error: "Title, description, and file type are required" });
    }

    // Check file size limit (10MB for base64 encoded files)
    if (fileData && fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }

    const resource = {
      title,
      description,
      fileUrl: fileUrl || undefined,
      fileType,
      fileName: fileName || undefined,
      fileData: fileData || undefined,
      fileSize: fileSize || undefined,
      uploadedBy: userId,
      uploaderName,
    };

    forum.resources.push(resource);
    await forum.save();

    // Award Hello World badge for resource upload
    if (userId) await checkHelloWorldBadge(userId);

    res.status(201).json(forum);
  } catch (error) {
    console.error("Upload resource error:", error);
    res.status(400).json({ error: error.message });
  }
};

// GET Request to get all resources for a forum
const getForumResources = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const forum = await Forum.findOne({ courseCode }).select("resources");

    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    res.status(200).json(forum.resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT Request to increment download count
const incrementDownload = async (req, res) => {
  try {
    const { courseCode, resourceId } = req.params;

    const forum = await Forum.findOne({ courseCode });
    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    const resource = forum.resources.id(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    resource.downloads += 1;
    await forum.save();

    res.status(200).json(resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE Request to delete a resource
const deleteResource = async (req, res) => {
  try {
    const { courseCode, resourceId } = req.params;
    const { userId } = req.body;

    const forum = await Forum.findOne({ courseCode });
    if (!forum) {
      return res.status(404).json({ error: "Forum not found" });
    }

    const resource = forum.resources.id(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Check if user is the uploader
    if (resource.uploadedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this resource" });
    }

    forum.resources.pull(resourceId);
    await forum.save();

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllForums,
  getForumByCourse,
  createForum,
  joinForum,
  uploadResource,
  getForumResources,
  incrementDownload,
  deleteResource,
};

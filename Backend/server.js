require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("./Config/passport_config");

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.SERVER_URI;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- SESSION & PASSPORT---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "assignment_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
const eventRoutes = require("./Routes/event_routes");
const cgpaRoutes = require("./Routes/cgpa_routes");
const reviewRoutes = require("./Routes/review_routes");
const authRoutes = require("./Routes/auth_routes");
const userRoutes = require("./Routes/user_routes");
const forumRoutes = require("./Routes/forum_routes");
const discussionRoutes = require("./Routes/discussion_routes");
const courseRoutes = require("./Routes/course_routes");
const messageRoutes = require("./Routes/message_routes");
const messagesOverviewRoutes = require("./Routes/messages_overview_routes");
const contributionRoutes = require("./Routes/hof_routes");
const instructorReviewRoutes = require("./Routes/instructor_review_routes");
const projectListingRoutes = require("./Routes/project_listing_routes");

app.use("/api/events", eventRoutes);
app.use("/api/cgpa", cgpaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/messages", messagesOverviewRoutes);
app.use("/api/hof", contributionRoutes);
app.use("/api/instructor-reviews", instructorReviewRoutes);
app.use("/api/partners", projectListingRoutes);

// Logger
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// --- DB CONNECTION & START ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  })
  .catch((error) => {
    console.log("Error connecting to DB:\n\n", error);
  });

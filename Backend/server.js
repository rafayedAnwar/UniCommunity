require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("./Config/passport_config");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.SERVER_URI || "mongodb://localhost:27017/unicommunity";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

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

app.use("/api/events", eventRoutes);
app.use("/api/cgpa", cgpaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forums", forumRoutes);

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

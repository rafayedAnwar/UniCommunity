require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./Models/user_model");

const MONGO_URI =
  process.env.SERVER_URI || "mongodb://localhost:27017/unicommunity";

const testUser = {
  googleId: "test123456789",
  firstName: "Test",
  lastName: "User",
  email: "testuser@g.bracu.ac.bd",
  photo: "https://via.placeholder.com/150",
  bio: "This is a test user account for development purposes.",
  socialLinks: {
    linkedIn: "https://linkedin.com/in/testuser",
    github: "https://github.com/testuser",
    portfolio: "https://testuser.dev",
  },
  currentCourses: [
    { code: "CSE471", name: "System Analysis and Design" },
    { code: "CSE370", name: "Database Systems" },
  ],
  completedCourses: [
    { code: "CSE110", name: "Programming Language I" },
    { code: "CSE111", name: "Programming Language II" },
    { code: "CSE220", name: "Data Structures" },
  ],
};

async function seedTestUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });

    if (existingUser) {
      console.log("\n✅ Test user already exists!");
      console.log("User ID:", existingUser._id);
      console.log("Email:", existingUser.email);
      console.log("\nYou can use this User ID to test features:");
      console.log(existingUser._id.toString());
    } else {
      // Create new test user
      const user = await User.create(testUser);
      console.log("\n✅ Test user created successfully!");
      console.log("User ID:", user._id);
      console.log("Email:", user.email);
      console.log("\nYou can use this User ID to test features:");
      console.log(user._id.toString());
    }

    console.log("\n📝 To test the application:");
    console.log("1. Copy the User ID above");
    console.log(
      "2. In ProfilePage.js and ForumPage.js, replace 'user123' with the User ID"
    );
    console.log("3. Start your backend server: npm start (in Backend folder)");
    console.log(
      "4. Start your frontend server: npm start (in Frontend folder)"
    );
    console.log("5. Navigate to http://localhost:3000/profile or /forums");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test user:", error);
    process.exit(1);
  }
}

seedTestUser();

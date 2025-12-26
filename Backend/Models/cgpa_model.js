const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseEntrySchema = new Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  credits: { type: Number, required: true, min: 0, default: 3 },
  gradePoint: { type: Number, required: true, min: 0, max: 4 },
  letterGrade: { type: String, required: true, default: "N/A" },
  semester: { type: String, required: false },
});

const cgpaCalculatorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    courses: [courseEntrySchema],
    totalCredits: { type: Number, default: 0 },
    currentCGPA: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Method to calculate CGPA
cgpaCalculatorSchema.methods.calculateCGPA = function () {
  if (this.courses.length === 0) {
    this.currentCGPA = 0;
    this.totalCredits = 0;
    return;
  }

  let totalPoints = 0;
  let totalCredits = 0;

  this.courses.forEach((course) => {
    const credits = Number(course.credits) || 0;
    const gp = Number(course.gradePoint) || 0;
    totalPoints += gp * credits;
    totalCredits += credits;
  });

  this.totalCredits = totalCredits;
  this.currentCGPA =
    totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
};

module.exports = mongoose.model("CGPACalculator", cgpaCalculatorSchema);

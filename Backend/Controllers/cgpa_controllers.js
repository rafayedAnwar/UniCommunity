const CGPACalculator = require("../Models/cgpa_model");

// GET Request to get user's CGPA calculator data
const getCGPAData = async (req, res) => {
  try {
    const { userId } = req.params;

    let cgpaData = await CGPACalculator.findOne({ userId });

    // If no data exists, create a new calculator for the user
    if (!cgpaData) {
      cgpaData = await CGPACalculator.create({ userId, courses: [] });
    }

    res.status(200).json(cgpaData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST Request to add a course to CGPA calculator
const addCourse = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      courseCode,
      courseName,
      credits,
      gradePoint,
      letterGrade,
      semester,
    } = req.body;

    if (
      !courseCode ||
      !courseName ||
      credits === undefined ||
      gradePoint === undefined ||
      !letterGrade
    ) {
      return res
        .status(400)
        .json({
          error:
            "courseCode, courseName, credits, gradePoint, and letterGrade are required",
        });
    }

    let cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      cgpaData = await CGPACalculator.create({ userId, courses: [] });
    }

    // Add the new course
    cgpaData.courses.push({
      courseCode,
      courseName,
      credits,
      gradePoint,
      letterGrade,
      semester,
    });

    // Recalculate CGPA
    cgpaData.calculateCGPA();
    await cgpaData.save();

    res.status(201).json(cgpaData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT Request to update a course in CGPA calculator
const updateCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const {
      courseCode,
      courseName,
      credits,
      gradePoint,
      letterGrade,
      semester,
    } = req.body;

    const cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    const course = cgpaData.courses.id(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update course fields
    if (courseCode) course.courseCode = courseCode;
    if (courseName) course.courseName = courseName;
    if (credits !== undefined) course.credits = credits;
    if (gradePoint !== undefined) course.gradePoint = gradePoint;
    if (letterGrade) course.letterGrade = letterGrade;
    if (semester) course.semester = semester;

    // Recalculate CGPA
    cgpaData.calculateCGPA();
    await cgpaData.save();

    res.status(200).json(cgpaData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE Request to remove a course from CGPA calculator
const deleteCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    cgpaData.courses.pull(courseId);

    // Recalculate CGPA
    cgpaData.calculateCGPA();
    await cgpaData.save();

    res.status(200).json(cgpaData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Request to export CGPA data for Google Sheets
const getExportData = async (req, res) => {
  try {
    const { userId } = req.params;

    const cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    // Format data for Google Sheets export
    const exportData = {
      headers: [
        "Course Code",
        "Course Name",
        "Credits",
        "Letter Grade",
        "Grade Point",
        "Semester",
      ],
      rows: cgpaData.courses.map((course) => [
        course.courseCode,
        course.courseName,
        course.credits,
        course.letterGrade,
        course.gradePoint,
        course.semester || "N/A",
      ]),
      summary: {
        totalCredits: cgpaData.totalCredits,
        currentCGPA: cgpaData.currentCGPA,
      },
    };

    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Request to clear all courses (reset calculator)
const resetCalculator = async (req, res) => {
  try {
    const { userId } = req.params;

    const cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    cgpaData.courses = [];
    cgpaData.calculateCGPA();
    await cgpaData.save();

    res.status(200).json(cgpaData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCGPAData,
  addCourse,
  updateCourse,
  deleteCourse,
  getExportData,
  resetCalculator,
};

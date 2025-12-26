const CGPACalculator = require("../Models/cgpa_model");
const User = require("../Models/user_model");
const { google } = require("googleapis");

function mapGradePointToLetter(gradePoint) {
  const gp = Number(gradePoint);
  if (Number.isNaN(gp)) return "N/A";
  if (gp >= 4.0) return "A";
  if (gp >= 3.7) return "A-";
  if (gp >= 3.3) return "B+";
  if (gp >= 3.0) return "B";
  if (gp >= 2.7) return "B-";
  if (gp >= 2.3) return "C+";
  if (gp >= 2.0) return "C";
  if (gp >= 1.7) return "C-";
  if (gp >= 1.3) return "D";
  if (gp >= 1.0) return "D-";
  return "F";
}

// Ensure CGPA calculator reflects completed courses from the user's profile
async function syncProfileCoursesToCgpa(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  let cgpaData = await CGPACalculator.findOne({ userId });
  if (!cgpaData) {
    cgpaData = await CGPACalculator.create({ userId, courses: [] });
  }

  const completed = Array.isArray(user.completedCourses)
    ? user.completedCourses
    : [];

  let updated = false;

  completed.forEach((course) => {
    const code = course?.code?.trim()?.toUpperCase();
    const name = course?.name?.trim();
    if (!code || !name) return;
    const gradePoint = Number.isNaN(Number(course.cgpa))
      ? 0
      : Number(course.cgpa);
    const credits = Number(course.credits) || 3;
    const letterGrade = mapGradePointToLetter(gradePoint);

    const existing = cgpaData.courses.find(
      (c) => c.courseCode === code || c.courseName === name
    );
    if (existing) {
      const before =
        existing.gradePoint !== gradePoint ||
        existing.credits !== credits ||
        existing.letterGrade !== letterGrade;
      existing.courseCode = code;
      existing.courseName = name;
      existing.gradePoint = gradePoint;
      existing.credits = credits;
      existing.letterGrade = letterGrade;
      if (before) updated = true;
    } else {
      cgpaData.courses.push({
        courseCode: code,
        courseName: name,
        credits,
        gradePoint,
        letterGrade,
        semester: course.semester || "",
      });
      updated = true;
    }
  });

  if (updated) {
    cgpaData.calculateCGPA();
    await cgpaData.save();
  }
  return cgpaData;
}

// GET Request to get user's CGPA calculator data
const getCGPAData = async (req, res) => {
  try {
    const { userId } = req.params;

    let cgpaData = await syncProfileCoursesToCgpa(userId);
    if (!cgpaData) {
      return res.status(404).json({ error: "User not found" });
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
      gradePoint === undefined ||
      Number.isNaN(Number(gradePoint))
    ) {
      return res
        .status(400)
        .json({
          error:
            "courseCode, courseName, and gradePoint are required",
        });
    }

    const normalizedCredits = Number(credits);
    const safeCredits = Number.isFinite(normalizedCredits) && normalizedCredits > 0 ? normalizedCredits : 3;
    const safeGradePoint = Number(gradePoint);
    const safeLetter = letterGrade && letterGrade.trim() !== "" ? letterGrade.trim().toUpperCase() : mapGradePointToLetter(safeGradePoint);

    let cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      cgpaData = await CGPACalculator.create({ userId, courses: [] });
    }

    // Add the new course
    cgpaData.courses.push({
      courseCode,
      courseName,
      credits: safeCredits,
      gradePoint: safeGradePoint,
      letterGrade: safeLetter,
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
    if (credits !== undefined) {
      const normalizedCredits = Number(credits);
      course.credits =
        Number.isFinite(normalizedCredits) && normalizedCredits > 0
          ? normalizedCredits
          : 3;
    }
    if (gradePoint !== undefined) {
      const gpNum = Number(gradePoint);
      course.gradePoint = Number.isFinite(gpNum) ? gpNum : course.gradePoint;
      if (!letterGrade) {
        course.letterGrade = mapGradePointToLetter(course.gradePoint);
      }
    }
    if (letterGrade) course.letterGrade = letterGrade.trim().toUpperCase();
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

// POST Request to export CGPA data directly to the user's Google Sheets
const exportToGoogleSheets = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.googleRefreshToken) {
      return res.status(400).json({
        error:
          "Missing Google permissions. Please log out and sign in again to grant Drive/Sheets access.",
      });
    }

    // Always sync with profile in case new courses were completed
    await syncProfileCoursesToCgpa(userId);

    const cgpaData = await CGPACalculator.findOne({ userId });
    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    // Prepare sheet values
    const header = [
      "Course Code",
      "Course Name",
      "Credits",
      "Letter Grade",
      "Grade Point",
      "Semester",
    ];
    const courseRows = cgpaData.courses.map((course) => [
      course.courseCode,
      course.courseName,
      course.credits || 3,
      course.letterGrade || mapGradePointToLetter(course.gradePoint),
      course.gradePoint || 0,
      course.semester || "N/A",
    ]);
    const summaryRows = [
      ["", "", "", "Total Credits", cgpaData.totalCredits],
      [
        "",
        "",
        "",
        "Current CGPA",
        Number(cgpaData.currentCGPA) || 0,
      ],
    ];
    const values = [header, ...courseRows, ...summaryRows];

    // Authorize with Google using the stored refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:1760/api/auth/google/callback"
    );
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Create spreadsheet
    const created = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `CGPA Tracker - ${new Date().toLocaleDateString()}`,
        },
      },
    });
    const spreadsheetId = created.data.spreadsheetId;

    // Write data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.status(201).json({
      spreadsheetId,
      spreadsheetUrl: created.data.spreadsheetUrl,
      rowsWritten: values.length,
    });
  } catch (error) {
    console.error("Google Sheets export failed:", error);
    res
      .status(500)
      .json({ error: "Failed to export to Google Sheets", detail: error.message });
  }
};

// DELETE Request to clear all courses (reset calculator)
const resetCalculator = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cgpaData = await CGPACalculator.findOne({ userId });

    if (!cgpaData) {
      return res.status(404).json({ error: "CGPA calculator not found" });
    }

    // Rebuild courses from completed profile courses only (preserve defaults)
    const completed = Array.isArray(user.completedCourses)
      ? user.completedCourses
      : [];

    cgpaData.courses = completed
      .filter((c) => c?.code && c?.name)
      .map((c) => {
        const code = c.code.trim().toUpperCase();
        const name = c.name.trim();
        const gp = Number.isNaN(Number(c.cgpa)) ? 0 : Number(c.cgpa);
        const credits = Number(c.credits) > 0 ? Number(c.credits) : 3;
        return {
          courseCode: code,
          courseName: name,
          gradePoint: gp,
          credits,
          letterGrade: mapGradePointToLetter(gp),
          semester: c.semester || "",
        };
      });

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
  exportToGoogleSheets,
  resetCalculator,
  syncProfileCoursesToCgpa,
};

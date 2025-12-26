import React, { useEffect, useState } from "react";
import "../CSS/cgpaPage.css";

const emptyCourse = {
  courseCode: "",
  courseName: "",
  credits: "3",
  gradePoint: "",
  letterGrade: "",
  semester: "",
};

const mapGradePointToLetter = (gp) => {
  const gradePoint = Number(gp);
  if (Number.isNaN(gradePoint)) return "";
  if (gradePoint >= 4.0) return "A";
  if (gradePoint >= 3.7) return "A-";
  if (gradePoint >= 3.3) return "B+";
  if (gradePoint >= 3.0) return "B";
  if (gradePoint >= 2.7) return "B-";
  if (gradePoint >= 2.3) return "C+";
  if (gradePoint >= 2.0) return "C";
  if (gradePoint >= 1.7) return "C-";
  if (gradePoint >= 1.3) return "D";
  if (gradePoint >= 1.0) return "D-";
  return "F";
};

const CgpaPage = () => {
  const [user, setUser] = useState(null);
  const [cgpaData, setCgpaData] = useState(null);
  const [newCourse, setNewCourse] = useState(emptyCourse);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({});
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:1760/api/auth/current", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      const loggedIn = data.user || data;
      setUser(loggedIn);
      await loadCgpa(loggedIn._id);
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const loadCgpa = async (userId) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`http://localhost:1760/api/cgpa/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setCgpaData(data);
    } catch (err) {
      setMessage("Failed to load CGPA data");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field, value) => {
    setNewCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    const creditsVal = newCourse.credits === "" ? 3 : Number(newCourse.credits);
    const gradePointVal = Number(newCourse.gradePoint);
    const letter =
      newCourse.letterGrade && newCourse.letterGrade.trim() !== ""
        ? newCourse.letterGrade.trim().toUpperCase()
        : mapGradePointToLetter(gradePointVal);

    const payload = {
      courseCode: newCourse.courseCode.trim().toUpperCase(),
      courseName: newCourse.courseName.trim(),
      credits: creditsVal,
      gradePoint: gradePointVal,
      letterGrade: letter,
      semester: newCourse.semester.trim(),
    };

    if (
      !payload.courseCode ||
      !payload.courseName ||
      Number.isNaN(payload.gradePoint) ||
      !payload.letterGrade
    ) {
      setMessage("Please fill in all fields with valid values.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:1760/api/cgpa/${user._id}/courses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setCgpaData(data);
      setNewCourse(emptyCourse);
    } catch (err) {
      setMessage("Could not add course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!user?._id) return;
    try {
      const res = await fetch(
        `http://localhost:1760/api/cgpa/${user._id}/courses/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      setCgpaData(data);
    } catch (err) {
      setMessage("Failed to delete course");
    }
  };

  const handleReset = async () => {
    if (!user?._id) return;
    if (!window.confirm("Clear all courses from your CGPA calculator?")) return;
    try {
      const res = await fetch(
        `http://localhost:1760/api/cgpa/${user._id}/reset`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Reset failed");
      const data = await res.json();
      setCgpaData(data);
    } catch (err) {
      setMessage("Failed to reset calculator");
    }
  };

  const handleEditChange = (courseId, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [courseId]: { ...(prev[courseId] || {}), [field]: value },
    }));
  };

  const startEdit = (course) => {
    setEditing((prev) => ({
      ...prev,
      [course._id]: {
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        gradePoint: course.gradePoint,
        letterGrade: course.letterGrade,
        semester: course.semester || "",
      },
    }));
  };

  const cancelEdit = (courseId) => {
    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[courseId];
      return copy;
    });
  };

  const handleSaveEdit = async (courseId) => {
    if (!user?._id) return;
    const edits = editing[courseId];
    if (!edits) return;
    const gp = Number(edits.gradePoint);
    const credits = edits.credits === "" ? 3 : Number(edits.credits);
    const letter =
      edits.letterGrade && edits.letterGrade.trim() !== ""
        ? edits.letterGrade.trim().toUpperCase()
        : mapGradePointToLetter(gp);

    if (Number.isNaN(gp)) {
      setMessage("Enter a valid grade point.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:1760/api/cgpa/${user._id}/courses/${courseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            courseCode: edits.courseCode,
            courseName: edits.courseName,
            credits,
            gradePoint: gp,
            letterGrade: letter,
            semester: edits.semester,
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setCgpaData(data);
      cancelEdit(courseId);
    } catch (err) {
      setMessage("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!user?._id) return;
    setExporting(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:1760/api/cgpa/${user._id}/export/sheets`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Export failed");
      }
      const url = data.spreadsheetUrl;
      setMessage(
        url
          ? `Exported to Google Sheets. Open it here: ${url}`
          : "Exported to Google Sheets."
      );
      if (url) {
        window.open(url, "_blank", "noopener");
      }
    } catch (err) {
      setMessage(
        err.message ||
          "Export failed. Re-login to grant Google Drive/Sheets permission."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading || !cgpaData) {
    return (
      <div className="cgpa-container">
        <h2>Loading CGPA calculator...</h2>
      </div>
    );
  }

  return (
    <div className="cgpa-container">
      <div className="cgpa-header">
        <div>
          <h1>CGPA Calculator</h1>
          <p>
            Completed courses from your profile are included automatically. Add extra courses here only if you want to project goal CGPAs.
          </p>
        </div>
        <div className="cgpa-actions">
          <button className="secondary" onClick={handleReset}>
            Reset
          </button>
          <button className="primary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export to Google Sheets"}
          </button>
        </div>
      </div>

      {message && <div className="cgpa-message">{message}</div>}

      <div className="cgpa-summary">
        <div className="summary-card">
          <span className="summary-label">Current CGPA</span>
          <span className="summary-value">{cgpaData.currentCGPA || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Credits</span>
          <span className="summary-value">{cgpaData.totalCredits || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Courses Tracked</span>
          <span className="summary-value">{cgpaData.courses.length}</span>
        </div>
      </div>

      <div className="cgpa-grid">
        <div className="cgpa-card">
          <h2>Add Course</h2>
          <form className="course-form" onSubmit={handleAddCourse}>
            <div className="form-row">
              <label>Course Code</label>
              <input
                value={newCourse.courseCode}
                onChange={(e) => handleInput("courseCode", e.target.value)}
                placeholder="e.g., CSE471"
                required
              />
            </div>
            <div className="form-row">
              <label>Course Name</label>
              <input
                value={newCourse.courseName}
                onChange={(e) => handleInput("courseName", e.target.value)}
                placeholder="System Analysis and Design"
                required
              />
            </div>
            <div className="form-row two-col">
              <div>
                <label>Credits</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newCourse.credits}
                  onChange={(e) => handleInput("credits", e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Grade Point</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={newCourse.gradePoint}
                  onChange={(e) => handleInput("gradePoint", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row two-col">
              <div>
                <label>Letter Grade</label>
                <input
                  value={newCourse.letterGrade}
                  onChange={(e) => handleInput("letterGrade", e.target.value)}
                  placeholder="A-, B+ (optional)"
                />
              </div>
              <div>
                <label>Semester (optional)</label>
                <input
                  value={newCourse.semester}
                  onChange={(e) => handleInput("semester", e.target.value)}
                  placeholder="Fall 2025"
                />
              </div>
            </div>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving..." : "Add Course"}
            </button>
          </form>
        </div>

        <div className="cgpa-card">
          <h2>Courses</h2>
          {cgpaData.courses.length === 0 ? (
            <p className="empty-state">No courses added yet.</p>
          ) : (
            <div className="courses-table">
              <div className="table-header">
                <span>Course</span>
                <span>Credits</span>
                <span>Grade</span>
                <span>Points</span>
                <span>Semester</span>
                <span></span>
              </div>
              {cgpaData.courses.map((course) => (
                <div className="table-row" key={course._id}>
                  {editing[course._id] ? (
                    <>
                      <span>
                        <input
                          value={editing[course._id].courseCode}
                          onChange={(e) =>
                            handleEditChange(course._id, "courseCode", e.target.value)
                          }
                        />
                        <input
                          value={editing[course._id].courseName}
                          onChange={(e) =>
                            handleEditChange(course._id, "courseName", e.target.value)
                          }
                          style={{ marginTop: 4 }}
                        />
                      </span>
                      <span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editing[course._id].credits}
                          onChange={(e) =>
                            handleEditChange(course._id, "credits", e.target.value)
                          }
                        />
                      </span>
                      <span>
                        <input
                          value={editing[course._id].letterGrade}
                          onChange={(e) =>
                            handleEditChange(course._id, "letterGrade", e.target.value)
                          }
                        />
                      </span>
                      <span>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          step="0.01"
                          value={editing[course._id].gradePoint}
                          onChange={(e) =>
                            handleEditChange(course._id, "gradePoint", e.target.value)
                          }
                        />
                      </span>
                      <span>
                        <input
                          value={editing[course._id].semester}
                          onChange={(e) =>
                            handleEditChange(course._id, "semester", e.target.value)
                          }
                        />
                      </span>
                      <span style={{ display: "flex", gap: 8 }}>
                        <button
                          className="primary"
                          type="button"
                          onClick={() => handleSaveEdit(course._id)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          className="secondary"
                          type="button"
                          onClick={() => cancelEdit(course._id)}
                        >
                          Cancel
                        </button>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        <strong>{course.courseCode}</strong>
                        <div className="muted">{course.courseName}</div>
                      </span>
                      <span>{course.credits}</span>
                      <span>{course.letterGrade}</span>
                      <span>{course.gradePoint}</span>
                      <span>{course.semester || "-"}</span>
                      <span style={{ display: "flex", gap: 8 }}>
                        <button
                          className="secondary"
                          type="button"
                          onClick={() => startEdit(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleDeleteCourse(course._id)}
                          title="Remove course"
                        >
                          Remove
                        </button>
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CgpaPage;

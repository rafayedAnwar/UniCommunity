import React, { useState, useEffect } from "react";
import "../CSS/profilePage.css";
import BadgeDisplay from "../Components/BadgeDisplay";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    currentCourses: [],
    completedCourses: [],
  });

  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    type: "current",
    cgpa: "",
    credits: "3",
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Fetch current authenticated user first
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) fetchBadges();
    // eslint-disable-next-line
  }, [userId]);
  const fetchBadges = async () => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/users/${userId}/badges`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      }
    } catch (error) {
      setBadges([]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:1760/api/auth/current", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData._id);
        setProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          photo: userData.photo || "",
          bio: userData.bio || "",
          linkedIn: userData.socialLinks?.linkedIn || "",
          github: userData.socialLinks?.github || "",
          portfolio: userData.socialLinks?.portfolio || "",
          currentCourses: userData.currentCourses || [],
          completedCourses: userData.completedCourses || [],
        });
      } else {
        // Not authenticated, redirect to login
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `http://localhost:1760/api/users/${userId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        photo: data.photo || "",
        bio: data.bio || "",
        linkedIn: data.socialLinks?.linkedIn || "",
        github: data.socialLinks?.github || "",
        portfolio: data.socialLinks?.portfolio || "",
        currentCourses: data.currentCourses || [],
        completedCourses: data.completedCourses || [],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bio: profile.bio,
            socialLinks: {
              linkedIn: profile.linkedIn,
              github: profile.github,
              portfolio: profile.portfolio,
            },
            currentCourses: profile.currentCourses,
            completedCourses: profile.completedCourses,
          }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      if (newCourse.type === "completed") {
        const gp = parseFloat(newCourse.cgpa);
        if (Number.isNaN(gp) || gp < 0 || gp > 4) {
          alert("Please enter a CGPA between 0 and 4 for completed courses.");
          return;
        }
        const credits = parseFloat(newCourse.credits || "3");
        if (!newCourse.credits || Number.isNaN(credits) || credits <= 0) {
          alert("Please enter valid credits for completed courses.");
          return;
        }
      }

      const courseToAdd = {
        code: newCourse.code.trim().toUpperCase(),
        name: newCourse.name.trim(),
        cgpa:
          newCourse.type === "completed"
            ? parseFloat(newCourse.cgpa)
            : newCourse.cgpa
            ? parseFloat(newCourse.cgpa)
            : undefined,
        credits:
          newCourse.type === "completed"
            ? parseFloat(newCourse.credits || "3")
            : newCourse.credits
            ? parseFloat(newCourse.credits)
            : 3,
      };

      if (newCourse.type === "current") {
        setProfile((prev) => ({
          ...prev,
          currentCourses: [...prev.currentCourses, courseToAdd],
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          completedCourses: [...prev.completedCourses, courseToAdd],
        }));
      }

      setNewCourse({
        code: "",
        name: "",
        type: "current",
        cgpa: "",
        credits: "3",
      });
    }
  };

  const handleRemoveCourse = (index, type) => {
    if (type === "current") {
      setProfile((prev) => ({
        ...prev,
        currentCourses: prev.currentCourses.filter((_, i) => i !== index),
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        completedCourses: prev.completedCourses.filter((_, i) => i !== index),
      }));
    }
  };

  const handleMoveCourse = (index, from, to) => {
    const course =
      from === "current"
        ? profile.currentCourses[index]
        : profile.completedCourses[index];

    let updatedCourse = { ...course };
    if (to === "completed") {
      const entered = prompt(
        "Enter CGPA (0-4) for this course before marking as completed:"
      );
      const gp = entered !== null ? parseFloat(entered) : NaN;
      if (Number.isNaN(gp) || gp < 0 || gp > 4) {
        alert("Invalid CGPA. Please try again.");
        return;
      }
      updatedCourse.cgpa = gp;
      // Use existing credits or default to 3 when moving to completed
      const credits = course.credits ? parseFloat(course.credits) : 3;
      updatedCourse.credits =
        Number.isFinite(credits) && credits > 0 ? credits : 3;
    }

    handleRemoveCourse(index, from);

    if (to === "current") {
      setProfile((prev) => ({
        ...prev,
        currentCourses: [...prev.currentCourses, updatedCourse],
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        completedCourses: [...prev.completedCourses, updatedCourse],
      }));
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveProfile}>
              Save Changes
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        {/* Profile Photo */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <img
            src={
              profile.photo && profile.photo.trim() !== ""
                ? profile.photo
                : `https://ui-avatars.com/api/?name=${profile.firstName}`
            }
            alt={profile.firstName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${profile.firstName}`;
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              marginRight: 24,
              objectFit: "cover",
            }}
          />
          <div>
            <h2 style={{ margin: 0 }}>
              {profile.firstName} {profile.lastName}
            </h2>
            <div style={{ color: "#888", fontSize: 16 }}>{profile.email}</div>
          </div>
        </div>
        {/* Badges Section */}
        <BadgeDisplay badges={badges} />
        {/* Basic Info Section removed as per new requirements */}

        {/* Bio Section */}
        <section className="profile-section">
          <h2>Bio</h2>
          {isEditing ? (
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="5"
              className="bio-textarea"
            />
          ) : (
            <p className="bio-text">{profile.bio || "No bio added yet."}</p>
          )}
        </section>

        {/* Social Links Section */}
        <section className="profile-section">
          <h2>Social & Professional Links</h2>
          <div className="links-grid">
            <div className="link-item">
              <label>
                <img
                  src="https://www.svgrepo.com/show/448234/linkedin.svg"
                  alt="LinkedIn"
                  className="link-icon"
                />
                LinkedIn
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="linkedIn"
                  value={profile.linkedIn}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : profile.linkedIn ? (
                <a
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.linkedIn}
                </a>
              ) : (
                <p className="no-link">Not added</p>
              )}
            </div>

            <div className="link-item">
              <label>
                <img
                  src="https://www.svgrepo.com/show/475654/github-color.svg"
                  alt="GitHub"
                  className="link-icon"
                />
                GitHub
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="github"
                  value={profile.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                />
              ) : profile.github ? (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.github}
                </a>
              ) : (
                <p className="no-link">Not added</p>
              )}
            </div>

            <div className="link-item">
              <label>
                <img
                  src="https://www.svgrepo.com/show/509124/globe.svg"
                  alt="Portfolio"
                  className="link-icon"
                />
                Portfolio
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="portfolio"
                  value={profile.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                />
              ) : profile.portfolio ? (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.portfolio}
                </a>
              ) : (
                <p className="no-link">Not added</p>
              )}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="profile-section">
          <h2>My Courses</h2>

          {isEditing && (
            <div className="add-course-form">
              <h3>Add Course</h3>
              <div className="course-input-group">
                <input
                  type="text"
                  placeholder="Course Code (e.g., CSE471)"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, code: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                />
                <select
                  value={newCourse.type}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, type: e.target.value })
                  }
                >
                  <option value="current">Current</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="number"
                  placeholder="Credits (e.g., 3)"
                  value={newCourse.credits}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, credits: e.target.value })
                  }
                  min="0"
                  step="0.5"
                />
                {newCourse.type === "completed" && (
                  <input
                    type="number"
                    placeholder="CGPA (0-4)"
                    value={newCourse.cgpa}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, cgpa: e.target.value })
                    }
                    min="0"
                    max="4"
                    step="0.01"
                  />
                )}
                <button className="add-course-btn" onClick={handleAddCourse}>
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="courses-container">
            {/* Current Courses */}
            <div className="course-list">
              <h3>Current Courses ({profile.currentCourses.length})</h3>
              {profile.currentCourses.length === 0 ? (
                <p className="no-courses">No current courses</p>
              ) : (
                <ul>
                  {profile.currentCourses.map((course, index) => (
                    <li key={index} className="course-item">
                      <div className="course-info">
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">{course.name}</span>
                      </div>
                      {isEditing && (
                        <div className="course-actions">
                          <button
                            className="move-btn"
                            onClick={() =>
                              handleMoveCourse(index, "current", "completed")
                            }
                            title="Move to completed"
                          >
                            {"→"}
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveCourse(index, "current")}
                          >
                            x
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Completed Courses */}
            <div className="course-list">
              <h3>Completed Courses ({profile.completedCourses.length})</h3>
              {profile.completedCourses.length === 0 ? (
                <p className="no-courses">No completed courses</p>
              ) : (
                <ul>
                  {profile.completedCourses.map((course, index) => (
                    <li key={index} className="course-item completed">
                      <div className="course-info">
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">
                          {course.name}
                          {course.cgpa !== undefined &&
                            course.cgpa !== null && (
                              <span className="course-meta">
                                {" | CGPA: "}
                                {course.cgpa}
                                {` | Credits: ${course.credits ?? 3}`}
                              </span>
                            )}
                        </span>
                      </div>
                      {isEditing && (
                        <div className="course-actions">
                          <button
                            className="move-btn"
                            onClick={() =>
                              handleMoveCourse(index, "completed", "current")
                            }
                            title="Move to current"
                          >
                            {"←"}
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() =>
                              handleRemoveCourse(index, "completed")
                            }
                          >
                            x
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;

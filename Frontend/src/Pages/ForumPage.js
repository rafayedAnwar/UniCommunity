import React, { useState, useEffect } from "react";
import "../CSS/forumPage.css";

const ForumPage = () => {
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [resources, setResources] = useState([]);
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [showUploadResource, setShowUploadResource] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "file"
  const [selectedFile, setSelectedFile] = useState(null);

  const [newForum, setNewForum] = useState({
    courseCode: "",
    courseName: "",
    description: "",
  });

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "",
  });

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:1760/api/auth/current", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData._id);
        setUserName(`${userData.firstName} ${userData.lastName}`);
        fetchForums();
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

  const fetchForums = async () => {
    try {
      const response = await fetch("http://localhost:1760/api/forums");
      const data = await response.json();
      setForums(data);
    } catch (error) {
      console.error("Error fetching forums:", error);
    }
  };

  const fetchForumResources = async (courseCode) => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/forums/${courseCode}/resources`
      );
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleSelectForum = async (forum) => {
    setSelectedForum(forum);
    await fetchForumResources(forum.courseCode);
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:1760/api/forums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newForum,
          userId,
        }),
      });

      if (response.ok) {
        alert("Forum created successfully!");
        setShowCreateForum(false);
        setNewForum({ courseCode: "", courseName: "", description: "" });
        fetchForums();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create forum");
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      alert("Failed to create forum");
    }
  };

  const handleJoinForum = async (courseCode) => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/forums/${courseCode}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        alert("Joined forum successfully!");
        // Update selectedForum members immediately for UI feedback
        setSelectedForum((prev) =>
          prev ? { ...prev, members: [...(prev.members || []), userId] } : prev
        );
        fetchForums();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to join forum");
      }
    } catch (error) {
      console.error("Error joining forum:", error);
      alert("Failed to join forum");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
      // Auto-detect file type
      setNewResource({ ...newResource, fileType: file.type });
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();

    // Validation
    if (uploadMethod === "file" && !selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    if (uploadMethod === "url" && !newResource.fileUrl) {
      alert("Please enter a file URL");
      return;
    }

    try {
      let payload = {
        title: newResource.title,
        description: newResource.description,
        userId,
        uploaderName: userName,
      };

      // If uploading a file directly
      if (uploadMethod === "file" && selectedFile) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          payload.fileData = reader.result;
          payload.fileName = selectedFile.name;
          payload.fileSize = selectedFile.size;
          payload.fileType = selectedFile.type;

          await sendUploadRequest(payload);
        };
        reader.onerror = () => {
          alert("Failed to read file");
        };
        reader.readAsDataURL(selectedFile);
      } else if (uploadMethod === "url") {
        // Using URL
        payload.fileUrl = newResource.fileUrl;
        payload.fileType = newResource.fileType;
        await sendUploadRequest(payload);
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      alert("Failed to upload resource");
    }
  };

  const sendUploadRequest = async (payload) => {
    try {
      const response = await fetch(
        `http://localhost:1760/api/forums/${selectedForum.courseCode}/resources`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Resource uploaded successfully!");
        setShowUploadResource(false);
        setUploadMethod("url");
        setSelectedFile(null);
        setNewResource({
          title: "",
          description: "",
          fileUrl: "",
          fileType: "",
        });
        fetchForumResources(selectedForum.courseCode);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload resource");
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      alert("Failed to upload resource: " + error.message);
    }
  };

  const handleDownload = async (resourceId, resource) => {
    try {
      await fetch(
        `http://localhost:1760/api/forums/${selectedForum.courseCode}/resources/${resourceId}/download`,
        {
          method: "PUT",
        }
      );

      // If file has fileData (stored in DB), download it
      if (resource.fileData) {
        const link = document.createElement("a");
        link.href = resource.fileData;
        link.download = resource.fileName || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (resource.fileUrl) {
        // Otherwise, open the URL
        window.open(resource.fileUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1760/api/forums/${selectedForum.courseCode}/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        alert("Resource deleted successfully!");
        fetchForumResources(selectedForum.courseCode);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource");
    }
  };

  if (loading) {
    return (
      <div className="forum-container">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Loading forums...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Course Resource Forums</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForum(true)}
        >
          Create New Forum
        </button>
      </div>

      <div className="forum-content">
        <div className="forum-sidebar">
          <h2>Available Forums</h2>
          <div className="forum-list">
            {forums.map((forum) => (
              <div
                key={forum._id}
                className={`forum-item ${
                  selectedForum?.courseCode === forum.courseCode ? "active" : ""
                }`}
                onClick={() => handleSelectForum(forum)}
              >
                <div className="forum-item-header">
                  <h3>{forum.courseCode}</h3>
                  <span className="member-count">
                    {forum.members?.length || 0} members
                  </span>
                </div>
                <p className="forum-course-name">{forum.courseName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="forum-main">
          {selectedForum ? (
            <>
              <div className="forum-details">
                <div className="forum-details-header">
                  <div>
                    <h2>
                      {selectedForum.courseCode} - {selectedForum.courseName}
                    </h2>
                    {selectedForum.description && (
                      <p className="forum-description">
                        {selectedForum.description}
                      </p>
                    )}
                  </div>
                  <div className="forum-actions">
                    {selectedForum.members &&
                    selectedForum.members.includes(userId) ? (
                      <button
                        className="btn btn-secondary"
                        disabled
                        style={{
                          backgroundColor: "#b5b5b5",
                          cursor: "not-allowed",
                        }}
                      >
                        Joined
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        style={{ backgroundColor: "#38a169", color: "white" }}
                        onClick={() =>
                          handleJoinForum(selectedForum.courseCode)
                        }
                      >
                        Join Forum
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowUploadResource(true)}
                    >
                      Upload Resource
                    </button>
                  </div>
                </div>
              </div>

              <div className="resources-section">
                <h3>Shared Resources ({resources.length})</h3>
                <div className="resources-grid">
                  {resources.length === 0 ? (
                    <p className="no-resources">
                      No resources uploaded yet. Be the first to share!
                    </p>
                  ) : (
                    resources.map((resource) => (
                      <div key={resource._id} className="resource-card">
                        <div className="resource-header">
                          <div className="file-icon">
                            {resource.fileType.includes("pdf") && "📄"}
                            {resource.fileType.includes("doc") && "📝"}
                            {resource.fileType.includes("ppt") && "📊"}
                            {resource.fileType.includes("image") && "🖼️"}
                            {!resource.fileType.includes("pdf") &&
                              !resource.fileType.includes("doc") &&
                              !resource.fileType.includes("ppt") &&
                              !resource.fileType.includes("image") &&
                              "📎"}
                          </div>
                          <h4>{resource.title}</h4>
                        </div>
                        <p className="resource-description">
                          {resource.description}
                        </p>

                        {resource.fileName && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#64748b",
                              marginTop: "4px",
                            }}
                          >
                            📁 {resource.fileName}{" "}
                            {resource.fileSize &&
                              `(${(resource.fileSize / 1024).toFixed(2)} KB)`}
                          </div>
                        )}

                        <div className="resource-footer">
                          <div className="uploader-info">
                            <span>Uploaded by {resource.uploaderName}</span>
                            <span className="downloads">
                              ⬇️ {resource.downloads} downloads
                            </span>
                          </div>
                          <div className="resource-actions">
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() =>
                                handleDownload(resource._id, resource)
                              }
                            >
                              Download
                            </button>
                            {resource.uploadedBy === userId && (
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() =>
                                  handleDeleteResource(resource._id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-forum-selected">
              <h2>Select a forum to view resources</h2>
              <p>Choose a course forum from the left sidebar to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Forum Modal */}
      {showCreateForum && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateForum(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Forum</h2>
            <form onSubmit={handleCreateForum}>
              <div className="form-group">
                <label>Course Code *</label>
                <input
                  type="text"
                  value={newForum.courseCode}
                  onChange={(e) =>
                    setNewForum({ ...newForum, courseCode: e.target.value })
                  }
                  required
                  placeholder="e.g., CSE471"
                />
              </div>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  value={newForum.courseName}
                  onChange={(e) =>
                    setNewForum({ ...newForum, courseName: e.target.value })
                  }
                  required
                  placeholder="e.g., System Analysis and Design"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newForum.description}
                  onChange={(e) =>
                    setNewForum({ ...newForum, description: e.target.value })
                  }
                  placeholder="Brief description of the forum"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForum(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Forum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadResource && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadResource(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Resource</h2>
            <form onSubmit={handleUploadResource}>
              <div className="form-group">
                <label>Upload Method *</label>
                <div
                  style={{ display: "flex", gap: "16px", marginBottom: "12px" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      value="url"
                      checked={uploadMethod === "url"}
                      onChange={(e) => setUploadMethod(e.target.value)}
                    />
                    URL Link
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      value="file"
                      checked={uploadMethod === "file"}
                      onChange={(e) => setUploadMethod(e.target.value)}
                    />
                    Upload File (PDF, etc.)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  required
                  placeholder="e.g., Lecture Notes - Chapter 5"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      description: e.target.value,
                    })
                  }
                  required
                  placeholder="Brief description of the resource"
                  rows="3"
                />
              </div>

              {uploadMethod === "url" ? (
                <>
                  <div className="form-group">
                    <label>File URL *</label>
                    <input
                      type="url"
                      value={newResource.fileUrl}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          fileUrl: e.target.value,
                        })
                      }
                      required
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>File Type *</label>
                    <select
                      value={newResource.fileType}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          fileType: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select file type</option>
                      <option value="application/pdf">PDF Document</option>
                      <option value="application/msword">Word Document</option>
                      <option value="application/vnd.ms-powerpoint">
                        PowerPoint Presentation
                      </option>
                      <option value="image/jpeg">JPEG Image</option>
                      <option value="image/png">PNG Image</option>
                      <option value="text/plain">Text File</option>
                      <option value="application/zip">ZIP Archive</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Select File * (Max 10MB)</label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt,.zip"
                  />
                  {selectedFile && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      <strong>Selected:</strong> {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowUploadResource(false);
                    setUploadMethod("url");
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {uploadMethod === "file" && selectedFile
                    ? "Upload File"
                    : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;

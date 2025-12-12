import React, { useState, useEffect } from "react";
import "./CSS/forumPage.css";

const ForumPage = () => {
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [resources, setResources] = useState([]);
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [showUploadResource, setShowUploadResource] = useState(false);

  const [newForum, setNewForum] = useState({
    courseCode: "",
    courseName: "",
    description: "",
  });

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileSize: 0,
    fileType: "",
  });

  // TODO: Replace with actual user ID from authentication
  const userId = "693bd29cddcf4501d3dcd73c"; // Test user ID
  const userName = "Test User";

  useEffect(() => {
    fetchForums();
  }, []);

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

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:1760/api/forums/${selectedForum.courseCode}/resources`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newResource,
            userId,
            uploaderName: userName,
          }),
        }
      );

      if (response.ok) {
        alert("Resource uploaded successfully!");
        setShowUploadResource(false);
        setNewResource({
          title: "",
          description: "",
          fileUrl: "",
          fileName: "",
          fileSize: 0,
          fileType: "",
        });
        fetchForumResources(selectedForum.courseCode);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload resource");
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      alert("Failed to upload resource");
    }
  };

  const handleDownload = async (resourceId, fileUrl) => {
    try {
      await fetch(
        `http://localhost:1760/api/forums/${selectedForum.courseCode}/resources/${resourceId}/download`,
        {
          method: "PUT",
        }
      );

      window.open(fileUrl, "_blank");
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

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
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleJoinForum(selectedForum.courseCode)}
                    >
                      Join Forum
                    </button>
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
                        <div className="resource-meta">
                          <span className="file-name">{resource.fileName}</span>
                          <span className="file-size">
                            {formatFileSize(resource.fileSize)}
                          </span>
                        </div>
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
                                handleDownload(resource._id, resource.fileUrl)
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
              <div className="form-group">
                <label>File URL *</label>
                <input
                  type="url"
                  value={newResource.fileUrl}
                  onChange={(e) =>
                    setNewResource({ ...newResource, fileUrl: e.target.value })
                  }
                  required
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="form-group">
                <label>File Name *</label>
                <input
                  type="text"
                  value={newResource.fileName}
                  onChange={(e) =>
                    setNewResource({ ...newResource, fileName: e.target.value })
                  }
                  required
                  placeholder="e.g., chapter5_notes.pdf"
                />
              </div>
              <div className="form-group">
                <label>File Size (bytes) *</label>
                <input
                  type="number"
                  value={newResource.fileSize}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      fileSize: parseInt(e.target.value),
                    })
                  }
                  required
                  placeholder="e.g., 2048576"
                />
              </div>
              <div className="form-group">
                <label>File Type *</label>
                <select
                  value={newResource.fileType}
                  onChange={(e) =>
                    setNewResource({ ...newResource, fileType: e.target.value })
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadResource(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload
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

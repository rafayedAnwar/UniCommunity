import React, { useEffect, useState } from "react";
import "../CSS/projectPartners.css";

const emptyForm = {
  projectName: "",
  courses: "",
  skills: "",
  description: "",
};

const ProjectPartnersPage = () => {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ course: "", skills: "", q: "" });

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:1760/api/auth/current", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      setUser(data.user || data);
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.course.trim()) params.append("course", filters.course.trim());
      if (filters.skills.trim()) params.append("skills", filters.skills.trim());
      if (filters.q.trim()) params.append("q", filters.q.trim());
      const res = await fetch(
        `http://localhost:1760/api/partners?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const combinedCourses = (form.courses || "")
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
        .join(",");
      const payload = {
        projectName: form.projectName.trim(),
        courseCodes: combinedCourses,
        skills: form.skills,
        description: form.description,
      };
      const res = await fetch("http://localhost:1760/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");
      setForm(emptyForm);
      await loadListings();
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`http://localhost:1760/api/partners/${id}/join`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");
      setListings((prev) => prev.map((l) => (l._id === id ? data : l)));
    } catch (err) {
      setError(err.message || "Could not join listing");
    }
  };

  const handleTrello = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:1760/api/partners/${id}/trello`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trello creation failed");
      setListings((prev) => prev.map((l) => (l._id === id ? data : l)));
      if (data.trelloBoardUrl)
        window.open(data.trelloBoardUrl, "_blank", "noopener");
    } catch (err) {
      setError(err.message || "Could not create Trello board");
    }
  };

  const isMember = (listing) =>
    listing.members?.some(
      (m) => m.userId === user?._id || m.userId === user?._id?.toString()
    );

  if (!user || loading) {
    return (
      <div className="partners-container">
        <h2>Loading partner listings...</h2>
      </div>
    );
  }

  return (
    <div className="partners-container">
      <div className="partners-header">
        <div>
          <h1>Project/Thesis Partners</h1>
          <p>Find partners by course or skills and spin up a Trello board.</p>
        </div>
        <div className="filters">
          <input
            placeholder="Courses (comma separated)"
            value={filters.course}
            onChange={(e) =>
              setFilters((f) => ({ ...f, course: e.target.value }))
            }
          />
          <input
            placeholder="Skills (comma separated)"
            value={filters.skills}
            onChange={(e) =>
              setFilters((f) => ({ ...f, skills: e.target.value }))
            }
          />
          <input
            placeholder="Search by project or creator"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          <button className="primary" type="button" onClick={loadListings}>
            Apply Filters
          </button>
        </div>
      </div>

      {error && <div className="events-message">{error}</div>}

      <div className="partners-grid">
        <div className="partners-card">
          <h2>Create listing</h2>
          <form className="event-form" onSubmit={handleCreate}>
            <div className="form-row two-col">
              <div>
                <label>Project name</label>
                <input
                  value={form.projectName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectName: e.target.value }))
                  }
                  placeholder="Thesis topic or project title"
                  required
                />
              </div>
              <div>
                <label>Courses (comma separated)</label>
                <input
                  value={form.courses}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, courses: e.target.value }))
                  }
                  placeholder="CSE471, CSE422"
                />
              </div>
            </div>
            <div className="form-row two-col">
              <div>
                <label>Skills needed (comma separated)</label>
                <input
                  value={form.skills}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, skills: e.target.value }))
                  }
                  placeholder="React, ML, Writing"
                />
              </div>
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Project idea, expectations, timeline..."
                required
              />
            </div>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Posting..." : "Post listing"}
            </button>
          </form>
        </div>

        <div className="partners-card">
          <h2>Listings</h2>
          {listings.length === 0 ? (
            <p className="empty-state">No listings yet.</p>
          ) : (
            <div
              className="events-list"
              style={{ maxHeight: 600, overflowY: "auto", paddingRight: 6 }}
            >
              {listings.map((l) => {
                const memberCount = l.members?.length || 0;
                const memberNames = l.members?.map((m) => m.name).join(", ");
                const owner =
                  l.creatorId === user?._id ||
                  l.creatorId === user?._id?.toString();
                return (
                  <div className="listing" key={l._id}>
                    <div className="listing-top">
                      <div>
                        <strong>{l.projectName || "Project"}</strong>
                        <div className="muted">
                          Courses: {(l.courseCodes || []).join(", ")}
                        </div>
                        <div className="muted">by {l.creatorName}</div>
                      </div>
                      <div className="pill">{memberCount} members</div>
                    </div>
                    <p>{l.description}</p>
                    <div className="skills">
                      {(l.skills || []).map((s, idx) => (
                        <span className="pill" key={idx}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="members">
                      <strong>Members:</strong> {memberNames || "—"}
                    </div>
                    {isMember(l) && l.trelloBoardUrl && (
                      <a
                        className="trello-link"
                        href={l.trelloBoardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 Open Trello Board
                      </a>
                    )}
                    <div className="partners-actions">
                      {!isMember(l) && (
                        <button
                          className="secondary"
                          onClick={() => handleJoin(l._id)}
                        >
                          Join group
                        </button>
                      )}
                      {isMember(l) && owner && !l.trelloBoardUrl && (
                        <button
                          className="primary"
                          onClick={() => handleTrello(l._id)}
                        >
                          Create Trello board
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPartnersPage;

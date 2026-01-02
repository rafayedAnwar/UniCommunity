import React, { useEffect, useMemo, useState } from "react";
import "../CSS/eventsPage.css";

const defaultForm = {
  title: "",
  description: "",
  eventType: "academic",
  startDateTime: "",
  endDateTime: "",
  location: "",
  maxAttendees: "",
  tags: "",
  openForAll: true,
};

const EventsPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    eventType: "all",
    startDate: "",
    endDate: "",
  });
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:1760/api/auth/current", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      const u = data.user || data;
      setUser(u);
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.eventType !== "all")
        params.append("eventType", filters.eventType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      const res = await fetch(
        `http://localhost:1760/api/events?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load events");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        organizerId: user._id,
        organizerName: `${user.firstName} ${user.lastName}`,
        maxAttendees:
          form.maxAttendees !== "" ? Number(form.maxAttendees) : undefined,
        openForAll: form.openForAll,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      const res = await fetch("http://localhost:1760/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create event");
      }
      setForm(defaultForm);
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev._id);
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      eventType: ev.eventType || "academic",
      startDateTime: ev.startDateTime ? ev.startDateTime.slice(0, 16) : "",
      endDateTime: ev.endDateTime ? ev.endDateTime.slice(0, 16) : "",
      location: ev.location || "",
      maxAttendees: ev.maxAttendees || "",
      tags: ev.tags?.join(", ") || "",
      openForAll: ev.openForAll !== undefined ? ev.openForAll : true,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user || !editingId) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...editForm,
        userId: user._id,
        maxAttendees:
          editForm.maxAttendees !== ""
            ? Number(editForm.maxAttendees)
            : undefined,
        tags: editForm.tags
          ? editForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      const res = await fetch(`http://localhost:1760/api/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update event");
      }
      setEditingId(null);
      setEditForm(defaultForm);
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!user) return;
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:1760/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      if (editingId === eventId) {
        setEditingId(null);
        setEditForm(defaultForm);
      }
    } catch (err) {
      setError("Could not delete event");
    }
  };

  const handleRsvp = async (eventId, status) => {
    if (!user) return;
    try {
      const res = await fetch(
        `http://localhost:1760/api/events/${eventId}/rsvp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`,
            rsvpStatus: status,
          }),
        }
      );
      if (!res.ok) throw new Error("RSVP failed");
      const updated = await res.json();
      setEvents((prev) =>
        prev.map((ev) => (ev._id === eventId ? updated : ev))
      );
    } catch (err) {
      setError("Could not update RSVP");
    }
  };

  const myRsvpStatus = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const found = ev.rsvps?.find((r) => r.userId?.toString?.() === user?._id);
      if (found) map[ev._id] = found.rsvpStatus;
    });
    return map;
  }, [events, user?._id]);

  const renderRsvpButtons = (ev) => {
    const currentStatus = myRsvpStatus[ev._id];
    const makeBtn = (label, status, color) => (
      <button
        key={status}
        className={`rsvp-btn ${currentStatus === status ? "active" : ""}`}
        style={{ background: color }}
        onClick={() => handleRsvp(ev._id, status)}
      >
        {label}
      </button>
    );
    return (
      <div className="rsvp-actions">
        {makeBtn("Going", "going", "#16a34a")}
        {makeBtn("Interested", "interested", "#2563eb")}
        {makeBtn("Not going", "not_going", "#94a3b8")}
      </div>
    );
  };

  if (!user || loading) {
    return (
      <div className="cgpa-container">
        <h2>Loading events...</h2>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <div>
          <h1>Community Events</h1>
          <p>Post, browse, and RSVP to academic and social happenings.</p>
        </div>
        <div className="filter-row">
          <select
            value={filters.eventType}
            onChange={(e) =>
              setFilters((f) => ({ ...f, eventType: e.target.value }))
            }
          >
            <option value="all">All types</option>
            <option value="academic">Academic</option>
            <option value="social">Social</option>
            <option value="open">Open for All</option>
            <option value="restricted">Restricted</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value }))
            }
            placeholder="Start date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
            placeholder="End date"
          />
          <button className="secondary" onClick={loadEvents}>
            Apply
          </button>
        </div>
      </div>

      {error && <div className="events-message">{error}</div>}

      <div className="events-grid">
        <div className="events-card">
          <h2>Create Event</h2>
          <form className="event-form" onSubmit={handleCreate}>
            <div className="form-row">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                rows={3}
                required
              />
            </div>
            <div className="form-row two-col">
              <div>
                <label>Type</label>
                <select
                  value={form.eventType}
                  onChange={(e) =>
                    handleFormChange("eventType", e.target.value)
                  }
                >
                  <option value="academic">Academic</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={!!form.openForAll}
                    onChange={(e) =>
                      handleFormChange("openForAll", e.target.checked)
                    }
                  />
                  Open for all
                </label>
              </div>
            </div>
            <div className="form-row two-col">
              <div>
                <label>Max attendees (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxAttendees}
                  onChange={(e) =>
                    handleFormChange("maxAttendees", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="form-row two-col">
              <div>
                <label>Starts</label>
                <input
                  type="datetime-local"
                  value={form.startDateTime}
                  onChange={(e) =>
                    handleFormChange("startDateTime", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label>Ends</label>
                <input
                  type="datetime-local"
                  value={form.endDateTime}
                  onChange={(e) =>
                    handleFormChange("endDateTime", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => handleFormChange("tags", e.target.value)}
                placeholder="workshop, networking"
              />
            </div>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Posting..." : "Post event"}
            </button>
          </form>
        </div>

        <div className="events-card">
          <h2>Upcoming Events</h2>
          {loading ? (
            <p>Loading...</p>
          ) : events.length === 0 ? (
            <p className="empty-state">No events yet.</p>
          ) : (
            <div className="events-list">
              {events.map((ev) => {
                const goingCount = ev.rsvps?.filter(
                  (r) => r.rsvpStatus === "going"
                ).length;
                const interestedCount = ev.rsvps?.filter(
                  (r) => r.rsvpStatus === "interested"
                ).length;
                const myStatus = myRsvpStatus[ev._id];
                const isOwner = ev.organizerId?.toString?.() === user?._id;
                return (
                  <div className="event-item" key={ev._id}>
                    {editingId === ev._id ? (
                      <form className="event-form" onSubmit={handleUpdate}>
                        <div className="form-row">
                          <label>Title</label>
                          <input
                            value={editForm.title}
                            onChange={(e) =>
                              handleEditFormChange("title", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="form-row">
                          <label>Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              handleEditFormChange(
                                "description",
                                e.target.value
                              )
                            }
                            rows={3}
                            required
                          />
                        </div>
                        <div className="form-row two-col">
                          <div>
                            <label>Type</label>
                            <select
                              value={editForm.eventType}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "eventType",
                                  e.target.value
                                )
                              }
                            >
                              <option value="academic">Academic</option>
                              <option value="social">Social</option>
                            </select>
                          </div>
                          <div>
                            <label>Open for all</label>
                            <input
                              type="checkbox"
                              checked={!!editForm.openForAll}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "openForAll",
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="form-row two-col">
                          <div>
                            <label>Starts</label>
                            <input
                              type="datetime-local"
                              value={editForm.startDateTime}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "startDateTime",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <label>Ends</label>
                            <input
                              type="datetime-local"
                              value={editForm.endDateTime}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "endDateTime",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <label>Location</label>
                          <input
                            value={editForm.location}
                            onChange={(e) =>
                              handleEditFormChange("location", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="form-row two-col">
                          <div>
                            <label>Max attendees (optional)</label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.maxAttendees}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "maxAttendees",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label>Tags</label>
                            <input
                              value={editForm.tags}
                              onChange={(e) =>
                                handleEditFormChange("tags", e.target.value)
                              }
                              placeholder="workshop, networking"
                            />
                          </div>
                        </div>
                        <div className="event-actions">
                          <button
                            className="primary"
                            type="submit"
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="secondary"
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(defaultForm);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="event-top">
                          <div>
                            <h3 className="event-name">{ev.title}</h3>
                          </div>
                          <div className="event-pills">
                            <span className={`pill ${ev.eventType}`}>
                              {ev.eventType}
                            </span>
                            <span
                              className={`pill ${
                                ev.openForAll ? "open" : "restricted"
                              }`}
                            >
                              {ev.openForAll ? "Open for all" : "Restricted"}
                            </span>
                          </div>
                        </div>
                        <p className="muted">{ev.description}</p>
                        <div className="event-time">
                          <div>
                            <strong>Starts:</strong>{" "}
                            {new Date(ev.startDateTime).toLocaleString()}
                          </div>
                          <div>
                            <strong>Ends:</strong>{" "}
                            {new Date(ev.endDateTime).toLocaleString()}
                          </div>
                          <div>
                            <strong>Location:</strong> {ev.location}
                          </div>
                          {ev.maxAttendees && (
                            <div>
                              <strong>Max:</strong> {ev.maxAttendees}
                            </div>
                          )}
                        </div>
                        <div className="event-bottom">
                          <div className="rsvp-stats">
                            <span>Going: {goingCount || 0}</span>
                            <span>Interested: {interestedCount || 0}</span>
                            <span>Mine: {myStatus || "—"}</span>
                          </div>
                          <div className="event-actions">
                            {renderRsvpButtons(ev)}
                            {isOwner && (
                              <>
                                <button
                                  className="secondary"
                                  type="button"
                                  onClick={() => startEdit(ev)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="danger"
                                  type="button"
                                  onClick={() => handleDelete(ev._id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
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

export default EventsPage;

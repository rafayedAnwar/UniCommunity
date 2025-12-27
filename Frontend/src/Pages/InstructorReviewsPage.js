import React, { useEffect, useState } from "react";
import "../CSS/instructorReviews.css";

const emptyForm = {
  instructorName: "",
  initial: "",
  clarity: "",
  fairness: "",
  helpfulness: "",
  comment: "",
};

const InstructorReviewsPage = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) loadReviews();
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

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        search && search.trim() !== ""
          ? `http://localhost:1760/api/instructor-reviews/search?q=${encodeURIComponent(
              search.trim()
            )}`
          : "http://localhost:1760/api/instructor-reviews/all";
      const res = await fetch(endpoint, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load instructor reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        instructorName: form.instructorName.trim(),
        initial: form.initial.trim().toUpperCase(),
        clarity: Number(form.clarity),
        fairness: Number(form.fairness),
        helpfulness: Number(form.helpfulness),
        comment: form.comment.trim(),
      };
      if (
        !payload.instructorName ||
        Number.isNaN(payload.clarity) ||
        Number.isNaN(payload.fairness) ||
        Number.isNaN(payload.helpfulness)
      ) {
        setError("Please fill all rating fields (0-5)");
        setSaving(false);
        return;
      }
      const res = await fetch("http://localhost:1760/api/instructor-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setForm(emptyForm);
      await loadReviews();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  const avg = (total, count) =>
    count > 0 ? (total / count).toFixed(2) : "0.00";

  if (!user || loading) {
    return (
      <div className="instructor-reviews-container">
        <h2>Loading instructor reviews...</h2>
      </div>
    );
  }

  return (
    <div className="instructor-reviews-container">
      <div className="instructor-header">
        <div>
          <h1>Instructor Reviews</h1>
          <p>Rate teaching clarity, fairness, and helpfulness.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name or initial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadReviews();
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              minWidth: 240,
            }}
          />
          <button className="submit-btn" type="button" onClick={loadReviews}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="events-message">{error}</div>}

      <div className="instructor-grid">
        <div className="card">
          <h2>Share a review</h2>
          <form className="event-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Instructor name</label>
              <input
                value={form.instructorName}
                onChange={(e) => handleInput("instructorName", e.target.value)}
                placeholder="e.g., Dr. Rahman"
                required
              />
            </div>
            <div className="form-row">
              <label>Initial (e.g., DR)</label>
              <input
                value={form.initial}
                onChange={(e) => handleInput("initial", e.target.value)}
                placeholder="e.g., DR"
              />
            </div>
            <div className="form-row two-col">
              <div>
                <label>Clarity (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.clarity}
                  onChange={(e) => handleInput("clarity", e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Fairness (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.fairness}
                  onChange={(e) => handleInput("fairness", e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Helpfulness (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.helpfulness}
                  onChange={(e) => handleInput("helpfulness", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <label>Comment (optional)</label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => handleInput("comment", e.target.value)}
                placeholder="Share specifics about teaching style, feedback, etc."
              />
            </div>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </div>

        <div className="card scrollable">
          <h2>Instructors</h2>
          {reviews.length === 0 ? (
            <p className="empty">No instructor reviews yet.</p>
          ) : (
            <div className="events-list" style={{ maxHeight: 520, overflowY: "auto", paddingRight: 6 }}>
              {reviews.map((rev) => (
                <div className="event-card" key={rev._id}>
                  <div className="review-card-header">
                    <div>
                      <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                        <span>{rev.instructorName}</span>
                        {rev.initial && <span className="pill">{rev.initial}</span>}
                        <span className="pill count">
                          {rev.reviewCount} review{rev.reviewCount === 1 ? "" : "s"}
                        </span>
                      </h3>
                    </div>
                  </div>
                  <div className="metrics">
                    <div className="metric">
                      <strong>Clarity</strong>
                      <span className="metric-value">
                        {avg(rev.clarity_total, rev.reviewCount)}
                      </span>
                    </div>
                    <div className="metric">
                      <strong>Fairness</strong>
                      <span className="metric-value">
                        {avg(rev.fairness_total, rev.reviewCount)}
                      </span>
                    </div>
                    <div className="metric">
                      <strong>Helpfulness</strong>
                      <span className="metric-value">
                        {avg(rev.helpfulness_total, rev.reviewCount)}
                      </span>
                    </div>
                  </div>
                  <div className="comments">
                    {rev.writtenReviews && rev.writtenReviews.length > 0 ? (
                      rev.writtenReviews
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((c, idx) => (
                          <div className="comment" key={idx}>
                            {c.text}
                          </div>
                        ))
                    ) : (
                      <div className="empty">No comments yet.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorReviewsPage;

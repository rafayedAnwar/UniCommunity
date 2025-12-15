import React, { useState } from "react";
import "../CSS/profilePage.css";
import "../CSS/userSearchPage.css";

const UserSearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:1760/api/users/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Could not fetch users");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>Find Students</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          Search
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {loading && <p>Loading...</p>}
      <div className="search-results-grid">
        {results.map((user) => (
          <div className="search-result-card" key={user._id}>
            <div className="search-card-photo-wrap">
              <img
                src={
                  user.photo && user.photo.trim() !== ""
                    ? user.photo
                    : `https://ui-avatars.com/api/?name=${user.firstName}`
                }
                alt={user.firstName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}`;
                }}
                className="search-user-photo"
              />
            </div>
            <div className="search-user-info">
              <div className="search-user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="search-user-email">{user.email}</div>
              <div className="search-user-actions">
                <a href={`/profile/${user._id}`} className="view-profile-link">
                  View Profile
                </a>
                <a href={`/messages/${user._id}`} className="message-link">
                  Message
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchPage;

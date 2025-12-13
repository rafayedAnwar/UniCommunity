import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/profilePage.css";

const MessagesOverviewPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:1760/api/messages/conversations", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load conversations");
        setConversations(await res.json());
      } catch (err) {
        setError("Could not load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="profile-container">
      <h1>Your Conversations</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error-msg">{error}</p>}
      {conversations.length === 0 && !loading && <p>No conversations yet.</p>}
      <div className="search-results-grid">
        {conversations.map(conv => (
          <Link to={`/messages/${conv.otherUser._id}`} className="search-result-card" key={conv.otherUser._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="search-card-photo-wrap">
              <img
                src={conv.otherUser.photo || `https://ui-avatars.com/api/?name=${conv.otherUser.firstName}`}
                alt={conv.otherUser.firstName}
                className="search-user-photo"
              />
            </div>
            <div className="search-user-info">
              <div className="search-user-name">{conv.otherUser.firstName} {conv.otherUser.lastName}</div>
              <div className="search-user-email">{conv.otherUser.email}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                Last message: {conv.lastMessage ? conv.lastMessage.content : "No messages yet."}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MessagesOverviewPage;

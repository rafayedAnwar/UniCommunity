import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "../CSS/profilePage.css";

const getCurrentUser = async () => {
  const res = await fetch("http://localhost:1760/api/auth/current", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  const data = await res.json();
  return data.user || data;
};

const MessagePage = () => {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        // Fetch recipient info
        const res = await fetch(`http://localhost:1760/api/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not found");
        setRecipient(await res.json());
      } catch (err) {
        setError("Could not load user info");
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchMessages = async (isInitialLoad = false) => {
      if (isInitialLoad) setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:1760/api/messages/conversation/${currentUser._id}/${userId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to load messages");
        setMessages(await res.json());
      } catch (err) {
        setError("Could not load messages");
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    };
    fetchMessages(true);
    // Poll for new messages every 5s without showing loading state
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [currentUser, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:1760/api/messages/send/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ senderId: currentUser._id, content: newMsg }),
        }
      );
      if (!res.ok) throw new Error("Send failed");
      setNewMsg("");
      // Refresh messages
      const updated = await fetch(
        `http://localhost:1760/api/messages/conversation/${currentUser._id}/${userId}`,
        { credentials: "include" }
      );
      setMessages(await updated.json());
    } catch (err) {
      setError("Could not send message");
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm("Delete entire conversation? This cannot be undone."))
      return;
    try {
      const res = await fetch(
        `http://localhost:1760/api/messages/conversation/${currentUser._id}/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setMessages([]);
    } catch (err) {
      setError("Could not delete conversation");
    }
  };

  if (error)
    return (
      <div className="profile-container">
        <h2>{error}</h2>
      </div>
    );
  if (!recipient)
    return (
      <div className="profile-container">
        <h2>Loading...</h2>
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>
          Chat with {recipient.firstName} {recipient.lastName}
        </h1>
        <button
          onClick={handleDeleteConversation}
          className="edit-btn"
          style={{ background: "#dc3545", borderColor: "#dc3545" }}
        >
          Delete Conversation
        </button>
      </div>
      <div
        className="messages-content"
        style={{
          minHeight: 400,
          background: "#f7f7fa",
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? null : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={
                "message-bubble " +
                (msg.sender === currentUser._id ? "sent" : "received")
              }
              style={{
                background:
                  msg.sender === currentUser._id ? "#4f8cff" : "#e0e7ff",
                color: msg.sender === currentUser._id ? "#fff" : "#222",
                alignSelf:
                  msg.sender === currentUser._id ? "flex-end" : "flex-start",
                borderRadius: 16,
                padding: "0.7rem 1.2rem",
                margin: "0.5rem 0",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        style={{ display: "flex", gap: 10, alignItems: "center" }}
      >
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.75rem 1.1rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: "1.08rem",
            fontFamily: "inherit",
            height: 44,
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          className="search-btn"
          style={{
            height: 44,
            fontSize: "1.08rem",
            fontFamily: "inherit",
            padding: "0 1.5rem",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePage;

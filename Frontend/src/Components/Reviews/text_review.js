import React, { useEffect, useState } from 'react';
import './text_review.css';

const TextReview = ({ written }) => {

  const [profile, setProfile] = useState({
      firstName: "",
      lastName: "",
      photo: null,
    })

  const fetchProfile = async () => {

    try {
      const response = await fetch(
        `http://localhost:1760/api/users/${written.userId}`,
        {credentials: "include",}
      );
      const data = await response.json();
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        photo: data.photo || "",
      });
    } catch (error) {console.error("Error fetching profile:", error);}
  }

  useEffect(() => {
    if (written?.userId) { fetchProfile()}
  }, [written?.userId]);


  const content = written?.text || '';
  const date = written?.createdAt ? new Date(written.createdAt).toLocaleDateString() : '';

const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'User';

  return (
    <div className="individual-review">
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
              width: 50,
              height: 50,
              borderRadius: "30%",
              marginRight: 5,
              marginBottom: 5,
              objectFit: "cover",
            }}
          />
      <div className="review-content">
        <div className="review-text">{content}</div>
        <div className="review-meta">
          <span className="review-author">{fullName}</span>
          {date && <span className="review-date">{date}</span>}
        </div>
      </div>
    </div>
  );
};

export default TextReview;
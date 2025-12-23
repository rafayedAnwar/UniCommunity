import React, { useEffect, useState } from 'react';
import './text_review.css';

const TextReview = ({ written }) => {
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    if (!written?.userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:1760/api/users/${written.userId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          console.error('Failed to fetch user', await res.text());
          return;
        }
        const data = await res.json();
        setAuthor(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [written?.userId]);

  const firstName = author?.firstName || 'User';
  const lastName = author?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const content = written?.text || '';
  const date = written?.createdAt
    ? new Date(written.createdAt).toLocaleDateString()
    : '';

  const photoUrl = author?.photo
    ? `${author.photo}=s64`
    : 'https://via.placeholder.com/64'; // fallback avatar

  return (
    <div className="individual-review">
      <img
        src={photoUrl}
        alt={fullName}
        className="review-user-photo"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
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
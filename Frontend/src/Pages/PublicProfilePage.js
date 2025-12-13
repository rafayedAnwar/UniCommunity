import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../CSS/profilePage.css";
import BadgeDisplay from "../Components/BadgeDisplay";
import "../CSS/userSearchPage.css";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:1760/api/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    const fetchBadges = async () => {
      try {
        const res = await fetch(`http://localhost:1760/api/users/${userId}/badges`, { credentials: "include" });
        if (res.ok) setBadges(await res.json());
      } catch {}
    };
    fetchProfile();
    fetchBadges();
  }, [userId]);

  if (loading) return <div className="profile-container"><h2>Loading...</h2></div>;
  if (error) return <div className="profile-container"><h2>{error}</h2></div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 style={{ margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
        <Link
          to={`/messages/${profile._id}`}
          className="send-message-btn"
          style={{
            background: '#3578e5',
            color: '#fff',
            padding: '0.55rem 1.4rem',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '1.05rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(53,120,229,0.08)',
            border: 'none',
            transition: 'background 0.18s, color 0.18s',
            marginLeft: 12
          }}
          onMouseOver={e => e.currentTarget.style.background = '#2451a6'}
          onMouseOut={e => e.currentTarget.style.background = '#3578e5'}
        >
          Send Message
        </Link>
      </div>
      <div className="profile-content">
        <section className="profile-section">
          <img
            src={profile.photo || `https://ui-avatars.com/api/?name=${profile.firstName}`}
            alt={profile.firstName}
            style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: 20 }}
          />
          <h3>Email</h3>
          <p>{profile.email}</p>
        </section>
        <section className="profile-section">
          <h3>Bio</h3>
          <p>{profile.bio || "No bio provided."}</p>
        </section>
        <section className="profile-section">
          <h3>Social Links</h3>
          <ul>
            {profile.socialLinks?.linkedIn && <li><a href={profile.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
            {profile.socialLinks?.github && <li><a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
            {profile.socialLinks?.portfolio && <li><a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></li>}
          </ul>
        </section>
        <BadgeDisplay badges={badges} />
      </div>
    </div>
  );
};

export default PublicProfilePage;

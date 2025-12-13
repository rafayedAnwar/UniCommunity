import React from "react";
import "./BadgeDisplay.css";

// Example badge metadata (should be fetched from backend or static file)
const BADGE_META = {
  initiate: {
    name: "The Initiate",
    description: "Successfully create an account and log in for the first time.",
    icon: "🥇",
  },
  whoami: {
    name: "Who Am I?",
    description: "Fill out the Bio, upload a profile picture, and add one social link.",
    icon: "🧑‍💼",
  },
  hello_world: {
    name: "Hello World",
    description: "Post your first comment or reply in any forum.",
    icon: "👋",
  },
  curious_mind: {
    name: "Curious Mind",
    description: "Download or view your first study material from the Resource Forum.",
    icon: "🧐",
  },
  streaker: {
    name: "Streaker",
    description: "Log in for 3 consecutive days.",
    icon: "🔥",
  },
  magna_cum_laude: {
    name: "Magna Cum Laude",
    description: "Maintain a CGPA of 3.7 or higher in the private calculator.",
    icon: "📚",
  },
  note_god: {
    name: "The Note God",
    description: "Your uploaded notes/slides receive 50+ downloads.",
    icon: "📝",
  },
  syllabus_crusher: {
    name: "Syllabus Crusher",
    description: "Check off 100% of the items in your Course Checklist before finals week.",
    icon: "✅",
  },
  ta_material: {
    name: "The TA Material",
    description: "Receive the 'Most Helpful' tag on 10 different forum answers.",
    icon: "🧑‍🏫",
  },
  c_is_for_degree: {
    name: "C is for Degree",
    description: "Maintain a CGPA between 2.0 and 2.5 for two consecutive semesters.",
    icon: "😅",
  },
  last_minute_legend: {
    name: "Last Minute Legend",
    description: "Download a resource file less than 1 hour before a scheduled exam event.",
    icon: "⏰",
  },
  night_owl: {
    name: "Night Owl",
    description: "Be active (post/comment) between 3:00 AM and 5:00 AM.",
    icon: "🦉",
  },
  lurker: {
    name: "The Lurker",
    description: "View 100 threads without posting a single comment.",
    icon: "👀",
  },
  social_butterfly: {
    name: "Social Butterfly",
    description: "RSVP 'Going' to 10 Social Events but 0 Academic Workshops.",
    icon: "🦋",
  },
};

const BadgeDisplay = ({ badges }) => {
  if (!badges || badges.length === 0) return <div className="badge-section"><h2>Badges</h2><p>No badges earned yet.</p></div>;
  return (
    <div className="badge-section">
      <h2>Badges</h2>
      <div className="badge-list">
        {badges.map((b) => {
          const meta = BADGE_META[b.badgeId] || {};
          return (
            <div className="badge-item" key={b.badgeId} title={meta.description}>
              <span className="badge-icon">{meta.icon || "🏅"}</span>
              <div className="badge-info">
                <span className="badge-name">{meta.name || b.badgeId}</span>
                <span className="badge-date">{b.dateEarned ? new Date(b.dateEarned).toLocaleDateString() : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;

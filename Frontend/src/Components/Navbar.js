import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          UniCommunity
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link
              to="/profile"
              className={`navbar-link ${isActive("/profile")}`}
            >
              <span className="nav-icon">👤</span>
              Profile
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/forums" className={`navbar-link ${isActive("/forums")}`}>
              <span className="nav-icon">📚</span>
              Forums
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/reviews"
              className={`navbar-link ${isActive("/reviews")}`}
            >
              <span className="nav-icon">⭐</span>
              Reviews
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/events" className={`navbar-link ${isActive("/events")}`}>
              <span className="nav-icon">📅</span>
              Events
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cgpa" className={`navbar-link ${isActive("/cgpa")}`}>
              <span className="nav-icon">📊</span>
              CGPA
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-btn">
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

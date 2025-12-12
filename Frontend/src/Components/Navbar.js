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
          UniCommunity
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link
              to="/profile"
              className={`navbar-link ${isActive("/profile")}`}
            >
              Profile
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/forums" className={`navbar-link ${isActive("/forums")}`}>
              Forums
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/discussion"
              className={`navbar-link ${isActive("/discussion")}`}
            >
              Discussion
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/reviews"
              className={`navbar-link ${isActive("/reviews")}`}
            >
              Reviews
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/events" className={`navbar-link ${isActive("/events")}`}>
              Events
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cgpa" className={`navbar-link ${isActive("/cgpa")}`}>
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

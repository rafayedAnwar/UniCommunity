import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import Icon from "../Assets/icon-navy-blue.png";

const Navbar = () => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const isDropdownActive = (paths) => {
    return paths.some((path) => location.pathname === path);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/profile"
          className="navbar-logo"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <img
            src={Icon}
            alt="Icon"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
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
            <Link to="/search" className={`navbar-link ${isActive("/search")}`}>
              Find Students
            </Link>
          </li>

          <li className="navbar-item">
            <Link to="/events" className={`navbar-link ${isActive("/events")}`}>
              Events
            </Link>
          </li>

          {/* Academic Dropdown */}
          <li
            className="navbar-item dropdown"
            onMouseEnter={() => setOpenDropdown("academic")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <span
              className={`navbar-link ${
                isDropdownActive([
                  "/reviews",
                  "/instructors",
                  "/partners",
                  "/cgpa",
                  "/forums",
                  "/discussion",
                ])
                  ? "active"
                  : ""
              }`}
            >
              Academic ▾
            </span>
            {openDropdown === "academic" && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/reviews" className="dropdown-link">
                    Course Reviews
                  </Link>
                </li>
                <li>
                  <Link to="/instructors" className="dropdown-link">
                    Instructors
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="dropdown-link">
                    Project Partners
                  </Link>
                </li>
                <li>
                  <Link to="/cgpa" className="dropdown-link">
                    CGPA Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/forums" className="dropdown-link">
                    Forums
                  </Link>
                </li>
                <li>
                  <Link to="/discussion" className="dropdown-link">
                    Discussion
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="navbar-item">
            <Link to="/hof" className={`navbar-link ${isActive("/hof")}`}>
              Hall Of Fame
            </Link>
          </li>
          <li className="navbar-item">
            <Link
              to="/messages"
              className={`navbar-link ${
                location.pathname.startsWith("/messages") ? "active" : ""
              }`}
            >
              Messages
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

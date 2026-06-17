import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <nav className={`navbar ${scrolled || !isHome ? "navbar-solid" : "navbar-transparent"} ${menuOpen ? "menu-open" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✈</span>
          <span className="logo-text">TravelBooking</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/flights" className="nav-link">Flights</Link>
          <Link to="/hotels" className="nav-link">Hotels</Link>
          <Link to="/dashboard" className="nav-link">My Trips</Link>
        </div>

        {/* Desktop Auth */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className="nav-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="nav-avatar">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="nav-user-name">{user?.firstName}</span>
                <span className="nav-chevron">{dropdownOpen ? "▲" : "▼"}</span>
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown-menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-name">{user?.firstName} {user?.lastName}</div>
                    <div className="nav-dropdown-email">{user?.email}</div>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <Link to="/dashboard" className="nav-dropdown-item">🗂️ My Bookings</Link>
                  <Link to="/dashboard" className="nav-dropdown-item">👤 Profile</Link>
                  <Link to="/dashboard" className="nav-dropdown-item">💳 Payment History</Link>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-nav-outline">Sign In</Link>
              <Link to="/register" className="btn-nav-solid">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/flights" className="mobile-nav-link">✈️ Flights</Link>
          <Link to="/hotels" className="mobile-nav-link">🏨 Hotels</Link>
          <Link to="/dashboard" className="mobile-nav-link">🗂️ My Trips</Link>
          <div className="mobile-nav-divider" />
          {isAuthenticated ? (
            <>
              <div className="mobile-nav-user">
                Signed in as <strong>{user?.firstName} {user?.lastName}</strong>
              </div>
              <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
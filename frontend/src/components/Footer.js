import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-logo-icon">✈</span>
                <span className="footer-logo-text">TravelBooking</span>
              </div>
              <p className="footer-tagline">
                Your trusted travel partner. Find the best flights and hotels at unbeatable prices.
              </p>
              <div className="footer-socials">
                <a href="#" className="social-btn">𝕏</a>
                <a href="#" className="social-btn">f</a>
                <a href="#" className="social-btn">in</a>
                <a href="#" className="social-btn">▶</a>
              </div>
            </div>

            {/* Explore */}
            <div className="footer-col">
              <h5>Explore</h5>
              <ul>
                <li><Link to="/flights">Search Flights</Link></li>
                <li><Link to="/hotels">Search Hotels</Link></li>
                <li><Link to="/dashboard">My Bookings</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            {/* Popular Destinations */}
            <div className="footer-col">
              <h5>Popular Destinations</h5>
              <ul>
                <li><Link to="/hotels/results?city=Dubai">Dubai</Link></li>
                <li><Link to="/hotels/results?city=Paris">Paris</Link></li>
                <li><Link to="/hotels/results?city=Singapore">Singapore</Link></li>
                <li><Link to="/hotels/results?city=New York">New York</Link></li>
                <li><Link to="/hotels/results?city=Tokyo">Tokyo</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-col">
              <h5>Support</h5>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Cancellation Policy</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <div>
              <h5>Get travel deals in your inbox</h5>
              <p>Subscribe and save up to 40% on your next booking.</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="newsletter-input" />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© {new Date().getFullYear()} TravelBooking. All rights reserved.</p>
            <div className="footer-payments">
              <span className="payment-badge">VISA</span>
              <span className="payment-badge">MC</span>
              <span className="payment-badge">PayPal</span>
              <span className="payment-badge">UPI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
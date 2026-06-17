// src/pages/RegisterPage.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome to Voyager 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-page">
      <div
        className="auth-visual"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80')",
        }}
      >
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <h2>
            Start Your
            <br />
            Journey Today
          </h2>
          <p>Join millions of travelers who book smarter with Voyager.</p>
          <div className="perks-list">
            {[
              "✓ Exclusive member deals",
              "✓ Price drop alerts",
              "✓ Saved itineraries",
              "✓ Priority support",
            ].map((p) => (
              <div key={p} className="perk-item">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container animate-fade-up">
          <Link to="/" className="auth-logo">
            ✈ Voyager
          </Link>

          <h1>Create Account</h1>
          <p className="auth-subtitle">
            Already have one? <Link to="/login">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  placeholder="John"
                  value={form.firstName}
                  onChange={set("firstName")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={set("lastName")}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <p className="auth-terms">
              By creating an account you agree to our <a href="#!">Terms</a> and{" "}
              <a href="#!">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Free Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

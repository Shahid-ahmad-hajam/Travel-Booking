// src/pages/LoginPage.js

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 👋");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <h2>
            Welcome Back,
            <br />
            Traveler
          </h2>
          <p>Your next adventure is just one click away.</p>
          <div className="auth-visual-stats">
            <div>
              <strong>50M+</strong>
              <span>Travelers</span>
            </div>
            <div>
              <strong>190+</strong>
              <span>Countries</span>
            </div>
            <div>
              <strong>1M+</strong>
              <span>Hotels</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container animate-fade-up">
          <Link to="/" className="auth-logo">
            ✈ Voyager
          </Link>

          <h1>Sign In</h1>
          <p className="auth-subtitle">
            Don't have an account? <Link to="/register">Join free</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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

            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#!" className="auth-link">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <div className="social-auth">
            <button className="social-auth-btn">🌐 Google</button>
            <button className="social-auth-btn">📘 Facebook</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

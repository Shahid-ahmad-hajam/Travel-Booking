import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: "5rem", marginBottom: 16 }}>✈️</div>
      <h1 style={{ fontSize: "5rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: "var(--muted)", maxWidth: 400, marginBottom: 32 }}>Looks like this flight has been diverted. The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
    </div>
  );
}
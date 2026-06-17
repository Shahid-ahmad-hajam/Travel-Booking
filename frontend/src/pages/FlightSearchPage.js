// src/pages/FlightSearchPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FlightSearchPage.css";

const AIRPORTS = [
  { code: "DEL", city: "New Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bengaluru", country: "India" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "LHR", city: "London", country: "UK" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "HKG", city: "Hong Kong", country: "China" },
  { code: "NRT", city: "Tokyo", country: "Japan" },
];

const today = new Date().toISOString().split("T")[0];

export default function FlightSearchPage() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("round_trip");
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departureDate: today,
    returnDate: "",
    cabinClass: "economy",
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showPassengers, setShowPassengers] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const totalPax = form.adults + form.children + form.infants;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.origin || !form.destination) return;
    if (form.origin === form.destination) return alert("Origin and destination cannot be the same.");
    const params = new URLSearchParams({ ...form, tripType }).toString();
    navigate(`/flights/results?${params}`);
  };

  return (
    <div className="fsearch-page">
      {/* Hero */}
      <div className="fsearch-hero">
        <div className="fsearch-hero-bg" />
        <div className="container">
          <div className="fsearch-hero-content animate-fade-up">
            <span className="fsearch-eyebrow">✈️ Fly Anywhere</span>
            <h1>Search Flights</h1>
            <p>Compare prices across hundreds of airlines and find your perfect flight.</p>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <div className="container">
        <div className="fsearch-card animate-fade-up">
          {/* Trip Type Tabs */}
          <div className="fsearch-tabs">
            {["one_way", "round_trip", "multi_city"].map((t) => (
              <button
                key={t}
                className={`fsearch-tab ${tripType === t ? "active" : ""}`}
                onClick={() => setTripType(t)}
              >
                {t === "one_way" ? "One Way" : t === "round_trip" ? "Round Trip" : "Multi-City"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="fsearch-form">
            {/* Origin / Destination */}
            <div className="fsearch-route">
              <div className="form-group">
                <label className="form-label">From</label>
                <select
                  className="form-input"
                  value={form.origin}
                  onChange={(e) => set("origin", e.target.value)}
                  required
                >
                  <option value="">Select departure city</option>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code}) — {a.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fsearch-swap" onClick={() => { set("origin", form.destination); set("destination", form.origin); }}>
                ⇄
              </div>

              <div className="form-group">
                <label className="form-label">To</label>
                <select
                  className="form-input"
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  required
                >
                  <option value="">Select arrival city</option>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code}) — {a.country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="fsearch-dates">
              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.departureDate}
                  min={today}
                  onChange={(e) => set("departureDate", e.target.value)}
                  required
                />
              </div>
              {tripType === "round_trip" && (
                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.returnDate}
                    min={form.departureDate || today}
                    onChange={(e) => set("returnDate", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cabin + Passengers Row */}
            <div className="fsearch-extras">
              <div className="form-group">
                <label className="form-label">Cabin Class</label>
                <select
                  className="form-input"
                  value={form.cabinClass}
                  onChange={(e) => set("cabinClass", e.target.value)}
                >
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Passengers</label>
                <div className="fsearch-pax-trigger" onClick={() => setShowPassengers(!showPassengers)}>
                  <span>👤 {totalPax} Passenger{totalPax !== 1 ? "s" : ""}</span>
                  <span>{showPassengers ? "▲" : "▼"}</span>
                </div>
                {showPassengers && (
                  <div className="fsearch-pax-dropdown">
                    {[
                      { key: "adults", label: "Adults", sub: "12+ years" },
                      { key: "children", label: "Children", sub: "2–11 years" },
                      { key: "infants", label: "Infants", sub: "Under 2" },
                    ].map(({ key, label, sub }) => (
                      <div className="fsearch-pax-row" key={key}>
                        <div>
                          <div className="fsearch-pax-label">{label}</div>
                          <div className="fsearch-pax-sub">{sub}</div>
                        </div>
                        <div className="fsearch-pax-counter">
                          <button type="button" onClick={() => set(key, Math.max(key === "adults" ? 1 : 0, form[key] - 1))}>−</button>
                          <span>{form[key]}</span>
                          <button type="button" onClick={() => set(key, Math.min(9, form[key] + 1))}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg fsearch-submit">
                🔍 Search Flights
              </button>
            </div>
          </form>
        </div>

        {/* Popular Routes */}
        <div className="fsearch-popular">
          <h3>Popular Routes</h3>
          <div className="fsearch-routes-grid">
            {[
              { from: "DEL", to: "DXB", label: "Delhi → Dubai", price: "$189", img: "🇦🇪" },
              { from: "BOM", to: "LHR", label: "Mumbai → London", price: "$520", img: "🇬🇧" },
              { from: "DEL", to: "SIN", label: "Delhi → Singapore", price: "$210", img: "🇸🇬" },
              { from: "BLR", to: "BKK", label: "Bengaluru → Bangkok", price: "$175", img: "🇹🇭" },
              { from: "DEL", to: "JFK", label: "Delhi → New York", price: "$650", img: "🇺🇸" },
              { from: "BOM", to: "CDG", label: "Mumbai → Paris", price: "$490", img: "🇫🇷" },
            ].map((r) => (
              <div
                key={r.label}
                className="fsearch-route-card"
                onClick={() => { set("origin", r.from); set("destination", r.to); }}
              >
                <span className="fsearch-route-flag">{r.img}</span>
                <span className="fsearch-route-label">{r.label}</span>
                <span className="fsearch-route-price">from {r.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
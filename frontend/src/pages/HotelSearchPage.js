// src/pages/HotelSearchPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelSearchPage.css";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

const POPULAR_CITIES = [
  {
    name: "Dubai",
    country: "UAE",
    emoji: "🇦🇪",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
  },
  {
    name: "Paris",
    country: "France",
    emoji: "🇫🇷",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
  },
  {
    name: "New York",
    country: "USA",
    emoji: "🇺🇸",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  },
  {
    name: "Tokyo",
    country: "Japan",
    emoji: "🇯🇵",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  },
  {
    name: "Bali",
    country: "Indonesia",
    emoji: "🇮🇩",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
  },
  {
    name: "Maldives",
    country: "Maldives",
    emoji: "🇲🇻",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80",
  },
];

export default function HotelSearchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    city: "",
    checkIn: today,
    checkOut: tomorrow,
    rooms: 1,
    guests: 2,
    stars: "",
    category: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(form).toString();
    navigate(`/hotels/results?${params}`);
  };

  return (
    <div className="hsearch-page">
      {/* Hero */}
      <div className="hsearch-hero">
        <div className="hsearch-hero-bg" />
        <div className="container">
          <div className="hsearch-hero-content animate-fade-up">
            <span className="hsearch-eyebrow">🏨 Stay Anywhere</span>
            <h1>Find Your Perfect Stay</h1>
            <p>
              Search thousands of hotels, resorts, and boutique properties
              worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search Card */}
        <div className="hsearch-card animate-fade-up">
          <form onSubmit={handleSearch} className="hsearch-form">
            <div className="form-group hsearch-city">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="City, hotel name, or destination..."
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-in</label>
              <input
                type="date"
                className="form-input"
                value={form.checkIn}
                min={today}
                onChange={(e) => set("checkIn", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-out</label>
              <input
                type="date"
                className="form-input"
                value={form.checkOut}
                min={form.checkIn}
                onChange={(e) => set("checkOut", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rooms</label>
              <select
                className="form-input"
                value={form.rooms}
                onChange={(e) => set("rooms", e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Room{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Guests</label>
              <select
                className="form-input"
                value={form.guests}
                onChange={(e) => set("guests", e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg">
              🔍 Search Hotels
            </button>
          </form>

          {/* Quick Filters */}
          <div className="hsearch-quick">
            <span className="hsearch-quick-label">Quick Filter:</span>
            {[
              "⭐⭐⭐⭐⭐ 5 Stars",
              "🏖️ Beachfront",
              "💼 Business",
              "👨‍👩‍👧 Family",
            ].map((f) => (
              <button key={f} className="hsearch-quick-btn">
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="hsearch-destinations">
          <h3>Popular Destinations</h3>
          <div className="hsearch-dest-grid">
            {POPULAR_CITIES.map((city) => (
              <div
                key={city.name}
                className="hsearch-dest-card"
                onClick={() => {
                  set("city", city.name);
                  navigate(`/hotels/results?city=${city.name}`);
                }}
              >
                <img src={city.img} alt={city.name} />
                <div className="hsearch-dest-overlay">
                  <span className="hsearch-dest-emoji">{city.emoji}</span>
                  <h4>{city.name}</h4>
                  <p>{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotelAPI } from "../utils/api";
import "./HomePage.css";

const DESTINATIONS = [
  { name: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", tag: "Beach Paradise" },
  { name: "Paris", country: "France", img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tag: "City of Love" },
  { name: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", tag: "Tech & Tradition" },
  { name: "Santorini", country: "Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", tag: "Island Dreams" },
  { name: "New York", country: "USA", img: "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=400&q=80", tag: "The Big Apple" },
  { name: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", tag: "Luxury Awaits" },
];

const DEALS = [
  { from: "DEL", to: "DXB", airline: "Emirates", price: 299, original: 480, savings: 38 },
  { from: "BOM", to: "LHR", airline: "British Airways", price: 520, original: 780, savings: 33 },
  { from: "DEL", to: "SIN", airline: "Singapore Air", price: 210, original: 340, savings: 38 },
  { from: "BLR", to: "BKK", airline: "Thai Airways", price: 180, original: 270, savings: 33 },
];

const TESTIMONIALS = [
  { name: "Priya S.", avatar: "PS", rating: 5, comment: "Booked my honeymoon to Maldives through Voyager. Absolutely seamless experience — the best prices and instant confirmation!", location: "Mumbai" },
  { name: "Rahul K.", avatar: "RK", rating: 5, comment: "Found flights 40% cheaper than other sites. The interface is clean and the booking process is super fast. Highly recommended!", location: "Bangalore" },
  { name: "Sarah M.", avatar: "SM", rating: 5, comment: "Voyager's hotel deals are incredible. Stayed at a 5-star for a 3-star price. Will never book anywhere else.", location: "London" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("flights");
  const [tripType, setTripType] = useState("one_way");
  const [featuredHotels, setFeaturedHotels] = useState([]);

  // Flight search state
  const [flightForm, setFlightForm] = useState({
    origin: "", destination: "", departureDate: "", returnDate: "",
    adults: 1, cabinClass: "economy"
  });

  // Hotel search state
  const [hotelForm, setHotelForm] = useState({
    city: "", checkIn: "", checkOut: "", guests: 2, rooms: 1
  });

  useEffect(() => {
    hotelAPI.getFeatured().then(({ data }) => setFeaturedHotels(data.data || [])).catch(() => {});
  }, []);

  const handleFlightSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ ...flightForm, tripType });
    navigate(`/flights/results?${params}`);
  };

  const handleHotelSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(hotelForm);
    navigate(`/hotels/results?${params}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="home">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-up">
            <span className="hero-badge">✈ 50M+ Happy Travelers</span>
            <h1>Discover the World,<br />Your Way</h1>
            <p>Find the best flights and hotels at unbeatable prices. Your next adventure starts here.</p>
          </div>

          {/* Search Panel */}
          <div className="search-panel animate-fade-up">
            <div className="search-tabs">
              {["flights", "hotels"].map((t) => (
                <button key={t} className={`search-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t === "flights" ? "✈ Flights" : "🏨 Hotels"}
                </button>
              ))}
            </div>

            {tab === "flights" && (
              <form onSubmit={handleFlightSearch} className="search-form">
                <div className="trip-type-selector">
                  {["one_way", "round_trip"].map((type) => (
                    <label key={type} className={`trip-radio ${tripType === type ? "active" : ""}`}>
                      <input type="radio" value={type} checked={tripType === type} onChange={() => setTripType(type)} />
                      {type === "one_way" ? "One Way" : "Round Trip"}
                    </label>
                  ))}
                </div>

                <div className="search-fields">
                  <div className="search-field">
                    <label>From</label>
                    <input className="form-input" placeholder="City or Airport" value={flightForm.origin}
                      onChange={(e) => setFlightForm({ ...flightForm, origin: e.target.value })} required />
                  </div>
                  <div className="swap-btn" onClick={() =>
                    setFlightForm({ ...flightForm, origin: flightForm.destination, destination: flightForm.origin })}>
                    ⇄
                  </div>
                  <div className="search-field">
                    <label>To</label>
                    <input className="form-input" placeholder="City or Airport" value={flightForm.destination}
                      onChange={(e) => setFlightForm({ ...flightForm, destination: e.target.value })} required />
                  </div>
                  <div className="search-field">
                    <label>Departure</label>
                    <input type="date" className="form-input" min={today} value={flightForm.departureDate}
                      onChange={(e) => setFlightForm({ ...flightForm, departureDate: e.target.value })} required />
                  </div>
                  {tripType === "round_trip" && (
                    <div className="search-field">
                      <label>Return</label>
                      <input type="date" className="form-input" min={flightForm.departureDate || today}
                        value={flightForm.returnDate}
                        onChange={(e) => setFlightForm({ ...flightForm, returnDate: e.target.value })} />
                    </div>
                  )}
                  <div className="search-field search-field-sm">
                    <label>Adults</label>
                    <input type="number" className="form-input" min={1} max={9} value={flightForm.adults}
                      onChange={(e) => setFlightForm({ ...flightForm, adults: e.target.value })} />
                  </div>
                  <div className="search-field search-field-sm">
                    <label>Class</label>
                    <select className="form-input" value={flightForm.cabinClass}
                      onChange={(e) => setFlightForm({ ...flightForm, cabinClass: e.target.value })}>
                      <option value="economy">Economy</option>
                      <option value="premium_economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg search-btn">
                  🔍 Search Flights
                </button>
              </form>
            )}

            {tab === "hotels" && (
              <form onSubmit={handleHotelSearch} className="search-form">
                <div className="search-fields">
                  <div className="search-field search-field-wide">
                    <label>Destination</label>
                    <input className="form-input" placeholder="City, region or property" value={hotelForm.city}
                      onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} required />
                  </div>
                  <div className="search-field">
                    <label>Check In</label>
                    <input type="date" className="form-input" min={today} value={hotelForm.checkIn}
                      onChange={(e) => setHotelForm({ ...hotelForm, checkIn: e.target.value })} required />
                  </div>
                  <div className="search-field">
                    <label>Check Out</label>
                    <input type="date" className="form-input" min={hotelForm.checkIn || today} value={hotelForm.checkOut}
                      onChange={(e) => setHotelForm({ ...hotelForm, checkOut: e.target.value })} required />
                  </div>
                  <div className="search-field search-field-sm">
                    <label>Guests</label>
                    <input type="number" className="form-input" min={1} max={20} value={hotelForm.guests}
                      onChange={(e) => setHotelForm({ ...hotelForm, guests: e.target.value })} />
                  </div>
                  <div className="search-field search-field-sm">
                    <label>Rooms</label>
                    <input type="number" className="form-input" min={1} max={10} value={hotelForm.rooms}
                      onChange={(e) => setHotelForm({ ...hotelForm, rooms: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg search-btn">
                  🔍 Search Hotels
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero-stats">
          <div className="container stats-grid">
            {[["500+", "Airlines"], ["1M+", "Hotels"], ["50M+", "Travelers"], ["190+", "Countries"]].map(([n, l]) => (
              <div key={l} className="stat-item">
                <span className="stat-number">{n}</span>
                <span className="stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR DESTINATIONS ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <p>Discover the world's most sought-after travel destinations</p>
          </div>
          <div className="destinations-grid">
            {DESTINATIONS.map((d) => (
              <div key={d.name} className="destination-card"
                onClick={() => navigate(`/hotels/results?city=${d.name}`)}>
                <img src={d.img} alt={d.name} />
                <div className="destination-overlay">
                  <span className="destination-tag">{d.tag}</span>
                  <h3>{d.name}</h3>
                  <p>{d.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLIGHT DEALS ─────────────────────────────────────── */}
      <section className="section deals-section" id="deals">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">🔥 Limited Time</span>
            <h2>Hot Flight Deals</h2>
            <p>Grab these incredible fares before they're gone</p>
          </div>
          <div className="deals-grid">
            {DEALS.map((d) => (
              <div key={`${d.from}-${d.to}`} className="deal-card">
                <div className="deal-header">
                  <span className="deal-savings">-{d.savings}%</span>
                  <span className="deal-airline">{d.airline}</span>
                </div>
                <div className="deal-route">
                  <div className="deal-city">
                    <span className="deal-iata">{d.from}</span>
                    <span className="deal-city-name">Origin</span>
                  </div>
                  <div className="deal-arrow">✈ ────</div>
                  <div className="deal-city">
                    <span className="deal-iata">{d.to}</span>
                    <span className="deal-city-name">Destination</span>
                  </div>
                </div>
                <div className="deal-pricing">
                  <span className="deal-original">${d.original}</span>
                  <span className="deal-price">${d.price}</span>
                </div>
                <button className="btn btn-primary btn-sm btn-block"
                  onClick={() => navigate(`/flights/results?origin=${d.from}&destination=${d.to}`)}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VOYAGER ──────────────────────────────────────── */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Voyager?</h2>
            <p>We make travel simple, affordable, and unforgettable</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "💰", title: "Best Price Guarantee", desc: "Find a lower price? We'll match it, no questions asked. Our price comparison engine scans 500+ airlines." },
              { icon: "🔒", title: "Secure Booking", desc: "Your payment data is encrypted with bank-level security. Book with complete confidence every time." },
              { icon: "⚡", title: "Instant Confirmation", desc: "Get your e-ticket in seconds, not hours. Real-time seat inventory across all airlines and hotels." },
              { icon: "🎧", title: "24/7 Support", desc: "Our travel experts are always available to help — by chat, email, or phone. We never sleep so you can." },
              { icon: "🔄", title: "Free Cancellation", desc: "Plans change — we get it. Cancel eligible bookings for free up to 24 hours before departure." },
              { icon: "🌍", title: "Global Coverage", desc: "190+ countries, 1M+ hotels, and 500+ airlines. Wherever you want to go, we'll get you there." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Loved by Millions</h2>
            <p>Don't just take our word for it</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="stars">{"★".repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.comment}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <p className="author-name">{t.name}</p>
                    <p className="author-location">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready for Your Next Adventure?</h2>
            <p>Join over 50 million travelers who trust Voyager for their journeys.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
                Start Exploring Free
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate("/flights")}>
                Search Flights
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
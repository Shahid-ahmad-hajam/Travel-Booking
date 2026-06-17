// src/pages/FlightResultsPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { flightAPI } from "../utils/api";
import toast from "react-hot-toast";
import "./FlightResultsPage.css";

const MOCK_FLIGHTS = [
  {
    _id: "f1",
    origin: "DEL",
    destination: "DXB",
    totalDuration: 195,
    stops: 0,
    flightType: "direct",
    departureDate: new Date(),
    arrivalDate: new Date(),
    segments: [
      {
        airline: "IndiGo",
        flightNumber: "6E-501",
        departure: {
          city: "New Delhi",
          iataCode: "DEL",
          time: new Date("2025-06-01T06:30:00"),
        },
        arrival: {
          city: "Dubai",
          iataCode: "DXB",
          time: new Date("2025-06-01T09:45:00"),
        },
      },
    ],
    cabinClasses: [
      { class: "economy", price: 189, currency: "USD", seatsAvailable: 42 },
      { class: "business", price: 540, currency: "USD", seatsAvailable: 8 },
    ],
    tags: ["best_value"],
  },
  {
    _id: "f2",
    origin: "DEL",
    destination: "DXB",
    totalDuration: 220,
    stops: 1,
    flightType: "connecting",
    departureDate: new Date(),
    arrivalDate: new Date(),
    segments: [
      {
        airline: "Air India",
        flightNumber: "AI-996",
        departure: {
          city: "New Delhi",
          iataCode: "DEL",
          time: new Date("2025-06-01T08:00:00"),
        },
        arrival: {
          city: "Dubai",
          iataCode: "DXB",
          time: new Date("2025-06-01T12:40:00"),
        },
      },
    ],
    cabinClasses: [
      { class: "economy", price: 145, currency: "USD", seatsAvailable: 18 },
      { class: "business", price: 420, currency: "USD", seatsAvailable: 4 },
    ],
    tags: ["cheapest"],
  },
  {
    _id: "f3",
    origin: "DEL",
    destination: "DXB",
    totalDuration: 185,
    stops: 0,
    flightType: "direct",
    departureDate: new Date(),
    arrivalDate: new Date(),
    segments: [
      {
        airline: "Emirates",
        flightNumber: "EK-516",
        departure: {
          city: "New Delhi",
          iataCode: "DEL",
          time: new Date("2025-06-01T14:15:00"),
        },
        arrival: {
          city: "Dubai",
          iataCode: "DXB",
          time: new Date("2025-06-01T17:20:00"),
        },
      },
    ],
    cabinClasses: [
      { class: "economy", price: 240, currency: "USD", seatsAvailable: 55 },
      { class: "business", price: 870, currency: "USD", seatsAvailable: 12 },
      { class: "first", price: 1800, currency: "USD", seatsAvailable: 4 },
    ],
    tags: ["fastest"],
  },
  {
    _id: "f4",
    origin: "DEL",
    destination: "DXB",
    totalDuration: 205,
    stops: 0,
    flightType: "direct",
    departureDate: new Date(),
    arrivalDate: new Date(),
    segments: [
      {
        airline: "SpiceJet",
        flightNumber: "SG-9",
        departure: {
          city: "New Delhi",
          iataCode: "DEL",
          time: new Date("2025-06-01T22:00:00"),
        },
        arrival: {
          city: "Dubai",
          iataCode: "DXB",
          time: new Date("2025-06-02T01:25:00"),
        },
      },
    ],
    cabinClasses: [
      { class: "economy", price: 162, currency: "USD", seatsAvailable: 30 },
    ],
    tags: [],
  },
];

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDuration = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export default function FlightResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(
    params.get("cabinClass") || "economy",
  );
  const [sortBy, setSortBy] = useState("price");
  const [filterStops, setFilterStops] = useState("any");
  const [maxPrice, setMaxPrice] = useState(2000);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const { data } = await flightAPI.search(Object.fromEntries(params));
        setFlights(data.data?.length ? data.data : MOCK_FLIGHTS);
      } catch {
        setFlights(MOCK_FLIGHTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [params]);

  const getPriceForClass = (f, cls) =>
    f.cabinClasses.find((c) => c.class === cls)?.price;

  const filtered = flights
    .filter((f) => {
      if (filterStops === "direct" && f.stops > 0) return false;
      if (filterStops === "1stop" && f.stops !== 1) return false;
      const p = getPriceForClass(f, selectedClass);
      if (!p) return false;
      if (p > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price")
        return (
          (getPriceForClass(a, selectedClass) || 9999) -
          (getPriceForClass(b, selectedClass) || 9999)
        );
      if (sortBy === "duration") return a.totalDuration - b.totalDuration;
      if (sortBy === "departure")
        return (
          new Date(a.segments[0]?.departure?.time) -
          new Date(b.segments[0]?.departure?.time)
        );
      return 0;
    });

  const handleBook = (flight) => {
    navigate(
      `/booking/flight/${flight._id}?cabinClass=${selectedClass}&adults=${params.get("adults") || 1}`,
    );
  };

  return (
    <div className="fresults-page">
      <div className="fresults-header">
        <div className="container">
          <div className="fresults-header-content">
            <h2>
              {params.get("origin")} → {params.get("destination")}
            </h2>
            <p>
              {params.get("departureDate")} · {params.get("adults") || 1} Adult
              · {params.get("cabinClass") || "Economy"}
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/flights")}
          >
            Modify Search
          </button>
        </div>
      </div>

      <div className="container">
        <div className="fresults-layout">
          {/* Filters Sidebar */}
          <aside className="fresults-filters">
            <h4>Filters</h4>

            <div className="filter-section">
              <label className="filter-label">Stops</label>
              {[
                ["any", "Any"],
                ["direct", "Direct only"],
                ["1stop", "1 stop"],
              ].map(([v, l]) => (
                <label key={v} className="filter-radio">
                  <input
                    type="radio"
                    name="stops"
                    value={v}
                    checked={filterStops === v}
                    onChange={() => setFilterStops(v)}
                  />
                  {l}
                </label>
              ))}
            </div>

            <div className="filter-section">
              <label className="filter-label">Max Price: ${maxPrice}</label>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="filter-range"
              />
              <div className="filter-range-labels">
                <span>$100</span>
                <span>$2000</span>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Cabin Class</label>
              {["economy", "premium_economy", "business", "first"].map((c) => (
                <label key={c} className="filter-radio">
                  <input
                    type="radio"
                    name="cabin"
                    value={c}
                    checked={selectedClass === c}
                    onChange={() => setSelectedClass(c)}
                  />
                  {c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
              ))}
            </div>
          </aside>

          {/* Results */}
          <div className="fresults-main">
            {/* Sort Bar */}
            <div className="fresults-sortbar">
              <span className="fresults-count">
                {filtered.length} flights found
              </span>
              <div className="fresults-sort">
                <span>Sort:</span>
                {[
                  ["price", "Cheapest"],
                  ["duration", "Fastest"],
                  ["departure", "Earliest"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={`sort-btn ${sortBy === v ? "active" : ""}`}
                    onClick={() => setSortBy(v)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="fresults-loading">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flight-skeleton skeleton"
                    style={{
                      height: 140,
                      borderRadius: "var(--radius-lg)",
                      marginBottom: 16,
                    }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="fresults-empty">
                <span style={{ fontSize: "3rem" }}>✈️</span>
                <h3>No flights found</h3>
                <p>Try adjusting your filters or search for different dates.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/flights")}
                >
                  New Search
                </button>
              </div>
            ) : (
              filtered.map((flight) => {
                const cabin = flight.cabinClasses.find(
                  (c) => c.class === selectedClass,
                );
                const seg = flight.segments[0];
                return (
                  <div key={flight._id} className="flight-card">
                    {flight.tags?.includes("best_value") && (
                      <span className="flight-tag best">Best Value</span>
                    )}
                    {flight.tags?.includes("cheapest") && (
                      <span className="flight-tag cheap">Cheapest</span>
                    )}
                    {flight.tags?.includes("fastest") && (
                      <span className="flight-tag fast">Fastest</span>
                    )}

                    <div className="flight-card-body">
                      <div className="flight-airline">
                        <div className="airline-logo">
                          {seg?.airline?.slice(0, 2)}
                        </div>
                        <div>
                          <div className="airline-name">{seg?.airline}</div>
                          <div className="flight-number">
                            {seg?.flightNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flight-route">
                        <div className="flight-time">
                          <span className="time">
                            {fmtTime(seg?.departure?.time)}
                          </span>
                          <span className="iata">
                            {seg?.departure?.iataCode}
                          </span>
                        </div>
                        <div className="flight-line">
                          <span className="flight-duration">
                            {fmtDuration(flight.totalDuration)}
                          </span>
                          <div className="flight-line-bar">
                            <div className="line" />
                            {flight.stops > 0 && <div className="stop-dot" />}
                          </div>
                          <span className="flight-stops">
                            {flight.stops === 0
                              ? "Direct"
                              : `${flight.stops} stop`}
                          </span>
                        </div>
                        <div className="flight-time">
                          <span className="time">
                            {fmtTime(seg?.arrival?.time)}
                          </span>
                          <span className="iata">{seg?.arrival?.iataCode}</span>
                        </div>
                      </div>

                      <div className="flight-price-box">
                        {cabin ? (
                          <>
                            <div className="flight-price">${cabin.price}</div>
                            <div className="flight-price-sub">per person</div>
                            <div className="flight-seats">
                              {cabin.seatsAvailable} seats left
                            </div>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleBook(flight)}
                            >
                              Select
                            </button>
                          </>
                        ) : (
                          <div className="flight-unavailable">
                            Not available in {selectedClass}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flight-card-footer">
                      <span>
                        🧳 {cabin?.baggage?.checked || "23kg"} checked bag
                      </span>
                      <span>
                        {cabin?.refundable
                          ? "✅ Refundable"
                          : "❌ Non-refundable"}
                      </span>
                      <span>
                        ✏️{" "}
                        {cabin?.changeable ? "Changes allowed" : "No changes"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

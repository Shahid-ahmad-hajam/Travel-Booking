// src/pages/HotelResultsPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { hotelAPI } from "../utils/api";
import "./HotelResultsPage.css";

const MOCK_HOTELS=[]
// const MOCK_HOTELS = [
//   {
//     _id: "h1",
//     name: "Atlantis The Palm",
//     starRating: 5,
//     guestRating: 9.2,
//     reviewCount: 3840,
//     category: "resort",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "12km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
//     },
//     rooms: [
//       {
//         type: "Deluxe Room",
//         pricePerNight: 380,
//         currency: "USD",
//         maxOccupancy: 2,
//       },
//     ],
//     amenities: { general: ["Pool", "Spa", "WiFi", "Gym", "Restaurant"] },
//     tags: ["beachfront", "luxury"],
//   },
//   {
//     _id: "h2",
//     name: "Burj Al Arab Jumeirah",
//     starRating: 5,
//     guestRating: 9.6,
//     reviewCount: 2210,
//     category: "hotel",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "15km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
//     },
//     rooms: [
//       { type: "Suite", pricePerNight: 1200, currency: "USD", maxOccupancy: 2 },
//     ],
//     amenities: {
//       general: ["Pool", "Spa", "WiFi", "Butler service", "Helipad"],
//     },
//     tags: ["ultra-luxury"],
//   },
//   {
//     _id: "h3",
//     name: "Rove Downtown",
//     starRating: 3,
//     guestRating: 8.1,
//     reviewCount: 5620,
//     category: "hotel",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "2km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
//     },
//     rooms: [
//       {
//         type: "Standard Room",
//         pricePerNight: 95,
//         currency: "USD",
//         maxOccupancy: 2,
//       },
//     ],
//     amenities: { general: ["Pool", "WiFi", "Gym", "Café"] },
//     tags: ["best_value"],
//   },
//   {
//     _id: "h4",
//     name: "JW Marriott Marquis",
//     starRating: 5,
//     guestRating: 8.9,
//     reviewCount: 4100,
//     category: "hotel",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "3km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
//     },
//     rooms: [
//       {
//         type: "Superior Room",
//         pricePerNight: 220,
//         currency: "USD",
//         maxOccupancy: 2,
//       },
//     ],
//     amenities: {
//       general: [
//         "Pool",
//         "Spa",
//         "WiFi",
//         "Business center",
//         "Multiple restaurants",
//       ],
//     },
//     tags: ["business"],
//   },
//   {
//     _id: "h5",
//     name: "Zabeel House by Jumeirah",
//     starRating: 4,
//     guestRating: 8.4,
//     reviewCount: 1890,
//     category: "boutique",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "1km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80",
//     },
//     rooms: [
//       {
//         type: "Studio Room",
//         pricePerNight: 140,
//         currency: "USD",
//         maxOccupancy: 2,
//       },
//     ],
//     amenities: { general: ["Rooftop pool", "WiFi", "Bar", "Gym"] },
//     tags: ["trendy"],
//   },
//   {
//     _id: "h6",
//     name: "Premier Inn Dubai",
//     starRating: 3,
//     guestRating: 7.8,
//     reviewCount: 8900,
//     category: "hotel",
//     location: {
//       city: "Dubai",
//       country: "UAE",
//       distanceFromCenter: "4km from city center",
//     },
//     images: {
//       main: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
//     },
//     rooms: [
//       {
//         type: "Standard Room",
//         pricePerNight: 65,
//         currency: "USD",
//         maxOccupancy: 2,
//       },
//     ],
//     amenities: { general: ["Pool", "WiFi", "Restaurant"] },
//     tags: ["budget"],
//   },
// ];


const Stars = ({ count }) => (
  <span className="stars">
    {Array.from({ length: 5 }, (_, i) => (i < count ? "★" : "☆")).join("")}
  </span>
);

export default function HotelResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [filterStars, setFilterStars] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  const nights = (() => {
    const ci = params.get("checkIn"),
      co = params.get("checkOut");
    if (!ci || !co) return 1;
    return Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000));
  })();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await hotelAPI.search(Object.fromEntries(params));
        setHotels(data.data || []);
      } catch {
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [params]);

  const toggleStar = (s) =>
    setFilterStars((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );

  const filtered = hotels
    .filter((h) => {
      if (filterStars.length && !filterStars.includes(h.starRating))
        return false;
      const price = h.rooms?.[0]?.pricePerNight || 0;
      if (price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.guestRating - a.guestRating;
      if (sortBy === "price_asc")
        return (
          (a.rooms?.[0]?.pricePerNight || 0) -
          (b.rooms?.[0]?.pricePerNight || 0)
        );
      if (sortBy === "price_desc")
        return (
          (b.rooms?.[0]?.pricePerNight || 0) -
          (a.rooms?.[0]?.pricePerNight || 0)
        );
      if (sortBy === "stars") return b.starRating - a.starRating;
      return 0;
    });

  return (
    <div className="hresults-page">
      <div className="hresults-header">
        <div className="container">
          <div>
            <h2>Hotels in {params.get("city") || "..."}</h2>
            <p>
              {params.get("checkIn")} → {params.get("checkOut")} · {nights}{" "}
              night{nights !== 1 ? "s" : ""} · {params.get("rooms") || 1} room ·{" "}
              {params.get("guests") || 2} guests
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/hotels")}
          >
            Modify Search
          </button>
        </div>
      </div>

      <div className="container">
        <div className="hresults-layout">
          {/* Filters */}
          <aside className="hresults-filters">
            <h4>Filters</h4>
            <div className="filter-section">
              <span className="filter-label">Star Rating</span>
              {[5, 4, 3, 2, 1].map((s) => (
                <label key={s} className="filter-radio">
                  <input
                    type="checkbox"
                    checked={filterStars.includes(s)}
                    onChange={() => toggleStar(s)}
                  />
                  {"★".repeat(s)}
                  {"☆".repeat(5 - s)}
                </label>
              ))}
            </div>
            <div className="filter-section">
              <span className="filter-label">Max Price/Night: ${maxPrice}</span>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(+e.target.value)}
                className="filter-range"
              />
              <div className="filter-range-labels">
                <span>$50</span>
                <span>$2000</span>
              </div>
            </div>
            <div className="filter-section">
              <span className="filter-label">Property Type</span>
              {["Hotel", "Resort", "Villa", "Hostel", "Boutique"].map((t) => (
                <label key={t} className="filter-radio">
                  <input type="checkbox" /> {t}
                </label>
              ))}
            </div>
            <div className="filter-section">
              <span className="filter-label">Amenities</span>
              {[
                "Swimming Pool",
                "Free WiFi",
                "Spa",
                "Gym",
                "Airport Shuttle",
                "Breakfast",
              ].map((a) => (
                <label key={a} className="filter-radio">
                  <input type="checkbox" /> {a}
                </label>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="hresults-main">
            <div className="hresults-sortbar">
              <span className="fresults-count">
                {filtered.length} properties found
              </span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="fresults-sort">
                  <span>Sort:</span>
                  {[
                    ["rating", "Top Rated"],
                    ["price_asc", "Price ↑"],
                    ["price_desc", "Price ↓"],
                    ["stars", "Stars"],
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
                <div className="view-toggle">
                  <button
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    ⊞
                  </button>
                  <button
                    className={viewMode === "list" ? "active" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 220, borderRadius: 16, marginBottom: 16 }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="fresults-empty">
                <span style={{ fontSize: "3rem" }}>🏨</span>
                <h3>No hotels found</h3>
                <p>Try adjusting your filters.</p>
              </div>
            ) : (
              <div className={`hresults-grid ${viewMode}`}>
                {filtered.map((hotel) => {
                  const price = hotel.rooms?.[0]?.pricePerNight;
                  const totalPrice = price * nights;
                  return (
                    <div
                      key={hotel._id}
                      className="hotel-card"
                      onClick={() =>
                        navigate(
                          `/hotels/${hotel._id}?checkIn=${params.get("checkIn")}&checkOut=${params.get("checkOut")}&guests=${params.get("guests")}&rooms=${params.get("rooms")}`,
                        )
                      }
                    >
                      <div className="hotel-card-img">
                        <img src={hotel.images?.main} alt={hotel.name} />
                        <div className="hotel-card-rating-badge">
                          {hotel.guestRating?.toFixed(1)}
                        </div>
                      </div>
                      <div className="hotel-card-body">
                        <div className="hotel-card-top">
                          <div>
                            <Stars count={hotel.starRating} />
                            <h4 className="hotel-card-name">{hotel.name}</h4>
                            <p className="hotel-card-location">
                              📍 {hotel.location?.city} ·{" "}
                              {hotel.location?.distanceFromCenter}
                            </p>
                          </div>
                          <div className="hotel-card-price-col">
                            <div className="hotel-card-price">${price}</div>
                            <div className="hotel-card-price-sub">
                              per night
                            </div>
                            <div className="hotel-card-total">
                              Total: ${totalPrice}
                            </div>
                          </div>
                        </div>
                        <div className="hotel-card-amenities">
                          {hotel.amenities?.general?.slice(0, 4).map((a) => (
                            <span key={a} className="hotel-amenity-tag">
                              {a}
                            </span>
                          ))}
                        </div>
                        <div className="hotel-card-footer">
                          <div className="hotel-review-count">
                            {hotel.reviewCount?.toLocaleString()} reviews
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hotels/${hotel._id}`);
                            }}
                          >
                            See Rooms
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

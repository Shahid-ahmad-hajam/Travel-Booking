// src/pages/HotelDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { hotelAPI } from "../utils/api";
import "./HotelDetailPage.css";

const MOCK_HOTEL=null
// const MOCK_HOTEL = {
//   _id: "h1", name: "Atlantis The Palm", starRating: 5, guestRating: 9.2, reviewCount: 3840, category: "resort",
//   description: "Atlantis The Palm is an iconic resort on the trunk of Palm Jumeirah in Dubai. It features Aquaventure Waterpark, The Lost Chambers Aquarium, multiple fine dining restaurants, a casino, and a private beach. Each room offers stunning views of the Arabian Gulf or the Palm.",
//   location: { address: "Palm Jumeirah", city: "Dubai", country: "UAE", distanceFromCenter: "12km from city center", nearbyAttractions: ["Aquaventure Waterpark", "The Lost Chambers", "Palm Monorail"] },
//   images: {
//     main: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
//     gallery: [
//       "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
//       "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
//       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
//       "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
//     ]
//   },
//   amenities: { general: ["Free WiFi", "Swimming Pool", "Private Beach", "Gym", "Parking"], dining: ["Fine Dining", "Buffet Breakfast", "Pool Bar", "Room Service"], wellness: ["Spa", "Sauna", "Massage", "Yoga Classes"] },
//   policies: { checkIn: "15:00", checkOut: "11:00", cancellation: "Free cancellation up to 48 hours before check-in", pets: false, smoking: false },
//   rooms: [
//     { type: "Deluxe Room", description: "Spacious room with balcony and partial sea view", pricePerNight: 380, currency: "USD", maxOccupancy: 2, bedType: "King or Twin", size: "45 sqm", view: "Partial Sea View", amenities: ["AC", "Mini bar", "Safe", "TV", "Balcony"], refundable: true },
//     { type: "Premier Sea View", description: "Stunning panoramic views of the Arabian Gulf", pricePerNight: 520, currency: "USD", maxOccupancy: 2, bedType: "King", size: "55 sqm", view: "Full Sea View", amenities: ["AC", "Mini bar", "Safe", "TV", "Balcony", "Bathtub"], refundable: true },
//     { type: "Signature Suite", description: "Ultra-luxury suite with private pool and butler", pricePerNight: 1200, currency: "USD", maxOccupancy: 4, bedType: "King + Sofa Bed", size: "120 sqm", view: "Panoramic Sea View", amenities: ["Private pool", "Butler service", "Living room", "Kitchen", "Dining area"], refundable: false },
//   ],
//   reviews: [
//     { userName: "Rahul S.", rating: 9.5, title: "Absolutely stunning!", comment: "The resort exceeded every expectation. Aquaventure is world-class.", travelType: "family" },
//     { userName: "Sarah M.", rating: 9.0, title: "Dream honeymoon", comment: "Perfect for couples. The sea view room was breathtaking.", travelType: "couple" },
//     { userName: "James T.", rating: 8.5, title: "Great business trip", comment: "Excellent facilities. A bit far from the business district though.", travelType: "business" },
//   ]
// };

const Stars = ({ count }) => <span className="stars">{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;

export default function HotelDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await hotelAPI.getById(id);
        setHotel(data.data);
      } catch(err) {
        console.error("Hotel fetch error:", err);
        setHotel(MOCK_HOTEL);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!hotel) return null;

  const allImages = [hotel.images?.main, ...(hotel.images?.gallery || [])].filter(Boolean);

  return (
    <div className="hdetail-page">
      {/* Image Gallery */}
      <div className="hdetail-gallery">
        <div className="hdetail-main-img">
          <img src={allImages[activeImg]} alt={hotel.name} />
          <div className="hdetail-img-nav">
            <button onClick={() => setActiveImg((p) => Math.max(0, p - 1))} disabled={activeImg === 0}>‹</button>
            <span>{activeImg + 1} / {allImages.length}</span>
            <button onClick={() => setActiveImg((p) => Math.min(allImages.length - 1, p + 1))} disabled={activeImg === allImages.length - 1}>›</button>
          </div>
        </div>
        <div className="hdetail-thumbs">
          {allImages.map((img, i) => (
            <div key={i} className={`hdetail-thumb ${i === activeImg ? "active" : ""}`} onClick={() => setActiveImg(i)}>
              <img src={img} alt={`View ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="hdetail-layout">
          {/* Left Column */}
          <div className="hdetail-left">
            {/* Header */}
            <div className="hdetail-header">
              <div>
                <Stars count={hotel.starRating} />
                <h1>{hotel.name}</h1>
                <p className="hdetail-location">📍 {hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country} · {hotel.location?.distanceFromCenter}</p>
              </div>
              <div className="hdetail-rating">
                <div className="hdetail-score">{hotel.guestRating?.toFixed(1)}</div>
                <div className="hdetail-rating-label">Excellent</div>
                <div className="hdetail-review-count">{hotel.reviewCount?.toLocaleString()} reviews</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="hdetail-tabs">
              {["overview", "rooms", "amenities", "reviews"].map((tab) => (
                <button key={tab} className={`hdetail-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="hdetail-content animate-fade">
                <p className="hdetail-description">{hotel.description}</p>
                <div className="hdetail-highlights">
                  {hotel.location?.nearbyAttractions?.map((a) => (
                    <span key={a} className="hdetail-highlight">🗺 {a}</span>
                  ))}
                </div>
                <div className="hdetail-policies">
                  <h4>Hotel Policies</h4>
                  <div className="policies-grid">
                    <div className="policy-item"><span>🕒 Check-in</span><strong>{hotel.policies?.checkIn}</strong></div>
                    <div className="policy-item"><span>🚪 Check-out</span><strong>{hotel.policies?.checkOut}</strong></div>
                    <div className="policy-item"><span>🚭 Smoking</span><strong>{hotel.policies?.smoking ? "Allowed" : "Not allowed"}</strong></div>
                    <div className="policy-item"><span>🐾 Pets</span><strong>{hotel.policies?.pets ? "Allowed" : "Not allowed"}</strong></div>
                  </div>
                  {hotel.policies?.cancellation && <p className="policy-cancellation">✅ {hotel.policies.cancellation}</p>}
                </div>
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <div className="hdetail-rooms animate-fade">
                {hotel.rooms?.map((room, i) => (
                  <div key={i} className="room-card">
                    <div className="room-card-body">
                      <div className="room-info">
                        <h4>{room.type}</h4>
                        <p className="room-desc">{room.description}</p>
                        <div className="room-meta">
                          <span>🛏 {room.bedType}</span>
                          <span>📐 {room.size}</span>
                          <span>🌊 {room.view}</span>
                          <span>👥 Up to {room.maxOccupancy}</span>
                        </div>
                        <div className="room-amenities">
                          {room.amenities?.map((a) => <span key={a} className="hotel-amenity-tag">{a}</span>)}
                        </div>
                        {room.refundable && <span className="badge badge-success">✓ Free cancellation</span>}
                      </div>
                      <div className="room-price-col">
                        <div className="room-price">${room.pricePerNight}</div>
                        <div className="room-price-sub">per night</div>
                        {nights > 1 && <div className="room-total">Total: ${room.pricePerNight * nights}</div>}
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/booking/hotel/${hotel._id}?roomType=${encodeURIComponent(room.type)}&pricePerNight=${room.pricePerNight}&checkIn=${checkIn}&checkOut=${checkOut}&nights=${nights}&guests=${searchParams.get("guests") || 2}`)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Amenities Tab */}
            {activeTab === "amenities" && (
              <div className="hdetail-amenities animate-fade">
                {Object.entries(hotel.amenities || {}).map(([cat, items]) => (
                  <div key={cat} className="amenity-group">
                    <h4>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
                    <div className="amenity-list">
                      {items.map((a) => <span key={a} className="amenity-pill">✓ {a}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="hdetail-reviews animate-fade">
                <div className="reviews-summary">
                  <div className="reviews-score">{hotel.guestRating?.toFixed(1)}</div>
                  <div>
                    <div className="reviews-label">Excellent</div>
                    <div className="reviews-count">Based on {hotel.reviewCount?.toLocaleString()} reviews</div>
                  </div>
                </div>
                {hotel.reviews?.map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <div className="review-avatar">{r.userName?.charAt(0)}</div>
                      <div>
                        <div className="review-name">{r.userName}</div>
                        <div className="review-type">{r.travelType}</div>
                      </div>
                      <div className="review-rating">{r.rating}/10</div>
                    </div>
                    <div className="review-title">{r.title}</div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="hdetail-sidebar">
            <div className="hdetail-booking-box">
              <div className="booking-box-price">
                <span className="booking-price">${hotel.rooms?.[0]?.pricePerNight}</span>
                <span className="booking-price-sub"> / night</span>
              </div>
              <div className="booking-dates">
                <div className="booking-date-field">
                  <label>Check-in</label>
                  <span>{checkIn || "Select date"}</span>
                </div>
                <div className="booking-date-sep" />
                <div className="booking-date-field">
                  <label>Check-out</label>
                  <span>{checkOut || "Select date"}</span>
                </div>
              </div>
              {nights > 1 && (
                <div className="booking-summary">
                  <span>${hotel.rooms?.[0]?.pricePerNight} × {nights} nights</span>
                  <span>${hotel.rooms?.[0]?.pricePerNight * nights}</span>
                </div>
              )}
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setActiveTab("rooms")}
              >
                Choose a Room
              </button>
              <p className="booking-box-note">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
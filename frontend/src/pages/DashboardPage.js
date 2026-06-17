// src/pages/DashboardPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./DashboardPage.css";

// const MOCK_BOOKINGS = [
//   {
//     _id: "b1",
//     bookingReference: "TB1A2B3C4D",
//     bookingType: "flight",
//     status: "confirmed",
//     payment: { status: "paid" },
//     pricing: { totalPrice: 465, currency: "USD" },
//     createdAt: new Date(Date.now() - 3 * 86400000),
//     flight: {
//       origin: "DEL",
//       destination: "DXB",
//       segments: [{ airline: "IndiGo", departure: { time: new Date() } }],
//     },
//   },
//   {
//     _id: "b2",
//     bookingReference: "TB9Z8Y7X6W",
//     bookingType: "hotel",
//     status: "confirmed",
//     payment: { status: "paid" },
//     pricing: { totalPrice: 1140, currency: "USD" },
//     createdAt: new Date(Date.now() - 7 * 86400000),
//     hotel: { name: "Atlantis The Palm", location: { city: "Dubai" } },
//     checkInDate: new Date("2025-06-15"),
//     checkOutDate: new Date("2025-06-18"),
//     nights: 3,
//   },
//   {
//     _id: "b3",
//     bookingReference: "TBABCD1234",
//     bookingType: "flight",
//     status: "cancelled",
//     payment: { status: "refunded" },
//     pricing: { totalPrice: 320, currency: "USD" },
//     createdAt: new Date(Date.now() - 14 * 86400000),
//     flight: {
//       origin: "BOM",
//       destination: "LHR",
//       segments: [{ airline: "Air India", departure: { time: new Date() } }],
//     },
//   },
// ];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [filterStatus, setFilterStatus] = useState("all");
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    nationality: user?.nationality || "",
    passportNumber: user?.passportNumber || "",
  });

  useEffect(() => {
    bookingAPI
      .getMyBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingAPI.cancel(id, "Cancelled by user");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed.");
    }
  };

  const filtered =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);
  const statusColors = {
    confirmed: "#2ecc71",
    pending: "#f39c12",
    cancelled: "#e74c3c",
    completed: "#4da6e8",
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="dash-profile">
              <div className="dash-avatar">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <div className="dash-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="dash-email">{user?.email}</div>
              </div>
            </div>
            <nav className="dash-nav">
              {[
                ["bookings", "🗂️", "My Bookings"],
                ["profile", "👤", "Profile"],
                ["saved", "❤️", "Saved"],
                ["payments", "💳", "Payments"],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  className={`dash-nav-item ${activeTab === id ? "active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
              <button
                className="dash-nav-item dash-logout"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          <div className="dashboard-main">
            {activeTab === "bookings" && (
              <div>
                <div className="dash-section-header">
                  <h2>My Bookings</h2>
                  <div className="dash-filter-tabs">
                    {["all", "confirmed", "pending", "cancelled"].map((s) => (
                      <button
                        key={s}
                        className={`dash-filter-tab ${filterStatus === s ? "active" : ""}`}
                        onClick={() => setFilterStatus(s)}
                      >
                        {s[0].toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        height: 110,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    />
                  ))
                ) : filtered.length === 0 ? (
                  <div className="dash-empty">
                    <span style={{ fontSize: "3rem" }}>🗂️</span>
                    <h4>No bookings found</h4>
                    <p>Make your first booking!</p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                      }}
                    >
                      <Link to="/flights" className="btn btn-primary">
                        Search Flights
                      </Link>
                      <Link to="/hotels" className="btn btn-outline">
                        Search Hotels
                      </Link>
                    </div>
                  </div>
                ) : (
                  filtered.map((b) => (
                    <div key={b._id} className="booking-list-card">
                      <div className="blc-left">
                        <div className="blc-type-icon">
                          {b.bookingType === "hotel" ? "🏨" : "✈️"}
                        </div>
                        <div>
                          <div className="blc-title">
                            {b.bookingType === "flight"
                              ? `${b.flight?.origin} → ${b.flight?.destination}`
                              : b.hotel?.name}
                          </div>
                          <div className="blc-subtitle">
                            {b.bookingType === "flight"
                              ? b.flight?.segments?.[0]?.airline
                              : `${b.hotel?.location?.city} · ${b.nights} nights`}
                          </div>
                          <div className="blc-ref">
                            Ref: <strong>{b.bookingReference}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="blc-right">
                        <div className="blc-price">
                          ${b.pricing?.totalPrice}
                        </div>
                        <span
                          className="blc-status"
                          style={{
                            background: `${statusColors[b.status]}20`,
                            color: statusColors[b.status],
                          }}
                        >
                          {b.status}
                        </span>
                        {b.status === "confirmed" && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleCancel(b._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 style={{ marginBottom: 24 }}>Profile Settings</h2>
                <div className="profile-card">
                  <form
                    className="booking-form-grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success("Profile saved!");
                    }}
                  >
                    {[
                      ["firstName", "First Name"],
                      ["lastName", "Last Name"],
                      ["phone", "Phone"],
                      ["nationality", "Nationality"],
                      ["passportNumber", "Passport Number"],
                    ].map(([k, l]) => (
                      <div className="form-group" key={k}>
                        <label className="form-label">{l}</label>
                        <input
                          className="form-input"
                          value={profileForm[k]}
                          onChange={(e) =>
                            setProfileForm((p) => ({
                              ...p,
                              [k]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: "span 2", marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <h2 style={{ marginBottom: 24 }}>Saved Trips</h2>
                <div className="dash-empty">
                  <span style={{ fontSize: "3rem" }}>❤️</span>
                  <h4>No saved items yet</h4>
                  <p>Heart a flight or hotel to save it here for later.</p>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div>
                <h2 style={{ marginBottom: 24 }}>Payment History</h2>
                {bookings
                  .filter((b) =>
                    ["paid", "refunded"].includes(b.payment?.status),
                  )
                  .map((b) => (
                    <div key={b._id} className="booking-list-card">
                      <div className="blc-left">
                        <div className="blc-type-icon">
                          {b.bookingType === "hotel" ? "🏨" : "✈️"}
                        </div>
                        <div>
                          <div className="blc-title">{b.bookingReference}</div>
                          <div className="blc-subtitle">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="blc-right">
                        <div className="blc-price">
                          ${b.pricing?.totalPrice}
                        </div>
                        <span
                          className="blc-status"
                          style={{
                            background:
                              b.payment?.status === "refunded"
                                ? "#e74c3c20"
                                : "#2ecc7120",
                            color:
                              b.payment?.status === "refunded"
                                ? "#e74c3c"
                                : "#27ae60",
                          }}
                        >
                          {b.payment?.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/BookingConfirmationPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingAPI } from "../utils/api";
// import "./BookingConfirmationPage.css";

export default function BookingConfirmationPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchByRef = async () => {
      try {
        const { data } = await bookingAPI.getByReference(reference);
        setBooking(data.data);
      } catch {
        // Mock for display
        setBooking({
          bookingReference: reference,
          bookingType: "flight",
          status: "confirmed",
          payment: { status: "paid", paidAt: new Date() },
          pricing: { totalPrice: 465, currency: "USD" },
          contactEmail: "guest@example.com",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchByRef();
  }, [reference]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="confirm-page">
      <div className="container">
        <div className="confirm-card animate-fade-up">
          {/* Success Icon */}
          <div className="confirm-icon">
            <div className="confirm-checkmark">✓</div>
          </div>

          <h1 className="confirm-title">Booking Confirmed!</h1>
          <p className="confirm-subtitle">
            Your booking has been successfully confirmed. A confirmation email has been sent to{" "}
            <strong>{booking?.contactEmail}</strong>
          </p>

          {/* Reference Box */}
          <div className="confirm-ref-box">
            <span className="confirm-ref-label">Booking Reference</span>
            <span className="confirm-ref-number">{booking?.bookingReference}</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { navigator.clipboard?.writeText(booking?.bookingReference); }}
            >
              Copy
            </button>
          </div>

          {/* Details Grid */}
          <div className="confirm-details">
            <div className="confirm-detail-item">
              <span>Status</span>
              <strong className="badge badge-success">{booking?.status?.toUpperCase()}</strong>
            </div>
            <div className="confirm-detail-item">
              <span>Payment</span>
              <strong className="badge badge-success">{booking?.payment?.status?.toUpperCase()}</strong>
            </div>
            <div className="confirm-detail-item">
              <span>Amount Paid</span>
              <strong>${booking?.pricing?.totalPrice} {booking?.pricing?.currency}</strong>
            </div>
            <div className="confirm-detail-item">
              <span>Booking Type</span>
              <strong>{booking?.bookingType === "hotel" ? "🏨 Hotel" : "✈️ Flight"}</strong>
            </div>
          </div>

          {/* What's Next */}
          <div className="confirm-next-steps">
            <h4>What's Next?</h4>
            <div className="confirm-steps-grid">
              <div className="confirm-step-item">
                <span className="confirm-step-icon">📧</span>
                <div>
                  <strong>Check Your Email</strong>
                  <p>We've sent your e-ticket and booking details to your email address.</p>
                </div>
              </div>
              <div className="confirm-step-item">
                <span className="confirm-step-icon">📱</span>
                <div>
                  <strong>Save Your Reference</strong>
                  <p>Keep your booking reference handy for check-in and any queries.</p>
                </div>
              </div>
              <div className="confirm-step-item">
                <span className="confirm-step-icon">🗂️</span>
                <div>
                  <strong>Manage Booking</strong>
                  <p>View, modify, or cancel your booking from your account dashboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="confirm-actions">
            <Link to="/dashboard/bookings" className="btn btn-primary btn-lg">
              View My Bookings
            </Link>
            <Link to="/" className="btn btn-ghost btn-lg">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
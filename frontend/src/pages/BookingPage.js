// src/pages/BookingPage.js
import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { bookingAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./BookingPage.css";

export default function BookingPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const cabinClass = searchParams.get("cabinClass") || "economy";
  const adults = parseInt(searchParams.get("adults") || "1");
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const nights = parseInt(searchParams.get("nights") || "1");
  const pricePerNight = parseFloat(searchParams.get("pricePerNight") || "0");
  const roomType = searchParams.get("roomType") || "";
  const guests = parseInt(searchParams.get("guests") || "2");

  const isHotel = type === "hotel";
  const basePrice = isHotel ? pricePerNight * nights : 450; // mock flight price
  const taxes = Math.round(basePrice * 0.12);
  const fees = 15;
  const totalPrice = basePrice + taxes + fees;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [passengers, setPassengers] = useState(
    Array.from({ length: adults }, () => ({
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      mealPreference: "standard",
    })),
  );

  const [guestInfo, setGuestInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialRequests: "",
  });

  const [contactInfo, setContactInfo] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const updatePassenger = (i, field, val) =>
    setPassengers((p) =>
      p.map((pax, idx) => (idx === i ? { ...pax, [field]: val } : pax)),
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const bookingData = isHotel
        ? {
            bookingType: "hotel",
            hotel: id,
            roomType,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            nights,
            rooms: 1,
            guests: [guestInfo],
            pricing: { basePrice, taxes, fees, totalPrice, currency: "USD" },
            contactEmail: contactInfo.email,
            contactPhone: contactInfo.phone,
          }
        : {
            bookingType: "flight",
            flight: id,
            cabinClass,
            passengers,
            tripType: "one_way",
            pricing: { basePrice, taxes, fees, totalPrice, currency: "USD" },
            contactEmail: contactInfo.email,
            contactPhone: contactInfo.phone,
          };

      const { data } = await bookingAPI.create(bookingData);
      toast.success("Booking created! Proceeding to payment...");
      navigate(`/payment/${data.data._id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="container">
          <h2>
            {isHotel
              ? "🏨 Complete Your Hotel Booking"
              : "✈️ Complete Your Flight Booking"}
          </h2>
        </div>
      </div>

      <div className="container">
        <div className="booking-layout">
          {/* Main Form */}
          <div className="booking-main">
            {/* Step Indicator */}
            <div className="booking-steps">
              {["Traveller Details", "Contact Info", "Review"].map((s, i) => (
                <div
                  key={s}
                  className={`booking-step ${step > i + 1 ? "done" : ""} ${step === i + 1 ? "active" : ""}`}
                >
                  <div className="step-circle">
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Traveller / Guest Details */}
            {step === 1 && (
              <div className="booking-section animate-fade-up">
                {isHotel ? (
                  <>
                    <h3>Guest Information</h3>
                    <div className="booking-form-grid">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                          className="form-input"
                          value={guestInfo.firstName}
                          onChange={(e) =>
                            setGuestInfo((p) => ({
                              ...p,
                              firstName: e.target.value,
                            }))
                          }
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                          className="form-input"
                          value={guestInfo.lastName}
                          onChange={(e) =>
                            setGuestInfo((p) => ({
                              ...p,
                              lastName: e.target.value,
                            }))
                          }
                          placeholder="Last name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={guestInfo.email}
                          onChange={(e) =>
                            setGuestInfo((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Email address"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          className="form-input"
                          value={guestInfo.phone}
                          onChange={(e) =>
                            setGuestInfo((p) => ({
                              ...p,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "span 2" }}
                      >
                        <label className="form-label">Special Requests</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={guestInfo.specialRequests}
                          onChange={(e) =>
                            setGuestInfo((p) => ({
                              ...p,
                              specialRequests: e.target.value,
                            }))
                          }
                          placeholder="E.g. high floor, non-smoking room..."
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  passengers.map((pax, i) => (
                    <div key={i} className="passenger-block">
                      <h3>
                        Passenger {i + 1} {i === 0 ? "(Primary)" : ""}
                      </h3>
                      <div className="booking-form-grid">
                        <div className="form-group">
                          <label className="form-label">Title</label>
                          <select
                            className="form-input"
                            value={pax.title}
                            onChange={(e) =>
                              updatePassenger(i, "title", e.target.value)
                            }
                          >
                            {["Mr", "Mrs", "Ms", "Dr"].map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">First Name</label>
                          <input
                            className="form-input"
                            value={pax.firstName}
                            onChange={(e) =>
                              updatePassenger(i, "firstName", e.target.value)
                            }
                            placeholder="As on passport"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name</label>
                          <input
                            className="form-input"
                            value={pax.lastName}
                            onChange={(e) =>
                              updatePassenger(i, "lastName", e.target.value)
                            }
                            placeholder="As on passport"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            className="form-input"
                            value={pax.dateOfBirth}
                            onChange={(e) =>
                              updatePassenger(i, "dateOfBirth", e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nationality</label>
                          <input
                            className="form-input"
                            value={pax.nationality}
                            onChange={(e) =>
                              updatePassenger(i, "nationality", e.target.value)
                            }
                            placeholder="e.g. Indian"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Passport Number</label>
                          <input
                            className="form-input"
                            value={pax.passportNumber}
                            onChange={(e) =>
                              updatePassenger(
                                i,
                                "passportNumber",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. A1234567"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Meal Preference</label>
                          <select
                            className="form-input"
                            value={pax.mealPreference}
                            onChange={(e) =>
                              updatePassenger(
                                i,
                                "mealPreference",
                                e.target.value,
                              )
                            }
                          >
                            {[
                              "standard",
                              "vegetarian",
                              "vegan",
                              "halal",
                              "kosher",
                              "gluten_free",
                            ].map((m) => (
                              <option key={m} value={m}>
                                {m
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="booking-section animate-fade-up">
                <h3>Contact Information</h3>
                <p style={{ marginBottom: 20 }}>
                  We'll send your booking confirmation to this email address.
                </p>
                <div className="booking-form-grid">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={contactInfo.email}
                      onChange={(e) =>
                        setContactInfo((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                </div>
                <div className="booking-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setStep(3)}
                  >
                    Review Booking →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="booking-section animate-fade-up">
                <h3>Review Your Booking</h3>
                <div className="booking-review-box">
                  <div className="review-row">
                    <span>Type</span>
                    <strong>{isHotel ? "Hotel" : "Flight"}</strong>
                  </div>
                  {isHotel ? (
                    <>
                      <div className="review-row">
                        <span>Room</span>
                        <strong>{roomType}</strong>
                      </div>
                      <div className="review-row">
                        <span>Check-in</span>
                        <strong>{checkIn}</strong>
                      </div>
                      <div className="review-row">
                        <span>Check-out</span>
                        <strong>{checkOut}</strong>
                      </div>
                      <div className="review-row">
                        <span>Duration</span>
                        <strong>
                          {nights} night{nights !== 1 ? "s" : ""}
                        </strong>
                      </div>
                      <div className="review-row">
                        <span>Guests</span>
                        <strong>{guests}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="review-row">
                        <span>Cabin</span>
                        <strong>
                          {cabinClass
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </strong>
                      </div>
                      <div className="review-row">
                        <span>Passengers</span>
                        <strong>
                          {passengers.length} adult
                          {passengers.length > 1 ? "s" : ""}
                        </strong>
                      </div>
                    </>
                  )}
                  <div className="divider" />
                  <div className="review-row">
                    <span>Base Price</span>
                    <strong>${basePrice}</strong>
                  </div>
                  <div className="review-row">
                    <span>Taxes (12%)</span>
                    <strong>${taxes}</strong>
                  </div>
                  <div className="review-row">
                    <span>Service Fee</span>
                    <strong>${fees}</strong>
                  </div>
                  <div className="divider" />
                  <div className="review-row total">
                    <span>Total</span>
                    <strong>${totalPrice}</strong>
                  </div>
                </div>
                <div className="booking-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Proceed to Payment →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Summary Sidebar */}
          <div className="booking-sidebar">
            <div className="booking-summary-card">
              <h4>Price Summary</h4>
              <div className="summary-row">
                <span>Base fare</span>
                <span>${basePrice}</span>
              </div>
              <div className="summary-row">
                <span>Taxes</span>
                <span>${taxes}</span>
              </div>
              <div className="summary-row">
                <span>Service fee</span>
                <span>${fees}</span>
              </div>
              <div className="divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
              <div className="summary-note">💳 Pay securely on next step</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// models/Booking.js

const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const passengerSchema = new mongoose.Schema({
  type: { type: String, enum: ["adult", "child", "infant"], default: "adult" },
  title: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  nationality: String,
  passportNumber: String,
  passportExpiry: Date,
  seatNumber: String,
  mealPreference: String,
  specialRequests: String,
});

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  specialRequests: String,
});

const bookingSchema = new mongoose.Schema(
  {
    // bookingReference: {
    //   type: String,
    //   unique: true,
    //   default: () =>
    //     `TB${uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    // },
    bookingReference: {
      type: String,
      unique: true,
      default: () => `TB${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingType: {
      type: String,
      enum: ["flight", "hotel", "package"],
      required: true,
    },

    // ── Flight Booking Fields ──────────────────────────────
    flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
    returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
    cabinClass: {
      type: String,
      enum: ["economy", "premium_economy", "business", "first"],
    },
    passengers: [passengerSchema],
    tripType: { type: String, enum: ["one_way", "round_trip", "multi_city"] },

    // ── Hotel Booking Fields ──────────────────────────────
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomType: String,
    checkInDate: Date,
    checkOutDate: Date,
    nights: Number,
    guests: [guestSchema],
    rooms: { type: Number, default: 1 },
    breakfastIncluded: { type: Boolean, default: false },

    // ── Pricing ───────────────────────────────────────────
    pricing: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      currency: { type: String, default: "USD" },
    },

    // ── Payment ───────────────────────────────────────────
    payment: {
      method: {
        type: String,
        enum: ["card", "paypal", "bank_transfer", "crypto"],
      },
      status: {
        type: String,
        enum: ["pending", "processing", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },

    // ── Booking Status ────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    cancellationReason: String,
    cancelledAt: Date,

    // ── Contact ───────────────────────────────────────────
    contactEmail: { type: String, required: true },
    contactPhone: String,

    notes: String,
    isInsuranceAdded: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Virtual: nights for hotel
bookingSchema.virtual("stayDuration").get(function () {
  if (this.checkInDate && this.checkOutDate) {
    return Math.ceil(
      (this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24),
    );
  }
  return null;
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

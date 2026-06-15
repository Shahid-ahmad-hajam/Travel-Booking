// models/Flight.js

const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  airlineCode: { type: String, required: true },
  flightNumber: { type: String, required: true },
  aircraft: String,
  departure: {
    airport: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    iataCode: { type: String, required: true },
    terminal: String,
    gate: String,
    time: { type: Date, required: true },
  },
  arrival: {
    airport: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    iataCode: { type: String, required: true },
    terminal: String,
    gate: String,
    time: { type: Date, required: true },
  },
  duration: Number, // minutes
  layover: Number,  // minutes until next segment
});

const cabinClassSchema = new mongoose.Schema({
  class: {
    type: String,
    enum: ["economy", "premium_economy", "business", "first"],
    required: true,
  },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  seatsAvailable: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  baggage: {
    cabin: { type: String, default: "7kg" },
    checked: { type: String, default: "23kg" },
  },
  features: [String],
  refundable: { type: Boolean, default: false },
  changeable: { type: Boolean, default: true },
});

const flightSchema = new mongoose.Schema(
  {
    segments: [segmentSchema],
    stops: { type: Number, default: 0 },
    totalDuration: { type: Number, required: true }, // minutes
    cabinClasses: [cabinClassSchema],
    origin: { type: String, required: true }, // IATA
    destination: { type: String, required: true }, // IATA
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    flightType: { type: String, enum: ["direct", "connecting"], default: "direct" },
    status: { type: String, enum: ["active", "cancelled", "delayed", "completed"], default: "active" },
    tags: [String], // e.g. ['best_value', 'fastest']
  },
  { timestamps: true }
);

// Index for fast searches
flightSchema.index({ origin: 1, destination: 1, departureDate: 1 });
flightSchema.index({ "cabinClasses.price": 1 });

module.exports = mongoose.model("Flight", flightSchema);
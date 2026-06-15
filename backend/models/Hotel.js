// models/Hotel.js

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "Deluxe Double"
  description: String,
  pricePerNight: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  maxOccupancy: { type: Number, default: 2 },
  bedType: String,
  size: String, // e.g. "35 sqm"
  view: String,
  amenities: [String],
  images: [String],
  availableRooms: { type: Number, default: 0 },
  refundable: { type: Boolean, default: true },
  breakfastIncluded: { type: Boolean, default: false },
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  rating: { type: Number, min: 1, max: 10, required: true },
  title: String,
  comment: String,
  travelType: {
    type: String,
    enum: ["solo", "couple", "family", "business", "group"],
  },
  stayDate: Date,
  helpful: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    starRating: { type: Number, min: 1, max: 5, required: true },
    guestRating: { type: Number, min: 0, max: 10, default: 0 },
    reviewCount: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["hotel", "resort", "hostel", "apartment", "villa", "boutique"],
      default: "hotel",
    },
    location: {
      address: String,
      city: { type: String, required: true },
      country: { type: String, required: true },
      countryCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      distanceFromCenter: String,
      nearbyAttractions: [String],
    },
    images: {
      main: String,
      gallery: [String],
    },
    amenities: {
      general: [String], // wifi, parking, pool, etc.
      rooms: [String],
      dining: [String],
      wellness: [String],
      business: [String],
    },
    policies: {
      checkIn: { type: String, default: "15:00" },
      checkOut: { type: String, default: "11:00" },
      cancellation: String,
      pets: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      children: { type: Boolean, default: true },
    },
    rooms: [roomSchema],
    reviews: [reviewSchema],
    tags: [String], // e.g. ['beachfront', 'family_friendly', 'romantic']
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

hotelSchema.index({ "location.city": 1, "location.country": 1 });
hotelSchema.index({ guestRating: -1 });
hotelSchema.index({ "rooms.pricePerNight": 1 });

module.exports = mongoose.model("Hotel", hotelSchema);

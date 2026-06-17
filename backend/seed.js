const mongoose = require("mongoose");
const Flight = require("./models/Flight");
const Hotel = require("./models/Hotel");
require("dotenv").config();

const flights = [
  {
    origin: "DEL", destination: "DXB",
    departureDate: new Date("2026-06-27"),
    arrivalDate: new Date("2026-06-27"),
    totalDuration: 195, stops: 0, flightType: "direct",
    segments: [{
      airline: "IndiGo", airlineCode: "6E", flightNumber: "6E-501",
      departure: { airport: "Indira Gandhi International", city: "New Delhi", country: "India", iataCode: "DEL", time: new Date("2026-05-27T16:30:00") },
      arrival: { airport: "Dubai International", city: "Dubai", country: "UAE", iataCode: "DXB", time: new Date("2026-05-27T19:45:00") },
      duration: 195,
    }],
    cabinClasses: [
      { class: "economy", price: 189, currency: "USD", seatsAvailable: 42, totalSeats: 180, baggage: { cabin: "7kg", checked: "23kg" }, refundable: false, changeable: true },
      { class: "business", price: 540, currency: "USD", seatsAvailable: 8, totalSeats: 20, baggage: { cabin: "15kg", checked: "32kg" }, refundable: true, changeable: true },
    ],
    status: "active", tags: ["best_value"],
  },
  {
    origin: "DEL", destination: "DXB",
    departureDate: new Date("2026-06-28"),
    arrivalDate: new Date("2026-06-28"),
    totalDuration: 185, stops: 0, flightType: "direct",
    segments: [{
      airline: "Emirates", airlineCode: "EK", flightNumber: "EK-516",
      departure: { airport: "Indira Gandhi International", city: "New Delhi", country: "India", iataCode: "DEL", time: new Date("2026-05-28T14:15:00") },
      arrival: { airport: "Dubai International", city: "Dubai", country: "UAE", iataCode: "DXB", time: new Date("2026-05-28T17:20:00") },
      duration: 185,
    }],
    cabinClasses: [
      { class: "economy", price: 240, currency: "USD", seatsAvailable: 55, totalSeats: 200, baggage: { cabin: "7kg", checked: "23kg" }, refundable: false, changeable: true },
      { class: "business", price: 870, currency: "USD", seatsAvailable: 12, totalSeats: 42, baggage: { cabin: "15kg", checked: "32kg" }, refundable: true, changeable: true },
      { class: "first", price: 1800, currency: "USD", seatsAvailable: 4, totalSeats: 8, baggage: { cabin: "20kg", checked: "40kg" }, refundable: true, changeable: true },
    ],
    status: "active", tags: ["fastest"],
  },
  {
    origin: "BOM", destination: "LHR",
    departureDate: new Date("2026-06-29"),
    arrivalDate: new Date("2026-06-29"),
    totalDuration: 540, stops: 0, flightType: "direct",
    segments: [{
      airline: "Air India", airlineCode: "AI", flightNumber: "AI-111",
      departure: { airport: "Chhatrapati Shivaji International", city: "Mumbai", country: "India", iataCode: "BOM", time: new Date("2026-05-29T02:00:00") },
      arrival: { airport: "Heathrow Airport", city: "London", country: "UK", iataCode: "LHR", time: new Date("2026-05-29T07:00:00") },
      duration: 540,
    }],
    cabinClasses: [
      { class: "economy", price: 520, currency: "USD", seatsAvailable: 30, totalSeats: 180, baggage: { cabin: "8kg", checked: "23kg" }, refundable: false, changeable: true },
      { class: "business", price: 1400, currency: "USD", seatsAvailable: 6, totalSeats: 24, baggage: { cabin: "15kg", checked: "32kg" }, refundable: true, changeable: true },
    ],
    status: "active", tags: ["cheapest"],
  },
  {
    origin: "DEL", destination: "SIN",
    departureDate: new Date("2026-06-30"),
    arrivalDate: new Date("2025-06-30"),
    totalDuration: 330, stops: 0, flightType: "direct",
    segments: [{
      airline: "Singapore Airlines", airlineCode: "SQ", flightNumber: "SQ-407",
      departure: { airport: "Indira Gandhi International", city: "New Delhi", country: "India", iataCode: "DEL", time: new Date("2026-05-30T09:00:00") },
      arrival: { airport: "Changi Airport", city: "Singapore", country: "Singapore", iataCode: "SIN", time: new Date("2026-05-30T19:30:00") },
      duration: 330,
    }],
    cabinClasses: [
      { class: "economy", price: 210, currency: "USD", seatsAvailable: 60, totalSeats: 200, baggage: { cabin: "7kg", checked: "23kg" }, refundable: false, changeable: true },
      { class: "business", price: 980, currency: "USD", seatsAvailable: 10, totalSeats: 40, baggage: { cabin: "15kg", checked: "32kg" }, refundable: true, changeable: true },
    ],
    status: "active", tags: [],
  },
];

const hotels = [
  {
    name: "Atlantis The Palm", slug: "atlantis-the-palm",
    description: "Iconic luxury resort on Palm Jumeirah featuring Aquaventure Waterpark, The Lost Chambers Aquarium, private beach, and world-class dining.",
    shortDescription: "Iconic Palm Jumeirah resort with waterpark and private beach",
    starRating: 5, guestRating: 9.2, reviewCount: 3840, category: "resort",
    location: { address: "Palm Jumeirah", city: "Dubai", country: "UAE", countryCode: "AE", distanceFromCenter: "12km from city center", nearbyAttractions: ["Aquaventure Waterpark", "The Lost Chambers", "Palm Monorail"] },
    images: { main: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", gallery: [] },
    amenities: { general: ["Free WiFi", "Swimming Pool", "Private Beach", "Gym", "Parking"], dining: ["Fine Dining", "Buffet Breakfast", "Pool Bar", "Room Service"], wellness: ["Spa", "Sauna", "Massage"] },
    policies: { checkIn: "15:00", checkOut: "11:00", cancellation: "Free cancellation up to 48 hours before check-in", pets: false, smoking: false },
    rooms: [
      { type: "Deluxe Room", description: "Spacious room with partial sea view and balcony", pricePerNight: 380, currency: "USD", maxOccupancy: 2, bedType: "King", size: "45 sqm", view: "Partial Sea View", amenities: ["AC", "Mini bar", "Safe", "TV", "Balcony"], availableRooms: 10, refundable: true, breakfastIncluded: false },
      { type: "Premier Sea View", description: "Stunning panoramic views of the Arabian Gulf", pricePerNight: 520, currency: "USD", maxOccupancy: 2, bedType: "King", size: "55 sqm", view: "Full Sea View", amenities: ["AC", "Mini bar", "Safe", "TV", "Balcony", "Bathtub"], availableRooms: 6, refundable: true, breakfastIncluded: true },
    ],
    featured: true, isActive: true, tags: ["beachfront", "luxury", "family_friendly"],
  },
  {
    name: "Rove Downtown Dubai", slug: "rove-downtown-dubai",
    description: "Modern and affordable hotel in the heart of Downtown Dubai, walking distance to Dubai Mall and Burj Khalifa.",
    shortDescription: "Trendy budget hotel steps from Burj Khalifa",
    starRating: 3, guestRating: 8.1, reviewCount: 5620, category: "hotel",
    location: { address: "Sheikh Mohammed Bin Rashid Blvd", city: "Dubai", country: "UAE", countryCode: "AE", distanceFromCenter: "2km from city center", nearbyAttractions: ["Dubai Mall", "Burj Khalifa", "Dubai Fountain"] },
    images: { main: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", gallery: [] },
    amenities: { general: ["Free WiFi", "Swimming Pool", "Gym", "Parking"], dining: ["Café", "Room Service"], wellness: ["Gym"] },
    policies: { checkIn: "15:00", checkOut: "12:00", cancellation: "Free cancellation up to 24 hours", pets: false, smoking: false },
    rooms: [
      { type: "Standard Room", description: "Cozy room with city view", pricePerNight: 95, currency: "USD", maxOccupancy: 2, bedType: "Queen", size: "28 sqm", view: "City View", amenities: ["AC", "TV", "Safe", "WiFi"], availableRooms: 20, refundable: true, breakfastIncluded: false },
      { type: "Rove King Room", description: "Larger room with extra workspace", pricePerNight: 120, currency: "USD", maxOccupancy: 2, bedType: "King", size: "35 sqm", view: "City View", amenities: ["AC", "TV", "Safe", "WiFi", "Work Desk"], availableRooms: 12, refundable: true, breakfastIncluded: false },
    ],
    featured: true, isActive: true, tags: ["best_value", "central"],
  },
  {
    name: "The Leela Palace New Delhi", slug: "leela-palace-new-delhi",
    description: "Ultra-luxury palace hotel in Chanakyapuri offering palatial rooms, multiple fine dining restaurants, a stunning pool, and world-class spa.",
    shortDescription: "Ultra-luxury palace hotel in New Delhi",
    starRating: 5, guestRating: 9.5, reviewCount: 2100, category: "hotel",
    location: { address: "Diplomatic Enclave, Chanakyapuri", city: "New Delhi", country: "India", countryCode: "IN", distanceFromCenter: "8km from city center", nearbyAttractions: ["India Gate", "Rashtrapati Bhavan", "Lodhi Garden"] },
    images: { main: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", gallery: [] },
    amenities: { general: ["Free WiFi", "Swimming Pool", "Valet Parking", "Concierge"], dining: ["Multiple Restaurants", "Bar", "Room Service", "High Tea"], wellness: ["Spa", "Gym", "Yoga", "Sauna"] },
    policies: { checkIn: "14:00", checkOut: "12:00", cancellation: "Free cancellation up to 72 hours", pets: false, smoking: false },
    rooms: [
      { type: "Grand Deluxe Room", description: "Elegantly appointed room with garden or pool view", pricePerNight: 320, currency: "USD", maxOccupancy: 2, bedType: "King", size: "52 sqm", view: "Garden View", amenities: ["AC", "Mini bar", "Bathtub", "TV", "Butler call"], availableRooms: 15, refundable: true, breakfastIncluded: true },
      { type: "Royal Suite", description: "Palatial suite with private dining and butler service", pricePerNight: 950, currency: "USD", maxOccupancy: 3, bedType: "King", size: "120 sqm", view: "Pool View", amenities: ["Private pool access", "Butler", "Living room", "Dining area"], availableRooms: 3, refundable: true, breakfastIncluded: true },
    ],
    featured: true, isActive: true, tags: ["luxury", "business", "romantic"],
  },
  {
    name: "Marina Bay Sands", slug: "marina-bay-sands-singapore",
    description: "Singapore's most iconic hotel featuring the famous infinity pool on the 57th floor SkyPark, celebrity chef restaurants, and a world-class casino.",
    shortDescription: "Singapore's iconic hotel with rooftop infinity pool",
    starRating: 5, guestRating: 9.0, reviewCount: 8900, category: "resort",
    location: { address: "10 Bayfront Avenue", city: "Singapore", country: "Singapore", countryCode: "SG", distanceFromCenter: "3km from city center", nearbyAttractions: ["Gardens by the Bay", "ArtScience Museum", "Shoppes at MBS"] },
    images: { main: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80", gallery: [] },
    amenities: { general: ["Free WiFi", "Infinity Pool", "Casino", "Shopping Mall", "Gym"], dining: ["Celebrity Chef Restaurants", "Bar", "Room Service", "Sky Bar"], wellness: ["Spa", "Infinity Pool", "Sauna"] },
    policies: { checkIn: "15:00", checkOut: "11:00", cancellation: "Free cancellation up to 48 hours", pets: false, smoking: false },
    rooms: [
      { type: "Deluxe Room", description: "Elegant room with stunning city or bay views", pricePerNight: 450, currency: "USD", maxOccupancy: 2, bedType: "King", size: "48 sqm", view: "City View", amenities: ["AC", "Mini bar", "Safe", "TV", "Rain Shower"], availableRooms: 30, refundable: false, breakfastIncluded: false },
      { type: "Premier Bay View", description: "Breathtaking views of Marina Bay and the city skyline", pricePerNight: 620, currency: "USD", maxOccupancy: 2, bedType: "King", size: "55 sqm", view: "Bay View", amenities: ["AC", "Mini bar", "Safe", "TV", "Bathtub", "Rain Shower"], availableRooms: 15, refundable: true, breakfastIncluded: false },
    ],
    featured: true, isActive: true, tags: ["iconic", "luxury", "romantic"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    console.log("🗑️  Cleared existing data");

    await Flight.insertMany(flights);
    console.log(`✈️  Seeded ${flights.length} flights`);

    await Hotel.insertMany(hotels);
    console.log(`🏨  Seeded ${hotels.length} hotels`);

    console.log("\n✅ Database seeded successfully!");
    console.log("You can now search for:");
    console.log("  Flights: DEL→DXB, BOM→LHR, DEL→SIN");
    console.log("  Hotels in: Dubai, New Delhi, Singapore");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedDB();
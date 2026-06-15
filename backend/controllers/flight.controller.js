// controllers/flight.controller.js

const Flight = require("../models/Flight");

// ── SEARCH FLIGHTS ─────────────────────────────────────────
exports.searchFlights = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      cabinClass = "economy",
      adults = 1,
      children = 0,
      infants = 0,
      tripType = "one_way",
      sortBy = "price",
      page = 1,
      limit = 10,
    } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: "Origin, destination, and departure date are required.",
      });
    }

    // Build date range query (same day)
    const depDate = new Date(departureDate);
    const depDateEnd = new Date(departureDate);
    depDateEnd.setDate(depDateEnd.getDate() + 1);

    const query = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate: { $gte: depDate, $lt: depDateEnd },
      status: "active",
      "cabinClasses.class": cabinClass,
    };

    // Sort options
    const sortMap = {
      price: { "cabinClasses.price": 1 },
      duration: { totalDuration: 1 },
      departure: { departureDate: 1 },
      rating: { rating: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.price;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [flights, total] = await Promise.all([
      Flight.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Flight.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: flights.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      filters: { origin, destination, departureDate, cabinClass, adults, children, infants, tripType },
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET FLIGHT BY ID ───────────────────────────────────────
exports.getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: "Flight not found." });
    }
    res.json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// ── GET POPULAR ROUTES ─────────────────────────────────────
exports.getPopularRoutes = async (req, res, next) => {
  try {
    const routes = await Flight.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: { origin: "$origin", destination: "$destination" },
          minPrice: { $min: "$cabinClasses.price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    res.json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

// ── CREATE FLIGHT (Admin) ──────────────────────────────────
exports.createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE FLIGHT (Admin) ──────────────────────────────────
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!flight) return res.status(404).json({ success: false, message: "Flight not found." });
    res.json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// ── DELETE FLIGHT (Admin) ──────────────────────────────────
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: "Flight not found." });
    res.json({ success: true, message: "Flight deleted." });
  } catch (error) {
    next(error);
  }
};
// controllers/hotel.controller.js

const Hotel = require("../models/Hotel");

// ── SEARCH HOTELS ──────────────────────────────────────────
exports.searchHotels = async (req, res, next) => {
  try {
    const {
      city,
      country,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      minPrice,
      maxPrice,
      stars,
      minRating,
      category,
      amenities,
      sortBy = "rating",
      page = 1,
      limit = 12,
    } = req.query;

    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "City is required." });
    }

    const query = {
      "location.city": { $regex: city, $options: "i" },
      isActive: true,
    };

    if (country) query["location.country"] = { $regex: country, $options: "i" };
    if (stars) query.starRating = { $in: stars.split(",").map(Number) };
    if (minRating) query.guestRating = { $gte: parseFloat(minRating) };
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query["rooms.pricePerNight"] = {};
      if (minPrice) query["rooms.pricePerNight"].$gte = parseFloat(minPrice);
      if (maxPrice) query["rooms.pricePerNight"].$lte = parseFloat(maxPrice);
    }

    if (amenities) {
      const amenityList = amenities.split(",");
      query["amenities.general"] = { $all: amenityList };
    }

    const sortMap = {
      rating: { guestRating: -1 },
      price_asc: { "rooms.pricePerNight": 1 },
      price_desc: { "rooms.pricePerNight": -1 },
      stars: { starRating: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.rating;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hotels, total] = await Promise.all([
      Hotel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-reviews"),
      Hotel.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: hotels.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: hotels,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET HOTEL BY ID ────────────────────────────────────────
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "reviews.user",
      "firstName lastName avatar",
    );
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found." });
    res.json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// ── GET FEATURED HOTELS ────────────────────────────────────
exports.getFeaturedHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ featured: true, isActive: true })
      .sort({ guestRating: -1 })
      .limit(8)
      .select("-reviews");
    res.json({ success: true, data: hotels });
  } catch (error) {
    next(error);
  }
};

// ── ADD REVIEW ─────────────────────────────────────────────
exports.addReview = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found." });

    const { rating, title, comment, travelType } = req.body;
    const review = {
      user: req.user._id,
      userName: req.user.fullName,
      rating,
      title,
      comment,
      travelType,
    };

    hotel.reviews.push(review);
    hotel.reviewCount = hotel.reviews.length;
    hotel.guestRating =
      hotel.reviews.reduce((acc, r) => acc + r.rating, 0) /
      hotel.reviews.length;
    await hotel.save();

    res
      .status(201)
      .json({ success: true, message: "Review added.", data: review });
  } catch (error) {
    next(error);
  }
};

// ── CREATE HOTEL (Admin) ───────────────────────────────────
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE HOTEL (Admin) ───────────────────────────────────
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found." });
    res.json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// ── DELETE HOTEL (Admin) ───────────────────────────────────
exports.deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Hotel deleted." });
  } catch (error) {
    next(error);
  }
};

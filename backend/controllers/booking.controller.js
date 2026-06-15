// controllers/booking.controller.js

const Booking = require("../models/Booking");
const Flight = require("../models/Flight");
const Hotel = require("../models/Hotel");
const sendEmail = require("../utils/sendEmail");

// ───────────────────────────────────────────────────────────
// CREATE BOOKING
// ───────────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { bookingType, ...data } = req.body;

    // ── FLIGHT VALIDATION ─────────────────────────────
    if (bookingType === "flight" && data.flight) {
      const flight = await Flight.findById(data.flight);

      if (!flight) {
        return res.status(404).json({
          success: false,
          message: "Flight not found.",
        });
      }

      const cabin = flight.cabinClasses.find(
        (c) => c.class === data.cabinClass
      );

      if (!cabin || cabin.seatsAvailable < (data.passengers?.length || 1)) {
        return res.status(400).json({
          success: false,
          message: "Not enough seats available.",
        });
      }

      // Reserve seats
      cabin.seatsAvailable -= data.passengers?.length || 1;

      await flight.save();
    }

    // ── HOTEL VALIDATION ──────────────────────────────
    if (bookingType === "hotel" && data.hotel) {
      const hotel = await Hotel.findById(data.hotel);

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found.",
        });
      }
    }

    // ── CREATE BOOKING ────────────────────────────────
    const booking = await Booking.create({
      ...data,
      bookingType,
      user: req.user._id,
      contactEmail: data.contactEmail || req.user.email,
    });

    await booking.populate("flight hotel");

    // ── SEND CONFIRMATION EMAIL ───────────────────────
    try {
      await sendEmail({
        email: booking.contactEmail,
        subject: "Travel Booking Confirmation",

        message: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">
              Booking Confirmed ✈️
            </h2>

            <p>Hello ${req.user.firstName || "User"},</p>

            <p>
              Your booking has been confirmed successfully.
            </p>

            <h3>Booking Details</h3>

            <ul>
              <li>
                <strong>Reference:</strong>
                ${booking.bookingReference}
              </li>

              <li>
                <strong>Booking Type:</strong>
                ${booking.bookingType}
              </li>

              <li>
                <strong>Status:</strong>
                ${booking.status}
              </li>
            </ul>

            <p>
              Thank you for booking with us.
            </p>

            <br>

            <p>
              Travel Booking Team
            </p>
          </div>
        `,
      });

      console.log("Booking confirmation email sent.");
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
    }

    // ── RESPONSE ──────────────────────────────────────
    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────
// GET MY BOOKINGS
// ───────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, bookingType, page = 1, limit = 10 } = req.query;

    const query = {
      user: req.user._id,
    };

    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate(
          "flight",
          "origin destination departureDate segments"
        )
        .populate(
          "hotel",
          "name location images.main"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────
// GET BOOKING BY ID
// ───────────────────────────────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("flight")
      .populate("hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────
// GET BOOKING BY REFERENCE
// ───────────────────────────────────────────────────────────
exports.getBookingByReference = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      bookingReference: req.params.reference.toUpperCase(),
      user: req.user._id,
    })
      .populate("flight")
      .populate("hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────
// CANCEL BOOKING
// ───────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled.",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled.",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason =
      req.body.reason || "Cancelled by user";

    booking.cancelledAt = new Date();

    // Restore seats
    if (booking.bookingType === "flight" && booking.flight) {
      const flight = await Flight.findById(booking.flight);

      if (flight) {
        const cabin = flight.cabinClasses.find(
          (c) => c.class === booking.cabinClass
        );

        if (cabin) {
          cabin.seatsAvailable +=
            booking.passengers?.length || 1;

          await flight.save();
        }
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────────────
// ADMIN - GET ALL BOOKINGS
// ───────────────────────────────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      bookingType,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate(
          "user",
          "firstName lastName email"
        )
        .populate(
          "flight",
          "origin destination"
        )
        .populate(
          "hotel",
          "name location.city"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: bookings.length,
      total,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};




















// // controllers/booking.controller.js

// const Booking = require("../models/Booking");
// const Flight = require("../models/Flight");
// const Hotel = require("../models/Hotel");

// // ── CREATE BOOKING ─────────────────────────────────────────
// exports.createBooking = async (req, res, next) => {
//   try {
//     const { bookingType, ...data } = req.body;

//     // Validate resource availability
//     if (bookingType === "flight" && data.flight) {
//       const flight = await Flight.findById(data.flight);
//       if (!flight)
//         return res
//           .status(404)
//           .json({ success: false, message: "Flight not found." });

//       const cabin = flight.cabinClasses.find(
//         (c) => c.class === data.cabinClass,
//       );
//       if (!cabin || cabin.seatsAvailable < (data.passengers?.length || 1)) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Not enough seats available." });
//       }

//       // Reserve seats
//       cabin.seatsAvailable -= data.passengers?.length || 1;
//       await flight.save();
//     }

//     if (bookingType === "hotel" && data.hotel) {
//       const hotel = await Hotel.findById(data.hotel);
//       if (!hotel)
//         return res
//           .status(404)
//           .json({ success: false, message: "Hotel not found." });
//     }

//     const booking = await Booking.create({
//       ...data,
//       bookingType,
//       user: req.user._id,
//       contactEmail: data.contactEmail || req.user.email,
//     });

//     await booking.populate("flight hotel");

//     res.status(201).json({ success: true, data: booking });
//   } catch (error) {
//     next(error);
//   }
// };

// // ── GET MY BOOKINGS ────────────────────────────────────────
// exports.getMyBookings = async (req, res, next) => {
//   try {
//     const { status, bookingType, page = 1, limit = 10 } = req.query;
//     const query = { user: req.user._id };

//     if (status) query.status = status;
//     if (bookingType) query.bookingType = bookingType;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const [bookings, total] = await Promise.all([
//       Booking.find(query)
//         .populate("flight", "origin destination departureDate segments")
//         .populate("hotel", "name location images.main")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Booking.countDocuments(query),
//     ]);

//     res.json({
//       success: true,
//       count: bookings.length,
//       total,
//       pages: Math.ceil(total / limit),
//       data: bookings,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ── GET BOOKING BY ID ──────────────────────────────────────
// exports.getBookingById = async (req, res, next) => {
//   try {
//     const booking = await Booking.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     })
//       .populate("flight")
//       .populate("hotel");

//     if (!booking)
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found." });

//     res.json({ success: true, data: booking });
//   } catch (error) {
//     next(error);
//   }
// };

// // ── GET BY REFERENCE ───────────────────────────────────────
// exports.getBookingByReference = async (req, res, next) => {
//   try {
//     const booking = await Booking.findOne({
//       bookingReference: req.params.reference.toUpperCase(),
//       user: req.user._id,
//     })
//       .populate("flight")
//       .populate("hotel");

//     if (!booking)
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found." });

//     res.json({ success: true, data: booking });
//   } catch (error) {
//     next(error);
//   }
// };

// // ── CANCEL BOOKING ─────────────────────────────────────────
// exports.cancelBooking = async (req, res, next) => {
//   try {
//     const booking = await Booking.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!booking)
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found." });
//     if (booking.status === "cancelled") {
//       return res
//         .status(400)
//         .json({ success: false, message: "Booking already cancelled." });
//     }
//     if (booking.status === "completed") {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Completed bookings cannot be cancelled.",
//         });
//     }

//     booking.status = "cancelled";
//     booking.cancellationReason = req.body.reason || "Cancelled by user";
//     booking.cancelledAt = new Date();

//     // Restore seats if flight booking
//     if (booking.bookingType === "flight" && booking.flight) {
//       const flight = await Flight.findById(booking.flight);
//       if (flight) {
//         const cabin = flight.cabinClasses.find(
//           (c) => c.class === booking.cabinClass,
//         );
//         if (cabin) {
//           cabin.seatsAvailable += booking.passengers?.length || 1;
//           await flight.save();
//         }
//       }
//     }

//     await booking.save();
//     res.json({
//       success: true,
//       message: "Booking cancelled successfully.",
//       data: booking,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ── ADMIN: GET ALL BOOKINGS ────────────────────────────────
// exports.getAllBookings = async (req, res, next) => {
//   try {
//     const { status, bookingType, page = 1, limit = 20 } = req.query;
//     const query = {};
//     if (status) query.status = status;
//     if (bookingType) query.bookingType = bookingType;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const [bookings, total] = await Promise.all([
//       Booking.find(query)
//         .populate("user", "firstName lastName email")
//         .populate("flight", "origin destination")
//         .populate("hotel", "name location.city")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit)),
//       Booking.countDocuments(query),
//     ]);

//     res.json({ success: true, count: bookings.length, total, data: bookings });
//   } catch (error) {
//     next(error);
//   }
// };

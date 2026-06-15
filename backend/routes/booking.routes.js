// routes/booking.routes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);

router.post("/", bookingController.createBooking);
router.get("/my-bookings", bookingController.getMyBookings);
router.get("/reference/:reference", bookingController.getBookingByReference);
router.get("/:id", bookingController.getBookingById);
router.put("/:id/cancel", bookingController.cancelBooking);
// router.get("/", adminOnly, bookingController.getAllBookings); //

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const {
//   createBooking, getMyBookings, getBookingById,
//   getBookingByReference, cancelBooking, getAllBookings,
// } = require("../controllers/booking.controller");
// const { protect, adminOnly } = require("../middleware/auth");

// router.use(protect); // all booking routes require auth

// router.post("/", createBooking);
// router.get("/my", getMyBookings);
// router.get("/reference/:reference", getBookingByReference);
// router.get("/:id", getBookingById);
// router.put("/:id/cancel", cancelBooking);

// // Admin
// router.get("/", protect, adminOnly, getAllBookings);

// module.exports = router;
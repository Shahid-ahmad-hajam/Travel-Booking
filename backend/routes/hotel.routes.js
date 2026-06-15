// routes/hotel.routes.js
const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotel.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/search", hotelController.searchHotels);
router.get("/featured", hotelController.getFeaturedHotels);
router.get("/:id", hotelController.getHotelById);
router.post("/:id/reviews", protect, hotelController.addReview);
router.post("/", protect, adminOnly, hotelController.createHotel);
router.put("/:id", protect, adminOnly, hotelController.updateHotel);
router.delete("/:id", protect, adminOnly, hotelController.deleteHotel);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const {
//   searchHotels,
//   getHotelById,
//   getFeaturedHotels,
//   addReview,
//   createHotel,
//   updateHotel,
//   deleteHotel,
// } = require("../controllers/hotel.controller");
// const { protect, adminOnly } = require("../middleware/auth");

// router.get("/search", searchHotels);
// router.get("/featured", getFeaturedHotels);
// router.get("/:id", getHotelById);
// router.post("/:id/reviews", protect, addReview);

// // Admin routes
// router.post("/", protect, adminOnly, createHotel);
// router.put("/:id", protect, adminOnly, updateHotel);
// router.delete("/:id", protect, adminOnly, deleteHotel);

// module.exports = router;

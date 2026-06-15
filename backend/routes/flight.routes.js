// routes/flight.routes.js

const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/search", flightController.searchFlights);
router.get("/popular-routes", flightController.getPopularRoutes);
router.get("/:id", flightController.getFlightById);
router.post("/", protect, adminOnly, flightController.createFlight);
router.put("/:id", protect, adminOnly, flightController.updateFlight);
router.delete("/:id", protect, adminOnly, flightController.deleteFlight);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   searchFlights,
//   getFlightById,
//   getPopularRoutes,
//   createFlight,
//   updateFlight,
//   deleteFlight,
// } = require("../controllers/flight.controller");
// const { protect, adminOnly } = require("../middleware/auth");

// router.get("/search", searchFlights);
// router.get("/popular-routes", getPopularRoutes);
// router.get("/:id", getFlightById);

// // Admin routes
// router.post("/", protect, adminOnly, createFlight);
// router.put("/:id", protect, adminOnly, updateFlight);
// router.delete("/:id", protect, adminOnly, deleteFlight);

// module.exports = router;

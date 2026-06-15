// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const User = require("../models/User");

router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
});

router.put("/profile", protect, async (req, res, next) => {
  try {
    const allowed = ["firstName", "lastName", "phone", "dateOfBirth", "nationality", "passportNumber", "preferences", "avatar"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.post("/saved-flights/:flightId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.savedFlights.includes(req.params.flightId)) {
      user.savedFlights.push(req.params.flightId);
      await user.save();
    }
    res.json({ success: true, message: "Flight saved." });
  } catch (error) { next(error); }
});

router.delete("/saved-flights/:flightId", protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { savedFlights: req.params.flightId } });
    res.json({ success: true, message: "Flight removed." });
  } catch (error) { next(error); }
});

router.post("/saved-hotels/:hotelId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.savedHotels.includes(req.params.hotelId)) {
      user.savedHotels.push(req.params.hotelId);
      await user.save();
    }
    res.json({ success: true, message: "Hotel saved." });
  } catch (error) { next(error); }
});

router.delete("/saved-hotels/:hotelId", protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { savedHotels: req.params.hotelId } });
    res.json({ success: true, message: "Hotel removed." });
  } catch (error) { next(error); }
});

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search
      ? { $or: [{ email: { $regex: search, $options: "i" } }, { firstName: { $regex: search, $options: "i" } }] }
      : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ success: true, count: users.length, total, data: users });
  } catch (error) { next(error); }
});

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const { protect, adminOnly } = require("../middleware/auth");
// const User = require("../models/User");

// // GET profile
// router.get("/profile", protect, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);
//     res.json({ success: true, data: user });
//   } catch (e) { next(e); }
// });

// // UPDATE profile
// router.put("/profile", protect, async (req, res, next) => {
//   try {
//     const allowed = ["firstName", "lastName", "phone", "dateOfBirth", "nationality", "passportNumber", "preferences"];
//     const updates = {};
//     allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

//     const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
//     res.json({ success: true, data: user });
//   } catch (e) { next(e); }
// });

// // Save/unsave flight
// router.post("/saved-flights/:flightId", protect, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const idx = user.savedFlights.indexOf(req.params.flightId);
//     if (idx === -1) user.savedFlights.push(req.params.flightId);
//     else user.savedFlights.splice(idx, 1);
//     await user.save();
//     res.json({ success: true, saved: idx === -1 });
//   } catch (e) { next(e); }
// });

// // Save/unsave hotel
// router.post("/saved-hotels/:hotelId", protect, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const idx = user.savedHotels.indexOf(req.params.hotelId);
//     if (idx === -1) user.savedHotels.push(req.params.hotelId);
//     else user.savedHotels.splice(idx, 1);
//     await user.save();
//     res.json({ success: true, saved: idx === -1 });
//   } catch (e) { next(e); }
// });

// // Admin: list all users
// router.get("/", protect, adminOnly, async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;
//     const skip = (page - 1) * limit;
//     const [users, total] = await Promise.all([
//       User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
//       User.countDocuments(),
//     ]);
//     res.json({ success: true, total, data: users });
//   } catch (e) { next(e); }
// });

// module.exports = router;
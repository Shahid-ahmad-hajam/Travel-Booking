// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.put("/change-password", protect, authController.changePassword);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/auth.controller");
// const { protect } = require("../middleware/auth");

// router.post("/register", authController.register);
// router.post("/login", authController.login);
// router.post("/refresh-token", authController.refreshToken);
// router.post("/logout", protect, authController.logout);
// router.get("/me", protect, authController.getMe);
// router.put("/change-password", protect, authController.changePassword);

// module.exports = router;
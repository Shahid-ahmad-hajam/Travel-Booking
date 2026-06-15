const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/auth");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendBookingConfirmation } = require("../utils/sendEmail");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── CREATE ORDER ───────────────────────────────────────────
// Called first — creates a Razorpay order before payment popup opens
router.post("/create-order", protect, async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid.",
      });
    }

    // Convert USD to INR then to paise
    const amountInINR = Math.round(booking.pricing.totalPrice * 83);
    const amountInPaise = amountInINR * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: booking.bookingReference,
      notes: {
        bookingId: booking._id.toString(),
        bookingReference: booking.bookingReference,
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingReference: booking.bookingReference,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── VERIFY PAYMENT ─────────────────────────────────────────
// Called after Razorpay confirms payment — verifies signature and confirms booking
router.post("/verify", protect, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Verify Razorpay signature — proves payment is genuine
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Signature valid — update booking to confirmed
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, user: req.user._id },
      {
        "payment.method": "card",
        "payment.status": "paid",
        "payment.transactionId": razorpay_payment_id,
        "payment.paidAt": new Date(),
        status: "confirmed",
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Send confirmation email after booking is confirmed
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        await sendBookingConfirmation(
          booking,
          user.email,
          user.firstName
        );
      }
    } catch (emailError) {
      // Email failure should not fail the payment response
      console.error("Email error:", emailError.message);
    }

    res.json({
      success: true,
      message: "Payment successful! Booking confirmed.",
      data: {
        bookingReference: booking.bookingReference,
        transactionId: razorpay_payment_id,
        amount: booking.pricing.totalPrice,
        paidAt: booking.payment.paidAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── REFUND ─────────────────────────────────────────────────
router.post("/refund", protect, async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid bookings can be refunded.",
      });
    }

    booking.payment.status = "refunded";
    booking.payment.refundedAt = new Date();
    booking.payment.refundAmount = booking.pricing.totalPrice;
    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Refund processed.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// ── PAYMENT HISTORY ────────────────────────────────────────
router.get("/history", protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      "payment.status": { $in: ["paid", "refunded"] },
    })
      .select("bookingReference bookingType pricing payment status createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;







// const express = require("express");
// const router = express.Router();
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const { protect } = require("../middleware/auth");
// const Booking = require("../models/Booking");

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // POST /api/payments/create-order
// // Creates a Razorpay order before payment
// router.post("/create-order", protect, async (req, res, next) => {
//   try {
//     const { bookingId } = req.body;

//     const booking = await Booking.findOne({
//       _id: bookingId,
//       user: req.user._id,
//     });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found.",
//       });
//     }

//     if (booking.payment.status === "paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Booking already paid.",
//       });
//     }

//     // Razorpay amount is in paise (1 USD = 83 paise * 100)
//     // Convert USD to INR (approximate)
//     const amountInINR = Math.round(booking.pricing.totalPrice * 83);
//     const amountInPaise = amountInINR * 100;

//     const order = await razorpay.orders.create({
//       amount: amountInPaise,
//       currency: "INR",
//       receipt: booking.bookingReference,
//       notes: {
//         bookingId: booking._id.toString(),
//         bookingReference: booking.bookingReference,
//       },
//     });

//     res.json({
//       success: true,
//       data: {
//         orderId: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         bookingReference: booking.bookingReference,
//         keyId: process.env.RAZORPAY_KEY_ID,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // POST /api/payments/verify
// // Verifies payment after Razorpay confirms it
// router.post("/verify", protect, async (req, res, next) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//     } = req.body;

//     // Verify signature — proves payment is genuine
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed. Invalid signature.",
//       });
//     }

//     // Payment verified — update booking
//     const booking = await Booking.findOneAndUpdate(
//       { _id: bookingId, user: req.user._id },
//       {
//         "payment.method": "card",
//         "payment.status": "paid",
//         "payment.transactionId": razorpay_payment_id,
//         "payment.paidAt": new Date(),
//         status: "confirmed",
//       },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found.",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Payment successful! Booking confirmed.",
//       data: {
//         bookingReference: booking.bookingReference,
//         transactionId: razorpay_payment_id,
//         amount: booking.pricing.totalPrice,
//         paidAt: booking.payment.paidAt,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // POST /api/payments/refund
// router.post("/refund", protect, async (req, res, next) => {
//   try {
//     const { bookingId } = req.body;
//     const booking = await Booking.findOne({
//       _id: bookingId,
//       user: req.user._id,
//     });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found.",
//       });
//     }

//     if (booking.payment.status !== "paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Only paid bookings can be refunded.",
//       });
//     }

//     booking.payment.status = "refunded";
//     booking.payment.refundedAt = new Date();
//     booking.payment.refundAmount = booking.pricing.totalPrice;
//     booking.status = "cancelled";
//     await booking.save();

//     res.json({
//       success: true,
//       message: "Refund processed.",
//       data: booking,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // GET /api/payments/history
// router.get("/history", protect, async (req, res, next) => {
//   try {
//     const bookings = await Booking.find({
//       user: req.user._id,
//       "payment.status": { $in: ["paid", "refunded"] },
//     })
//       .select("bookingReference bookingType pricing payment status createdAt")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, data: bookings });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;










// // routes/payment.routes.js
// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middleware/auth");
// const Booking = require("../models/Booking");

// router.post("/process", protect, async (req, res, next) => {
//   try {
//     const { bookingId, paymentMethod } = req.body;
//     const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
//     if (booking.payment.status === "paid") return res.status(400).json({ success: false, message: "Already paid." });

//     const transactionId = `TXN${Date.now()}`;
//     booking.payment.method = paymentMethod;
//     booking.payment.status = "paid";
//     booking.payment.transactionId = transactionId;
//     booking.payment.paidAt = new Date();
//     booking.status = "confirmed";
//     await booking.save();

//     res.json({
//       success: true,
//       message: "Payment successful!",
//       data: {
//         transactionId,
//         bookingReference: booking.bookingReference,
//         amount: booking.pricing.totalPrice,
//         currency: booking.pricing.currency,
//         paidAt: booking.payment.paidAt,
//       },
//     });
//   } catch (error) { next(error); }
// });

// router.post("/refund", protect, async (req, res, next) => {
//   try {
//     const { bookingId } = req.body;
//     const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
//     if (booking.payment.status !== "paid") return res.status(400).json({ success: false, message: "Only paid bookings can be refunded." });

//     booking.payment.status = "refunded";
//     booking.payment.refundedAt = new Date();
//     booking.payment.refundAmount = booking.pricing.totalPrice;
//     booking.status = "cancelled";
//     await booking.save();

//     res.json({ success: true, message: "Refund processed.", data: booking });
//   } catch (error) { next(error); }
// });

// router.get("/history", protect, async (req, res, next) => {
//   try {
//     const bookings = await Booking.find({
//       user: req.user._id,
//       "payment.status": { $in: ["paid", "refunded"] },
//     }).select("bookingReference bookingType pricing payment status createdAt").sort({ createdAt: -1 });
//     res.json({ success: true, data: bookings });
//   } catch (error) { next(error); }
// });

// module.exports = router;




// // const express = require("express");
// // const router = express.Router();
// // const { protect } = require("../middleware/auth");
// // const Booking = require("../models/Booking");

// // // Simulate payment processing (replace with Stripe in production)
// // router.post("/process", protect, async (req, res, next) => {
// //   try {
// //     const { bookingId, paymentMethod, cardDetails } = req.body;

// //     const booking = await Booking.findOne({
// //       _id: bookingId,
// //       user: req.user._id,
// //     });
// //     if (!booking)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Booking not found." });
// //     if (booking.payment.status === "paid") {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Booking already paid." });
// //     }

// //     // Simulate payment delay / processing
// //     // In production: integrate Stripe PaymentIntent here
// //     const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// //     booking.payment.method = paymentMethod;
// //     booking.payment.status = "paid";
// //     booking.payment.transactionId = transactionId;
// //     booking.payment.paidAt = new Date();
// //     booking.status = "confirmed";
// //     await booking.save();

// //     res.json({
// //       success: true,
// //       message: "Payment successful. Booking confirmed!",
// //       data: {
// //         transactionId,
// //         bookingReference: booking.bookingReference,
// //         amountPaid: booking.pricing.totalPrice,
// //         currency: booking.pricing.currency,
// //         paidAt: booking.payment.paidAt,
// //       },
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // // Get payment status
// // router.get("/status/:bookingId", protect, async (req, res, next) => {
// //   try {
// //     const booking = await Booking.findOne({
// //       _id: req.params.bookingId,
// //       user: req.user._id,
// //     }).select("payment status bookingReference pricing");
// //     if (!booking)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Booking not found." });
// //     res.json({ success: true, data: booking });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // // Request refund
// // router.post("/refund/:bookingId", protect, async (req, res, next) => {
// //   try {
// //     const booking = await Booking.findOne({
// //       _id: req.params.bookingId,
// //       user: req.user._id,
// //     });
// //     if (!booking)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Booking not found." });
// //     if (booking.payment.status !== "paid") {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Booking is not in a paid state." });
// //     }

// //     booking.payment.status = "refunded";
// //     booking.payment.refundedAt = new Date();
// //     booking.payment.refundAmount = booking.pricing.totalPrice;
// //     booking.status = "cancelled";
// //     await booking.save();

// //     res.json({
// //       success: true,
// //       message: "Refund processed successfully.",
// //       refundAmount: booking.pricing.totalPrice,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // module.exports = router;

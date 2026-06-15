// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    nationality: { type: String, trim: true },
    passportNumber: { type: String, trim: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    savedFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
    savedHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
    preferences: {
      currency: { type: String, default: "USD" },
      language: { type: String, default: "en" },
      seatPreference: {
        type: String,
        enum: ["window", "aisle", "middle", "no_preference"],
        default: "no_preference",
      },
      mealPreference: { type: String, default: "standard" },
      newsletterSubscribed: { type: Boolean, default: true },
    },
    refreshToken: { type: String, select: false },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: [true, "First name is required"],
//       trim: true,
//       maxlength: [50, "First name cannot exceed 50 characters"],
//     },
//     lastName: {
//       type: String,
//       required: [true, "Last name is required"],
//       trim: true,
//       maxlength: [50, "Last name cannot exceed 50 characters"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [6, "Password must be at least 6 characters"],
//       select: false,
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },
//     dateOfBirth: {
//       type: Date,
//     },
//     nationality: {
//       type: String,
//       trim: true,
//     },
//     passportNumber: {
//       type: String,
//       trim: true,
//     },
//     avatar: {
//       type: String,
//       default: "",
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     savedFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
//     savedHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
//     preferences: {
//       currency: { type: String, default: "USD" },
//       language: { type: String, default: "en" },
//       seatPreference: { type: String, enum: ["window", "aisle", "middle", "no_preference"], default: "no_preference" },
//       mealPreference: { type: String, default: "standard" },
//       newsletterSubscribed: { type: Boolean, default: true },
//     },
//     refreshToken: {
//       type: String,
//       select: false,
//     },
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     lastLogin: Date,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Virtual: full name
// userSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Pre-save: hash password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method: compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);
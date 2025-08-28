const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6 },
    role: { type: String, enum: ["moderator", "admin"], default: "user" },

    otp: { type: String },
    otpExpires: { type: Date },

    isVerified: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Number },
  },
  { timestamps: true }
);

// Hash password on create or change
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);

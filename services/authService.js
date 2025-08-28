const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const { createResetToken } = require("../utils/generateResetToken");
const sendEmail = require("../utils/emailService");
const crypto = require("crypto");

// REGISTER USER + SEND OTP
exports.registerUser = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("User already exists");
    err.statusCode = 400;
    throw err;
  }

  // generate OTP
  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpires,
    isVerified: false,
    role: role || "user"
  });

  // send OTP email
  await sendEmail({
  to: email,
  subject: "Verify your account",
  text: `Your verification code is: ${otp}`,
  html: `
    <h5>Welcome!</h5>
    <p>Thank you for signing up to our Blog Platform 🎉</p>
    <p>Your verification code is: <b>${otp}</b></p>
    <p>This code will expire in 10 minutes.</p>`
});


  return { message: "OTP sent to email. Please verify." };
};

exports.resendOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send new OTP email
  const message = `
    <h1>Resend OTP</h1>
    <p>Your new OTP is:</p>
    <h2>${otp}</h2>
    <p>This code will expire in 10 minutes.</p>
  `;

  await sendEmail({
  to: user.email,  
  subject: "Your New OTP Code",
  text: `Your OTP is: ${otp}`,
  html: `
  <p>Your OTP is <b>${otp}</b></p>
  <p>This code will expire in 10 minutes.</p>`
});

  return { message: 'A new OTP has been sent to your email' };
};

// VERIFY OTP
exports.verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  // Expired?
  if (!user.otpExpires || user.otpExpires < Date.now()) {
    throw new Error("OTP expired, click resendOTP");
  }

  // Compare as string
  if (String(user.otp) !== String(otp)) {
    throw new Error("Invalid OTP, try again with a valid OTP");
  }

  // update user
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // return user info + JWT
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    message: "Account verified successfully, you can now login."
  };
};


// LOGIN USER
exports.loginUser = async ({ email, password }) => {
  // find user in DB
  const user = await User.findOne({ email });
  
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  console.log("Login attempt:", { email, password });
  console.log("Stored hash:", user.password);

  const match = await bcrypt.compare(password, user.password);
  console.log("Password match:", match);


  // compare plaintext password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid password");
    err.statusCode = 401;
    throw err;
  }

  // check if user has verified email
  if (!user.isVerified) {
    const err = new Error("Please verify your email with OTP before login.");
    err.statusCode = 401;
    throw err;
  }

  // generate JWT token
  const token = generateToken(user._id);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    message: "Login Successful"
  };
};


exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal whether email exists
    return { message: "A reset link has been sent." };
  }

  const { resetToken, hashedToken, expire } = createResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = expire;
  await user.save({ validateBeforeSave: false });
  console.log("Stored hashed token:", user.resetPasswordToken);

  //For Mail Purpose
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const text = `You requested a password reset. Use the link within 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, ignore.`;
  const html = `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset.</p><p>This link expires in 15 minutes.</p>`;

  try {
    await sendEmail({ to: user.email, subject: "Password Reset", text, html });
  } catch (err) {
    // cleanup on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const e = new Error("Email could not be sent");
    e.statusCode = 500;
    throw e;
  }

  return { message: "Reset link sent to email." };
};

exports.resetPassword = async (token, newPassword) => {
  // Hash the incoming plain token from the URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  console.log("Incoming hashed token:", hashedToken);

  // Find user with hashed token in DB and check expiry
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  // Hash the new password before saving
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset token and expiry
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const accessToken = generateToken(user._id);
  return { message: "Password updated successfully", token: accessToken };
};

const jwt = require("jsonwebtoken");

const signToken = (payload, expiresIn = process.env.JWT_EXPIRES || "15m") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signToken, verifyToken };
// uses crypto to create a token and returns { resetToken, hashedToken, expire }
const crypto = require("crypto");

const createResetToken = () => {
  // plain token sent to user
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hashed token stored in DB (safer)
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // expire in 15 minutes
  const expire = Date.now() + 15 * 60 * 1000;

  return { resetToken, hashedToken, expire };
};

module.exports = { createResetToken };

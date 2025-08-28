// small wrapper using jwtHelper
const { signToken } = require("../jwt/jwtHelper");

const generateToken = (userId) => {
  return signToken({ id: userId });
};

module.exports = generateToken;

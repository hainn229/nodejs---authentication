const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

const jwt_secret = keys.JWT_SECRET;

// Jsonwebtoken
const signToken = (id, email, role) => {
  return jwt.sign(
    {
      id: id,
      iss: email,
      sub: role,
      exp: new Date().setDate(new Date().getDate() + 1),
      iat: new Date().getTime(),
    },
    jwt_secret
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, jwt_secret);
};

module.exports = {
  signToken,
  verifyToken,
};

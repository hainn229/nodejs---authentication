const { verifyToken } = require("../services/jwt");
const User = require("../models/User");

const requireLogin = (required) => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      if (required) {
        res.status(401).send("Could not find token!");
      } else {
        next();
      }
    }
    const token = req.headers.authorization.split(" ")[1];
    try {
      const object = verifyToken(token);
      const email = object.iss;
      User.findOne({
        email: email,
      })
        .exec()
        .then((user) => {
          req.user = user;
          next();
        })
        .catch(() => {
          res.status(401).send("Could not find user!");
        });
    } catch {
      if (required) {
        res.status(401).send("Invalid token!");
      } else {
        next();
      }
    }
  };
};

const requireAdmin = () => {
  return (req, res, next) => {
    if (req.user.role === "ADMIN") {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

module.exports = {
  requireLogin,
  requireAdmin,
};

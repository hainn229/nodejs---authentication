const express = require("express");
const router = express.Router();
const joi = require("joi");
const axios = require("axios");
const bcryptjs = require("bcryptjs");
const sendGridMail = require("@sendgrid/mail");
const OTPGenerator = require("otp-generator");
const keys = require("../../config/keys");
const { requireLogin, requireAdmin } = require("../middlewares/auth");
const {
  login,
  signup,
  updateUser,
  // deleteUser,
  changePassword,
  findUserByEmail,
  findUserByGoogleId,
  // findUserByFacebookId,
} = require("../services/users");
const { signToken } = require("../services/jwt");
const User = require("../models/User");

// setup sendgrid API key
sendGridMail.setApiKey(keys.SENDGRID_MAIL_API_KEY);

// ger user information
router.get("/me", requireLogin(true), (req, res) => {
  const userData = req.user;
  const user = {
    _id: userData._id,
    email: userData.email,
    full_name: userData.full_name,
    dob: userData.dob,
    address: userData.address,
    amount: userData.amount,
    ggId: userData.ggId,
    fbId: userData.fbId,
    image: userData.image,
    password: userData.password,
    role: userData.role,
    status: userData.status,
    verified: userData.verified,
  };
  res.status(200).json(user);
});

// log in
router.post("/login", async (req, res) => {
  try {
    const data = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const checkData = await data.validateAsync(req.body);
    const request = await login(checkData);
    if (request) {
      return res.status(200).json({
        user: request.user,
        token: request.token,
        message: request.message,
      });
    } else {
      return res.status(400).json({
        message: `The email address or password that you've entered is incorrect!`,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// sign up user
router.post("/signup", async (req, res) => {
  try {
    const data = joi
      .object({
        full_name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
      })
      .unknown();

    const checkData = await data.validateAsync(req.body);
    const checkEmail = await findUserByEmail(checkData.email);
    if (checkEmail != null) {
      return res.status(400).json({
        message: "The email address is already exist!",
      });
    }
    if (checkData.error) {
      return res.status(400).json({
        message: checkData.error.message,
      });
    }

    const request = await signup(checkData);

    const msg = {
      from: {
        email: "hainn229@gmail.com",
        name: "Double D Team",
      },
      to: {
        email: request.user.email,
      },
      templateId: "d-73745e6ca9af42459149f4452002eda5",
      dynamicTemplateData: {
        id: request.user._id,
        full_name: request.user.full_name,
        redirect_domain: keys.REDIRECT_DOMAIN,
      },
    };

    sendGridMail
      .send(msg)
      .then(async () => {
        return res.status(200).json({
          user: request.user,
          token: request.token,
          message: `Sign Up Successfully! Please check your email to verify email address.`,
        });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message });
      });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// google login
router.post("/google", async (req, res) => {
  try {
    const response = await axios.default.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${req.body.access_token}`
    );
    if (response.data) {
      const user = await findUserByGoogleId(response.data.id);
      if (user != null) {
        const token = signToken(user._id, user.email, user.role);
        return res.status(200).json({
          user: user,
          token: token,
        });
      } else {
        const newUser = new User({
          email: response.data.email,
          full_name: response.data.name,
          image: response.data.picture,
          ggId: response.data.id,
        });

        const user = await newUser.save();
        const token = signToken(user._id, user.email, user.role);
        return res.status(200).json({
          user: user,
          token: token,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// update user
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;
    const request = await updateUser(req.params.id, data);
    return res.status(200).json({
      user: request,
      message: "Update successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// verify-email
router.get("/verify-email", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.query.id });
    if (user) {
      user.verified = true;
      await user.save();
      return res.status(200).send(
        `
          <h1 style="text-align: center; padding: 20%">
            Your account has been verified!
          </h1>
        `
      );
    } else {
      return res.status(400).json({ message: "Could not find user!" });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// start forgot-password
router.post("/forgot-password/get-otp", async (req, res) => {
  try {
    const data = joi.object({
      email: joi.string().email().required(),
    });

    const checkData = await data.validateAsync(req.body);
    const user = await findUserByEmail(checkData.email);
    if (user) {
      if (user.verified === false) {
        return res.status(400).json({
          message:
            "Your account has not verified your email address. Please verify your email address before doing this!",
        });
      } else {
        user.otp = OTPGenerator.generate(4, {
          upperCase: true,
          specialChars: false,
        });

        user.save((error) => {
          if (error) {
            console.log(error);
          }
          console.log("User saved successfully!");
        });

        const msg = {
          from: {
            email: "hainn229@gmail.com",
            name: "Double D Team",
          },
          to: {
            email: user.email,
          },
          templateId: "d-f44d1830801b4711b057c8c41f0a0446",
          dynamicTemplateData: {
            full_name: user.full_name,
            otp: user.otp,
          },
        };

        sendGridMail
          .send(msg)
          .then(async () => {
            console.log("getOTP: " + user);
            return res
              .status(200)
              .json({ message: "Please check your email to get OTP." });
          })
          .catch((error) => {
            return res.status(500).json({ message: error.message });
          });
      }
    } else {
      return res.status(400).json({
        message: "Couldn't find any accounts with the email address entered!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const data = joi.object({
      email: joi.string().email().required(),
      otp: joi.string().required(),
    });

    const checkData = await data.validateAsync(req.body);
    const user = await findUserByEmail(checkData.email);
    console.log(user);
    if (user) {
      console.log("verify: " + user);
      if (user.otp === checkData.otp) {
        return res.status(200).json({ message: "Verify OTP successfully!" });
      } else {
        return res.status(400).json({
          message: "The OTP you entered does not match!",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/forgot-password/create-new-password", async (req, res) => {
  try {
    const data = joi
      .object({
        email: joi.string().email().required(),
        password: joi.string().required(),
      })
      .unknown();

    const checkData = await data.validateAsync(req.body);
    const salt = await bcryptjs.genSalt(10);
    checkData.password = await bcryptjs.hash(checkData.password, salt);
    const user = await findUserByEmail(checkData.email);
    if (user) {
      user.password = checkData.password;
      user.otp = null;
      user.save();
      return res.status(200).json({
        user: user,
        token: signToken(user._id, user.email, user.role),
        message: "Password change successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});
// end forgot-password

// change password
router.post("/change-password", requireLogin(true), async (req, res) => {
  try {
    const data = joi
      .object({
        current_password: joi.string().required(),
        new_password: joi.string().required(),
      })
      .unknown();
    const checkData = await data.validateAsync(req.body);
    if (checkData.error) {
      return res.status(400).json({ message: checkData.error.message });
    } else {
      const request = await changePassword(req.user._id, checkData);
      if (request.match == false) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      } else {
        return res.status(200).json({
          message: "Change password successfully",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

// ----REQUIRE_ADMIN----
// delete user
router.delete(
  "/:id",
  requireLogin(true),
  requireAdmin(true),
  async (req, res) => {
    try {
      await deleteUser(req.params.id);
      return res.status(200).json({
        message: "User have been deleted!",
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }
);

// lock or unlock account
router.post(
  "/change-status",
  requireLogin(true),
  requireAdmin(true),
  async (req, res) => {
    try {
      const id = req.body.id;
      const data = req.body.data;
      const request = await updateUser(id, data);
      return res.status(200).json({
        user: request,
        message: "User status has been changed!",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;

// router.post("/facebook", async (req, res) => {
//   try {
//     const response = await axios.default.get(
//       `https://graph.facebook.com/${req.body.user_id}?fields=name,email,picture&access_token=${req.body.access_token}`
//     );
//     if (response.data) {
//       const user = await findUserByFacebookId(response.data.id);
//       if (user != null) {
//         if (user.status === false) {
//           return res.status(400).json({
//             message:
//               "Your account has been locked. Please contact with staff to unlock",
//           });
//         }
//         const token = signToken(user._id, user.email, user.role);
//         return res.status(200).json(user, token);
//       } else {
//         const newUser = new User({
//           fbId: response.data.id,
//           email: response.data.email,
//           full_name: response.data.name,
//           image: response.data.picture.data.url,
//         });
//         const user = await newUser.save();
//         const token = signToken(user._id, user.email, user.role);
//         return res.status(200).json(user, token);
//       }
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Could not log in with Facebook!" });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });

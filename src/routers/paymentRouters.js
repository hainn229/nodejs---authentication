const express = require("express");
const router = express.Router();
const keys = require("../../config/keys");
const stripe = require("stripe")(keys.STRIPE_SECRET_KEY);
const { requireLogin } = require("../middlewares/auth");
const { create } = require("../services/transactions");

router.post("/stripe", requireLogin(true), async (req, res) => {
  try {
    console.log(req);
    // console.log(req.body);
    // const charge = await stripe.charges.create({
    //   amount: req.body.d,
    //   currency: "usd",
    //   description: "Update amount!",
    //   source: req.body.id,
    // });
    // console.log(charge);
    
    // const data = {
    //   user: req.user._id,
    //   chargeId: charge.id,
    //   amount: charge.amount / 100,
    //   method:
    //     charge.source.brand +
    //     " " +
    //     charge.source.funding
    //     // " " +
    //     // charge.source.last4,
    // };

    // return res
    //   .status(200)
    //   .json({ user: user, message: "Checkout with Stripe successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

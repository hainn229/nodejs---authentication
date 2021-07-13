const express = require("express");
const router = express.Router();

const auth = require("./authRouters");
const upload = require("./uploadRouters");
const payment = require("./paymentRouters");

router.use("/auth", auth);
router.use("/upload", upload);
router.use("/payment", payment);

module.exports = router;

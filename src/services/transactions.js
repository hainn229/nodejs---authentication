const axios = require("axios");
const keys = require("../../config/keys");
const Transaction = require("../models/Transaction");

module.exports.getAll = async (page, limit, n, e) => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: "user",
        match: {
          full_name: { $regex: n, $options: {} },
          email: { $regex: e, $options: {} },
        },
      })
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ _createdAt: -1 });
    const totalTransactions = await Transaction.find()
      .populate({ path: "user" })
      .countDocuments();

    return {
      docs: transactions,
      page: page,
      limit: limit,
      total: totalTransactions,
    };
  } catch (error) {
    throw error;
  }
};

module.exports.getTransactionsByUserId = async (id, page, limit) => {
  try {
    const query = Transaction.find({ user: id });
    const transactions = await query
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ _createdAt: -1 });
    const totalTransactions = await query.countDocuments();

    return {
      docs: transactions,
      page: page,
      limit: limit,
      total: totalTransactions,
    };
  } catch (error) {
    throw error;
  }
};

module.exports.create = async (data) => {
  try {
    const transaction = new Transaction(data);
    return await transaction.save();
  } catch (error) {
    throw error;
  }
};

module.exports.delete = async (id) => {
  try {
    return await Transaction.deleteOne({
      _id: id,
    });
  } catch (error) {
    throw error;
  }
};

module.exports.checkPaypal = async (paymentId) => {
  try {
    const data = queryString.stringify({
      grant_type: "client_credentials",
    });
    const response = await axios.default.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: keys.PAYPAL_USERNAME,
          password: keys.PAYPAL_PASSWORD,
        },
      }
    );
    const paymentDetails = await axios.default.get(
      `https://api-m.sandbox.paypal.com/v1/payments/payment/${paymentId}`,
      {
        headers: {
          Accept: `application/json`,
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );
    return paymentDetails.data.transactions[0];
  } catch (error) {
    throw error;
  }
};

module.exports.checkStripe = async (paymentId) => {
  try {
    console.log(paymentId);
  } catch (error) {
    throw error;
  }
};

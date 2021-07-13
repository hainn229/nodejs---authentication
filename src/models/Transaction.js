const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },
    paymentId: {
      type: String,
    //   required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({
  "$**": "text",
}); // search

const Transaction = mongoose.model("transactions", transactionSchema);
module.exports = Transaction;

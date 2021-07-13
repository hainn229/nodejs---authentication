const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    ggId: {
      type: String,
      default: null,
    },
    fbId: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  "$**": "text",
}); // search

const User = mongoose.model("users", userSchema);
module.exports = User;

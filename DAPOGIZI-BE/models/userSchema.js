const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema, "users");
module.exports = User;

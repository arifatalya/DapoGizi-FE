const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendors",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image_url: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    approved_at: Date,
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema, "mealplans");
module.exports = MealPlan;

const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
const MealDetail = require("../models/mealDetailSchema");
const {uploadToSupabase} = require("../utils/supabaseUpload");

async function ensureVendor(req) {
  const userId = req.user._id;
  const vendor = await Vendor.findOne({ user_id: userId });
  return vendor;
}

const createMealPlan = async (req, res) => {
  try {
    const vendor = await ensureVendor(req);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });

    let image_url = null;
    const imageFile = req.file;
    if (imageFile) {
      image_url = await uploadToSupabase(imageFile.buffer, "meals", imageFile.originalname);
    }

    const plan = new MealPlan({
      vendor_id: vendor._id,
      name,
      description: description || "",
      image_url,
      status: "pending",
    });
    await plan.save();

    return res.status(201).json({ message: "MealPlan created", mealPlan: plan });
  } catch (err) {
    console.error("createMealPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateMealPlan = async (req, res) => {
  try {
    const vendor = await ensureVendor(req);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { id } = req.params;
    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "MealPlan not found" });
    if (String(plan.vendor_id) !== String(vendor._id)) {
      return res.status(403).json({ message: "You do not own this meal plan" });
    }

    const {
      name,
      description,
      overall_calories,
      protein,
      fat,
      carbs,
      sugar,
      fiber,
    } = req.body || {};

    if (name != null) plan.name = name;
    if (description != null) plan.description = description;

    const imageFile = req.file;
    if (imageFile) {
      plan.image_url = await uploadToSupabase(imageFile.buffer, "meals", imageFile.originalname);
    }

    await plan.save();

    // Upsert meal detail
    const detail = await MealDetail.findOne({ meal_id: plan._id });
    const toNum = (v) => (v == null ? undefined : Number(v));

    const detailData = {
      overall_calories: toNum(overall_calories),
      protein: toNum(protein),
      fat: toNum(fat),
      carbs: toNum(carbs),
      sugar: toNum(sugar),
      fiber: toNum(fiber),
    };

    if (detail) {
      Object.keys(detailData).forEach((k) => {
        if (detailData[k] != null) detail[k] = detailData[k];
      });
      await detail.save();
    } else {
      const anyProvided = Object.values(detailData).some((v) => v != null);
      if (anyProvided) {
        const newDetail = new MealDetail({
          meal_id: plan._id,
          ...detailData,
        });
        await newDetail.save();
      }
    }

    // Return both plan + detail
    const outDetail = await MealDetail.findOne({ meal_id: plan._id });
    return res.json({
      message: "MealPlan updated",
      mealPlan: plan,
      detail: outDetail
    });

  } catch (err) {
    console.error("updateMealPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMealPlan,
  updateMealPlan
};
const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
const MealDetail = require("../models/mealDetailSchema");
const {uploadToSupabase} = require("../utils/supabaseUpload");
const {getFoodPredictionAndNutrition} = require("../services/mealAIService");
const {analyze4Sehat5Sempurna} = require("../utils/foodClassifier");

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
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Handle image upload and save the URL to Supabase
    let image_url = null;
    const imageFile = req.file;
    if (imageFile) {
      image_url = await uploadToSupabase(imageFile.buffer, "meals", imageFile.originalname);
    }

    // Create the meal plan
    const plan = new MealPlan({
      vendor_id: vendor._id,
      name,
      description: description || "",
      image_url,
      status: "pending",
    });
    await plan.save();

    // Get prediction and nutrition details from the image URL
    const nutritionData = await getFoodPredictionAndNutrition(plan.image_url);

    const classificationResult = analyze4Sehat5Sempurna(
        nutritionData.predictions,
        nutritionData.confidence
    );

    plan.detected_foods = classificationResult.detected_foods;
    plan.classification_4sehat5sempurna = {
      status: classificationResult.status,
      categories_fulfilled: classificationResult.categories_fulfilled,
      categories_missing: classificationResult.categories_missing,
      total_categories: classificationResult.total_categories,
      unrecognized_foods: classificationResult.unrecognized_foods,
      analysis_date: classificationResult.analysis_date
    };
    await plan.save();

    const mealDetail = new MealDetail({
      meal_id: plan._id,
      overall_calories: nutritionData.nutrition[0]["Calories (kcal)"],
      protein: nutritionData.nutrition[0]["Proteins (g)"],
      fat: nutritionData.nutrition[0]["Fat (g)"],
      carbs: nutritionData.nutrition[0]["Carbohydrate (g)"],
      sugar: nutritionData.nutrition[0]["Sugars (g)"],
      fiber: nutritionData.nutrition[0]["Fibers (g)"],
    });
    await mealDetail.save();

    // Return the response with both meal plan and nutrition data
    return res.status(201).json({
      message: "MealPlan created",
      mealPlan: plan,
      nutrition: nutritionData.nutrition,
      classification: classificationResult,
    });
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

    // Handle the fields to update
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

    // Handle image upload and update the URL to Supabase
    const imageFile = req.file;
    if (imageFile) {
      plan.image_url = await uploadToSupabase(imageFile.buffer, "meals", imageFile.originalname);
    }

    await plan.save();

    // Update or insert meal details
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
      // Update existing meal details
      Object.keys(detailData).forEach((k) => {
        if (detailData[k] != null) detail[k] = detailData[k];
      });
      await detail.save();
    } else {
      // If no detail exists, create a new one
      const anyProvided = Object.values(detailData).some((v) => v != null);
      if (anyProvided) {
        const newDetail = new MealDetail({
          meal_id: plan._id,
          ...detailData,
        });
        await newDetail.save();
      }
    }

    // Return the updated plan and meal detail
    const outDetail = await MealDetail.findOne({ meal_id: plan._id });
    return res.json({ message: "MealPlan updated", mealPlan: plan, detail: outDetail });
  } catch (err) {
    console.error("updateMealPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMealPlan,
  updateMealPlan
};
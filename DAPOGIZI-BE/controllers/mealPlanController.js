const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
const MealPlanDetail = require("../models/mealDetailSchema");
const uploadToBucket = require("../utils/upload");

async function ensureVendor(req) {
  const userId = req.user._id;
  const vendor = await Vendor.findOne({ user_id: userId });
  return vendor;
}

// const createMealPlan = async (req, res) => {
//   try {
//     const vendor = await ensureVendor(req);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });
//
//     const { name, description } = req.body || {};
//     if (!name) return res.status(400).json({ message: "name is required" });
//
//     const imageFile = req.file;
//     const image_url = imageFile ? `/uploads/meals/${imageFile.filename}` : undefined;
//
//     const plan = new MealPlan({
//       vendor_id: vendor._id,
//       name,
//       description: description || "",
//       image_url,
//       status: "pending",
//     });
//     await plan.save();
//
//     return res.status(201).json({ message: "MealPlan created", mealPlan: plan });
//   } catch (err) {
//     console.error("createMealPlan error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const createMealPlan = async (req, res) => {
  try {
    const vendor = await ensureVendor(req);
    const {name, description} = req.body;
    const imageFile = req.file;

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Meal plan name is required"
      });
    }

    const plan = new MealPlan({
      vendor_id: vendor._id,
      name,
      description: description || "",
      image_url: imageFile
          ? await uploadToBucket(
              imageFile.buffer,
              imageFile.originalname,
              imageFile.mimetype,
              `meals/${vendor._id}`
          ) : undefined,
      status: "pending",
    });
    await plan.save();

    return res.status(201).json({
      success: true,
      message: "Meal plan created",
    });

  } catch (err) {
    console.error("createMealPlan error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during meal plan creation"
    });
  }
};

// const updateMealPlan = async (req, res) => {
//   try {
//     const vendor = await ensureVendor(req);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });
//
//     const { id } = req.params;
//
//     const plan = await MealPlan.findById(id);
//     if (!plan) return res.status(404).json({ message: "MealPlan not found" });
//     if (String(plan.vendor_id) !== String(vendor._id)) {
//       return res.status(403).json({ message: "You do not own this meal plan" });
//     }
//
//     const {
//       name,
//       description,
//       overall_calories,
//       protein,
//       fat,
//       carbs,
//       sugar,
//       fiber,
//     } = req.body || {};
//
//     if (name != null) plan.name = name;
//     if (description != null) plan.description = description;
//
//     const imageFile = req.file;
//     if (imageFile) {
//       plan.image_url = `/uploads/meals/${imageFile.filename}`;
//     }
//
//     await plan.save();
//
//     // Upsert meal detail
//     const detail = await MealPlanDetail.findOne({ meal_id: plan._id });
//     const toNum = (v) => (v == null ? undefined : Number(v));
//
//     const detailData = {
//       overall_calories: toNum(overall_calories),
//       protein: toNum(protein),
//       fat: toNum(fat),
//       carbs: toNum(carbs),
//       sugar: toNum(sugar),
//       fiber: toNum(fiber),
//     };
//
//     if (detail) {
//       Object.keys(detailData).forEach((k) => {
//         if (detailData[k] != null) detail[k] = detailData[k];
//       });
//       await detail.save();
//     } else {
//       const anyProvided = Object.values(detailData).some((v) => v != null);
//       if (anyProvided) {
//         const newDetail = new MealPlanDetail({
//           meal_id: plan._id,
//           ...detailData,
//         });
//         await newDetail.save();
//       }
//     }
//
//     const outDetail = await MealPlanDetail.findOne({ meal_id: plan._id });
//     return res.json({ message: "MealPlan updated", mealPlan: plan, detail: outDetail });
//   } catch (err) {
//     console.error("updateMealPlan error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const updateMealPlan = async (req, res) => {
  try {
    const {id} = req.params;
    const vendor = await ensureVendor(req);
    const plan = await MealPlan.findById(id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    if (!plan) {
      return res.status(404).json({
        message: "Meal plan not found"
      });
    }

    if (String(plan.vendor_id) !== String(vendor._id)) {
      return res.status(403).json({
        message: "You do not own this meal plan"
      });
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

    if (name != null) {
      plan.name = name;
    }

    if (description != null) {
      plan.description = description;
    }

    const imageFile = req.file;
    if (imageFile) {
      const newUrl = await uploadToBucket(
          imageFile.buffer,
          imageFile.originalname,
          imageFile.mimetype,
          `meals/${vendor._id}`
      );
      plan.image_url = newUrl;
    }
    await plan.save();

    const detail = await MealPlanDetail.findOne({meal_id: plan._id});
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
      Object.keys(detailData).forEach((key) => {
        if (detailData[key] != null) detail[key] = detailData[key];
      });
      await detail.save();
    } else {
      const hasValues = Object.values(detailData).some((v) => v != null);
      if (hasValues) {
        await new MealPlanDetail({meal_id: plan._id, ...detailData,}).save();
      }
    }
    const outDetail = await MealPlanDetail.findOne({meal_id: plan._id});

    return res.json({
      message: "MealPlan updated",
      mealPlan: plan,
      detail: outDetail,
    });

  } catch (err) {
    console.error("updateMealPlan error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = { createMealPlan, updateMealPlan };

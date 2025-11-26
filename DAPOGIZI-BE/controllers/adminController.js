const Vendor = require("../models/vendorSchema");
const KitchenCheck = require("../models/kitchenCheckSchema");
const MealPlan = require("../models/mealPlanSchema");

exports.getAllVendors = async (req, res) => {
  try {
    const allVendors = await Vendor.find().populate("user_id", "email");

    const vendorDataList = allVendors.map((vendor) => ({
      id: vendor._id,
      vendor_name: vendor.vendor_name,
      address: vendor.address || "N/A",
      email: vendor.user_id?.email || "N/A",
    }));

    res.json({ success: true, data: vendorDataList });
  } catch (err) {
    console.error("Get all vendors error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVendorDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendorRecord = await Vendor.findById(vendorId).populate(
      "user_id",
      "email"
    );
    
    if (!vendorRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    const vendorDetails = {
      vendor_name: vendorRecord.vendor_name,
      address: vendorRecord.address || "N/A",
      email: vendorRecord.user_id?.email || "N/A",
    };

    res.json({ success: true, data: vendorDetails });
  } catch (err) {
    console.error("Get vendor details error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getKitchenChecksForVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const kitchenChecks = await KitchenCheck.find({ vendor_id: vendorId }).populate(
      "checked_by",
      "email"
    );

    const kitchenCheckList = kitchenChecks.map((kitchenCheck) => ({
      id: kitchenCheck._id,
      check_date: kitchenCheck.check_date,
      score: kitchenCheck.score,
      status: kitchenCheck.status,
      notes: kitchenCheck.notes || "",
      kitchen_photos: kitchenCheck.kitchen_photos || [],
      checked_by: kitchenCheck.checked_by?.email || null,
    }));

    res.json({ success: true, data: kitchenCheckList });
  } catch (err) {
    console.error("Get kitchen checks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateKitchenCheck = async (req, res) => {
  try {
    const checkId = req.params.checkId;
    const { score, status, notes } = req.body;

    const kitchenCheckToUpdate = await KitchenCheck.findById(checkId);
    if (!kitchenCheckToUpdate) {
      return res.status(404).json({ 
        success: false, 
        message: "Kitchen check not found" 
      });
    }

    if (score !== undefined) kitchenCheckToUpdate.score = score;
    if (status !== undefined) kitchenCheckToUpdate.status = status;
    if (notes !== undefined) kitchenCheckToUpdate.notes = notes;

    await kitchenCheckToUpdate.save();

    res.json({ success: true, data: kitchenCheckToUpdate });
  } catch (err) {
    console.error("Update kitchen check error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVendorMealPlanStatus = async (req, res) => {
  try {
    const allMealPlans = await MealPlan.find().populate("vendor_id", "vendor_name address");

    const mealPlanStatusList = allMealPlans.map((mealPlan) => ({
      vendor_name: mealPlan.vendor_id?.vendor_name || "Unknown Vendor",
      address: mealPlan.vendor_id?.address || "N/A",
      meal_plan: {
        name: mealPlan.name,
        status: mealPlan.status,
      },
    }));

    res.json({ success: true, data: mealPlanStatusList });
  } catch (err) {
    console.error("Get vendor meal plan status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFullVendorProfile = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).populate("user_id", "email");

    if (!vendor) {
      return res.status(404).json({
        status: false,
        message: "Vendor not found"
      });
    }

    const kitchenChecks = await KitchenCheck.find({vendor_id: vendorId}).populate("checked_by", "email");
    const mealPlans = await MealPlan.find({vendor_id: vendorId}).populate("approved_by", "email").sort({createdAt: -1});

    const response = {
      vendor_details: {
        id: vendor._id,
        vendor_name: vendor.vendor_name,
        email: vendor.user_id?.email || null,
        address: vendor.address || null,
        operating_days: vendor.operating_days || [],
        location: vendor.location || null,
        kitchen_photos: vendor.kitchen_photos || [],
        target_schools: vendor.target_schools || [],
        created_at: vendor.createdAt,
        updated_at: vendor.updatedAt,
      },
      kitchen_checks: kitchenChecks.map((check) => ({
        id: check._id,
        check_date: check.check_date,
        score: check.score,
        status: check.status,
        notes: check.notes,
        kitchen_photos: check.kitchen_photos || [],
        checked_by: check.checked_by?.email || null,
      })),
      meal_plans: mealPlans.map((meal) => ({
        id: meal._id,
        name: meal.name,
        status: meal.status,
        image_url: meal.image_url || null,
        approved_by: meal.approved_by?.email || null,
        approved_at: meal.approved_at || null,
        created_at: meal.createdAt,
      }))
    };

    return res.json({
      success: true,
      data: response
    });

} catch (err) {
    console.error("Unable to fetch full vendor profile:", err);
    res.status(500).json({
      success: false,
      message: "Get full vendor profile error"
    });
  }
};

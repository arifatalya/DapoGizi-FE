const Vendor = require("../models/vendorSchema");
const KitchenCheck = require("../models/kitchenCheckSchema");
const MealPlan = require("../models/mealPlanSchema");

const getAllVendors = async (req, res) => {
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

const getVendorDetails = async (req, res) => {
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

const getKitchenChecksForVendor = async (req, res) => {
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
      checked_by: kitchenCheck.checked_by?.email || null,
    }));

    res.json({ success: true, data: kitchenCheckList });
  } catch (err) {
    console.error("Get kitchen checks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateKitchenCheck = async (req, res) => {
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

const getVendorMealPlanStatus = async (req, res) => {
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

const getFullVendorProfile = async (req, res) => {
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
    const mealPlans = await MealPlan.find({vendor_id: vendorId}).populate("vendor_id", "vendor_name address").sort({createdAt: -1});

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
        vendor_id: meal.vendor_id?._id,
        vendor_name: meal.vendor_id?.vendor_name,
        name: meal.name,
        description: meal.description,
        image_url: meal.image_url,
        status: meal.status,
        approved_by: meal.approved_by?.email || null,
        created_at: meal.createdAt,
        approved_at: meal.approved_at || null
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

const approveMealPlan = async (req, res) => {
  try {
    const adminId = req.userId;
    const {ids} = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one meal plan ID"
      });
    }

    const result = await MealPlan.updateMany(
        {_id: {$in: ids}}, {
          $set: {
            status: "approved",
            approved_by: adminId,
            approved_at: new Date(),
          }});
    return res.json({
      success: true,
      message: `Successfully approved ${result.modifiedCount} meal plan(s)`,
      modified: result.modifiedCount,
    });

  } catch (err) {
    console.error("Unable to approve meal plan:", err);
    res.status(500).json({
      success: false,
      message: "Error approving meal plan"
    });
  }
};

const rejectMealPlan = async (req, res) => {
  try {
    const adminId = req.userId;
    const {ids} = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one meal plan ID"
      });
    }

    const result = await MealPlan.updateMany(
        {_id: {$in: ids}},
        {
          $set: {
            status: "rejected",
            approved_by: adminId,
            approved_at: new Date(),
          }
        }
    );
    return res.json({
      success: true,
      message: `Successfully rejected ${result.modifiedCount} meal plan(s)`,
      modified: result.modifiedCount,
    });

  } catch (err) {
    console.error("Unable to reject meal plan:", err);
    res.status(500).json({
      success: false,
      message: "Error rejecting meal plan"
    });
  }
};

const overrideKitchenCheck = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const adminId = req.userId;
    const {score, status, notes} = req.body;

    const arraysEqual = (a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, i) => val === sortedB[i]);
    };

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    const vendorPhotos = vendor.kitchen_photos || [];
    if (vendorPhotos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vendor has no kitchen photos uploaded"
      });
    }

    const existing = await KitchenCheck.find({vendor_id: vendorId});
    const duplicate = existing.some((check) => arraysEqual(check.kitchen_photos, vendorPhotos));

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "This kitchen has been assessed before"
      });
    }

    if (score == null || !status) {
      return res.status(400).json({
        success: false,
        message: "Score and status are required"
      });
    }

    const check = new KitchenCheck({
      vendor_id: vendorId,
      check_date: new Date(),
      score,
      status,
      notes: notes || "",
      kitchen_photos: vendorPhotos,
      checked_by: adminId
    });
    await check.save();

    return res.json({
      success: true,
      message: "Kitchen assessment created",
      data: check
    });

  } catch (err) {
    console.error("Error assessing kitchen:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong during kitchen assessment"
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorDetails,
  getKitchenChecksForVendor,
  updateKitchenCheck,
  getVendorMealPlanStatus,
  getFullVendorProfile,
  approveMealPlan,
  rejectMealPlan,
  overrideKitchenCheck
};
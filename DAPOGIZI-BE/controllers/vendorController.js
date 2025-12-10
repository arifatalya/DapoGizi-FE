const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
const MealDetail = require("../models/mealDetailSchema");
const KitchenCheck = require("../models/kitchenCheckSchema");
const { geocodeAddress, findNearbySchools } = require("../utils/geoapify");
const { analyzeKitchenImage } = require("../services/kitchenAIService");
const { determineKitchenStatus } = require("../utils/kitchenStatus");
const { uploadToSupabase, downloadFromSupabase } = require("../utils/supabaseUpload");

const getMySubmissions = async (req, res) => {
  try {
    const vendorRecord = await Vendor.findOne({ user_id: req.userId });
    if (!vendorRecord) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const queryFilter = { vendor_id: vendorRecord._id };
    const {createdAt} = req.query;

    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (isNaN(parsedDate.getTime())) {
        return  res.status(400).json({
          success: false,
          message: "Invalid date format. Please parse first."
        });
      }
      parsedDate.setHours(0, 0, 0, 0);
      queryFilter.createdAt = {$gte: parsedDate}
    }

    const mealPlans= await MealPlan.find(queryFilter)
        .populate("approved_by", "email")
        .sort({createdAt: -1});

    const mealPlanIds = mealPlans.map(meal => meal._id);

    const mealDetails = await MealDetail.find({meal_id: {$in: mealPlanIds}});
    const mealDetailsMap = new Map();
    mealDetails.forEach(detail => mealDetailsMap.set(String(detail.meal_id), detail));

    const submissions = mealPlans.map((meal) => {
      const detail = mealDetailsMap.get(String(meal._id));

      return {
        id: meal._id,
        name: meal.name,
        description: meal.description,
        image_url: meal.image_url,
        status: meal.status,
        approved_by: meal.approved_by,
        approved_at: meal.approved_at,
        created_at: meal.createdAt,
        updated_at: meal.createdAt,

        nutrition: detail ? {
          overall_calories: detail.overall_calories,
          protein: detail.protein,
          fat: detail.fat,
          carbs: detail.carbs,
          sugar: detail.sugar,
          fiber: detail.fiber
        } : null,
      }
    });

    return res.json({
      success: true,
      total_count: mealPlans.length,
      data: submissions,
      filter_applied: {
        created_at: createdAt || null,
      },
    });
  } catch (error) {
    console.error("Get vendor submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching submissions",
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({user_id: userId});

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Updating profile for user:", userId);

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    let {
      vendor_name,
      address,
      operating_days,
      location,
      skip_geo,
      target_schools,
      skip_auto_schools
    } = req.body || {};

    if (typeof operating_days === "string") {
      try {
        operating_days = JSON.parse(operating_days);
      } catch {
        operating_days = undefined;
      }
    }

    if (typeof target_schools === "string") {
      try {
        target_schools = JSON.parse(target_schools);
      } catch {
        target_schools = undefined;
      }
    }

    if (vendor_name != null) {
      vendor.vendor_name = vendor_name;
    }
    if (Array.isArray(operating_days)) {
      vendor.operating_days = operating_days;
    }

    if (address && typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch {
        return res.status(400).json({
          message: "Invalid address format"
        });
      }
    }

    if (address && typeof address === "object") {
      const {
        address_line_1 = "",
        address_line_2 = "",
        district = "",
        city = "",
        province = "",
        postal_code = ""
      } = address;

      vendor.address.address_line_1 = address_line_1;
      vendor.address.address_line_2 = address_line_2;
      vendor.address.district = district;
      vendor.address.city = city;
      vendor.address.province = province;
      vendor.address.postal_code = postal_code;

      const parts = [
        address_line_1,
        address_line_2,
        district,
        city,
        province,
        postal_code
      ].filter(Boolean);

      vendor.address.full_address = parts.join(", ");
    }

    let bias = null;
    const wantSkipGeo = String(skip_geo || "").toLowerCase() === "true";
    const wantSkipAutoSchools = String(skip_auto_schools || "").toLowerCase() === "true";

    if (location && location.lat != null && location.lon != null) {
      vendor.location = {
        type: "Point",
        coordinates: [Number(location.lon), Number(location.lat)],
      };
      bias = { lon: Number(location.lon), lat: Number(location.lat) };

    } else if (!wantSkipGeo && vendor.address.full_address) {
      const geo = await geocodeAddress(vendor.address.full_address);
      console.log("Geocode result:", geo);

      if (geo && geo.lon != null && geo.lat != null) {
        vendor.location = {
          type: "Point",
          coordinates: [geo.lon, geo.lat],
        };
        bias = { lon: geo.lon, lat: geo.lat };
      }

    } else if (vendor.location?.coordinates?.length === 2) {
      bias = {
        lon: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1]
      };
    }

    let manualTargetSchoolsProvided = false;

    if (Array.isArray(target_schools) && target_schools.length > 0) {
      manualTargetSchoolsProvided = true;

      vendor.target_schools = target_schools.map((s) => {
        const safe = {
          name: s.name,
          address: s.address || "",
          geoapify_id: s.geoapify_id || ""
        };

        if (s.location?.coordinates?.length === 2) {
          const lon = Number(s.location.coordinates[0]);
          const lat = Number(s.location.coordinates[1]);
          if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
            safe.location = { type: "Point", coordinates: [lon, lat] };
          }
        }

        return safe;
      });
    }

    if (bias && !manualTargetSchoolsProvided && !wantSkipAutoSchools) {
      const schools = await findNearbySchools(bias, 3);
      vendor.target_schools = schools;
    }

    await vendor.save();

    return res.json({
      message: "Vendor updated",
      vendor
    });

  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

const updateKitchenPhotos = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filenames = files.map((f) => f.originalname.toLowerCase());
    const hasDuplicate = filenames.some((name, idx) => filenames.indexOf(name) !== idx);
    if (hasDuplicate) {
      return res.status(400).json({
        message: "Duplicate filenames detected. Please rename your files before uploading.",
      });
    }

    const uploadPromises = files.map((file) =>
        uploadToSupabase(file.buffer, "kitchens", file.originalname)
    );
    const supabaseUrls = await Promise.all(uploadPromises);

    const replace = (req.query.replace || "").toLowerCase() === "true";
    vendor.kitchen_photos = replace
        ? supabaseUrls
        : [...(vendor.kitchen_photos || []), ...supabaseUrls];

    await vendor.save();

    const aiResults = [];

    for (let i = 0; i < supabaseUrls.length; i++) {
      const fileUrl = supabaseUrls[i];
      const file = files[i];

      try {
        const buffer = await downloadFromSupabase(fileUrl);

        const aiData = await analyzeKitchenImage(buffer, file.originalname);
        const status = determineKitchenStatus(aiData.prediction);

        const kitchenCheck = await KitchenCheck.create({
          vendor_id: vendor._id,
          score: aiData.confidence,
          status,
          notes: req.body.notes || "",
          kitchen_photos: [fileUrl],
          checked_by: req.user._id,
          check_date: new Date(),
        });

        aiResults.push({
          file: file.originalname,
          url: fileUrl,
          status: kitchenCheck.status,
          score: kitchenCheck.score,
        });
      } catch (err) {
        console.error("AI analysis failed for", file.originalname, err);
      }
    }

    return res.json({
      message: "Kitchen photos updated",
      kitchen_photos: vendor.kitchen_photos,
      kitchen_check: aiResults,
    });

  } catch (error) {
    console.error("updateKitchenPhotos failed:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyKitchenChecks = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({user_id: userId});
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    const filters = {vendor_id: vendor._id};
    const {date, status} = req.query;
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
      parsedDate.setHours(0, 0, 0, 0);
      filters.check_date = {$gte: parsedDate};
    }

    if (status && ["clean", "dirty"].includes(status.toLowerCase())) {
      filters.status = status.toLowerCase();
    }

    const checks = await KitchenCheck.find(filters).populate("checked_by", "email").sort({check_date: -1});

    const myChecks = checks.map((check) => ({
      id: check._id,
      check_date: check.check_date,
      score: check.score,
      status: check.status,
      notes: check.notes || "",
      kitchen_photos: check.kitchen_photos || [],
      checked_by: check.checked_by?.email || null,
    }));

    return res.json({
      success: true,
      total: checks.length,
      data: myChecks,
      after_filter: {
        date: date || null,
        status: status || null,
      },
    });

  } catch (error) {
    console.error("Unable to retrieve past kitchen checks", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching kitchen checks",
    });
  }
};

module.exports = {
  getMySubmissions,
  updateProfile,
  updateKitchenPhotos,
  getMyKitchenChecks,
  getMyProfile,
};

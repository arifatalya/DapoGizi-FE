const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
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

    const { createdAt } = req.query;

    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid createdAt format. Use YYYY-MM-DD",
        });
      }

      parsedDate.setHours(0, 0, 0, 0);
      queryFilter.createdAt = { $gte: parsedDate };
    }

    const mealPlanSubmissions = await MealPlan.find(queryFilter)
        .populate("approved_by", "email")
        .sort({ createdAt: -1 });

    const formattedSubmissions = mealPlanSubmissions.map((submission) => ({
      id: submission._id,
      name: submission.name,
      image_url: submission.image_url || null,
      status: submission.status,
      approved_by: submission.approved_by?.email || null,
      approved_at: submission.approved_at || null,
      created_at: submission.createdAt,
      updated_at: submission.updatedAt,
    }));

    res.json({
      success: true,
      total_count: mealPlanSubmissions.length,
      data: formattedSubmissions,
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

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Updating profile for user:", userId);

    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    let {
      vendor_name,
      address,
      operating_days,
      location,
      skip_geo,
      target_schools,
      skip_auto_schools,
    } = req.body || {};

    console.log("Raw request body:", req.body); // Log incoming data

    // Parse operating_days if it's a stringified JSON array (because form-data sends as string)
    if (typeof operating_days === "string") {
      try {
        operating_days = JSON.parse(operating_days);
      } catch (err) {
        console.warn("Failed to parse operating_days from string, ignoring it.");
        operating_days = undefined;
      }
    }

    // Parse target_schools if sent as string (form-data)
    if (typeof target_schools === "string") {
      try {
        target_schools = JSON.parse(target_schools);
      } catch (err) {
        console.warn("Failed to parse target_schools from string, ignoring it.");
        target_schools = undefined;
      }
    }

    // Update simple fields if provided
    if (vendor_name != null) vendor.vendor_name = vendor_name;
    if (address != null) vendor.address = address;
    if (Array.isArray(operating_days)) vendor.operating_days = operating_days;

    // Geocoding and location logic
    let bias = null;
    const wantSkipGeo = String(skip_geo || "").toLowerCase() === "true";
    const wantSkipAutoSchools = String(skip_auto_schools || "").toLowerCase() === "true";

    if (location && location.lat != null && location.lon != null) {
      vendor.location = {
        type: "Point",
        coordinates: [Number(location.lon), Number(location.lat)],
      };
      bias = { lon: Number(location.lon), lat: Number(location.lat) };
    } else if (!wantSkipGeo && address) {
      const geo = await geocodeAddress(address);
      console.log("Geocode result:", geo); // Log geocode response
      if (geo && geo.lon != null && geo.lat != null) {
        vendor.location = { type: "Point", coordinates: [geo.lon, geo.lat] };
        bias = { lon: geo.lon, lat: geo.lat };
      }
    } else if (vendor.location?.coordinates?.length === 2) {
      bias = {
        lon: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1],
      };
    }

    // Handle manual target_schools from client
    let manualTargetSchoolsProvided = false;
    if (Array.isArray(target_schools) && target_schools.length > 0) {
      manualTargetSchoolsProvided = true;

      vendor.target_schools = target_schools.map((s) => {
        const safe = {
          name: s.name,
          address: s.address || "",
          geoapify_id: s.geoapify_id || "",
        };

        // Optional: accept provided coordinates if any
        if (s.location && Array.isArray(s.location.coordinates)) {
          const lon = Number(s.location.coordinates[0]);
          const lat = Number(s.location.coordinates[1]);
          if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
            safe.location = {
              type: "Point",
              coordinates: [lon, lat],
            };
          }
        }

        return safe;
      });
    }

    // Only auto-fill target_schools from Geoapify if:
    // - We have a bias (location),
    // - The client did NOT provide manual target_schools,
    // - And skip_auto_schools is NOT true
    if (bias && !manualTargetSchoolsProvided && !wantSkipAutoSchools) {
      const schools = await findNearbySchools(bias, 3);
      console.log("Nearby schools:", schools); // Log nearby schools
      vendor.target_schools = schools;
    }

    // Save the updated vendor document
    console.log("Vendor to be saved:", vendor);
    await vendor.save();

    return res.json({ message: "Vendor updated", vendor });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
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
    const hasDuplicate = filenames.some(
        (name, idx) => filenames.indexOf(name) !== idx
    );

    if (hasDuplicate) {
      return res.status(400).json({
        message:
            "Duplicate filenames detected. Please rename your files before uploading.",
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

    let aiResult = null;

    if (supabaseUrls.length > 0) {
      const lastFileUrl = supabaseUrls[supabaseUrls.length - 1];
      const lastFile = files[files.length - 1];

      try {
        const imageBuffer = await downloadFromSupabase(lastFileUrl);

        const aiData = await analyzeKitchenImage(
            imageBuffer,
            lastFile.originalname
        );
        const status = determineKitchenStatus(aiData.prediction);

        const kitchenCheck = await KitchenCheck.create({
          vendor_id: vendor._id,
          score: aiData.confidence,
          status: status,
          notes: req.body.notes || "",
          checked_by: req.user._id,
          check_date: new Date(),
        });

        aiResult = {
          score: kitchenCheck.score,
          status: kitchenCheck.status,
        };
      } catch (e) {
        console.error("Analysis AI error:", e.message);
      }
    }

    return res.json({
      message: "Kitchen photos updated",
      kitchen_photos: vendor.kitchen_photos,
      kitchen_check: aiResult,
    });
  } catch (e) {
    console.error("updateKitchenPhotos failed:", e);
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
      photo_urls: check.photo_urls || [],
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

  } catch (err) {
    console.error("Unable to retrieve past kitchen checks", err);
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
  getMyKitchenChecks
};

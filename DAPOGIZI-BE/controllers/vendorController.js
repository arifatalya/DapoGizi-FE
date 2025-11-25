const Vendor = require("../models/vendorSchema");
const MealPlan = require("../models/mealPlanSchema");
const { geocodeAddress, findNearbySchools } = require("../utils/geoapify");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const {
      vendor_name,
      address,
      operating_days,
      location,
      skip_geo
    } = req.body || {};

    if (vendor_name != null) vendor.vendor_name = vendor_name;
    if (address != null) vendor.address = address;
    if (Array.isArray(operating_days)) vendor.operating_days = operating_days;
    
    let bias = null;
    const wantSkipGeo = String(skip_geo || "").toLowerCase() === "true";

    if (location && location.lat != null && location.lon != null) {
      vendor.location = {
        type: "Point",
        coordinates: [Number(location.lon), Number(location.lat)],
      };
      bias = { lon: Number(location.lon), lat: Number(location.lat) };
    } else if (!wantSkipGeo && address) {
      const geo = await geocodeAddress(address);
      if (geo) {
        vendor.location = { type: "Point", coordinates: [geo.lon, geo.lat] };
        bias = { lon: geo.lon, lat: geo.lat };
      }
    } else if (vendor.location?.coordinates?.length === 2) {
      bias = {
        lon: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1],
      };
    }

    if (bias) {
      const schools = await findNearbySchools(bias, 3);
      vendor.target_schools = schools;
    }

    await vendor.save();
    return res.json({ message: "Vendor updated", vendor });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateKitchenPhotos = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const files = req.files || [];
    const urls = files.map((f) => `/uploads/kitchens/${f.filename}`);

    const replace = (req.query.replace || "").toLowerCase() === "true";
    vendor.kitchen_photos = replace ? urls : [...(vendor.kitchen_photos || []), ...urls];

    await vendor.save();
    return res.json({
      message: "Kitchen photos updated",
      kitchen_photos: vendor.kitchen_photos,
    });
  } catch (err) {
    console.error("updateKitchenPhotos error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const vendorRecord = await Vendor.findOne({ user_id: req.userId });
    if (!vendorRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor profile not found" 
      });
    }

    const queryFilter = { vendor_id: vendorRecord._id };

    const { createdAt } = req.query;
    
    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid createdAt format. Use YYYY-MM-DD" 
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
      message: "Server error while fetching submissions" 
    });
  }
};


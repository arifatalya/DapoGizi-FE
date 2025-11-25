const express = require("express");
const {
	getVendorDetails,
	getAllVendors,
	getKitchenChecksForVendor,
	updateKitchenCheck,
	getVendorMealPlanStatus,
	getFullVendorProfile
} = require("../controllers/adminController");
const { 
	verifyToken, 
	verifyAdmin 
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/view-vendors", getAllVendors);
router.get("/view-vendor/:id", getVendorDetails);
router.get("/kitchen-checks/vendor/:vendorId", getKitchenChecksForVendor);
router.put("/kitchen-check/:checkId", updateKitchenCheck);
router.get("/vendors-meal-plans", getVendorMealPlanStatus);
router.get("/vendor-profile/:vendorId", getFullVendorProfile);

module.exports = router;

const express = require("express");
const {
	getVendorDetails,
	getAllVendors,
	getKitchenChecksForVendor,
	updateKitchenCheck,
	getVendorMealPlanStatus,
	getFullVendorProfile,
	approveMealPlan,
	rejectMealPlan,
	overrideKitchenCheck
} = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken);
router.use(verifyAdmin);

router.get("/view-vendors", getAllVendors);
router.get("/view-vendor/:id", getVendorDetails);
router.get("/kitchen-checks/vendor/:vendorId", getKitchenChecksForVendor);
router.put("/kitchen-check/:checkId", updateKitchenCheck);
router.get("/vendors-meal-plans", getVendorMealPlanStatus);
router.get("/vendor-profile/:id", getFullVendorProfile);
router.patch("/meal-plans/approve", approveMealPlan);
router.patch("/meal-plans/reject", rejectMealPlan);
router.post("/kitchen-check/assess/:vendorId", overrideKitchenCheck);

module.exports = router;

const express = require("express");
const {
	getVendorDetails,
	getAllVendors,
	getKitchenChecksForVendor,
	updateKitchenCheck,
	getVendorMealPlanStatus,
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

module.exports = router;

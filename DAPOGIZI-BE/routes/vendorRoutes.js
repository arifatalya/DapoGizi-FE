const express = require("express");
const { verifyToken, verifyVendor, verifyUploadKitchen } = require("../middleware/authMiddleware");
const { updateProfile, updateKitchenPhotos, getMySubmissions, getMyKitchenChecks} = require("../controllers/vendorController");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

router.put("/profile", updateProfile);
router.put("/kitchen/photos", verifyUploadKitchen, updateKitchenPhotos);
router.get("/submissions", getMySubmissions);
router.get("/my-kitchen-checks", getMyKitchenChecks);

module.exports = router;
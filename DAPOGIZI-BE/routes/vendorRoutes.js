const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { updateProfile, updateKitchenPhotos,  getMySubmissions, getMyKitchenChecks} = require("../controllers/vendorController");
const { verifyToken, verifyVendor } = require("../middleware/authMiddleware");
const { kitchenPhotosUpload } = require("../utils/upload");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

router.put("/profile", auth("vendor"), updateProfile);
// router.put("/kitchen/photos", (req, res, next) => {
//     kitchenPhotosUpload(req, res, function (err) {
//         if (err) return res.status(400).json({ message: err.message || "Upload error" });
//         next();
//     });
// }, auth("vendor"), updateKitchenPhotos);
router.put("/kitchen/photos", (req, res, next) => {
    kitchenPhotosUpload(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || "Upload error" });
        next();
    });
}, auth("vendor"), updateKitchenPhotos);
router.get("/submissions", getMySubmissions);
router.get("/my-kitchen-checks", getMyKitchenChecks);

module.exports = router;
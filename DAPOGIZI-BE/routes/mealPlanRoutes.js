const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { createMealPlan, updateMealPlan } = require("../controllers/mealPlanController");
const { mealImageUpload } = require("../utils/upload");

const router = express.Router();

router.post("/meal-plans", auth("vendor"), (req, res, next) => {
    mealImageUpload(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || "Upload error" });
        next();
    });
}, createMealPlan);
router.put("/meal-plans/:id", auth("vendor"), (req, res, next) => {
    mealImageUpload(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || "Upload error" });
        next();
    });
}, updateMealPlan);

module.exports = router;
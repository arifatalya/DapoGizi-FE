const express = require("express");
const { verifyToken, verifyVendor, verifyUploadMealPlan  } = require("../middleware/authMiddleware");
const { createMealPlan, updateMealPlan } = require("../controllers/mealPlanController");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

router.post("/meal-plans", verifyUploadMealPlan, createMealPlan);
router.put("/meal-plans/:id", verifyUploadMealPlan, updateMealPlan);

module.exports = router;
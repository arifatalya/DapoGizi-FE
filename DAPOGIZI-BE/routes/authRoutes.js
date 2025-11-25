const express = require("express");
const { signup, login, getVendorMe } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", getVendorMe);

module.exports = router;
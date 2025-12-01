const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Vendor = require("../models/vendorSchema");
const dotenv = require("dotenv");

dotenv.config();

const signup = async (req, res) => {
  try {
    const { email, password, vendor_name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    if (!vendor_name) {
      return res.status(400).json({ 
        success: false, 
        message: "Vendor name is required" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password_hash: hashedPassword,
      role: "vendor",
    });
    await newUser.save();

    const newVendor = new Vendor({
      user_id: newUser._id,
      vendor_name,
    });
    await newVendor.save();

    res.status(201).json({
      success: true,
      message: "Signup success",
      userId: newUser._id,
      role: "vendor",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const authenticatedUser = await User.findOne({ email });
    if (!authenticatedUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, authenticatedUser.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { userId: authenticatedUser._id, role: authenticatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login success",
      token,
      role: authenticatedUser.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

const getVendorMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const authenticatedUser = await User.findById(decodedToken.userId);
    if (!authenticatedUser || authenticatedUser.role !== "vendor") {
      return res.status(403).json({ 
        success: false, 
        message: "Not a vendor" 
      });
    }

    const vendorProfile = await Vendor.findOne({ user_id: authenticatedUser._id });
    
    res.json({ 
      success: true, 
      vendor: vendorProfile 
    });
  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

module.exports = {
  signup,
  login,
  getVendorMe
};

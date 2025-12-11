const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const cors = require("cors");

// Importing routes
const authRoutes = require("./routes/authRoutes"); 
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");

// Middleware
app.use(express.json());
// Cors
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://dapogizi.up.railway.app',
        'https://dapogizi-fe-admin.vercel.app',
        'https://dapogizi-fe.vercel.app'
    ],
    credentials: true
}));


//sybau
// Load .env
dotenv.config();

// Set up routes
app.use("/user/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/vendor", vendorRoutes);
app.use("/vendor/ops", mealPlanRoutes);

// Connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI,{
    dbName: "dapogizi_new",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Server is successfully running on " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
  
// Event listener to monitor the connection
const con = mongoose.connection;
con.on("disconnected", () => {
  console.log("[ALERT] MongoDB disconnected");
});

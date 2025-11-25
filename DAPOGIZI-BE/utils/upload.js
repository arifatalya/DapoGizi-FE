const path = require("path");
const fs = require("fs");
const multer = require("multer");

function makeStorage(subdir) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = path.join(process.cwd(), "uploads", subdir);
            fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || "");
            const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, base + ext);
        },
    });
}

function imageFileFilter(req, file, cb) {
    const ok = /image\/(jpeg|jpg|png|webp|svg)/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
}

const kitchenPhotosUpload = multer({
    storage: makeStorage("kitchens"),
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // I changed it to 10 MB max
}).array("photos", 5);

const mealImageUpload = multer({
    storage: makeStorage("meals"),
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },// This one as well lol
}).single("image");

module.exports = { kitchenPhotosUpload, mealImageUpload };

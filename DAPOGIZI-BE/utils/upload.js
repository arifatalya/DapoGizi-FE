// const path = require("path");
// const fs = require("fs");
const multer = require("multer");
const supabase = require("../utils/supabase");
const path = require("path");

// function makeStorage(subdir) {
//     return multer.diskStorage({
//         destination: (req, file, cb) => {
//             const dest = path.join(process.cwd(), "uploads", subdir);
//             fs.mkdirSync(dest, { recursive: true });
//             cb(null, dest);
//         },
//         filename: (req, file, cb) => {
//             const ext = path.extname(file.originalname || "");
//             const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
//             cb(null, base + ext);
//         },
//     });
// }

const memoryStorage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
    const ok = /image\/(jpeg|jpg|png|webp|svg)/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
}

const kitchenPhotosUpload = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // I changed it to 10 MB max
}).array("photos", 5);

const mealImageUpload = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },// This one as well lol
}).single("image");

async function uploadToBucket(fileBuffer, originalName, mimetype, folder) {
    const extension = path.extname(originalName) || "";
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const filePath = `${folder}/${fileName}`;

    const {error} = await supabase.storage.from(process.env.SUPABASE_BUCKET)
        .upload(filePath, fileBuffer, {
            contentType: mimetype,
            upsert: false
        });
    if (error) {
        console.error("Error uploading file to bucket:", error);
        throw new Error("Failed to upload image");
    }

    const {data: {publicUrl}} = supabase.storage.from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filePath);

    return publicUrl;
}

module.exports = { kitchenPhotosUpload, mealImageUpload, uploadToBucket };

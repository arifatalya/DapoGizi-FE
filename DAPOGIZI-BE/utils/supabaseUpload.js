const multer = require("multer");
const { supabase } = require("../services/supabase");
const axios = require("axios");

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
    const ok = /image\/(jpeg|jpg|png)/.test(file.mimetype);
    cb(ok ? null : new Error("Only .jpg and .png images are allowed"), ok);
}

const kitchenPhotosUpload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 3 * 1024 * 1024, files: 5 }, // 3MB each, up to 5
}).array("photos", 5);

const mealImageUpload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 3 * 1024 * 1024, files: 1 }, // 3MB
}).single("image");

async function uploadToSupabase(fileBuffer, folder, filename) {
    const bucketName = "dapogizi-images";
    const randomStr = Math.random().toString(36).substring(2, 7);
    const ext = filename.split(".").pop().toLowerCase();
    const uniqueFilename = `${randomStr}.${ext}`;
    const filePath = `${folder}/${uniqueFilename}`;

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
            contentType: `image/${ext}`,
            upsert: false,
        });

    if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

async function downloadFromSupabase(url) {
    const response = await axios.get(url, {
        responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
}

module.exports = {
    kitchenPhotosUpload,
    mealImageUpload,
    uploadToSupabase,
    downloadFromSupabase,
};
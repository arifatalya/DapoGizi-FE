const axios = require("axios");
const FormData = require("form-data");


async function analyzeKitchenImage(imageBuffer, originalname) {
    const filename = originalname;
    const formData = new FormData();
    formData.append("file", imageBuffer, filename);

    const response = await axios.post(
        "https://leemto-kitchen-cleanliness-api.hf.space/predict",
        formData,
        {
            headers: formData.getHeaders(),
            timeout: 10000,
        }
    );

    return response.data;
}


module.exports = { analyzeKitchenImage };

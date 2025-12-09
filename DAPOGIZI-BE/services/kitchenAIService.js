const axios = require("axios");
const FormData = require("form-data");
const dotenv = require("dotenv");

dotenv.config();

const kitchenAIModelUrl = process.env.KITCHEN_AI_MODEL;

async function analyzeKitchenImage(imageBuffer, originalname) {
    const filename = originalname;
    const formData = new FormData();
    formData.append("file", imageBuffer, filename);

    const response = await axios.post(
        kitchenAIModelUrl,
        formData,
        {
            headers: formData.getHeaders(),
            timeout: 10000,
        }
    );
    return response.data;
}


module.exports = { analyzeKitchenImage };

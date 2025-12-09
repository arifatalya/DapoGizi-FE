const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');

dotenv.config();

const mealAIModelUrl = process.env.MEAL_AI_MODEL;

const getFoodPredictionAndNutrition = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        const form = new FormData();
        form.append('file', response.data, {
            filename: 'food.jpg',
            contentType: 'image/jpeg',
        });

        const foodPredictionResponse = await axios.post(mealAIModelUrl, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        const predictionData = foodPredictionResponse.data;
        return {
            predictions: predictionData.predictions,
            nutrition: predictionData.nutrition,
            plot: predictionData.plot,
            confidence: predictionData.confidence,
        };
    } catch (error) {
        console.error('Error getting food prediction:', error);
        throw new Error('Food prediction failed');
    }
};

module.exports = { getFoodPredictionAndNutrition };
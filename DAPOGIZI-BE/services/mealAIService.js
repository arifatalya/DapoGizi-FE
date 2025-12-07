// services/mealAIService.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Sends the image to the food detection API and returns the prediction and nutrition data.
 * @param {string} imageUrl - The URL of the image to be analyzed.
 * @returns {Promise<object>} - The response object containing the prediction and nutrition details.
 */
const getFoodPredictionAndNutrition = async (imageUrl) => {
    try {
        // Fetch the image from the URL
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        const form = new FormData();
        form.append('file', response.data, {
            filename: 'food.jpg',
            contentType: 'image/jpeg',
        });

        // Send the image to the food detection service
        const foodPredictionResponse = await axios.post('https://weewrwr-indonesian-food-detection-despro.hf.space/predict', form, {
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
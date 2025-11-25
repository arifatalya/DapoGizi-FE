const mongoose = require("mongoose");

const targetSchoolSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
        geoapify_id: { type: String },
    },
    { _id: false }
);

module.exports = targetSchoolSchema;
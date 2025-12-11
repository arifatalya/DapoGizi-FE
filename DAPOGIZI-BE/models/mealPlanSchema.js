const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema(
    {
        vendor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendors",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        image_url: String,
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            required: true,
        },
        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        approved_at: Date,
        detected_foods: [
            {
                name: String,
                confidence: Number,
                category: {
                    type: String,
                    enum: ["makanan_pokok", "lauk_pauk", "sayur", "buah", "susu", null]
                }
            }
        ],
        classification_4sehat5sempurna: {
            status: {
                type: String,
                enum: ["5 Sempurna", "4 Sehat", "Tidak Memenuhi", "Pending"],
                default: "Pending"
            },
            categories_fulfilled: {
                makanan_pokok: [String],
                lauk_pauk: [String],
                sayur: [String],
                buah: [String],
                susu: [String]
            },
            categories_missing: [String],
            total_categories: {
                type: Number,
                default: 0
            },
            unrecognized_foods: [String],
            analysis_date: Date
        },
    },
    { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema, "mealplans");
module.exports = MealPlan;
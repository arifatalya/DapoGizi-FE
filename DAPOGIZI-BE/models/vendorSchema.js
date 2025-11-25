// const mongoose = require("mongoose");
//
// const vendorSchema = new mongoose.Schema(
//   {
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Users",
//       required: true,
//     },
//     vendor_name: {
//       type: String,
//       required: true,
//     },
//     address: {
//       type: String,
//     },
//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         default: "Point",
//       },
//       coordinates: {
//         type: [Number],
//         default: [0, 0],
//       },
//     },
//   },
//   { timestamps: true }
// );
//
// const Vendor = mongoose.model("Vendors", vendorSchema, "vendors");
// module.exports = { Vendor };

const mongoose = require("mongoose");
const Counter = require("./counterSchema");
const targetSchoolSchema = require("./targetSchoolSchema");

const vendorSchema = new mongoose.Schema(
    {
        vendor_id: {
            type: Number,
            unique: true,
            index: true,
            sparse: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        vendor_name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [lon, lat]
                default: [0, 0],
            },
        },
        operating_days: {
            type: [String], // e.g. ["Mon", "Tue", "Wed"]
            default: [],
        },
        kitchen_photos: {
            type: [String], // URLs to /uploads/kitchens/...
            default: [],
        },
        target_schools: {
            type: [targetSchoolSchema],
            default: [],
        },
    },
    { timestamps: true }
);

vendorSchema.index({ location: "2dsphere" });

vendorSchema.pre("save", async function (next) {
    try {
        if (!this.isNew || this.vendor_id != null) {
            return next();
        }
        const seqDoc = await Counter.findByIdAndUpdate(
            {
                _id: "vendor_id"
            },
            {
                $inc: { seq: 1 }
            },
            {
                upsert: true,
                new: true
            }
        );
        this.vendor_id = seqDoc.seq;
        next();
    } catch (err) {
        next(err);
    }
});

const Vendor = mongoose.model("Vendors", vendorSchema);
module.exports = Vendor;


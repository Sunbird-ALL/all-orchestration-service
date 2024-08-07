import mongoose from "mongoose";

// Define the User schema
const learnerai_points_tracking = new mongoose.Schema({
    userId : {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    language: {
        type: String,
        required: true,
        index: true
    },
    points: {
        type: Number,
        required: true,
        index: true
    },
    milestone: {
        type: String,
         required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Create pointer model
const pointer = mongoose.model("learnerai_points_tracking", learnerai_points_tracking);
export default pointer;



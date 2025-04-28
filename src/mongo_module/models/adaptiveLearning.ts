import mongoose from "mongoose";

// Define the adaptive_learning schema
const adaptive_learning = new mongoose.Schema({
    udise_code : {
        type: String,
        required: true,
        index: true
    },
    school_name: {
        type: String,
        required: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


// Create the adaptiveLearning model
const adaptiveLearning = mongoose.model("learnerai_adaptive_learning", adaptive_learning);
export default adaptiveLearning;

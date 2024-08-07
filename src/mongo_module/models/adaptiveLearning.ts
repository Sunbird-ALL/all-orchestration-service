import mongoose from "mongoose";

// Define the User schema
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


// Create the Lesson model
const adaptiveLearning = mongoose.model("adaptive_learning", adaptive_learning);
export default adaptiveLearning;

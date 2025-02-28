import mongoose from "mongoose";

// Define the emis_learning_logs schema
const emis_learning_logs = new mongoose.Schema({
    student_id : {
        type: String,
        required: true,
        index: true
    },
    score: {
        type: Number,
        required: true
    },
    date_completed: {
        type: Date,
        default: Date.now
    },
    lesson_master_id: {
        type: Number,
        required: true,
        index: true
    }
});


// Create the emis_learning_logs model
const emisLearningLogs = mongoose.model("emis_learning_logs", emis_learning_logs);
export default emisLearningLogs;

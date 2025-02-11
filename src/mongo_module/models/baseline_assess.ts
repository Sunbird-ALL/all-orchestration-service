import mongoose from "mongoose";

// Define the schema for baseline assessment submissions
const Baseline_Assessment = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    assessment_id: {
        type: String,
        required: true
    },
    submission_data: {
        type: Object,
        required: true
    },
    emis_username: {
        type: String,
        required: true
    },
    school_name: {
        type: String,
        required: true
    },
    student_name: {
        type: String,
        required: true
    },
    udise_code: {
        type: String,
        required: true
    },
    user_info: {
        type: Object,
        required: false
    },
    login_time: {
        type: Date,
        required: false
    },
    school_id: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const BaselineAssessment = mongoose.model(
    "Baseline_Assessment",
    Baseline_Assessment
);

export default BaselineAssessment;

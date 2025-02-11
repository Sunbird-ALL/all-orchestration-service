import mongoose from "mongoose";

// Define the schema for baseline assessment submissions
const Baseline_Assessment = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    assessmentId: {
        type: String,
        required: true
    },
    submissionData: {
        type: Object,
        required: true
    },
    emisUsername: {
        type: String,
        required: true
    },
    schoolName: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    udiseCode: {
        type: String,
        required: true
    },
    userInfo: {
        type: Object,
        required: false
    },
    loginTime: {
        type: Date,
        required: false
    },
    schoolId: {
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
